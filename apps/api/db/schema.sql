-- ─────────────────────────────────────────────────────────────────────
-- Audit fix: схема идемпотентна (IF NOT EXISTS) — повторный запуск не падает.
-- Виды сделок совпадают с packages/core: sale, rent, vacancy, resume, service.
-- Числовые индексы по attrs защищены проверкой: нечисловое значение
-- («54 000») больше не ломает INSERT/UPDATE объявления.
-- Если база уже создана старой схемой — выполните db/migrations/001_audit_fix.sql.
-- ─────────────────────────────────────────────────────────────────────

-- ═══════════════════════════════════════════════════════════════
-- Nova — схема базы данных (PostgreSQL 14+)
-- ═══════════════════════════════════════════════════════════════
--
-- Главное решение схемы: атрибуты объявлений хранятся в JSONB, а не
-- в отдельных колонках и не в таблице «сущность-атрибут-значение».
--
-- Почему не колонки. У нас 380 полей в 40 подкатегориях, и они почти не
-- пересекаются: у участка «вид разрешённого использования», у телефона
-- «ёмкость аккумулятора». Таблица на 380 колонок, где заполнено десять, —
-- это мёртвая схема, которая требует миграции на каждую новую категорию.
--
-- Почему не EAV. Классическая таблица «объявление, ключ, значение» кажется
-- гибкой, но любой фильтр по трём полям превращается в три соединения,
-- а сортировка по числовому атрибуту — в приведение типов на лету.
--
-- JSONB с GIN-индексом даёт и гибкость, и скорость: новая категория не
-- требует миграции вообще, а фильтр по атрибуту укладывается в один индекс.
-- Часто фильтруемые числовые поля дополнительно выносятся в отдельные
-- индексы-выражения — см. конец файла.

-- ─────────────────────────────────────────────
-- Пользователи
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Телефон — основной идентификатор: на досках объявлений входят по нему.
  -- Хранится в формате E.164 (+79991234567), без пробелов и скобок.
  phone         text UNIQUE,
  email         text UNIQUE,

  name          text,
  avatar_url    text,

  -- Страна пользователя. Влияет на валюту, язык и на то, какие объявления
  -- он видит по умолчанию.
  country_code  char(2) NOT NULL,
  language      text NOT NULL DEFAULT 'ru',

  -- Проверка личности. Пока просто флаг, позже сюда придёт способ проверки:
  -- документ, банк, госуслуги — в разных странах по-разному.
  verified      boolean NOT NULL DEFAULT false,

  -- Тип аккаунта влияет на лимиты размещения и на подпись в карточке.
  kind          text NOT NULL DEFAULT 'private'
                CHECK (kind IN ('private', 'agent', 'company')),

  created_at    timestamptz NOT NULL DEFAULT now(),
  last_seen_at  timestamptz,

  -- Мягкое удаление: объявления и переписка должны пережить удаление
  -- аккаунта, иначе у собеседника пропадёт история сделки.
  deleted_at    timestamptz,

  CONSTRAINT users_contact_required CHECK (phone IS NOT NULL OR email IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS users_country_idx ON users (country_code) WHERE deleted_at IS NULL;

-- ─────────────────────────────────────────────
-- Сессии
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sessions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Храним хеш токена, а не сам токен: утечка базы не должна давать
  -- возможность войти под чужим аккаунтом.
  token_hash    text NOT NULL UNIQUE,

  -- Для показа списка «где выполнен вход» и отзыва чужих сессий.
  device        text,
  ip            inet,

  created_at    timestamptz NOT NULL DEFAULT now(),
  expires_at    timestamptz NOT NULL,
  revoked_at    timestamptz
);

CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions (user_id) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions (expires_at) WHERE revoked_at IS NULL;

-- Одноразовые коды входа по телефону.
CREATE TABLE IF NOT EXISTS auth_codes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone         text NOT NULL,
  code_hash     text NOT NULL,
  attempts      smallint NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  expires_at    timestamptz NOT NULL,
  used_at       timestamptz
);

CREATE INDEX IF NOT EXISTS auth_codes_phone_idx ON auth_codes (phone, created_at DESC);

