import type { CategoryModule } from '../core/types';

/**
 * Авто.
 *
 * Исправления относительно исходных схем:
 * — VIN стоит первым: по нему заполняются марка, модель, год, двигатель,
 *   коробка, привод и кузов, вместо четырёх экранов ручного выбора;
 * — тип топлива и объём двигателя разделены, потому что фильтровать их нужно
 *   по отдельности;
 * — привод и цвет заполнялись автором, но не фильтровались — теперь фильтруются;
 * — число владельцев выведено в карточку: для авто это фактор доверия.
 */
export const autoCategory: CategoryModule = {
  id: 'auto',
  title: 'Авто',
  icon: 'car',
  path: '/auto',
  intents: [
    { id: 'buy', title: 'Купить', subtitle: 'Все объявления', mode: 'browse', deal: 'sale' },
    { id: 'rent', title: 'Взять в аренду', subtitle: 'Авто и спецтехника напрокат', mode: 'browse', deal: 'rent' },
    { id: 'sell', title: 'Продать', subtitle: 'Разместить своё объявление', mode: 'publish', deal: 'sale' },
    { id: 'lease', title: 'Сдать в аренду', subtitle: 'Разместить объявление об аренде', mode: 'publish', deal: 'rent' },
  ],
  subcategories: [
    {
      id: 'cars',
      title: 'Легковые авто',
      listTitle: 'Легковые авто',
      steps: ['VIN и модель', 'Фото', 'Характеристики', 'Цена и город', 'Предпросмотр'],
      fields: [
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит покупатель.' },
        {
          key: 'vin',
          label: 'VIN или госномер',
          type: 'text',
          step: 1,
          hint: 'Заполним марку, модель, год и двигатель автоматически. Можно ввести данные вручную.',
          deals: ['sale'],
        },
        { key: 'brand', label: 'Марка', type: 'select', reference: 'auto-brands', required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'model', label: 'Модель', type: 'select', reference: 'auto-brands', dependsOn: 'brand', required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'year', label: 'Год выпуска', type: 'number', required: true, step: 1, filterable: true, filterKind: 'range', showInCard: true },
        { key: 'photos', label: 'Фотографии', type: 'text', step: 2, hint: 'Минимум 3 фото: спереди, сзади, салон.' },
        { key: 'mileage', label: 'Пробег', type: 'number', unit: 'км', required: true, step: 3, filterable: true, filterKind: 'range', showInCard: true },
        { key: 'fuel', label: 'Тип топлива', type: 'select', options: ['Бензин', 'Дизель', 'Гибрид', 'Электро', 'Газ'], required: true, step: 3, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'engineVolume', label: 'Объём двигателя', type: 'number', unit: 'л', step: 3, filterable: true, filterKind: 'range', showInCard: true },
        { key: 'gearbox', label: 'Коробка передач', type: 'select', options: ['Автомат', 'Механика', 'Робот', 'Вариатор'], required: true, step: 3, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'drive', label: 'Привод', type: 'select', options: ['Передний', 'Задний', 'Полный'], step: 3, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'body', label: 'Кузов', type: 'select', options: ['Седан', 'Хэтчбек', 'Универсал', 'Внедорожник', 'Купе', 'Минивэн'], step: 3, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'color', label: 'Цвет', type: 'select', options: ['Чёрный', 'Белый', 'Серебристый', 'Серый', 'Синий', 'Красный'], step: 3, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'owners', label: 'Владельцев по ПТС', type: 'select', options: ['1', '2', '3 и более'], step: 3, deals: ['sale'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'description', label: 'Описание', type: 'textarea', step: 3, hint: 'Состояние, история обслуживания, что менялось.' },
        { key: 'price', label: 'Цена', type: 'money', unit: '₽', required: true, step: 4, deals: ['sale'] },
        { key: 'price', label: 'Цена за сутки', type: 'money', unit: '₽', required: true, step: 4, deals: ['rent'] },
        { key: 'rentPeriod', label: 'Минимальный срок', type: 'select', options: ['Час', 'Сутки', 'Неделя', 'Месяц'], required: true, step: 4, deals: ['rent'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'deposit', label: 'Залог', type: 'money', unit: '₽', step: 4, deals: ['rent'], showInCard: true, hint: 'Оставьте пустым, если залога нет.' },
        { key: 'minAge', label: 'Возраст водителя от', type: 'number', unit: 'лет', step: 4, deals: ['rent'], showInCard: true },
        { key: 'minLicense', label: 'Стаж вождения от', type: 'number', unit: 'лет', step: 4, deals: ['rent'], showInCard: true },
        { key: 'mileageLimit', label: 'Лимит пробега в сутки', type: 'number', unit: 'км', step: 4, deals: ['rent'], showInCard: true },
        { key: 'withDriver', label: 'С водителем', type: 'toggle', step: 4, deals: ['rent'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 4 },
      ],
    },
    {
      id: 'moto',
      title: 'Мотоциклы и мототехника',
      listTitle: 'Мотоциклы и мототехника',
      steps: ['Основные параметры', 'Фото', 'Характеристики', 'Цена и город', 'Предпросмотр'],
      fields: [
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит покупатель.' },
        { key: 'brand', label: 'Марка', type: 'select', reference: 'moto-brands', required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'model', label: 'Модель', type: 'select', reference: 'moto-brands', dependsOn: 'brand', step: 1, showInCard: true },
        { key: 'type', label: 'Тип', type: 'select', options: ['Дорожный', 'Спорт', 'Кросс', 'Эндуро', 'Круизер', 'Скутер'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'year', label: 'Год выпуска', type: 'number', required: true, step: 1, filterable: true, filterKind: 'range', showInCard: true },
        { key: 'photos', label: 'Фотографии', type: 'text', step: 2 },
        { key: 'mileage', label: 'Пробег', type: 'number', unit: 'км', step: 3, filterable: true, filterKind: 'range', showInCard: true },
        { key: 'engineVolume', label: 'Объём двигателя', type: 'number', unit: 'см³', step: 3, filterable: true, filterKind: 'range', showInCard: true },
        { key: 'description', label: 'Описание', type: 'textarea', step: 3 },
        { key: 'price', label: 'Цена', type: 'money', unit: '₽', required: true, step: 4 },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 4 },
      ],
    },
    {
      id: 'trucks',
      title: 'Грузовики и спецтехника',
      listTitle: 'Грузовики и спецтехника',
      steps: ['Основные параметры', 'Фото', 'Характеристики', 'Цена и город', 'Предпросмотр'],
      fields: [
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит покупатель.' },
        { key: 'kind', label: 'Тип техники', type: 'select', options: ['Грузовик', 'Тягач', 'Автобус', 'Экскаватор', 'Погрузчик', 'Кран'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'brand', label: 'Марка', type: 'text', required: true, step: 1, showInCard: true },
        { key: 'year', label: 'Год выпуска', type: 'number', required: true, step: 1, filterable: true, filterKind: 'range', showInCard: true },
        { key: 'photos', label: 'Фотографии', type: 'text', step: 2 },
        { key: 'mileage', label: 'Пробег', type: 'number', unit: 'км', step: 3, filterable: true, filterKind: 'range', showInCard: true },
        { key: 'loadCapacity', label: 'Грузоподъёмность', type: 'number', unit: 'т', step: 3, filterable: true, filterKind: 'range', showInCard: true },
        { key: 'description', label: 'Описание', type: 'textarea', step: 3 },
        { key: 'price', label: 'Цена', type: 'money', unit: '₽', required: true, step: 4 },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 4 },
      ],
    },
    {
      id: 'parts',
      deals: ['sale'],
      title: 'Запчасти и аксессуары',
      listTitle: 'Запчасти и аксессуары',
      steps: ['Основные параметры', 'Фото', 'Цена и город', 'Предпросмотр'],
      fields: [
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит покупатель.' },
        { key: 'partType', label: 'Тип запчасти', type: 'select', options: ['Кузов', 'Двигатель', 'Подвеска', 'Электрика', 'Шины и диски', 'Салон'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'forBrand', label: 'Для марки', type: 'text', step: 1, showInCard: true },
        { key: 'condition', label: 'Состояние', type: 'select', options: ['Новое', 'Б/у'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'photos', label: 'Фотографии', type: 'text', step: 2 },
        { key: 'price', label: 'Цена', type: 'money', unit: '₽', required: true, step: 3 },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 3 },
      ],
    },
  ],
};
