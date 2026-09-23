import { Router } from 'express';
import { z } from 'zod';
import { query, transaction } from '../../db/pool.js';
import { buildListingQuery, buildCountQuery, type ListingQuery, type SellerKind } from './listings.query.js';

/** Виды сделок — те же, что в packages/core (DealType). Раньше API знал только sale/rent. */
const DEALS = ['sale', 'rent', 'vacancy', 'resume', 'service'] as const;

/**
 * Тип продавца: в приложении 'owner', в базе 'private'. Принимаем оба
 * написания на входе и отдаём наружу то, что понимает фронтенд.
 */
function toDbSeller(kind?: string): SellerKind | undefined {
  if (!kind) return undefined;
  return kind === 'owner' ? 'private' : (kind as SellerKind);
}
import { requireAuth, optionalAuth } from '../auth/auth.middleware.js';

/**
 * Объявления.
 *
 * Формат ответа совпадает с CatalogItem из packages/core — тем самым, на
 * котором работает фронтенд с демоданными. Поэтому переключение с демоданных
 * на сервер не требует переделки экранов.
 */

export const listingsRouter = Router();

/** Разбор параметров запроса. Всё, что не прошло проверку, отбрасывается. */
const listSchema = z.object({
  country: z.string().length(2),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  deal: z.enum(DEALS).optional(),
  places: z.string().optional(),
  lat: z.coerce.number().optional(),
  lon: z.coerce.number().optional(),
  radius: z.coerce.number().positive().max(2000).optional(),
  priceFrom: z.coerce.number().nonnegative().optional(),
  priceTo: z.coerce.number().nonnegative().optional(),
  seller: z.enum(['private', 'owner', 'agent', 'company']).optional(),
  q: z.string().max(200).optional(),
  sort: z.enum(['new', 'price-asc', 'price-desc']).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  cursor: z.string().max(120).optional(),
});

/**
 * Атрибуты приходят с префиксом: attr.brand=BMW, attr.mileage.to=50000.
 * Разбираем их отдельно, потому что набор полей заранее неизвестен —
 * он зависит от подкатегории.
 */
function parseAttrs(raw: Record<string, unknown>) {
  const attrs: Record<string, string> = {};
  const attrRanges: Record<string, { from?: number; to?: number }> = {};

  for (const [key, value] of Object.entries(raw)) {
    if (!key.startsWith('attr.') || typeof value !== 'string') continue;
    const path = key.slice(5);

    if (path.endsWith('.from') || path.endsWith('.to')) {
      const field = path.slice(0, path.lastIndexOf('.'));
      const bound = path.endsWith('.from') ? 'from' : 'to';
      const num = Number(value);
      if (!Number.isFinite(num)) continue;
      attrRanges[field] = { ...attrRanges[field], [bound]: num };
    } else {
      attrs[path] = value;
    }
  }

  return { attrs, attrRanges };
}

/** Строка базы → формат, который ждёт фронтенд. */
function toCatalogItem(row: Record<string, unknown>) {
  const photos = (row.photos as { key: string; blur: string }[] | null) ?? [];
  return {
    id: row.id,
    categoryId: row.category_id,
    subcategoryId: row.subcategory_id,
    deal: row.deal,
    title: row.title,
    description: row.description,
    // Из наименьших единиц обратно в обычные: в базе копейки, наружу рубли.
    price: Number(row.price_minor ?? 0) / 100,
    currency: row.currency,
    priceKind: row.price_kind,
    countryCode: row.country_code,
    placeId: row.place_id,
    lat: row.lat,
    lon: row.lon,
    address: row.address,
    image: photos[0] ? `/media/${photos[0].key}` : '/assets/placeholder.jpg',
    photos: photos.map((p) => ({ url: `/media/${p.key}`, blur: p.blur })),
    // У объявлений на модерации published_at пуст — отдаём дату создания.
    publishedAt: row.published_at ?? row.created_at,
    views: row.views,
    seller: {
      id: row.seller_id,
      name: row.seller_name,
      kind: row.seller_kind === 'private' ? 'owner' : row.seller_kind,
      verified: row.seller_verified,
    },
    attrs: row.attrs ?? {},
  };
}