-- ─────────────────────────────────────────────
-- Объявления
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS listings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id       uuid NOT NULL REFERENCES users(id),

  -- Категория и подкатегория хранятся строками, а не внешними ключами:
  -- справочник категорий живёт в коде (packages/core), а не в базе.
  -- Так добавление категории не требует миграции.
  category_id     text NOT NULL,
  subcategory_id  text NOT NULL,

  -- Продажа или аренда. Отделено от намерения: «купить» и «продать» —
  -- разные намерения, но одна сделка.
  deal            text NOT NULL CHECK (deal IN ('sale', 'rent', 'vacancy', 'resume', 'service')),

  title           text NOT NULL,
  description     text,

  -- Цена в наименьших единицах валюты (копейки, центы): хранить деньги
  -- дробным числом нельзя, накапливается ошибка округления.
  price_minor     bigint,
  currency        char(3) NOT NULL,
  -- Для услуг и «отдам даром»: цена может быть «от» или отсутствовать.
  price_kind      text NOT NULL DEFAULT 'fixed'
                  CHECK (price_kind IN ('fixed', 'from', 'free', 'negotiable')),

  -- География. place_id ссылается на справочник мест из кода,
  -- координаты нужны для поиска радиусом.
  country_code    char(2) NOT NULL,
  place_id        text NOT NULL,
  lat             double precision,
  lon             double precision,
  address         text,

  -- Атрибуты подкатегории. Ключи совпадают с FieldDef.key из конфигурации.
  attrs           jsonb NOT NULL DEFAULT '{}'::jsonb,

  status          text NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft', 'moderation', 'active', 'paused', 'sold', 'expired', 'rejected')),
  -- Причина отклонения модератором — показывается автору.
  reject_reason   text,

  views           integer NOT NULL DEFAULT 0,
  contacts        integer NOT NULL DEFAULT 0,

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  published_at    timestamptz,
  -- Объявления протухают: доска, полная неактуальных предложений, бесполезна.
  expires_at      timestamptz,
  deleted_at      timestamptz,

  CONSTRAINT listings_coords_valid CHECK (
    (lat IS NULL AND lon IS NULL) OR
    (lat BETWEEN -90 AND 90 AND lon BETWEEN -180 AND 180)
  )
);

-- ── Индексы для списка ──

-- Основной индекс выдачи: активные объявления подкатегории в стране,
-- свежие сверху. Частичный — мёртвые объявления в индекс не попадают,
-- он остаётся компактным.
CREATE INDEX IF NOT EXISTS listings_feed_idx
  ON listings (country_code, subcategory_id, deal, published_at DESC)
  WHERE status = 'active' AND deleted_at IS NULL;

-- Поиск по месту: строковое сравнение place_id плюс вложенность
-- разворачивается на стороне приложения в список идентификаторов.
CREATE INDEX IF NOT EXISTS listings_place_idx
  ON listings (place_id, published_at DESC)
  WHERE status = 'active' AND deleted_at IS NULL;

-- Сортировка по цене внутри подкатегории.
CREATE INDEX IF NOT EXISTS listings_price_idx
  ON listings (subcategory_id, price_minor)
  WHERE status = 'active' AND deleted_at IS NULL;

-- Кабинет автора: все его объявления любого статуса.
CREATE INDEX IF NOT EXISTS listings_author_idx
  ON listings (author_id, created_at DESC)
  WHERE deleted_at IS NULL;

-- Атрибуты. GIN по jsonb_path_ops компактнее обычного GIN и быстрее
-- на запросах вида attrs @> '{"brand":"BMW"}'.
CREATE INDEX IF NOT EXISTS listings_attrs_idx
  ON listings USING gin (attrs jsonb_path_ops)
  WHERE status = 'active' AND deleted_at IS NULL;

-- Полнотекстовый поиск по названию и описанию.
-- Конфигурация 'russian' для русского рынка; для мультиязычного запуска
-- сюда придёт выбор конфигурации по языку объявления.
CREATE INDEX IF NOT EXISTS listings_search_idx
  ON listings USING gin (
    to_tsvector('russian', coalesce(title, '') || ' ' || coalesce(description, ''))
  )
  WHERE status = 'active' AND deleted_at IS NULL;

-- Географический поиск радиусом. Индекс по координатам как по точке;
-- при росте объёма заменяется на PostGIS, но на старте хватает этого.
CREATE INDEX IF NOT EXISTS listings_geo_idx
  ON listings (lat, lon)
  WHERE status = 'active' AND deleted_at IS NULL AND lat IS NOT NULL;

-- ─────────────────────────────────────────────
-- Фотографии
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS listing_photos (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id    uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,

  -- Ключ в объектном хранилище, а не полный адрес: домен хранилища
  -- может смениться, ключ останется прежним.
  storage_key   text NOT NULL,
  width         integer,
  height        integer,
  -- Размытая миниатюра в base64 для показа до загрузки: список не должен
  -- прыгать, пока грузятся картинки.
  blur_hash     text,

  position      smallint NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS listing_photos_idx ON listing_photos (listing_id, position);

-- ─────────────────────────────────────────────
-- Избранное и сохранённые поиски
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS favorites (
  user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id    uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, listing_id)
);

