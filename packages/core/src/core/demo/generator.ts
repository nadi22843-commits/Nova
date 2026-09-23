import type { CategoryModule, Subcategory } from '../types';
import type { CatalogItem } from '../catalogData';

/**
 * Генератор демонстрационных объявлений.
 *
 * Строит объявления из настоящих конфигураций категорий, а не из отдельного
 * списка. Это не удобство, а гарантия: данные не могут разойтись с полями.
 * Добавили поле в подкатегорию — оно появится в демоданных само; убрали —
 * исчезнет. Ручной список рассинхронизировался бы на первой же правке.
 *
 * Генератор детерминированный: одна и та же входная последовательность даёт
 * один и тот же результат. Это нужно, чтобы показ выглядел одинаково каждый
 * раз и чтобы по скриншоту можно было найти объявление.
 *
 * Единственный источник для Web и Mobile — обе платформы вызывают эту функцию
 * через @nova/core, поэтому демонстрационные объявления не могут разойтись
 * между приложениями (одинаковые картинки, одинаковые заголовки, одинаковое
 * распределение по странам).
 */

/** Простой линейный конгруэнтный генератор — воспроизводимый и без зависимостей. */
function makeRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

type PlaceSeed = { placeId: string; lat: number; lon: number };

/** Места по странам, куда раскладываются объявления. */
const PLACES: Record<string, PlaceSeed[]> = {
  RU: [
    { placeId: 'ru-msk', lat: 55.7558, lon: 37.6173 },
    { placeId: 'ru-msk-cao', lat: 55.7558, lon: 37.6173 },
    { placeId: 'ru-msk-zao', lat: 55.728, lon: 37.44 },
    { placeId: 'ru-mo-khimki', lat: 55.897, lon: 37.4297 },
    { placeId: 'ru-mo-podolsk', lat: 55.4312, lon: 37.5447 },
    { placeId: 'ru-spb', lat: 59.9311, lon: 30.3609 },
    { placeId: 'ru-tat-kazan', lat: 55.7963, lon: 49.1088 },
    { placeId: 'ru-krd-sochi', lat: 43.5855, lon: 39.7231 },
    { placeId: 'ru-tver', lat: 56.8587, lon: 35.9176 },
  ],
  DE: [
    { placeId: 'de-by-muc', lat: 48.1351, lon: 11.582 },
    { placeId: 'de-by-nue', lat: 49.4521, lon: 11.0767 },
    { placeId: 'de-be-mitte', lat: 52.52, lon: 13.405 },
    { placeId: 'de-be-kreuzberg', lat: 52.4977, lon: 13.403 },
    { placeId: 'de-hh', lat: 53.5511, lon: 9.9937 },
    { placeId: 'de-nw-koeln', lat: 50.9375, lon: 6.9603 },
  ],
  AE: [
    { placeId: 'ae-du-marina', lat: 25.0805, lon: 55.1403 },
    { placeId: 'ae-du-deira', lat: 25.2697, lon: 55.3095 },
    { placeId: 'ae-az', lat: 24.4539, lon: 54.3773 },
    { placeId: 'ae-sh', lat: 25.3463, lon: 55.4209 },
  ],
  SG: [
    { placeId: 'sg-central', lat: 1.3048, lon: 103.8318 },
    { placeId: 'sg-east', lat: 1.3236, lon: 103.9273 },
    { placeId: 'sg-west', lat: 1.3404, lon: 103.709 },
  ],
};

const CURRENCY: Record<string, string> = { RU: 'RUB', DE: 'EUR', AE: 'AED', SG: 'SGD' };

/**
 * Порядок цен по подкатегориям.
 * Без этого генератор выдаст квартиру за 3000 и футболку за 8 миллионов —
 * на показе это замечают первым делом.
 */