/** Список объявлений. */
listingsRouter.get('/', optionalAuth, async (req, res) => {
  const parsed = listSchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: 'bad_request', details: parsed.error.flatten() });
  }

  const p = parsed.data;
  const { attrs, attrRanges } = parseAttrs(req.query as Record<string, unknown>);

  const q: ListingQuery = {
    countryCode: p.country.toUpperCase(),
    categoryId: p.category,
    subcategoryId: p.subcategory,
    deal: p.deal,
    placeIds: p.places?.split(',').filter(Boolean),
    radius: p.lat !== undefined && p.lon !== undefined && p.radius
      ? { lat: p.lat, lon: p.lon, km: p.radius }
      : undefined,
    // Цены наружу в рублях, внутри в копейках.
    priceFrom: p.priceFrom !== undefined ? Math.round(p.priceFrom * 100) : undefined,
    priceTo: p.priceTo !== undefined ? Math.round(p.priceTo * 100) : undefined,
    attrs,
    attrRanges,
    sellerKind: toDbSeller(p.seller),
    text: p.q,
    sort: p.sort,
    limit: p.limit,
    cursor: p.cursor,
  };

  try {
    const { sql, params } = buildListingQuery(q);
    const rows = await query<Record<string, unknown>>(sql, params);
    const items = rows.map(toCatalogItem);

    // Курсор следующей страницы — из последней строки выдачи.
    const last = rows[rows.length - 1];
    // Те же выражения, что в ORDER BY: пустая цена = 0, пустая дата = дата создания.
    const lastDate = (last?.published_at ?? last?.created_at) as Date | string | null | undefined;
    const nextCursor = last
      ? q.sort === 'price-asc' || q.sort === 'price-desc'
        ? `${last.price_minor ?? 0}|${last.id}`
        : lastDate
          ? `${new Date(lastDate).toISOString()}|${last.id}`
          : null
      : null;

    res.json({ items, nextCursor: rows.length === (q.limit ?? 30) ? nextCursor : null });
  } catch (error) {
    console.error('[Nova/listings] выдача не построена', error);
    res.status(500).json({ error: 'internal' });
  }
});

/** Счётчик для кнопки «Показать N объявлений». */
listingsRouter.get('/count', async (req, res) => {
  const parsed = listSchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: 'bad_request' });

  const p = parsed.data;
  const { attrs, attrRanges } = parseAttrs(req.query as Record<string, unknown>);

  try {
    const { sql, params } = buildCountQuery({
      countryCode: p.country.toUpperCase(),
      categoryId: p.category,
      subcategoryId: p.subcategory,
      deal: p.deal,
      placeIds: p.places?.split(',').filter(Boolean),
      priceFrom: p.priceFrom !== undefined ? Math.round(p.priceFrom * 100) : undefined,
      priceTo: p.priceTo !== undefined ? Math.round(p.priceTo * 100) : undefined,
      attrs,
      attrRanges,
      sellerKind: toDbSeller(p.seller),
      text: p.q,
    });
    const [row] = await query<{ total: number }>(sql, params);
    res.json({ total: row?.total ?? 0 });
  } catch (error) {
    console.error('[Nova/listings] счётчик не построен', error);
    res.status(500).json({ error: 'internal' });
  }
});

/** Одно объявление. */
listingsRouter.get('/:id', optionalAuth, async (req, res) => {
  const id = z.string().uuid().safeParse(req.params.id);
  if (!id.success) return res.status(400).json({ error: 'bad_id' });

  try {
    const rows = await query<Record<string, unknown>>(
      `SELECT l.*, u.id AS seller_id, u.name AS seller_name, u.kind AS seller_kind,
              u.verified AS seller_verified,
              (SELECT json_agg(json_build_object('key', p.storage_key, 'blur', p.blur_hash) ORDER BY p.position)
               FROM listing_photos p WHERE p.listing_id = l.id) AS photos
       FROM listings l JOIN users u ON u.id = l.author_id
       WHERE l.id = $1 AND l.deleted_at IS NULL`,
      [id.data],
    );

    if (rows.length === 0) return res.status(404).json({ error: 'not_found' });

    const row = rows[0];
    // Черновик и объявление на модерации видны только автору.
    const isAuthor = req.userId === row.author_id;
    if (row.status !== 'active' && !isAuthor) return res.status(404).json({ error: 'not_found' });

    // Счётчик просмотров не должен задерживать ответ и не должен считать
    // заходы самого автора.
    if (!isAuthor) {
      void query('UPDATE listings SET views = views + 1 WHERE id = $1', [id.data]).catch(() => {});
    }

    res.json(toCatalogItem(row));
  } catch (error) {
    console.error('[Nova/listings] объявление не получено', error);
    res.status(500).json({ error: 'internal' });
  }
});

