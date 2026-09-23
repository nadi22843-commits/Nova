import type { CategoryModule } from '../core/types';

/**
 * Личные вещи.
 *
 * Размер здесь обязателен и фильтруем: без него объявление об одежде
 * бесполезно, а покупатель отсеивает по нему в первую очередь.
 */
export const personalCategory: CategoryModule = {
  id: 'personal',
  title: 'Личные вещи',
  icon: 'more',
  path: '/personal',
  intents: [
    { id: 'buy', title: 'Купить', subtitle: 'Все объявления', mode: 'browse' , deal: 'sale' },
    { id: 'sell', title: 'Продать', subtitle: 'Разместить своё объявление', mode: 'publish' , deal: 'sale' },
  ],
  subcategories: [
    {
      id: 'clothes',
      title: 'Одежда и обувь',
      listTitle: 'Одежда и обувь',
      steps: ['Вещь и размер', 'Фото', 'Цена и город', 'Предпросмотр'],
      fields: [
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит покупатель.' },
        { key: 'target', label: 'Для кого', type: 'select', options: ['Женское', 'Мужское', 'Унисекс'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'kind', label: 'Тип вещи', type: 'select', options: ['Верхняя одежда', 'Платья', 'Брюки и джинсы', 'Рубашки и блузки', 'Обувь', 'Свитеры и кофты', 'Спортивная одежда'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'size', label: 'Размер', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'condition', label: 'Состояние', type: 'select', options: ['Новое с биркой', 'Новое без бирки', 'Отличное', 'Хорошее'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'brand', label: 'Бренд', type: 'select', reference: 'clothing-brands', step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'photos', label: 'Фотографии', type: 'text', step: 2, hint: 'Покажите вещь целиком и вблизи — фактуру и возможные дефекты.' },
        { key: 'description', label: 'Описание', type: 'textarea', step: 2 },
        { key: 'price', label: 'Цена', type: 'money', unit: '₽', required: true, step: 3 },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 3 },
      ],
    },
    {
      id: 'accessories',
      title: 'Аксессуары и часы',
      listTitle: 'Аксессуары и часы',
      steps: ['Вещь и состояние', 'Фото', 'Цена и город', 'Предпросмотр'],
      fields: [
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит покупатель.' },
        { key: 'kind', label: 'Тип', type: 'select', options: ['Сумки', 'Часы', 'Украшения', 'Очки', 'Ремни', 'Головные уборы'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'brand', label: 'Бренд', type: 'text', step: 1, showInCard: true },
        { key: 'condition', label: 'Состояние', type: 'select', options: ['Новое', 'Отличное', 'Хорошее'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'photos', label: 'Фотографии', type: 'text', step: 2 },
        { key: 'description', label: 'Описание', type: 'textarea', step: 2 },
        { key: 'price', label: 'Цена', type: 'money', unit: '₽', required: true, step: 3 },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 3 },
      ],
    },
    {
      id: 'beauty-goods',
      title: 'Красота и здоровье',
      listTitle: 'Красота и здоровье',
      steps: ['Товар и состояние', 'Фото', 'Цена и город', 'Предпросмотр'],
      fields: [
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит покупатель.' },
        { key: 'kind', label: 'Тип товара', type: 'select', options: ['Косметика', 'Парфюмерия', 'Приборы для ухода', 'Медицинские товары'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'condition', label: 'Состояние', type: 'select', options: ['Новое запечатанное', 'Новое вскрытое', 'Б/у'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'photos', label: 'Фотографии', type: 'text', step: 2 },
        { key: 'description', label: 'Описание', type: 'textarea', step: 2 },
        { key: 'price', label: 'Цена', type: 'money', unit: '₽', required: true, step: 3 },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 3 },
      ],
    },
  ],
};