const PRICE_RANGE: Record<string, [number, number]> = {
  land: [800_000, 9_000_000],
  flat: [3_500_000, 40_000_000],
  house: [4_000_000, 60_000_000],
  garage: [300_000, 3_500_000],
  commercial: [5_000_000, 90_000_000],
  cars: [350_000, 12_000_000],
  moto: [80_000, 1_800_000],
  trucks: [700_000, 15_000_000],
  parts: [500, 90_000],
  phones: [4_000, 180_000],
  computers: [12_000, 400_000],
  'tv-audio': [2_000, 250_000],
  photo: [5_000, 400_000],
  gaming: [1_000, 90_000],
  furniture: [1_500, 250_000],
  appliances: [3_000, 200_000],
  garden: [500, 90_000],
  'repair-goods': [300, 80_000],
  clothes: [300, 40_000],
  accessories: [500, 150_000],
  'beauty-goods': [200, 25_000],
  'kids-clothes': [200, 12_000],
  strollers: [3_000, 90_000],
  toys: [200, 25_000],
  'kids-furniture': [1_500, 80_000],
  sport: [500, 150_000],
  music: [2_000, 400_000],
  books: [100, 90_000],
  tickets: [500, 25_000],
  animals: [0, 120_000],
  'pet-goods': [200, 40_000],
  'daily-rent': [1_500, 45_000],
  tours: [2_000, 250_000],
  gear: [500, 90_000],
  repair: [1_000, 150_000],
  beauty: [500, 25_000],
  education: [700, 8_000],
  transport: [800, 30_000],
  cleaning: [1_000, 20_000],
  it: [5_000, 400_000],
};

/** Множители, чтобы цены в других валютах не выглядели абсурдно. */
const PRICE_SCALE: Record<string, number> = { RU: 1, DE: 0.011, AE: 0.045, SG: 0.017 };

const CATEGORY_IMAGES: Record<string, readonly string[]> = {
  realty: ['/assets/apartment.jpg', '/assets/house.jpg'],
  auto: ['/assets/car.jpg', '/assets/short-car.jpg'],
  electronics: ['/assets/laptop.jpg', '/assets/phone.jpg', '/assets/short-laptop.jpg', '/assets/short-phone.jpg'],
  home: ['/assets/apartment.jpg', '/assets/short-sofa.jpg', '/assets/short-kitchen.jpg'],
  personal: ['/assets/shoes.jpg', '/assets/short-shoes.jpg', '/assets/short-bag.jpg'],
  hobby: ['/assets/category-art.svg', '/assets/category-music.svg', '/assets/category-sport.svg', '/assets/category-books.svg'],
  travel: ['/assets/category-travel.svg', '/assets/house.jpg'],
  services: ['/assets/category-services.svg', '/assets/category-beauty.svg', '/assets/category-education.svg'],
  kids: ['/assets/category-kids.svg'],
  pets: ['/assets/category-pets.svg'],
  work: ['/assets/category-work.svg'],
};

const SUBCATEGORY_IMAGES: Record<string, readonly string[]> = {
  'hobby:art': ['/assets/category-art.svg'], 'work:art': ['/assets/category-art.svg'],
  'hobby:music': ['/assets/category-music.svg'], 'hobby:sport': ['/assets/category-sport.svg'],
  'hobby:books': ['/assets/category-books.svg'], 'kids:toys': ['/assets/category-kids.svg'],
  'services:beauty': ['/assets/category-beauty.svg'], 'work:beauty': ['/assets/category-beauty.svg'],
  'services:education': ['/assets/category-education.svg'], 'work:education': ['/assets/category-education.svg'],
  'services:it': ['/assets/laptop.jpg'], 'work:it': ['/assets/laptop.jpg'],
  'services:transport': ['/assets/car.jpg'], 'work:transport': ['/assets/car.jpg'],
  'home:furniture': ['/assets/category-homegoods.svg', '/assets/short-sofa.jpg'],
};

const CURATED_TITLES: Record<string, readonly string[]> = {
  'work:sales:vacancy': ['Продавец-консультант', 'Менеджер по продажам', 'Кассир'],
  'work:sales:resume': ['Менеджер по продажам ищет работу', 'Продавец-консультант · резюме'],
  'work:transport:vacancy': ['Водитель категории B', 'Курьер на автомобиле', 'Водитель-экспедитор'],
  'work:transport:resume': ['Водитель · опыт 5 лет', 'Логист · резюме'],
  'electronics:phones:sale': ['iPhone 15 Pro 256 ГБ', 'Samsung Galaxy S24', 'Смартфон в отличном состоянии'],
  'electronics:computers:sale': ['MacBook Air M2', 'Ноутбук для работы', 'Игровой ноутбук'],
  'auto:cars:sale': ['BMW X5', 'Mercedes-Benz E-Class', 'Toyota Camry'],
  'realty:flat:sale': ['2-комнатная квартира', 'Светлая квартира с ремонтом', 'Квартира рядом с парком'],
  'realty:flat:rent': ['Квартира-студия', '1-комнатная квартира в аренду'],
  'realty:house:sale': ['Дом 120 м² с участком', 'Современный загородный дом'],
  'travel:daily-rent:rent': ['Глэмпинг в лесу', 'Домик у озера', 'Уютный дом для выходных'],
};