/** Публикация. */
const createSchema = z.object({
  categoryId: z.string().min(1).max(50),
  subcategoryId: z.string().min(1).max(50),
  deal: z.enum(DEALS),
  title: z.string().min(3).max(120),
  description: z.string().max(5000).optional(),
  price: z.number().nonnegative().optional(),
  priceKind: z.enum(['fixed', 'from', 'free', 'negotiable']).default('fixed'),
  currency: z.string().length(3),
  countryCode: z.string().length(2),
  placeId: z.string().min(1).max(80),
  lat: z.number().min(-90).max(90).optional(),
  lon: z.number().min(-180).max(180).optional(),
  address: z.string().max(300).optional(),
  // Двухаргументная форма работает и в zod 3, и в zod 4 (там одноаргументную убрали).
  attrs: z.record(z.string(), z.string()).default({}),
  photoKeys: z.array(z.string().max(200)).max(20).default([]),
})
  // В базе ограничение: координаты либо обе, либо ни одной. Без этой проверки
  // одна широта давала ошибку ограничения и ответ 500 вместо 400.
  .refine((v) => (v.lat === undefined) === (v.lon === undefined), { message: 'lat_lon_pair', path: ['lat'] });

listingsRouter.post('/', requireAuth, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'bad_request', details: parsed.error.flatten() });
  }
  const d = parsed.data;

  try {
    // Объявление и фото — одной транзакцией: сбой на фото не оставляет
    // в базе объявление без фотографий.
    const listingId = await transaction(async (tq) => {
      // Ручной модерации в MVP нет — ни одного места в коде, которое
      // переводило бы объявление из 'moderation' в 'active'. Оставлять здесь
      // 'moderation' означало бы, что опубликованное объявление никогда не
      // появится в каталоге: тупик, а не MVP. Публикуем сразу, как и в
      // локальном (без сервера) режиме на фронтенде.
      const rows = await tq<{ id: string }>(
      `INSERT INTO listings (
         author_id, category_id, subcategory_id, deal, title, description,
         price_minor, currency, price_kind, country_code, place_id, lat, lon, address, attrs,
         status, published_at, expires_at
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,
                 'active', now(), now() + interval '60 days')
       RETURNING id`,
      [
        req.userId,
        d.categoryId,
        d.subcategoryId,
        d.deal,
        d.title,
        d.description ?? null,
        d.price !== undefined ? Math.round(d.price * 100) : null,
        d.currency.toUpperCase(),
        d.priceKind,
        d.countryCode.toUpperCase(),
        d.placeId,
        d.lat ?? null,
        d.lon ?? null,
        d.address ?? null,
        JSON.stringify(d.attrs),
      ],
    );

      const id = rows[0].id;

      for (const [index, key] of d.photoKeys.entries()) {
        await tq(
          'INSERT INTO listing_photos (listing_id, storage_key, position) VALUES ($1, $2, $3)',
          [id, key, index],
        );
      }
      return id;
    });

    res.status(201).json({ id: listingId, status: 'active' });
  } catch (error) {
    console.error('[Nova/listings] публикация не удалась', error);
    res.status(500).json({ error: 'internal' });
  }
});

/** Мои объявления. */
listingsRouter.get('/my/list', requireAuth, async (req, res) => {
  try {
    const rows = await query<Record<string, unknown>>(
      `SELECT l.*, u.id AS seller_id, u.name AS seller_name, u.kind AS seller_kind,
              u.verified AS seller_verified, NULL::json AS photos
       FROM listings l JOIN users u ON u.id = l.author_id
       WHERE l.author_id = $1 AND l.deleted_at IS NULL
       ORDER BY l.created_at DESC LIMIT 100`,
      [req.userId],
    );
    res.json({ items: rows.map((r) => ({ ...toCatalogItem(r), status: r.status })) });
  } catch (error) {
    console.error('[Nova/listings] кабинет не загружен', error);
    res.status(500).json({ error: 'internal' });
  }
});

/** Снятие с публикации. */
listingsRouter.post('/:id/close', requireAuth, async (req, res) => {
  const id = z.string().uuid().safeParse(req.params.id);
  if (!id.success) return res.status(400).json({ error: 'bad_id' });

  const reason = z.enum(['sold', 'paused']).safeParse(req.body?.reason);
  if (!reason.success) return res.status(400).json({ error: 'bad_reason' });

  try {
    const rows = await query<{ id: string }>(
      'UPDATE listings SET status = $1 WHERE id = $2 AND author_id = $3 RETURNING id',
      [reason.data, id.data, req.userId],
    );
    if (rows.length === 0) return res.status(404).json({ error: 'not_found' });
    res.json({ ok: true, status: reason.data });
  } catch (error) {
    console.error('[Nova/listings] снятие не удалось', error);
    res.status(500).json({ error: 'internal' });
  }
});
