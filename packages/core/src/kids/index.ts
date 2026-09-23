import type { CategoryModule } from '../core/types';

/**
 * Детское.
 *
 * Возраст ребёнка — главный фильтр категории, поэтому он обязателен
 * и выводится в карточку. Для колясок и автокресел отдельно важна
 * безопасность: возрастная группа и вес указываются явно.
 */
export const kidsCategory: CategoryModule = {
  id: 'kids',
  title: 'Детское',
  icon: 'more',
  path: '/kids',
  intents: [
    { id: 'buy', title: 'Купить', subtitle: 'Все объявления', mode: 'browse' , deal: 'sale' },
    { id: 'sell', title: 'Продать', subtitle: 'Разместить своё объявление', mode: 'publish' , deal: 'sale' },
  ],
  subcategories: [
    {
      id: 'kids-clothes',
      title: 'Детская одежда и обувь',
      listTitle: 'Детская одежда и обувь',
      steps: ['Вещь и размер', 'Фото', 'Цена и город', 'Предпросмотр'],
      fields: [
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит покупатель.' },
        { key: 'age', label: 'Возраст', type: 'select', options: ['0–1 год', '1–3 года', '3–7 лет', '7–12 лет', 'Подростковое'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'kind', label: 'Тип вещи', type: 'select', options: ['Верхняя одежда', 'Комбинезоны', 'Кофты и футболки', 'Брюки', 'Платья', 'Обувь'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'size', label: 'Размер', type: 'text', required: true, step: 1, showInCard: true },
        { key: 'condition', label: 'Состояние', type: 'select', options: ['Новое с биркой', 'Отличное', 'Хорошее'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'photos', label: 'Фотографии', type: 'text', step: 2 },
        { key: 'description', label: 'Описание', type: 'textarea', step: 2 },
        { key: 'price', label: 'Цена', type: 'money', unit: '₽', required: true, step: 3 },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 3 },
      ],
    },
    {
      id: 'strollers',
      title: 'Коляски и автокресла',
      listTitle: 'Коляски и автокресла',
      steps: ['Тип и безопасность', 'Фото', 'Цена и город', 'Предпросмотр'],
      fields: [
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит покупатель.' },
        { key: 'kind', label: 'Тип', type: 'select', options: ['Коляска-люлька', 'Прогулочная коляска', 'Коляска 2 в 1', 'Коляска 3 в 1', 'Автокресло', 'Бустер'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'ageGroup', label: 'Возрастная группа', type: 'select', options: ['0–6 мес.', '6–18 мес.', '1–4 года', '4–7 лет', '7–12 лет'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'weightLimit', label: 'Допустимый вес ребёнка', type: 'number', unit: 'кг', step: 1, filterable: true, filterKind: 'range', showInCard: true },
        { key: 'condition', label: 'Состояние', type: 'select', options: ['Новое', 'Отличное', 'Хорошее'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'photos', label: 'Фотографии', type: 'text', step: 2, hint: 'Покажите крепления и ремни — это первое, что смотрят родители.' },
        { key: 'description', label: 'Описание', type: 'textarea', step: 2 },
        { key: 'price', label: 'Цена', type: 'money', unit: '₽', required: true, step: 3 },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 3 },
      ],
    },
    {
      id: 'toys',
      title: 'Игрушки и товары для игр',
      listTitle: 'Игрушки и товары для игр',
      steps: ['Товар и возраст', 'Фото', 'Цена и город', 'Предпросмотр'],
      fields: [
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит покупатель.' },
        { key: 'kind', label: 'Тип игрушки', type: 'select', options: ['Развивающие', 'Конструкторы', 'Куклы', 'Машинки', 'Настольные игры', 'Уличные игрушки', 'Мягкие игрушки'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'age', label: 'Возраст', type: 'select', options: ['0–1 год', '1–3 года', '3–7 лет', '7–12 лет', '12+'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'condition', label: 'Состояние', type: 'select', options: ['Новое', 'Отличное', 'Хорошее'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'photos', label: 'Фотографии', type: 'text', step: 2 },
        { key: 'description', label: 'Описание', type: 'textarea', step: 2 },
        { key: 'price', label: 'Цена', type: 'money', unit: '₽', required: true, step: 3 },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 3 },
      ],
    },
    {
      id: 'kids-furniture',
      title: 'Детская мебель',
      listTitle: 'Детская мебель',
      steps: ['Тип и состояние', 'Фото', 'Цена и город', 'Предпросмотр'],
      fields: [
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит покупатель.' },
        { key: 'kind', label: 'Тип мебели', type: 'select', options: ['Кроватка', 'Стульчик для кормления', 'Манеж', 'Пеленальный столик', 'Парта', 'Шкаф'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'condition', label: 'Состояние', type: 'select', options: ['Новое', 'Отличное', 'Хорошее'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'photos', label: 'Фотографии', type: 'text', step: 2 },
        { key: 'delivery', label: 'Возможна доставка', type: 'toggle', step: 2, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'description', label: 'Описание', type: 'textarea', step: 2 },
        { key: 'price', label: 'Цена', type: 'money', unit: '₽', required: true, step: 3 },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 3 },
      ],
    },
  ],
};