const SELLER_NAMES: Record<string, string[]> = {
  RU: ['Алексей', 'Мария', 'Дмитрий', 'Ольга', 'Сергей', 'Анна', 'Игорь', 'Екатерина'],
  DE: ['Lukas', 'Anna', 'Felix', 'Sophie', 'Jonas', 'Marie'],
  AE: ['Ahmed', 'Fatima', 'Omar', 'Layla', 'Yusuf'],
  SG: ['Wei Ming', 'Priya', 'Daniel', 'Siti', 'Jun Jie'],
};

const COMPANIES: Record<string, string[]> = {
  RU: ['Компания «Вектор»', 'Студия «Мастер»', 'Автосалон «Премиум»'],
  DE: ['Autohaus Nord', 'Immobilien Schmidt', 'TechPoint GmbH'],
  AE: ['Gulf Trading', 'Marina Properties'],
  SG: ['Lion Motors', 'City Realty'],
};

/**
 * Сколько объявлений генерировать на подкатегорию.
 *
 * Минимум восемь везде, чтобы MVP можно было реально тестировать (см. ТЗ).
 * Авто, Недвижимость и Работа — самые смотрибельные разделы демо, поэтому
 * для них объём больше.
 */
const PER_SUBCATEGORY_DEFAULT = 8;
const PER_SUBCATEGORY_OVERRIDE: Record<string, number> = {
  auto: 15,
  realty: 15,
  work: 12,
};

function pick<T>(rnd: () => number, list: readonly T[]): T {
  return list[Math.floor(rnd() * list.length)];
}

function pickInt(rnd: () => number, min: number, max: number): number {
  return Math.floor(min + rnd() * (max - min + 1));
}

/** Округление цены до «человеческого» вида: 2 900 000, а не 2 873 412. */
function roundPrice(value: number): number {
  if (value >= 1_000_000) return Math.round(value / 100_000) * 100_000;
  if (value >= 100_000) return Math.round(value / 10_000) * 10_000;
  if (value >= 10_000) return Math.round(value / 1_000) * 1_000;
  if (value >= 1_000) return Math.round(value / 100) * 100;
  return Math.max(100, Math.round(value / 50) * 50);
}

/**
 * Значение поля.
 *
 * Для select берём вариант из самого конфига — поэтому значение всегда
 * проходит фильтр по этому полю. Для чисел — правдоподобный диапазон
 * по смыслу поля, а не случайное число.
 */
function valueForField(rnd: () => number, key: string, options?: readonly string[]): string {
  if (options && options.length > 0) return pick(rnd, options);

  const ranges: Record<string, [number, number]> = {
    area: [18, 220],
    landArea: [4, 30],
    floor: [1, 24],
    totalFloors: [5, 25],
    floors: [1, 3],
    year: [2005, 2025],
    buildYear: [1960, 2024],
    mileage: [5_000, 220_000],
    engineVolume: [1, 5],
    distance: [3, 80],
    guests: [1, 8],
    minNights: [1, 7],
    durationDays: [1, 14],
    ageMonths: [2, 60],
    weightLimit: [9, 36],
    screen: [13, 75],
    shutterCount: [1_000, 90_000],
    ceiling: [3, 8],
    width: [60, 240],
    depth: [40, 90],
    height: [70, 220],
    batteryHealth: [78, 100],
    quantity: [1, 4],
    loadCapacity: [1, 20],
    term: [3, 45],
    duration: [45, 90],
    experience: [1, 12],
  };

  const range = ranges[key];
  if (range) return String(pickInt(rnd, range[0], range[1]));
  return '';
}

/** Заголовок объявления собирается из значимых полей — как его пишет человек. */
function buildTitle(sub: Subcategory, attrs: Record<string, string>): string {
  const parts: string[] = [];
  for (const key of ['brand', 'kind', 'service', 'subject', 'species', 'partType', 'rooms', 'landUse', 'type']) {
    if (attrs[key]) parts.push(attrs[key]);
    if (parts.length === 2) break;
  }
  if (attrs.model) parts.push(attrs.model);
  if (parts.length === 0) parts.push(sub.title);
  if (attrs.area) parts.push(`${attrs.area} м²`);
  return parts.join(' ').slice(0, 70);
}

