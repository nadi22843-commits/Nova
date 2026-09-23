import type { DealType, FieldDef, Subcategory } from './types';
import type { CatalogItem } from './catalogData';
import type { LocationSelection } from './places/types';
import { distanceKm } from './places/geo';

/**
 * Фильтры собираются из тех же FieldDef, что и форма публикации.
 * Поэтому фильтр не может спрашивать поле, которого нет в форме,
 * и наоборот — как было в исходных схемах (привод и цвет заполнялись,
 * но не фильтровались).
 */

export type FilterValues = {
  priceFrom?: string;
  priceTo?: string;
  sellerKind?: string;
  /** Значения по ключам полей. Для range — «key.from» и «key.to». */
  [key: string]: string | undefined;
};

/**
 * Участвует ли поле в этом виде предложения.
 * Поле без указания видов участвует во всех — это общий случай.
 */
function appliesTo(field: FieldDef, deal?: DealType): boolean {
  if (!field.deals || field.deals.length === 0) return true;
  if (!deal) return true;
  return field.deals.includes(deal);
}

export function filterableFields(sub: Subcategory, deal?: DealType): FieldDef[] {
  return sub.fields.filter((f) => f.filterable && appliesTo(f, deal));
}

export function cardFields(sub: Subcategory, deal?: DealType): FieldDef[] {
  return sub.fields.filter((f) => f.showInCard && appliesTo(f, deal));
}

export function fieldsForStep(sub: Subcategory, step: number, deal?: DealType): FieldDef[] {
  return sub.fields.filter((f) => f.step === step && appliesTo(f, deal));
}

/**
 * Подкатегории, доступные в этом виде предложения.
 * «Сдать жильё» не должно предлагать туры и снаряжение.
 */
export function subcategoriesForDeal(
  subcategories: readonly Subcategory[],
  deal?: DealType,
): Subcategory[] {
  return subcategories.filter(
    (s) => !deal || !s.deals || s.deals.length === 0 || s.deals.includes(deal),
  );
}

/** Все поля вида предложения — для валидации перед публикацией. */
export function fieldsForDeal(sub: Subcategory, deal?: DealType): FieldDef[] {
  return sub.fields.filter((f) => appliesTo(f, deal));
}

function inRange(value: string | undefined, from?: string, to?: string): boolean {
  if (!from && !to) return true;
  const n = Number(value);
  if (!Number.isFinite(n)) return false;
  if (from && n < Number(from)) return false;
  if (to && n > Number(to)) return false;
  return true;
}

/**
 * Совпадение по месту.
 *
 * Два независимых режима. По границам — через путь предков: выбрана область,
 * находятся все её города. По радиусу — через расстояние, и тогда границы
 * не учитываются вовсе: это осознанный выбор пользователя искать «вокруг точки».
 */
export function matchesLocation(
  item: { placeId: string; lat?: number; lon?: number },
  location: LocationSelection,
  itemPath?: string[],
): boolean {
  // Вся страна — ничего не отсекаем.
  if (!location.placeId) return true;

  if (location.radiusKm && location.radiusKm > 0) {
    if (typeof location.lat !== 'number' || typeof location.lon !== 'number') return false;
    if (typeof item.lat !== 'number' || typeof item.lon !== 'number') return false;
    return distanceKm(location.lat, location.lon, item.lat, item.lon) <= location.radiusKm;
  }

  if (item.placeId === location.placeId) return true;
  return Boolean(itemPath?.includes(location.placeId));
}

export function matchItem(
  item: CatalogItem,
  sub: Subcategory,
  values: FilterValues,
  location: LocationSelection,
  deal?: DealType,
  /** Путь предков объявления — считается один раз при загрузке данных. */
  itemPath?: string[],
): boolean {
  // Сделка отсекается первой: человек, выбравший «Снять», не должен видеть
  // объявления о продаже.
  if (deal && item.deal !== deal) return false;

  if (!matchesLocation(item, location, itemPath)) return false;

  if (!inRange(String(item.price), values.priceFrom, values.priceTo)) return false;

  // Значение — стабильный код (owner/agent/company), не переведённый текст:
  // выбор в интерфейсе на любом языке даёт один и тот же результат фильтра.
  if (values.sellerKind && item.seller.kind !== values.sellerKind) return false;

  for (const field of filterableFields(sub, deal)) {
    if (field.filterKind === 'range') {
      const from = values[`${field.key}.from`];
      const to = values[`${field.key}.to`];
      if (!inRange(item.attrs[field.key], from, to)) return false;
    } else if (field.type === 'toggle') {
      // Переключатель фильтруется как «yes / no» — стабильный код, а не
      // переведённое слово, иначе выбор на другом языке переставал фильтровать.
      const selected = values[field.key];
      if (!selected) continue;
      const isOn = item.attrs[field.key] === 'да';
      if (selected === 'yes' && !isOn) return false;
      if (selected === 'no' && isOn) return false;
    } else {
      // Значение поля хранится в исходном (русском) виде конфигурации —
      // как и attrs объявления, независимо от языка интерфейса. Экран
      // показывает переведённую подпись, но сравнивает канонический текст.
      const selected = values[field.key];
      if (selected && item.attrs[field.key] !== selected) return false;
    }
  }

  return true;
}

export type SortKey = 'new' | 'price-asc' | 'price-desc';

export const SORT_LABELS: Record<SortKey, string> = {
  new: 'Сначала новые',
  'price-asc': 'Сначала дешевле',
  'price-desc': 'Сначала дороже',
};

export function sortItems(items: CatalogItem[], sort: SortKey): CatalogItem[] {
  const copy = [...items];
  if (sort === 'price-asc') return copy.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') return copy.sort((a, b) => b.price - a.price);
  return copy.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

/** Склонение: 1 объявление, 2 объявления, 5 объявлений. */
export function pluralListings(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} объявление`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} объявления`;
  return `${n} объявлений`;
}
