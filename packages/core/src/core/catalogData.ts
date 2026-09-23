import type { DealType } from './types';

/**
 * Демонстрационный каталог.
 *
 * Здесь лежат объявления, пока нет API. Формат намеренно совпадает с тем, что
 * вернёт сервер: attrs — это словарь по ключам FieldDef, поэтому карточка и
 * фильтры работают с реальными данными без переделки.
 *
 * Единственный источник для Web и Mobile: обе платформы читают этот файл
 * через @nova/core, поэтому каталог не может разойтись между ними.
 */

export type CatalogItem = {
  id: string;
  categoryId: string;
  subcategoryId: string;
  /** Вид предложения. Список показывает только объявления своего вида. */
  deal: DealType;
  title: string;
  price: number;
  /** ISO 4217. Хранится с объявлением: цена в Берлине не должна показаться в рублях. */
  currency: string;
  /** Место из справочника страны. Заменяет прежнюю строку региона. */
  countryCode: string;
  placeId: string;
  /** Координаты объекта — для поиска радиусом. Центр города здесь не годится. */
  lat?: number;
  lon?: number;
  image: string;
  publishedAt: string;
  seller: { name: string; kind: 'owner' | 'agent' | 'company'; verified: boolean };
  attrs: Record<string, string>;
};

export const catalog: CatalogItem[] = [
  {
    id: 'r-1',
    categoryId: 'realty',
    subcategoryId: 'land',
    deal: 'sale',
    title: 'Участок 12 соток, ИЖС',
    price: 2_900_000,
    currency: 'RUB',
    countryCode: 'RU',
    placeId: 'ru-mo',
    lat: 55.5043,
    lon: 37.5136,
    image: '/assets/house.jpg',
    publishedAt: '2026-09-06',
    seller: { name: 'Иван', kind: 'owner', verified: true },
    attrs: {
      area: '12',
      landUse: 'ИЖС',
      utilities: 'Электричество, газ',
      access: 'Асфальт',
      distance: '12',
    },
  },
  {
    id: 'r-2',
    categoryId: 'realty',
    subcategoryId: 'land',
    deal: 'sale',
    title: 'Участок 8 соток, СНТ',
    price: 1_650_000,
    currency: 'RUB',
    countryCode: 'RU',
    placeId: 'ru-lo',
    lat: 59.7,
    lon: 31.0,
    image: '/assets/house.jpg',
    publishedAt: '2026-09-05',
    seller: { name: 'Агентство «Дом»', kind: 'agent', verified: false },
    attrs: { area: '8', landUse: 'Садоводство (СНТ)', utilities: 'Электричество', access: 'Грунт', distance: '45' },
  },
  {
    id: 'r-3',
    categoryId: 'realty',
    subcategoryId: 'flat',
    deal: 'rent',
    title: 'Квартира-студия, 28 м²',
    price: 45_000,
    currency: 'RUB',
    countryCode: 'RU',
    placeId: 'ru-krd-sochi',
    lat: 43.5855,
    lon: 39.7231,
    image: '/assets/apartment.jpg',
    publishedAt: '2026-09-07',
    seller: { name: 'Мария', kind: 'owner', verified: true },
    attrs: { rooms: 'Студия', area: '28', floor: '4', totalFloors: '9', renovation: 'Евроремонт' },
  },
  {
    id: 'r-4',
    categoryId: 'realty',
    subcategoryId: 'house',
    deal: 'sale',
    title: 'Дом 120 м² с участком',
    price: 12_000_000,
    currency: 'RUB',
    countryCode: 'RU',
    placeId: 'ru-tat-kazan',
    lat: 55.7963,
    lon: 49.1088,
    image: '/assets/house.jpg',
    publishedAt: '2026-09-04',
    seller: { name: 'Пётр', kind: 'owner', verified: false },
    attrs: { area: '120', landArea: '8', floors: '2', heating: 'Газовое', material: 'Кирпич' },
  },
  {
    id: 'a-1',
    categoryId: 'auto',
    subcategoryId: 'cars',
    deal: 'sale',
    title: 'BMW X5',
    price: 5_490_000,
    currency: 'RUB',
    countryCode: 'RU',
    placeId: 'ru-msk',
    lat: 55.7558,
    lon: 37.6173,
    image: '/assets/car.jpg',
    publishedAt: '2026-09-07',
    seller: { name: 'Алексей', kind: 'owner', verified: true },
    attrs: {
      brand: 'BMW',
      model: 'X5',
      year: '2020',
      mileage: '54000',
      fuel: 'Дизель',
      gearbox: 'Автомат',
      drive: 'Полный',
      body: 'Внедорожник',
      color: 'Чёрный',
      owners: '1',
    },
  },
  {
    id: 'a-2',
    categoryId: 'auto',
    subcategoryId: 'cars',
    deal: 'sale',
    title: 'Mercedes-Benz E-Class',
    price: 4_990_000,
    currency: 'RUB',
    countryCode: 'RU',
    placeId: 'ru-msk',
    lat: 55.7558,
    lon: 37.6173,
    image: '/assets/car.jpg',
    publishedAt: '2026-09-06',
    seller: { name: 'Автосалон «Премиум»', kind: 'company', verified: true },
    attrs: {
      brand: 'Mercedes-Benz',
      model: 'E-Class',
      year: '2021',
      mileage: '32000',
      fuel: 'Бензин',
      gearbox: 'Автомат',
      drive: 'Задний',
      body: 'Седан',
      color: 'Серебристый',
      owners: '1',
    },
  },
  {
    id: 'a-3',
    categoryId: 'auto',
    subcategoryId: 'cars',
    deal: 'sale',
    title: 'Toyota Camry',
    price: 2_750_000,
    currency: 'RUB',
    countryCode: 'RU',
    placeId: 'ru-spb',
    lat: 59.9311,
    lon: 30.3609,
    image: '/assets/car.jpg',
    publishedAt: '2026-09-05',
    seller: { name: 'Дмитрий', kind: 'owner', verified: false },
    attrs: {
      brand: 'Toyota',
      model: 'Camry',
      year: '2020',
      mileage: '68000',
      fuel: 'Бензин',
      gearbox: 'Автомат',
      drive: 'Передний',
      body: 'Седан',
      color: 'Белый',
      owners: '2',
    },
  },
  {
    id: 'a-4',
    categoryId: 'auto',
    subcategoryId: 'moto',
    deal: 'sale',
    title: 'Honda CB500',
    price: 520_000,
    currency: 'RUB',
    countryCode: 'RU',
    placeId: 'ru-msk',
    lat: 55.7558,
    lon: 37.6173,
    image: '/assets/car.jpg',
    publishedAt: '2026-09-03',
    seller: { name: 'Сергей', kind: 'owner', verified: false },
    attrs: { brand: 'Honda', year: '2019', mileage: '12000', engineVolume: '500', type: 'Дорожный' },
  },
];

