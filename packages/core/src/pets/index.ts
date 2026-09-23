import type { CategoryModule } from '../core/types';

/**
 * Животные.
 *
 * Продажа живых животных — зона повышенной ответственности. Поэтому здесь
 * отдельное намерение «Отдам даром», а для самих животных обязательны
 * возраст и отметки о прививках: это то, о чём в любом случае спросят.
 */
export const petsCategory: CategoryModule = {
  id: 'pets',
  title: 'Животные',
  icon: 'more',
  path: '/pets',
  intents: [
    { id: 'buy', title: 'Найти питомца или товар', subtitle: 'Все объявления', mode: 'browse' , deal: 'sale' },
    { id: 'sell', title: 'Разместить объявление', subtitle: 'Продажа или отдам даром', mode: 'publish' , deal: 'sale' },
  ],
  subcategories: [
    {
      id: 'animals',
      title: 'Животные',
      listTitle: 'Животные',
      steps: ['Питомец и возраст', 'Фото', 'Здоровье и документы', 'Условия передачи', 'Предпросмотр'],
      fields: [
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит покупатель.' },
        { key: 'species', label: 'Вид животного', type: 'select', options: ['Собаки', 'Кошки', 'Птицы', 'Грызуны', 'Аквариумные', 'Сельхозживотные'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'breed', label: 'Порода', type: 'select', reference: 'pet-breeds', dependsOn: 'species', step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'ageMonths', label: 'Возраст', type: 'number', unit: 'мес.', required: true, step: 1, filterable: true, filterKind: 'range', showInCard: true },
        { key: 'sex', label: 'Пол', type: 'select', options: ['Мальчик', 'Девочка'], step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'photos', label: 'Фотографии', type: 'text', step: 2, hint: 'Живые фото питомца, а не изображения породы из интернета.' },
        { key: 'vaccinated', label: 'Прививки сделаны', type: 'toggle', step: 3, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'documents', label: 'Есть документы и родословная', type: 'toggle', step: 3, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'sterilized', label: 'Стерилизован', type: 'toggle', step: 3, showInCard: true },
        { key: 'description', label: 'Описание', type: 'textarea', step: 3, hint: 'Характер, привычки, к чему приучен, почему передаёте.' },
        { key: 'transfer', label: 'Условия передачи', type: 'select', options: ['Продажа', 'Отдам даром', 'В добрые руки с договором'], required: true, step: 4, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'price', label: 'Цена', type: 'money', unit: '₽', step: 4, hint: 'Оставьте пустым, если отдаёте даром.' },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 4 },
      ],
    },
    {
      id: 'pet-goods',
      title: 'Товары для животных',
      listTitle: 'Товары для животных',
      steps: ['Товар и состояние', 'Фото', 'Цена и город', 'Предпросмотр'],
      fields: [
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит покупатель.' },
        { key: 'kind', label: 'Тип товара', type: 'select', options: ['Корма', 'Клетки и переноски', 'Аквариумы', 'Игрушки', 'Амуниция', 'Домики и лежанки', 'Уход и гигиена'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'forSpecies', label: 'Для кого', type: 'select', options: ['Собаки', 'Кошки', 'Птицы', 'Грызуны', 'Рыбы', 'Универсальное'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'condition', label: 'Состояние', type: 'select', options: ['Новое', 'Отличное', 'Хорошее'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'photos', label: 'Фотографии', type: 'text', step: 2 },
        { key: 'description', label: 'Описание', type: 'textarea', step: 2 },
        { key: 'price', label: 'Цена', type: 'money', unit: '₽', required: true, step: 3 },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 3 },
      ],
    },
  ],
};