CREATE INDEX IF NOT EXISTS favorites_user_idx ON favorites (user_id, created_at DESC);

-- Сохранённый поиск с уведомлениями — то, что возвращает людей в приложение.
CREATE TABLE IF NOT EXISTS saved_searches (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title         text NOT NULL,

  -- Условия поиска целиком: подкатегория, фильтры, место, радиус.
  -- Формат совпадает с параметрами запроса к /listings.
  query         jsonb NOT NULL,

  notify        boolean NOT NULL DEFAULT true,
  last_seen_at  timestamptz NOT NULL DEFAULT now(),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS saved_searches_user_idx ON saved_searches (user_id);
CREATE INDEX IF NOT EXISTS saved_searches_notify_idx ON saved_searches (notify) WHERE notify = true;

-- ─────────────────────────────────────────────
-- Переписка
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS chats (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id    uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id      uuid NOT NULL REFERENCES users(id),
  seller_id     uuid NOT NULL REFERENCES users(id),

  created_at    timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz,

  -- Один диалог на пару «покупатель — объявление»: иначе переписка
  -- разваливается на несколько веток и обе стороны теряют контекст.
  UNIQUE (listing_id, buyer_id)
);

CREATE INDEX IF NOT EXISTS chats_buyer_idx ON chats (buyer_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS chats_seller_idx ON chats (seller_id, last_message_at DESC);

CREATE TABLE IF NOT EXISTS messages (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id       uuid NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  author_id     uuid NOT NULL REFERENCES users(id),

  body          text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  read_at       timestamptz
);

CREATE INDEX IF NOT EXISTS messages_chat_idx ON messages (chat_id, created_at);

-- ─────────────────────────────────────────────
-- Модерация и жалобы
-- ─────────────────────────────────────────────

-- Жалобы обязательны для магазинов приложений: без механизма жалоб
-- на контент приложение-маркетплейс не проходит ревью.
CREATE TABLE IF NOT EXISTS reports (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id    uuid REFERENCES listings(id) ON DELETE CASCADE,
  user_id       uuid REFERENCES users(id) ON DELETE SET NULL,
  reporter_id   uuid REFERENCES users(id) ON DELETE SET NULL,

  reason        text NOT NULL,
  comment       text,

  status        text NOT NULL DEFAULT 'open'
                CHECK (status IN ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  resolved_at   timestamptz,

  CONSTRAINT reports_target_required CHECK (listing_id IS NOT NULL OR user_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS reports_open_idx ON reports (created_at) WHERE status = 'open';

-- ─────────────────────────────────────────────
-- Обновление updated_at
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS listings_touch ON listings;
CREATE TRIGGER listings_touch
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ─────────────────────────────────────────────
-- Индексы по частым числовым атрибутам
-- ─────────────────────────────────────────────
--
-- GIN по attrs отлично отвечает на равенство («марка BMW»), но плохо —
-- на диапазоны («пробег до 50 000»). Для полей, по которым фильтруют
-- диапазоном чаще всего, добавляем индексы-выражения.
--
-- Список намеренно короткий: каждый индекс замедляет запись. Добавлять
-- новые нужно по статистике реальных запросов, а не заранее.

CREATE INDEX IF NOT EXISTS listings_attr_mileage_idx
  ON listings ((CASE WHEN (attrs->>'mileage') ~ '^-?[0-9]+(\.[0-9]+)?$' THEN (attrs->>'mileage')::numeric END))
  WHERE status = 'active' AND deleted_at IS NULL AND attrs ? 'mileage';

CREATE INDEX IF NOT EXISTS listings_attr_year_idx
  ON listings ((CASE WHEN (attrs->>'year') ~ '^-?[0-9]+(\.[0-9]+)?$' THEN (attrs->>'year')::numeric END))
  WHERE status = 'active' AND deleted_at IS NULL AND attrs ? 'year';

CREATE INDEX IF NOT EXISTS listings_attr_area_idx
  ON listings ((CASE WHEN (attrs->>'area') ~ '^-?[0-9]+(\.[0-9]+)?$' THEN (attrs->>'area')::numeric END))
  WHERE status = 'active' AND deleted_at IS NULL AND attrs ? 'area';
