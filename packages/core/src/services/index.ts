import type { CategoryModule } from '../core/types';

/**
 * Услуги.
 *
 * Структурно — обычная категория объявлений, как на Авито: услугу размещает
 * исполнитель, а не заказчик. Специфика вынесена в поля, а не в отдельный
 * модуль: форма работы, выезд, опыт, минимальная цена.
 *
 * Цена здесь всегда «от» — точную стоимость исполнитель называет после
 * обсуждения задачи. Поэтому поле называется «Цена от», а не «Цена».
 */
export const servicesCategory: CategoryModule = {
  id: 'services',
  title: 'Услуги',
  icon: 'services',
  path: '/services',
  intents: [
    { id: 'buy', title: 'Найти исполнителя', subtitle: 'Все предложения услуг', mode: 'browse', deal: 'service' },
    { id: 'sell', title: 'Предложить услугу', subtitle: 'Разместить своё объявление', mode: 'publish', deal: 'service' },
  ],
  subcategories: [
    {
      id: 'repair',
      title: 'Ремонт и строительство',
      listTitle: 'Ремонт и строительство',
      steps: ['Услуга и опыт', 'Фото работ', 'Условия', 'Цена и город', 'Предпросмотр'],
      fields: [
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит покупатель.' },
        {
          key: 'service',
          label: 'Вид работ',
          type: 'select',
          options: ['Ремонт под ключ', 'Отделочные работы', 'Сантехника', 'Электрика', 'Сборка мебели', 'Окна и двери', 'Кровля', 'Плитка'],
          required: true,
          step: 1,
          filterable: true,
          filterKind: 'select',
          showInCard: true,
        },
        { key: 'experience', label: 'Опыт работы', type: 'select', options: ['До года', '1–3 года', '3–5 лет', 'Более 5 лет'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'performerType', label: 'Кто оказывает услугу', type: 'select', options: ['Частный мастер', 'Бригада', 'Компания'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'photos', label: 'Фото выполненных работ', type: 'text', step: 2, hint: 'Портфолио повышает отклик в разы. Минимум 3 фото.' },
        { key: 'departure', label: 'Выезд к заказчику', type: 'select', options: ['Да', 'Нет', 'По договорённости'], step: 3, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'guarantee', label: 'Гарантия на работы', type: 'toggle', step: 3, showInCard: true },
        { key: 'contract', label: 'Работаю по договору', type: 'toggle', step: 3, showInCard: true },
        { key: 'description', label: 'Описание услуги', type: 'textarea', step: 3, hint: 'Что делаете, за какой срок, что входит в стоимость.' },
        { key: 'price', label: 'Цена от', type: 'money', unit: '₽', required: true, step: 4 },
        { key: 'priceUnit', label: 'Единица расчёта', type: 'select', options: ['За услугу', 'За час', 'За м²', 'За метр погонный'], required: true, step: 4, showInCard: true },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 4 },
      ],
    },
    {
      id: 'beauty',
      title: 'Красота и здоровье',
      listTitle: 'Красота и здоровье',
      steps: ['Услуга и опыт', 'Фото работ', 'Условия', 'Цена и город', 'Предпросмотр'],
      fields: [
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит покупатель.' },
        {
          key: 'service',
          label: 'Вид услуги',
          type: 'select',
          options: ['Парикмахерские услуги', 'Маникюр и педикюр', 'Косметология', 'Массаж', 'Брови и ресницы', 'Макияж', 'Эпиляция'],
          required: true,
          step: 1,
          filterable: true,
          filterKind: 'select',
          showInCard: true,
        },
        { key: 'experience', label: 'Опыт работы', type: 'select', options: ['До года', '1–3 года', '3–5 лет', 'Более 5 лет'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'photos', label: 'Фото работ', type: 'text', step: 2, hint: 'Портфолио — главный аргумент в этой категории.' },
        { key: 'place', label: 'Где принимаете', type: 'select', options: ['В салоне', 'На дому у мастера', 'С выездом к клиенту'], required: true, step: 3, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'certificate', label: 'Есть сертификат или диплом', type: 'toggle', step: 3, showInCard: true },
        { key: 'description', label: 'Описание услуги', type: 'textarea', step: 3 },
        { key: 'price', label: 'Цена от', type: 'money', unit: '₽', required: true, step: 4 },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 4 },
      ],
    },
    {
      id: 'education',
      title: 'Обучение и репетиторы',
      listTitle: 'Обучение и репетиторы',
      steps: ['Предмет и опыт', 'Условия', 'Цена и город', 'Предпросмотр'],
      fields: [
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит покупатель.' },
        {
          key: 'subject',
          label: 'Предмет или направление',
          type: 'select',
          options: ['Математика', 'Русский язык', 'Английский язык', 'Другие языки', 'Физика', 'Химия', 'Информатика', 'Музыка', 'Подготовка к ЕГЭ и ОГЭ'],
          required: true,
          step: 1,
          filterable: true,
          filterKind: 'select',
          showInCard: true,
        },
        { key: 'level', label: 'Для кого', type: 'select', options: ['Дошкольники', 'Начальная школа', 'Средняя школа', 'Старшие классы', 'Студенты', 'Взрослые'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'experience', label: 'Опыт преподавания', type: 'select', options: ['До года', '1–3 года', '3–5 лет', 'Более 5 лет'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'format', label: 'Формат занятий', type: 'select', options: ['Онлайн', 'У преподавателя', 'С выездом к ученику'], required: true, step: 2, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'duration', label: 'Длительность занятия', type: 'number', unit: 'мин', step: 2, showInCard: true },
        { key: 'trial', label: 'Первое занятие бесплатно', type: 'toggle', step: 2, showInCard: true },
        { key: 'description', label: 'О себе и методике', type: 'textarea', step: 2 },
        { key: 'price', label: 'Цена за занятие от', type: 'money', unit: '₽', required: true, step: 3 },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 3 },
      ],
    },
    {
      id: 'transport',
      title: 'Перевозки и грузчики',
      listTitle: 'Перевозки и грузчики',
      steps: ['Услуга и транспорт', 'Условия', 'Цена и город', 'Предпросмотр'],
      fields: [
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит покупатель.' },
        { key: 'service', label: 'Вид услуги', type: 'select', options: ['Квартирный переезд', 'Офисный переезд', 'Доставка мебели', 'Вывоз мусора', 'Только грузчики', 'Междугородние перевозки'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'transport', label: 'Транспорт', type: 'select', options: ['Газель', 'Фургон', 'Грузовик до 5 т', 'Грузовик свыше 5 т', 'Без транспорта'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'loaders', label: 'Грузчики', type: 'select', options: ['Есть', 'Нет'], required: true, step: 2, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'roundTheClock', label: 'Работаю круглосуточно', type: 'toggle', step: 2, showInCard: true },
        { key: 'description', label: 'Описание услуги', type: 'textarea', step: 2 },
        { key: 'price', label: 'Цена от', type: 'money', unit: '₽', required: true, step: 3 },
        { key: 'priceUnit', label: 'Единица расчёта', type: 'select', options: ['За час', 'За заказ', 'За км'], required: true, step: 3, showInCard: true },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 3 },
      ],
    },
    {
      id: 'cleaning',
      title: 'Уборка и помощь по хозяйству',
      listTitle: 'Уборка и помощь по хозяйству',
      steps: ['Услуга и опыт', 'Условия', 'Цена и город', 'Предпросмотр'],
      fields: [
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит покупатель.' },
        { key: 'service', label: 'Вид услуги', type: 'select', options: ['Поддерживающая уборка', 'Генеральная уборка', 'Уборка после ремонта', 'Мытьё окон', 'Химчистка мебели', 'Помощь по хозяйству'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'performerType', label: 'Кто оказывает услугу', type: 'select', options: ['Частный специалист', 'Клининговая компания'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'supplies', label: 'Со своими средствами и техникой', type: 'toggle', step: 2, showInCard: true },
        { key: 'description', label: 'Описание услуги', type: 'textarea', step: 2 },
        { key: 'price', label: 'Цена от', type: 'money', unit: '₽', required: true, step: 3 },
        { key: 'priceUnit', label: 'Единица расчёта', type: 'select', options: ['За час', 'За м²', 'За заказ'], required: true, step: 3, showInCard: true },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 3 },
      ],
    },
    {
      id: 'it',
      title: 'IT, реклама и дизайн',
      listTitle: 'IT, реклама и дизайн',
      steps: ['Услуга и опыт', 'Условия', 'Цена', 'Предпросмотр'],
      fields: [
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит покупатель.' },
        { key: 'service', label: 'Вид услуги', type: 'select', options: ['Разработка сайтов', 'Мобильные приложения', 'Дизайн', 'SMM и реклама', 'Копирайтинг', 'Ремонт компьютеров', 'Настройка сетей'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'experience', label: 'Опыт работы', type: 'select', options: ['До года', '1–3 года', '3–5 лет', 'Более 5 лет'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'format', label: 'Формат работы', type: 'select', options: ['Удалённо', 'В офисе заказчика', 'Гибрид'], required: true, step: 2, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'term', label: 'Средний срок выполнения', type: 'number', unit: 'дней', step: 2, showInCard: true },
        { key: 'description', label: 'Описание услуги и портфолио', type: 'textarea', step: 2 },
        { key: 'price', label: 'Цена от', type: 'money', unit: '₽', required: true, step: 3 },
        { key: 'priceUnit', label: 'Единица расчёта', type: 'select', options: ['За проект', 'За час', 'В месяц'], required: true, step: 3, showInCard: true },
      ],
    },
  ],
};