/**
 * Полный каталог: ручные примеры плюс сгенерированные из конфигураций.
 *
 * Ручные остаются первыми — на них удобно показывать конкретные сценарии.
 * Генератор наполняет остальное, чтобы списки и фильтры работали на объёме,
 * а не на трёх записях.
 */
let generatedCatalog: CatalogItem[] = [];
let userCatalog: CatalogItem[] = [];
/** Объявления, пришедшие с сервера (apps/web/src/shared/api/ServerCatalog). Mobile их не использует. */
let serverCatalog: CatalogItem[] = [];
let fullCatalog: CatalogItem[] = catalog;

function rebuildCatalog(): void {
  // Сначала свои объявления, затем серверные, затем примеры и демоданные.
  // Дубли по id отсекаются: объявление, опубликованное локально и уже
  // вернувшееся с сервера, не должно показываться дважды.
  const seen = new Set<string>();
  fullCatalog = [...userCatalog, ...serverCatalog, ...catalog, ...generatedCatalog].filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}
export function setGeneratedItems(items: CatalogItem[]): void { generatedCatalog = items; rebuildCatalog(); }
export function setUserItems(items: CatalogItem[]): void { userCatalog = items; rebuildCatalog(); }
export function setServerItems(items: CatalogItem[]): void { serverCatalog = items; rebuildCatalog(); }

export function allItems(): CatalogItem[] {
  return fullCatalog;
}

export function findItem(id: string): CatalogItem | undefined {
  return fullCatalog.find((i) => i.id === id);
}

export function itemsFor(categoryId: string, subcategoryId?: string): CatalogItem[] {
  return fullCatalog.filter(
    (i) => i.categoryId === categoryId && (!subcategoryId || i.subcategoryId === subcategoryId),
  );
}
