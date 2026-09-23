import type { CategoryModule } from '../core/types';

/**
 * Хобби и отдых.
 */
export const hobbyCategory: CategoryModule = {
  id: 'hobby',
  title: 'Хобби и отдых',
  icon: 'hobby',
  path: '/hobby',
  intents: [
    { id: 'buy', title: 'Купить', subtitle: 'Все объявления', mode: 'browse' , deal: 'sale' },
    { id: 'sell', title: 'Продать', subtitle: 'Разместить своё объявление', mode: 'publish' , deal: 'sale' },
  ],
  subcategories: [
    {
      id: 'sport',
      title: 'Спорт и отдых',
      listTitle: 'Спорт и отдых',
      steps: ['Товар и состояние', 'Фото', 'Цена и город', 'Предпросмотр'],
      fields: [
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит покупатель.' },
        { key: 'kind', label: 'Тип товара', type: 'select', options: ['Тренажёры', 'Велосипеды', 'Зимний спорт', 'Туризм и походы', 'Рыбалка', 'Единоборства', 'Командные виды'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'condition', label: 'Состояние', type: 'select', options: ['Новое', 'Отличное', 'Хорошее', 'Требует ремонта'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'photos', label: 'Фотографии', type: 'text', step: 2 },
        { key: 'description', label: 'Описание', type: 'textarea', step: 2 },
        { key: 'price', label: 'Цена', type: 'money', unit: '₽', required: true, step: 3 },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 3 },
      ],
    },
    {
      id: 'music',
      title: 'Музыкальные инструменты',
      listTitle: 'Музыкальные инструменты',
      steps: ['Инструмент и состояние', 'Фото', 'Цена и город', 'Предпросмотр'],
      fields: [
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит покупатель.' },
        { key: 'kind', label: 'Тип инструмента', type: 'select', options: ['Гитары', 'Клавишные', 'Ударные', 'Духовые', 'Струнные смычковые', 'Студийное оборудование'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'brand', label: 'Марка', type: 'text', step: 1, showInCard: true },
        { key: 'condition', label: 'Состояние', type: 'select', options: ['Новое', 'Отличное', 'Хорошее', 'Требует ремонта'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'photos', label: 'Фотографии', type: 'text', step: 2 },
        { key: 'description', label: 'Описание', type: 'textarea', step: 2 },
        { key: 'price', label: 'Цена', type: 'money', unit: '₽', required: true, step: 3 },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 3 },
      ],
    },
    {
      id: 'books',
      title: 'Книги и коллекционирование',
      listTitle: 'Книги и коллекционирование',
      steps: ['Товар и состояние', 'Фото', 'Цена и город', 'Предпросмотр'],
      fields: [
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит покупатель.' },
        { key: 'kind', label: 'Тип', type: 'select', options: ['Книги', 'Монеты', 'Марки', 'Антиквариат', 'Значки', 'Открытки', 'Модели и фигурки'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'condition', label: 'Состояние', type: 'select', options: ['Новое', 'Отличное', 'Хорошее', 'Удовлетворительное'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'year', label: 'Год выпуска', type: 'number', step: 1, filterable: true, filterKind: 'range', showInCard: true },
        { key: 'photos', label: 'Фотографии', type: 'text', step: 2 },
        { key: 'description', label: 'Описание', type: 'textarea', step: 2 },
        { key: 'price', label: 'Цена', type: 'money', unit: '₽', required: true, step: 3 },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 3 },
      ],
    },
    {
      id: 'tickets',
      title: 'Билеты на события',
      listTitle: 'Билеты на события',
      steps: ['Билет и дата', 'Цена и город', 'Предпросмотр'],
      fields: [
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит покупатель.' },
        { key: 'kind', label: 'Тип билета', type: 'select', options: ['Концерты', 'Театр', 'Спорт', 'Кино', 'Выставки', 'Фестивали'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'eventDate', label: 'Дата события', type: 'text', required: true, step: 1, showInCard: true, hint: 'Например: 15 октября 2026' },
        { key: 'quantity', label: 'Количество билетов', type: 'number', required: true, step: 1, filterable: true, filterKind: 'range', showInCard: true },
        { key: 'description', label: 'Описание', type: 'textarea', step: 1 },
        { key: 'price', label: 'Цена за билет', type: 'money', unit: '₽', required: true, step: 2 },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 2 },
      ],
    },
  ],
};
