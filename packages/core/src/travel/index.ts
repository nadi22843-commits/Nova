import type { CategoryModule } from '../core/types';

/**
 * Путешествия.
 *
 * Категория пересекается с «Недвижимостью» только на первый взгляд: там
 * долгосрочная аренда с договором, здесь — посуточное жильё с датами заезда.
 * Поэтому ключевые поля тут другие: срок, количество гостей, что включено.
 */
export const travelCategory: CategoryModule = {
  id: 'travel',
  title: 'Путешествия',
  icon: 'more',
  path: '/travel',
  intents: [
    { id: 'buy', title: 'Найти жильё', subtitle: 'Посуточная аренда', mode: 'browse', deal: 'rent' },
    { id: 'buy-tours', title: 'Найти тур или снаряжение', subtitle: 'Туры, экскурсии, снаряжение', mode: 'browse', deal: 'sale' },
    { id: 'lease', title: 'Сдать жильё', subtitle: 'Посуточно', mode: 'publish', deal: 'rent' },
    { id: 'sell', title: 'Разместить предложение', subtitle: 'Тур, экскурсия или снаряжение', mode: 'publish', deal: 'sale' },
  ],
  subcategories: [
    {
      id: 'daily-rent',
      deals: ['rent'],
      title: 'Посуточная аренда жилья',
      listTitle: 'Посуточная аренда жилья',
      steps: ['Жильё и вместимость', 'Фото', 'Условия', 'Цена и адрес', 'Предпросмотр'],
      fields: [
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит покупатель.' },
        { key: 'kind', label: 'Тип жилья', type: 'select', options: ['Квартира', 'Комната', 'Дом', 'Апартаменты', 'База отдыха', 'Хостел'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'guests', label: 'Гостей', type: 'number', required: true, step: 1, filterable: true, filterKind: 'range', showInCard: true },
        { key: 'rooms', label: 'Комнат', type: 'select', options: ['Студия', '1', '2', '3', '4+'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'area', label: 'Площадь', type: 'number', unit: 'м²', step: 1, showInCard: true },
        { key: 'photos', label: 'Фотографии', type: 'text', step: 2, hint: 'Все комнаты, санузел и кухня. Минимум 5 фото.' },
        { key: 'minNights', label: 'Минимальный срок', type: 'number', unit: 'суток', step: 3, filterable: true, filterKind: 'range', showInCard: true },
        { key: 'wifi', label: 'Wi-Fi', type: 'toggle', step: 3, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'parking', label: 'Парковка', type: 'toggle', step: 3, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'withPets', label: 'Можно с животными', type: 'toggle', step: 3, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'withKids', label: 'Можно с детьми', type: 'toggle', step: 3, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'description', label: 'Описание', type: 'textarea', step: 3, hint: 'Что рядом, как заселение, что входит в стоимость.' },
        { key: 'price', label: 'Цена за сутки', type: 'money', unit: '₽', required: true, step: 4 },
        { key: 'address', label: 'Адрес или район', type: 'text', required: true, step: 4 },
      ],
    },
    {
      id: 'tours',
      deals: ['sale'],
      title: 'Туры и экскурсии',
      listTitle: 'Туры и экскурсии',
      steps: ['Тур и маршрут', 'Фото', 'Условия', 'Цена', 'Предпросмотр'],
      fields: [
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит покупатель.' },
        { key: 'kind', label: 'Тип', type: 'select', options: ['Экскурсия', 'Многодневный тур', 'Сплав и походы', 'Морская прогулка', 'Гастротур', 'Индивидуальный гид'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'destination', label: 'Направление', type: 'text', required: true, step: 1, showInCard: true },
        { key: 'durationDays', label: 'Продолжительность', type: 'number', unit: 'дней', required: true, step: 1, filterable: true, filterKind: 'range', showInCard: true },
        { key: 'groupSize', label: 'Размер группы', type: 'select', options: ['Индивидуально', 'До 5 человек', 'До 15 человек', 'Более 15 человек'], step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'photos', label: 'Фотографии', type: 'text', step: 2 },
        { key: 'included', label: 'Что включено', type: 'textarea', step: 3, hint: 'Проживание, питание, трансфер, входные билеты.' },
        { key: 'transferIncluded', label: 'Трансфер включён', type: 'toggle', step: 3, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'description', label: 'Описание маршрута', type: 'textarea', step: 3 },
        { key: 'price', label: 'Цена с человека', type: 'money', unit: '₽', required: true, step: 4 },
        { key: 'city', label: 'Город отправления', type: 'text', required: true, step: 4 },
      ],
    },
    {
      id: 'gear',
      deals: ['sale', 'rent'],
      title: 'Туристическое снаряжение',
      listTitle: 'Туристическое снаряжение',
      steps: ['Товар и состояние', 'Фото', 'Цена и город', 'Предпросмотр'],
      fields: [
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит покупатель.' },
        { key: 'kind', label: 'Тип снаряжения', type: 'select', options: ['Палатки', 'Рюкзаки', 'Спальники', 'Горелки и посуда', 'Одежда для походов', 'Навигация'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'condition', label: 'Состояние', type: 'select', options: ['Новое', 'Отличное', 'Хорошее'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'photos', label: 'Фотографии', type: 'text', step: 2 },
        { key: 'description', label: 'Описание', type: 'textarea', step: 2 },
        { key: 'price', label: 'Цена', type: 'money', unit: '₽', required: true, step: 3 },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 3 },
      ],
    },
  ],
};
