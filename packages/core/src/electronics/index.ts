import type { CategoryModule } from '../core/types';

/**
 * Электроника.
 *
 * Ключевое поле категории — состояние. На Авито это первое, что смотрит
 * покупатель, поэтому оно обязательное, фильтруемое и выводится в карточку.
 * Гарантия и комплект вынесены отдельно: для техники это влияет на цену.
 */
export const electronicsCategory: CategoryModule = {
  id: 'electronics',
  title: 'Электроника',
  icon: 'electronics',
  path: '/electronics',
  intents: [
    { id: 'buy', title: 'Купить', subtitle: 'Все объявления', mode: 'browse' , deal: 'sale' },
    { id: 'sell', title: 'Продать', subtitle: 'Разместить своё объявление', mode: 'publish' , deal: 'sale' },
  ],
  subcategories: [
    {
      id: 'phones',
      title: 'Телефоны',
      listTitle: 'Телефоны',
      steps: ['Модель и состояние', 'Фото', 'Характеристики', 'Цена и город', 'Предпросмотр'],
      fields: [
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит покупатель.' },
        { key: 'brand', label: 'Марка', type: 'select', reference: 'electronics-brands', required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'model', label: 'Модель', type: 'select', reference: 'electronics-brands', dependsOn: 'brand', required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'condition', label: 'Состояние', type: 'select', options: ['Новое', 'Отличное', 'Хорошее', 'Требует ремонта'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'photos', label: 'Фотографии', type: 'text', step: 2, hint: 'Минимум 3 фото, включая экран во включённом состоянии.' },
        { key: 'memory', label: 'Встроенная память', type: 'select', options: ['64 ГБ', '128 ГБ', '256 ГБ', '512 ГБ', '1 ТБ'], required: true, step: 3, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'batteryHealth', label: 'Ёмкость аккумулятора', type: 'number', unit: '%', step: 3, filterable: true, filterKind: 'range', showInCard: true },
        { key: 'complete', label: 'Полный комплект', type: 'toggle', step: 3, showInCard: true },
        { key: 'warranty', label: 'Гарантия действует', type: 'toggle', step: 3, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'description', label: 'Описание', type: 'textarea', step: 3, hint: 'Что в комплекте, были ли ремонты, есть ли дефекты.' },
        { key: 'price', label: 'Цена', type: 'money', unit: '₽', required: true, step: 4 },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 4 },
      ],
    },
    {
      id: 'computers',
      title: 'Ноутбуки и компьютеры',
      listTitle: 'Ноутбуки и компьютеры',
      steps: ['Тип и состояние', 'Фото', 'Характеристики', 'Цена и город', 'Предпросмотр'],
      fields: [
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит покупатель.' },
        { key: 'kind', label: 'Тип устройства', type: 'select', options: ['Ноутбук', 'Настольный компьютер', 'Моноблок', 'Планшет'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'brand', label: 'Марка', type: 'text', required: true, step: 1, showInCard: true },
        { key: 'condition', label: 'Состояние', type: 'select', options: ['Новое', 'Отличное', 'Хорошее', 'Требует ремонта'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'photos', label: 'Фотографии', type: 'text', step: 2 },
        { key: 'cpu', label: 'Процессор', type: 'text', step: 3, showInCard: true },
        { key: 'ram', label: 'Оперативная память', type: 'select', options: ['4 ГБ', '8 ГБ', '16 ГБ', '32 ГБ', '64 ГБ'], step: 3, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'storage', label: 'Накопитель', type: 'text', step: 3, showInCard: true },
        { key: 'screen', label: 'Диагональ экрана', type: 'number', unit: '"', step: 3, filterable: true, filterKind: 'range', showInCard: true },
        { key: 'description', label: 'Описание', type: 'textarea', step: 3 },
        { key: 'price', label: 'Цена', type: 'money', unit: '₽', required: true, step: 4 },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 4 },
      ],
    },
    {
      id: 'tv-audio',
      title: 'Телевизоры и аудио',
      listTitle: 'Телевизоры и аудио',
      steps: ['Тип и состояние', 'Фото', 'Характеристики', 'Цена и город', 'Предпросмотр'],
      fields: [
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит покупатель.' },
        { key: 'kind', label: 'Тип устройства', type: 'select', options: ['Телевизор', 'Проектор', 'Наушники', 'Колонки', 'Домашний кинотеатр', 'Медиаплеер'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'brand', label: 'Марка', type: 'text', required: true, step: 1, showInCard: true },
        { key: 'condition', label: 'Состояние', type: 'select', options: ['Новое', 'Отличное', 'Хорошее', 'Требует ремонта'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'photos', label: 'Фотографии', type: 'text', step: 2 },
        { key: 'screen', label: 'Диагональ', type: 'number', unit: '"', step: 3, filterable: true, filterKind: 'range', showInCard: true },
        { key: 'smart', label: 'Smart TV', type: 'toggle', step: 3, showInCard: true },
        { key: 'description', label: 'Описание', type: 'textarea', step: 3 },
        { key: 'price', label: 'Цена', type: 'money', unit: '₽', required: true, step: 4 },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 4 },
      ],
    },
    {
      id: 'photo',
      title: 'Фото и видеотехника',
      listTitle: 'Фото и видеотехника',
      steps: ['Тип и состояние', 'Фото', 'Характеристики', 'Цена и город', 'Предпросмотр'],
      fields: [
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит покупатель.' },
        { key: 'kind', label: 'Тип техники', type: 'select', options: ['Фотоаппарат', 'Объектив', 'Видеокамера', 'Экшн-камера', 'Штатив и стабилизаторы', 'Свет'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'brand', label: 'Марка', type: 'text', required: true, step: 1, showInCard: true },
        { key: 'condition', label: 'Состояние', type: 'select', options: ['Новое', 'Отличное', 'Хорошее', 'Требует ремонта'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'photos', label: 'Фотографии', type: 'text', step: 2 },
        { key: 'shutterCount', label: 'Пробег затвора', type: 'number', unit: 'кадров', step: 3, filterable: true, filterKind: 'range', showInCard: true },
        { key: 'description', label: 'Описание', type: 'textarea', step: 3 },
        { key: 'price', label: 'Цена', type: 'money', unit: '₽', required: true, step: 4 },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 4 },
      ],
    },
    {
      id: 'gaming',
      title: 'Игры и приставки',
      listTitle: 'Игры и приставки',
      steps: ['Тип и состояние', 'Фото', 'Характеристики', 'Цена и город', 'Предпросмотр'],
      fields: [
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит покупатель.' },
        { key: 'kind', label: 'Что продаёте', type: 'select', options: ['Игровая приставка', 'Игра', 'Геймпад', 'Аксессуары', 'VR-гарнитура'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'platform', label: 'Платформа', type: 'select', options: ['PlayStation', 'Xbox', 'Nintendo', 'PC', 'Другая'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'condition', label: 'Состояние', type: 'select', options: ['Новое', 'Отличное', 'Хорошее', 'Требует ремонта'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'photos', label: 'Фотографии', type: 'text', step: 2 },
        { key: 'description', label: 'Описание', type: 'textarea', step: 3 },
        { key: 'price', label: 'Цена', type: 'money', unit: '₽', required: true, step: 4 },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 4 },
      ],
    },
  ],
};
