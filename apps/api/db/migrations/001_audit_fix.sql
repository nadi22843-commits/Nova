-- Nova: миграция для базы, созданной старой версией schema.sql.
-- На новой базе не нужна — schema.sql уже содержит эти изменения.
-- Запуск: psql "$DATABASE_URL" -f db/migrations/001_audit_fix.sql

BEGIN;

-- 1. Виды сделок как в приложении (работа и услуги).
ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_deal_check;
ALTER TABLE listings ADD CONSTRAINT listings_deal_check
  CHECK (deal IN ('sale', 'rent', 'vacancy', 'resume', 'service'));

-- 2. Числовые индексы по атрибутам без падения на нечисловых значениях.
DROP INDEX IF EXISTS listings_attr_mileage_idx;
DROP INDEX IF EXISTS listings_attr_year_idx;
DROP INDEX IF EXISTS listings_attr_area_idx;

CREATE INDEX listings_attr_mileage_idx
  ON listings ((CASE WHEN (attrs->>'mileage') ~ '^-?[0-9]+(\.[0-9]+)?$' THEN (attrs->>'mileage')::numeric END))
  WHERE status = 'active' AND deleted_at IS NULL AND attrs ? 'mileage';
CREATE INDEX listings_attr_year_idx
  ON listings ((CASE WHEN (attrs->>'year') ~ '^-?[0-9]+(\.[0-9]+)?$' THEN (attrs->>'year')::numeric END))
  WHERE status = 'active' AND deleted_at IS NULL AND attrs ? 'year';
CREATE INDEX listings_attr_area_idx
  ON listings ((CASE WHEN (attrs->>'area') ~ '^-?[0-9]+(\.[0-9]+)?$' THEN (attrs->>'area')::numeric END))
  WHERE status = 'active' AND deleted_at IS NULL AND attrs ? 'area';

COMMIT;
