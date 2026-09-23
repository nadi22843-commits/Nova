import type { CategoryModule } from '../core/types';

/**
 * Недвижимость.
 *
 * Исправления относительно исходных схем:
 * — кадастровый номер идёт первым шагом: по нему подтягиваются площадь и ВРИ,
 *   вместо того чтобы спрашивать их вручную и в конце;
 * — «категория земли» больше не путается с видом разрешённого использования:
 *   ИЖС, СНТ и ЛПХ собраны в одно понятное поле;
 * — фото поднято на второй шаг, до длинных характеристик;
 * — все поля, которые заполняет автор, доступны и в фильтрах, и в карточке.
 */
export const realtyCategory: CategoryModule = {
  id: 'realty',
  title: 'Недвижимость',
  icon: 'home',
  path: '/realty',
  intents: [
    { id: 'buy', title: 'Купить', subtitle: 'Все объекты в продаже', mode: 'browse' , deal: 'sale' },
    { id: 'rent', title: 'Снять', subtitle: 'Аренда жилья и помещений', mode: 'browse' , deal: 'rent' },
    { id: 'sell', title: 'Продать', subtitle: 'Разместить объявление о продаже', mode: 'publish' , deal: 'sale' },
    { id: 'lease', title: 'Сдать', subtitle: 'Разместить объявление об аренде', mode: 'publish' , deal: 'rent' },
  ],
  subcategories: [
    {
      id: 'land',
      title: 'Земельный участок',
      listTitle: 'Земельные участки',
      steps: ['Кадастр и площадь', 'Фото', 'Характеристики', 'Цена и адрес', 'Предпросмотр'],
      fields: [
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит покупатель.' },
        {
          key: 'cadastral',
          label: 'Кадастровый номер',
          type: 'text',
          step: 1,
          hint: 'По номеру заполним площадь, вид использования и границы. Можно пропустить.',
          showInCard: true,
        },
        { key: 'area', label: 'Площадь', type: 'number', unit: 'соток', required: true, step: 1, filterable: true, filterKind: 'range', showInCard: true },
        {
          key: 'landUse',
          label: 'Вид разрешённого использования',
          type: 'select',
          options: ['ИЖС', 'Садоводство (СНТ)', 'ЛПХ', 'Сельхозназначение', 'Коммерческое'],
          required: true,
          step: 1,
          filterable: true,
          filterKind: 'select',
          showInCard: true,
        },
        { key: 'photos', label: 'Фотографии', type: 'text', step: 2, hint: 'Минимум 3 фото — объявления с фото смотрят в 4 раза чаще.' },
        {
          key: 'utilities',
          label: 'Коммуникации',
          type: 'select',
          options: ['Нет', 'Электричество', 'Электричество, газ', 'Все центральные'],
          step: 3,
          filterable: true,
          filterKind: 'select',
          showInCard: true,
        },
        { key: 'access', label: 'Подъездная дорога', type: 'select', options: ['Асфальт', 'Грунт', 'Бездорожье'], step: 3, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'distance', label: 'Удалённость от города', type: 'number', unit: 'км', step: 3, filterable: true, filterKind: 'range', showInCard: true },
        { key: 'fenced', label: 'Огорожен', type: 'toggle', step: 3 },
        { key: 'description', label: 'Описание', type: 'textarea', step: 3 },
        // ── Только продажа ──
        { key: 'ownership', label: 'Форма собственности', type: 'select', options: ['Собственность', 'Долевая собственность', 'Муниципальная', 'Переуступка'], required: true, step: 4, deals: ['sale'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'ownershipYears', label: 'В собственности', type: 'select', options: ['Менее года', '1–3 года', '3–5 лет', 'Более 5 лет'], step: 4, deals: ['sale'], showInCard: true },
        { key: 'encumbrance', label: 'Обременения', type: 'select', options: ['Нет', 'Ипотека', 'Арест', 'Рента'], step: 4, deals: ['sale'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'mortgageOk', label: 'Возможна ипотека', type: 'toggle', step: 4, deals: ['sale'], filterable: true, filterKind: 'select', showInCard: true },

      // ── Только аренда ──
        { key: 'rentTerm', label: 'Срок аренды', type: 'select', options: ['Длительно (от года)', 'На несколько месяцев', 'Посуточно'], required: true, step: 4, deals: ['rent'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'deposit', label: 'Залог', type: 'money', unit: '₽', step: 4, deals: ['rent'], showInCard: true, hint: 'Оставьте пустым, если залога нет.' },
        { key: 'commission', label: 'Комиссия агента', type: 'select', options: ['Без комиссии', '50% от аренды', '100% от аренды'], required: true, step: 4, deals: ['rent'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'prepayment', label: 'Предоплата', type: 'select', options: ['За месяц', 'За два месяца', 'Без предоплаты'], step: 4, deals: ['rent'], showInCard: true },
        { key: 'utilitiesIncluded', label: 'Коммунальные включены', type: 'toggle', step: 4, deals: ['rent'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'withPets', label: 'Можно с животными', type: 'toggle', step: 4, deals: ['rent'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'withKids', label: 'Можно с детьми', type: 'toggle', step: 4, deals: ['rent'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'furniture', label: 'Мебель', type: 'select', options: ['Полностью меблирована', 'Частично', 'Без мебели'], step: 4, deals: ['rent'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'price', label: 'Цена', type: 'money', unit: '₽', required: true, step: 4, deals: ['sale'] },
        { key: 'price', label: 'Цена за месяц', type: 'money', unit: '₽', required: true, step: 4, deals: ['rent'] },
        { key: 'address', label: 'Населённый пункт', type: 'text', required: true, step: 4 },
      ],
    },
    {
      id: 'flat',
      title: 'Квартира',
      listTitle: 'Квартиры',
      steps: ['Основные параметры', 'Фото', 'Дом и состояние', 'Цена и адрес', 'Предпросмотр'],
      fields: [
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит покупатель.' },
        { key: 'rooms', label: 'Комнат', type: 'select', options: ['Студия', '1', '2', '3', '4+'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'area', label: 'Площадь', type: 'number', unit: 'м²', required: true, step: 1, filterable: true, filterKind: 'range', showInCard: true },
        { key: 'floor', label: 'Этаж', type: 'number', required: true, step: 1, filterable: true, filterKind: 'range', showInCard: true },
        { key: 'totalFloors', label: 'Этажей в доме', type: 'number', step: 1, showInCard: true },
        { key: 'photos', label: 'Фотографии', type: 'text', step: 2, hint: 'Минимум 3 фото.' },
        { key: 'renovation', label: 'Ремонт', type: 'select', options: ['Без ремонта', 'Косметический', 'Евроремонт', 'Дизайнерский'], step: 3, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'buildYear', label: 'Год постройки', type: 'number', step: 3, showInCard: true },
        { key: 'balcony', label: 'Балкон или лоджия', type: 'toggle', step: 3 },
        { key: 'description', label: 'Описание', type: 'textarea', step: 3 },
        // ── Только продажа ──
        { key: 'ownership', label: 'Форма собственности', type: 'select', options: ['Собственность', 'Долевая собственность', 'Муниципальная', 'Переуступка'], required: true, step: 4, deals: ['sale'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'ownershipYears', label: 'В собственности', type: 'select', options: ['Менее года', '1–3 года', '3–5 лет', 'Более 5 лет'], step: 4, deals: ['sale'], showInCard: true },
        { key: 'encumbrance', label: 'Обременения', type: 'select', options: ['Нет', 'Ипотека', 'Арест', 'Рента'], step: 4, deals: ['sale'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'mortgageOk', label: 'Возможна ипотека', type: 'toggle', step: 4, deals: ['sale'], filterable: true, filterKind: 'select', showInCard: true },

      // ── Только аренда ──
        { key: 'rentTerm', label: 'Срок аренды', type: 'select', options: ['Длительно (от года)', 'На несколько месяцев', 'Посуточно'], required: true, step: 4, deals: ['rent'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'deposit', label: 'Залог', type: 'money', unit: '₽', step: 4, deals: ['rent'], showInCard: true, hint: 'Оставьте пустым, если залога нет.' },
        { key: 'commission', label: 'Комиссия агента', type: 'select', options: ['Без комиссии', '50% от аренды', '100% от аренды'], required: true, step: 4, deals: ['rent'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'prepayment', label: 'Предоплата', type: 'select', options: ['За месяц', 'За два месяца', 'Без предоплаты'], step: 4, deals: ['rent'], showInCard: true },
        { key: 'utilitiesIncluded', label: 'Коммунальные включены', type: 'toggle', step: 4, deals: ['rent'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'withPets', label: 'Можно с животными', type: 'toggle', step: 4, deals: ['rent'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'withKids', label: 'Можно с детьми', type: 'toggle', step: 4, deals: ['rent'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'furniture', label: 'Мебель', type: 'select', options: ['Полностью меблирована', 'Частично', 'Без мебели'], step: 4, deals: ['rent'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'price', label: 'Цена', type: 'money', unit: '₽', required: true, step: 4, deals: ['sale'] },
        { key: 'price', label: 'Цена за месяц', type: 'money', unit: '₽', required: true, step: 4, deals: ['rent'] },
        { key: 'address', label: 'Адрес', type: 'text', required: true, step: 4 },
      ],
    },
    {
      id: 'house',
      title: 'Дом, дача, таунхаус',
      listTitle: 'Дома и дачи',
      steps: ['Основные параметры', 'Фото', 'Инженерия', 'Цена и адрес', 'Предпросмотр'],
      fields: [
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит покупатель.' },
        { key: 'area', label: 'Площадь дома', type: 'number', unit: 'м²', required: true, step: 1, filterable: true, filterKind: 'range', showInCard: true },
        { key: 'landArea', label: 'Площадь участка', type: 'number', unit: 'соток', required: true, step: 1, filterable: true, filterKind: 'range', showInCard: true },
        { key: 'floors', label: 'Этажей', type: 'number', step: 1, showInCard: true },
        { key: 'material', label: 'Материал стен', type: 'select', options: ['Кирпич', 'Дерево', 'Газоблок', 'Каркас', 'Панель'], step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'photos', label: 'Фотографии', type: 'text', step: 2, hint: 'Минимум 3 фото.' },
        { key: 'heating', label: 'Отопление', type: 'select', options: ['Газовое', 'Электрическое', 'Печное', 'Нет'], step: 3, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'description', label: 'Описание', type: 'textarea', step: 3 },
        // ── Только продажа ──
        { key: 'ownership', label: 'Форма собственности', type: 'select', options: ['Собственность', 'Долевая собственность', 'Муниципальная', 'Переуступка'], required: true, step: 4, deals: ['sale'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'ownershipYears', label: 'В собственности', type: 'select', options: ['Менее года', '1–3 года', '3–5 лет', 'Более 5 лет'], step: 4, deals: ['sale'], showInCard: true },
        { key: 'encumbrance', label: 'Обременения', type: 'select', options: ['Нет', 'Ипотека', 'Арест', 'Рента'], step: 4, deals: ['sale'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'mortgageOk', label: 'Возможна ипотека', type: 'toggle', step: 4, deals: ['sale'], filterable: true, filterKind: 'select', showInCard: true },

      // ── Только аренда ──
        { key: 'rentTerm', label: 'Срок аренды', type: 'select', options: ['Длительно (от года)', 'На несколько месяцев', 'Посуточно'], required: true, step: 4, deals: ['rent'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'deposit', label: 'Залог', type: 'money', unit: '₽', step: 4, deals: ['rent'], showInCard: true, hint: 'Оставьте пустым, если залога нет.' },
        { key: 'commission', label: 'Комиссия агента', type: 'select', options: ['Без комиссии', '50% от аренды', '100% от аренды'], required: true, step: 4, deals: ['rent'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'prepayment', label: 'Предоплата', type: 'select', options: ['За месяц', 'За два месяца', 'Без предоплаты'], step: 4, deals: ['rent'], showInCard: true },
        { key: 'utilitiesIncluded', label: 'Коммунальные включены', type: 'toggle', step: 4, deals: ['rent'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'withPets', label: 'Можно с животными', type: 'toggle', step: 4, deals: ['rent'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'withKids', label: 'Можно с детьми', type: 'toggle', step: 4, deals: ['rent'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'furniture', label: 'Мебель', type: 'select', options: ['Полностью меблирована', 'Частично', 'Без мебели'], step: 4, deals: ['rent'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'price', label: 'Цена', type: 'money', unit: '₽', required: true, step: 4, deals: ['sale'] },
        { key: 'price', label: 'Цена за месяц', type: 'money', unit: '₽', required: true, step: 4, deals: ['rent'] },
        { key: 'address', label: 'Населённый пункт', type: 'text', required: true, step: 4 },
      ],
    },
    {
      id: 'garage',
      title: 'Гараж и машиноместо',
      listTitle: 'Гаражи и машиноместа',
      steps: ['Основные параметры', 'Фото', 'Цена и адрес', 'Предпросмотр'],
      fields: [
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит покупатель.' },
        { key: 'kind', label: 'Тип объекта', type: 'select', options: ['Гараж', 'Машиноместо', 'Бокс'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'area', label: 'Площадь', type: 'number', unit: 'м²', required: true, step: 1, filterable: true, filterKind: 'range', showInCard: true },
        { key: 'security', label: 'Охрана', type: 'toggle', step: 1, showInCard: true },
        { key: 'photos', label: 'Фотографии', type: 'text', step: 2 },
        { key: 'price', label: 'Цена', type: 'money', unit: '₽', required: true, step: 3 },
        { key: 'address', label: 'Адрес', type: 'text', required: true, step: 3 },
      ],
    },
    {
      id: 'commercial',
      title: 'Коммерческая недвижимость',
      listTitle: 'Коммерческая недвижимость',
      steps: ['Основные параметры', 'Фото', 'Условия', 'Цена и адрес', 'Предпросмотр'],
      fields: [
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит покупатель.' },
        { key: 'purpose', label: 'Назначение', type: 'select', options: ['Офис', 'Торговое', 'Склад', 'Производство', 'Свободное назначение'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'area', label: 'Площадь', type: 'number', unit: 'м²', required: true, step: 1, filterable: true, filterKind: 'range', showInCard: true },
        { key: 'ceiling', label: 'Высота потолков', type: 'number', unit: 'м', step: 1, showInCard: true },
        { key: 'photos', label: 'Фотографии', type: 'text', step: 2 },
        { key: 'entrance', label: 'Отдельный вход', type: 'toggle', step: 3, showInCard: true },
        { key: 'description', label: 'Описание', type: 'textarea', step: 3 },
        // ── Только продажа ──
        { key: 'ownership', label: 'Форма собственности', type: 'select', options: ['Собственность', 'Долевая собственность', 'Муниципальная', 'Переуступка'], required: true, step: 4, deals: ['sale'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'ownershipYears', label: 'В собственности', type: 'select', options: ['Менее года', '1–3 года', '3–5 лет', 'Более 5 лет'], step: 4, deals: ['sale'], showInCard: true },
        { key: 'encumbrance', label: 'Обременения', type: 'select', options: ['Нет', 'Ипотека', 'Арест', 'Рента'], step: 4, deals: ['sale'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'mortgageOk', label: 'Возможна ипотека', type: 'toggle', step: 4, deals: ['sale'], filterable: true, filterKind: 'select', showInCard: true },

      // ── Только аренда ──
        { key: 'rentTerm', label: 'Срок аренды', type: 'select', options: ['Длительно (от года)', 'На несколько месяцев', 'Посуточно'], required: true, step: 4, deals: ['rent'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'deposit', label: 'Залог', type: 'money', unit: '₽', step: 4, deals: ['rent'], showInCard: true, hint: 'Оставьте пустым, если залога нет.' },
        { key: 'commission', label: 'Комиссия агента', type: 'select', options: ['Без комиссии', '50% от аренды', '100% от аренды'], required: true, step: 4, deals: ['rent'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'prepayment', label: 'Предоплата', type: 'select', options: ['За месяц', 'За два месяца', 'Без предоплаты'], step: 4, deals: ['rent'], showInCard: true },
        { key: 'utilitiesIncluded', label: 'Коммунальные включены', type: 'toggle', step: 4, deals: ['rent'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'withPets', label: 'Можно с животными', type: 'toggle', step: 4, deals: ['rent'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'withKids', label: 'Можно с детьми', type: 'toggle', step: 4, deals: ['rent'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'furniture', label: 'Мебель', type: 'select', options: ['Полностью меблирована', 'Частично', 'Без мебели'], step: 4, deals: ['rent'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'price', label: 'Цена', type: 'money', unit: '₽', required: true, step: 4, deals: ['sale'] },
        { key: 'price', label: 'Цена за месяц', type: 'money', unit: '₽', required: true, step: 4, deals: ['rent'] },
        { key: 'address', label: 'Адрес', type: 'text', required: true, step: 4 },
      ],
    },
  ],
};
