/**
 * Импорт типа из '@nova/core' удалён: он не использовался, но затягивал
 * исходники ядра в программу tsc — сборка API падала (файлы вне rootDir,
 * относительные импорты без расширений при module NodeNext).
 */

export type DealType = 'sale' | 'rent' | 'vacancy' | 'resume' | 'service';
export type SellerKind = 'private' | 'agent' | 'company';

/**
 * Построение SQL для выдачи объявлений.
 *
 * Собирается из частей, а не склеивается строками с подстановкой значений:
 * всё, что пришло от пользователя, уходит параметрами. Иначе первый же
 * фильтр с кавычкой в значении становится дырой в базе.
 */

export type ListingQuery = {
  countryCode: string;
  categoryId?: string;
  subcategoryId?: string;
  deal?: DealType;

  /** Место и вложенные в него: список идентификаторов разворачивает приложение. */
  placeIds?: string[];
  /** Поиск радиусом вместо границ места. */
  radius?: { lat: number; lon: number; km: number };

  priceFrom?: number;
  priceTo?: number;
  /** Атрибуты: точные совпадения и диапазоны. */
  attrs?: Record<string, string>;
  attrRanges?: Record<string, { from?: number; to?: number }>;

  sellerKind?: SellerKind;
  text?: string;

  sort?: 'new' | 'price-asc' | 'price-desc';
  limit?: number;
  cursor?: string;
};

export type BuiltQuery = { sql: string; params: unknown[] };

