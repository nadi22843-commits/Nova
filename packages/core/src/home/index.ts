import type { CategoryModule } from '../core/types';

/**
 * Для дома и дачи.
 *
 * Габариты вынесены в фильтруемые поля: в этой категории покупатель чаще
 * всего отсеивает по размеру, потому что вещь нужно увезти и куда-то поставить.
 */
export const homeCategory: CategoryModule = {
  id: 'home',
  title: 'Для дома',
  icon: 'sofa',
  path: '/home-goods',
  intents: [
    { id: 'buy', title: 'Купить', subtitle: 'Все объявления', mode: 'browse' , deal: 'sale' },
    { id: 'sell', title: 'Продать', subtitle: 'Разместить своё объявление', mode: 'publish' , deal: 'sale' },
  ],
  subcategories: [
    {
      id: 'furniture',
      title: 'Мебель и интерьер',
      listTitle: 'Мебель и интерьер',
      steps: ['Тип и состояние', 'Фото', 'Габариты', 'Цена и город', 'Предпросмотр'],
      fields: [
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит покупатель.' },
        { key: 'kind', label: 'Тип мебели', type: 'select', options: ['Диван', 'Кровать', 'Шкаф', 'Стол', 'Стулья', 'Кухонный гарнитур', 'Комод', 'Полки'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'condition', label: 'Состояние', type: 'select', options: ['Новое', 'Отличное', 'Хорошее', 'Требует ремонта'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'material', label: 'Материал', type: 'select', options: ['Дерево', 'ЛДСП', 'Металл', 'Ткань', 'Кожа', 'Стекло'], step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'photos', label: 'Фотографии', type: 'text', step: 2, hint: 'Снимите со всех сторон — так вещь продаётся быстрее.' },
        { key: 'width', label: 'Ширина', type: 'number', unit: 'см', step: 3, filterable: true, filterKind: 'range', showInCard: true },
        { key: 'depth', label: 'Глубина', type: 'number', unit: 'см', step: 3, showInCard: true },
        { key: 'height', label: 'Высота', type: 'number', unit: 'см', step: 3, showInCard: true },
        { key: 'delivery', label: 'Возможна доставка', type: 'toggle', step: 3, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'description', label: 'Описание', type: 'textarea', step: 3 },
        { key: 'price', label: 'Цена', type: 'money', unit: '₽', required: true, step: 4 },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 4 },
      ],
    },
    {
      id: 'appliances',
      title: 'Бытовая техника',
      listTitle: 'Бытовая техника',
      steps: ['Тип и состояние', 'Фото', 'Характеристики', 'Цена и город', 'Предпросмотр'],
      fields: [
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит покупатель.' },
        { key: 'kind', label: 'Тип техники', type: 'select', options: ['Холодильник', 'Стиральная машина', 'Посудомоечная машина', 'Плита', 'Микроволновка', 'Пылесос', 'Кондиционер'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'brand', label: 'Марка', type: 'select', reference: 'appliance-brands', required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'condition', label: 'Состояние', type: 'select', options: ['Новое', 'Отличное', 'Хорошее', 'Требует ремонта'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'photos', label: 'Фотографии', type: 'text', step: 2 },
        { key: 'warranty', label: 'Гарантия действует', type: 'toggle', step: 3, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'delivery', label: 'Возможна доставка', type: 'toggle', step: 3, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'description', label: 'Описание', type: 'textarea', step: 3 },
        { key: 'price', label: 'Цена', type: 'money', unit: '₽', required: true, step: 4 },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 4 },
      ],
    },
    {
      id: 'garden',
      title: 'Сад и огород',
      listTitle: 'Сад и огород',
      steps: ['Тип и состояние', 'Фото', 'Цена и город', 'Предпросмотр'],
      fields: [
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит покупатель.' },
        { key: 'kind', label: 'Что продаёте', type: 'select', options: ['Садовая техника', 'Инструменты', 'Теплицы', 'Растения и саженцы', 'Садовая мебель', 'Ёмкости и баки'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'condition', label: 'Состояние', type: 'select', options: ['Новое', 'Отличное', 'Хорошее', 'Требует ремонта'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'photos', label: 'Фотографии', type: 'text', step: 2 },
        { key: 'description', label: 'Описание', type: 'textarea', step: 2 },
        { key: 'price', label: 'Цена', type: 'money', unit: '₽', required: true, step: 3 },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 3 },
      ],
    },
    {
      id: 'repair-goods',
      title: 'Ремонт и стройматериалы',
      listTitle: 'Ремонт и стройматериалы',
      steps: ['Тип и состояние', 'Фото', 'Цена и город', 'Предпросмотр'],
      fields: [
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит покупатель.' },
        { key: 'kind', label: 'Что продаёте', type: 'select', options: ['Инструменты', 'Стройматериалы', 'Сантехника', 'Двери', 'Окна', 'Электрика', 'Напольные покрытия'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'condition', label: 'Состояние', type: 'select', options: ['Новое', 'Отличное', 'Хорошее', 'Требует ремонта'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'photos', label: 'Фотографии', type: 'text', step: 2 },
        { key: 'description', label: 'Описание', type: 'textarea', step: 2 },
        { key: 'price', label: 'Цена', type: 'money', unit: '₽', required: true, step: 3 },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 3 },
      ],
    },
  ],
};