export function generateDemoItems(
  categories: CategoryModule[],
  perSubcategory?: number,
  seed = 20260909,
): CatalogItem[] {
  const rnd = makeRandom(seed);
  const items: CatalogItem[] = [];
  let counter = 0;

  /**
   * Взвешенное распределение по странам.
   *
   * Россия — рынок запуска, поэтому основная масса объявлений там: пустой
   * список в стране запуска выглядит хуже, чем отсутствие страны вообще.
   * Остальные показывают, что мультивалютность и разные структуры мест
   * работают по-настоящему.
   */
  const countries = ['RU', 'RU', 'RU', 'RU', 'RU', 'RU', 'DE', 'DE', 'AE', 'SG'];

  for (const category of categories) {
    // Категории со своим роутингом (например «Работа») не описываются полями
    // объявления — данные для них генерировать нечем.
    if (category.subcategories.length === 0) continue;

    const publishDeals = new Set(category.intents.map((i) => i.deal));
    const countPerSub = perSubcategory ?? PER_SUBCATEGORY_OVERRIDE[category.id] ?? PER_SUBCATEGORY_DEFAULT;

    for (const sub of category.subcategories) {
      for (let n = 0; n < countPerSub; n += 1) {
        const countryCode = pick(rnd, countries);
        const place = pick(rnd, PLACES[countryCode]);

        // Вид предложения берём из намерений категории: в работе это
        // вакансия и резюме, в недвижимости продажа и аренда.
        // Учитываем ограничения подкатегории: посуточное жильё не продаётся,
        // участок не сдаётся. Иначе объявление получало вид сделки, в котором
        // его подкатегория не показывается, и оно было недостижимо.
        const allowed = [...publishDeals].filter((d) => !sub.deals || sub.deals.length === 0 || sub.deals.includes(d));
        const deals = allowed.length > 0 ? allowed : [...publishDeals];
        const deal = deals.length > 1 ? pick(rnd, deals) : (deals[0] ?? 'sale');

        const attrs: Record<string, string> = {};
        for (const field of sub.fields) {
          // Поле, не относящееся к этому виду предложения, пропускаем.
          if (field.deals && field.deals.length > 0 && !field.deals.includes(deal)) continue;
          // Название и описание собираются отдельно, фото пропускаем.
          if (field.key === 'title' || field.key === 'photos' || field.key === 'description') continue;
          if (field.type === 'toggle') {
            attrs[field.key] = rnd() > 0.45 ? 'да' : '';
            continue;
          }
          if (field.key === 'price') continue;
          const value = valueForField(rnd, field.key, field.options);
          // Необязательное поле иногда остаётся пустым — так выглядят реальные
          // объявления, и это проверяет, что карточка переживает пропуски.
          if (value && (field.required || rnd() > 0.25)) attrs[field.key] = value;
        }

        const [minPrice, maxPrice] = PRICE_RANGE[sub.id] ?? [1_000, 100_000];
        const scale = PRICE_SCALE[countryCode] ?? 1;
        const price = roundPrice(pickInt(rnd, minPrice, maxPrice) * scale);

        const isCompany = rnd() > 0.72;

        // Дата публикации — в пределах последних тридцати дней.
        const daysAgo = pickInt(rnd, 0, 30);
        const published = new Date(Date.UTC(2026, 8, 9) - daysAgo * 86_400_000);

        counter += 1;
        items.push({
          id: `${category.id}-${sub.id}-${counter}`,
          categoryId: category.id,
          subcategoryId: sub.id,
          deal,
          title: pick(rnd, CURATED_TITLES[`${category.id}:${sub.id}:${deal}`] ?? [buildTitle(sub, attrs)]),
          price,
          currency: CURRENCY[countryCode] ?? 'USD',
          countryCode,
          placeId: place.placeId,
          // Небольшой разброс вокруг центра места: объявления не должны
          // лежать в одной точке, иначе радиус нечего проверять.
          lat: place.lat + (rnd() - 0.5) * 0.25,
          lon: place.lon + (rnd() - 0.5) * 0.25,
          image: pick(rnd, SUBCATEGORY_IMAGES[`${category.id}:${sub.id}`] ?? CATEGORY_IMAGES[category.id] ?? ['/assets/placeholder.jpg']),
          publishedAt: published.toISOString().slice(0, 10),
          seller: isCompany
            ? { name: pick(rnd, COMPANIES[countryCode] ?? COMPANIES.RU), kind: 'company', verified: rnd() > 0.3 }
            : {
                name: pick(rnd, SELLER_NAMES[countryCode] ?? SELLER_NAMES.RU),
                kind: rnd() > 0.8 ? 'agent' : 'owner',
                verified: rnd() > 0.55,
              },
          attrs,
        });
      }
    }
  }

  return items;
}