export function buildListingQuery(q: ListingQuery): BuiltQuery {
  const params: unknown[] = [];
  const where: string[] = [
    "l.status = 'active'",
    'l.deleted_at IS NULL',
  ];

  const push = (value: unknown): string => {
    params.push(value);
    return `$${params.length}`;
  };

  where.push(`l.country_code = ${push(q.countryCode)}`);

  if (q.categoryId) where.push(`l.category_id = ${push(q.categoryId)}`);
  if (q.subcategoryId) where.push(`l.subcategory_id = ${push(q.subcategoryId)}`);
  if (q.deal) where.push(`l.deal = ${push(q.deal)}`);

  // Место: либо по границам (список идентификаторов), либо радиусом.
  // Одновременно они не применяются — это два разных намерения пользователя.
  if (q.radius) {
    // Сначала отсекаем прямоугольником по индексу — это дёшево, — и только
    // потом считаем настоящее расстояние для того, что осталось.
    const latDelta = q.radius.km / 111.32;
    const cosLat = Math.cos((q.radius.lat * Math.PI) / 180);
    const lonDelta = Math.abs(cosLat) < 1e-6 ? 180 : q.radius.km / (111.32 * Math.abs(cosLat));

    where.push(`l.lat BETWEEN ${push(q.radius.lat - latDelta)} AND ${push(q.radius.lat + latDelta)}`);
    where.push(`l.lon BETWEEN ${push(q.radius.lon - lonDelta)} AND ${push(q.radius.lon + lonDelta)}`);

    const lat = push(q.radius.lat);
    const lon = push(q.radius.lon);
    const km = push(q.radius.km);
    // Формула гаверсинуса — та же, что на клиенте, чтобы результаты совпадали.
    where.push(`
      2 * 6371 * asin(sqrt(
        power(sin(radians(l.lat - ${lat}) / 2), 2) +
        cos(radians(${lat})) * cos(radians(l.lat)) *
        power(sin(radians(l.lon - ${lon}) / 2), 2)
      )) <= ${km}
    `);
  } else if (q.placeIds?.length) {
    where.push(`l.place_id = ANY(${push(q.placeIds)})`);
  }

  if (q.priceFrom !== undefined) where.push(`l.price_minor >= ${push(q.priceFrom)}`);
  if (q.priceTo !== undefined) where.push(`l.price_minor <= ${push(q.priceTo)}`);

  // Точные совпадения атрибутов одним условием: оператор @> попадает
  // в GIN-индекс, а несколько отдельных сравнений — нет.
  if (q.attrs && Object.keys(q.attrs).length > 0) {
    where.push(`l.attrs @> ${push(JSON.stringify(q.attrs))}::jsonb`);
  }

  // Диапазоны по числовым атрибутам.
  // Прямое приведение ::numeric падало на первом нечисловом значении
  // («54 000», «Студия») и роняло всю выдачу с ошибкой 500. Нечисловое
  // значение теперь просто не проходит диапазон.
  for (const [key, range] of Object.entries(q.attrRanges ?? {})) {
    const k = push(key);
    const safeNumber = `(CASE WHEN (l.attrs->>${k}) ~ '^-?[0-9]+(\\.[0-9]+)?$' THEN (l.attrs->>${k})::numeric END)`;
    if (range.from !== undefined) {
      where.push(`${safeNumber} >= ${push(range.from)}`);
    }
    if (range.to !== undefined) {
      where.push(`${safeNumber} <= ${push(range.to)}`);
    }
  }

  if (q.sellerKind) where.push(`u.kind = ${push(q.sellerKind)}`);

  if (q.text?.trim()) {
    where.push(`
      to_tsvector('russian', coalesce(l.title, '') || ' ' || coalesce(l.description, ''))
      @@ plainto_tsquery('russian', ${push(q.text.trim())})
    `);
  }

  // Постраничность курсором, а не смещением: OFFSET на десятой странице
  // заставляет базу перебрать всё, что до неё, и с ростом каталога
  // пролистывание становится всё медленнее.
  // Пустая цена («договорная») и пустая дата сравниваются как 0 и начало эпохи:
  // с NULL сравнение строк курсора давало NULL, и следующая страница пропадала.
  const priceExpr = 'COALESCE(l.price_minor, 0)';
  const dateExpr = "COALESCE(l.published_at, l.created_at)";
  const order =
    q.sort === 'price-asc' ? `${priceExpr} ASC, l.id ASC`
    : q.sort === 'price-desc' ? `${priceExpr} DESC, l.id DESC`
    : `${dateExpr} DESC, l.id DESC`;

  if (q.cursor) {
    const [value, id] = q.cursor.split('|');
    const validId = /^[0-9a-f-]{36}$/i.test(id ?? '');
    const num = Number(value);
    const date = new Date(value ?? '');
    // Битый курсор игнорируем, а не отдаём 500.
    if (validId) {
      if (q.sort === 'price-asc' && Number.isFinite(num)) {
        where.push(`(${priceExpr}, l.id) > (${push(num)}::bigint, ${push(id)}::uuid)`);
      } else if (q.sort === 'price-desc' && Number.isFinite(num)) {
        where.push(`(${priceExpr}, l.id) < (${push(num)}::bigint, ${push(id)}::uuid)`);
      } else if (q.sort !== 'price-asc' && q.sort !== 'price-desc' && !Number.isNaN(date.getTime())) {
        where.push(`(${dateExpr}, l.id) < (${push(date.toISOString())}::timestamptz, ${push(id)}::uuid)`);
      }
    }
  }

  const limit = Math.min(Math.max(q.limit ?? 30, 1), 100);

  const sql = `
    SELECT
      l.id, l.category_id, l.subcategory_id, l.deal, l.title, l.description,
      l.price_minor, l.currency, l.price_kind,
      l.country_code, l.place_id, l.lat, l.lon, l.address,
      l.attrs, l.published_at, l.created_at, l.views,
      u.id AS seller_id, u.name AS seller_name, u.kind AS seller_kind, u.verified AS seller_verified,
      (
        SELECT json_agg(json_build_object('key', p.storage_key, 'blur', p.blur_hash) ORDER BY p.position)
        FROM listing_photos p WHERE p.listing_id = l.id
      ) AS photos
    FROM listings l
    JOIN users u ON u.id = l.author_id
    WHERE ${where.join('\n      AND ')}
    ORDER BY ${order}
    LIMIT ${limit}
  `;

  return { sql, params };
}

/** Счётчик для кнопки «Показать N объявлений». */
export function buildCountQuery(q: ListingQuery): BuiltQuery {
  const { sql, params } = buildListingQuery({ ...q, cursor: undefined, limit: 1 });
  const from = sql.indexOf('FROM listings l');
  // lastIndexOf: первое «ORDER BY» стоит внутри подзапроса фото (json_agg … ORDER BY),
  // раньше срез получался пустым и /count отправлял в базу «SELECT count(*) » без FROM.
  const orderAt = sql.lastIndexOf('ORDER BY');
  return {
    sql: `SELECT count(*)::int AS total ${sql.slice(from, orderAt)}`,
    params,
  };
}
