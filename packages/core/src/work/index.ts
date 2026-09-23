import type { CategoryModule } from '../core/types';

/**
 * Работа.
 *
 * Приведена к общей архитектуре: раньше это был отдельный модуль со своим
 * роутингом, своими демоданными и без единой проверки авторизации.
 *
 * Ключ к тому, чтобы работа уложилась в общую модель, — виды предложения.
 * Вакансия и резюме относятся друг к другу так же, как продажа и аренда:
 * это одна категория, одни направления, но разные наборы полей. Поле
 * объявляет, в каких видах оно участвует, через `deals`.
 *
 * Подкатегории здесь — профессиональные направления, а конкретная профессия
 * выбирается из справочника внутри направления.
 */
export const workCategory: CategoryModule = {
  id: 'work',
  title: 'Работа',
  icon: 'work',
  path: '/work',
  intents: [
    { id: 'find-job', title: 'Найти работу', subtitle: 'Все вакансии', mode: 'browse', deal: 'vacancy' },
    { id: 'find-employee', title: 'Найти сотрудника', subtitle: 'Все резюме', mode: 'browse', deal: 'resume' },
    { id: 'post-vacancy', title: 'Разместить вакансию', subtitle: 'Найти человека в команду', mode: 'publish', deal: 'vacancy' },
    { id: 'post-resume', title: 'Разместить резюме', subtitle: 'Чтобы работа нашла вас', mode: 'publish', deal: 'resume' },
  ],
  subcategories: [
    {
      id: 'sales',
      title: 'Продажи и торговля',
      listTitle: 'Продажи и торговля',
      steps: ['Основное', 'Подробности', 'Оплата и город', 'Предпросмотр'],
      fields: [
      // ── Общее для вакансии и резюме ──
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит человек.' },
        { key: 'profession', label: 'Профессия', type: 'select', reference: 'professions', dependsOn: '@subcategory', required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'employment', label: 'Занятость', type: 'select', options: ['Полная', 'Частичная', 'Подработка', 'Вахта', 'Стажировка'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'format', label: 'Формат работы', type: 'select', options: ['На месте', 'Удалённо', 'Гибрид'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'experience', label: 'Опыт работы', type: 'select', options: ['Без опыта', 'До года', '1–3 года', '3–6 лет', 'Более 6 лет'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'schedule', label: 'График', type: 'select', options: ['5/2', '2/2', '6/1', 'Сменный', 'Свободный'], step: 2, filterable: true, filterKind: 'select', showInCard: true },

      // ── Только вакансия ──
        { key: 'company', label: 'Название компании', type: 'text', required: true, step: 2, deals: ['vacancy'], showInCard: true },
        { key: 'duties', label: 'Обязанности', type: 'textarea', required: true, step: 2, deals: ['vacancy'], hint: 'Что человек будет делать каждый день.' },
        { key: 'requirements', label: 'Требования', type: 'textarea', step: 2, deals: ['vacancy'] },
        { key: 'conditions', label: 'Условия', type: 'textarea', step: 2, deals: ['vacancy'], hint: 'Оформление, отпуск, что оплачивается.' },
        { key: 'registration', label: 'Оформление', type: 'select', options: ['По ТК РФ', 'Самозанятость', 'Договор ГПХ', 'Без оформления'], step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'payoutFrequency', label: 'Выплаты', type: 'select', options: ['Два раза в месяц', 'Раз в месяц', 'Еженедельно', 'Ежедневно'], step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'noExperienceOk', label: 'Можно без опыта', type: 'toggle', step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'forStudents', label: 'Подходит студентам', type: 'toggle', step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select' },

      // ── Только резюме ──
        { key: 'age', label: 'Возраст', type: 'number', unit: 'лет', step: 2, deals: ['resume'], hint: 'Необязательно. Требовать возраст в вакансиях запрещено законом.' },
        { key: 'education', label: 'Образование', type: 'select', options: ['Среднее', 'Среднее специальное', 'Незаконченное высшее', 'Высшее'], step: 2, deals: ['resume'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'lastPosition', label: 'Последнее место работы', type: 'text', step: 2, deals: ['resume'], showInCard: true },
        { key: 'about', label: 'О себе', type: 'textarea', required: true, step: 2, deals: ['resume'], hint: 'Чем занимались, что умеете, чего ищете.' },
        { key: 'skills', label: 'Навыки', type: 'textarea', step: 2, deals: ['resume'] },
        { key: 'hasCar', label: 'Есть автомобиль', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'hasLicense', label: 'Водительские права', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select' },
        { key: 'relocation', label: 'Готов к переезду', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select' },

      // ── Оплата и место ──
        { key: 'price', label: 'Зарплата от', type: 'money', unit: '₽', required: true, step: 3, hint: 'В вакансии — что предлагаете, в резюме — что ожидаете.' },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 3 },
      ],
    },
    {
      id: 'transport',
      title: 'Транспорт и логистика',
      listTitle: 'Транспорт и логистика',
      steps: ['Основное', 'Подробности', 'Оплата и город', 'Предпросмотр'],
      fields: [
      // ── Общее для вакансии и резюме ──
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит человек.' },
        { key: 'profession', label: 'Профессия', type: 'select', reference: 'professions', dependsOn: '@subcategory', required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'employment', label: 'Занятость', type: 'select', options: ['Полная', 'Частичная', 'Подработка', 'Вахта', 'Стажировка'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'format', label: 'Формат работы', type: 'select', options: ['На месте', 'Удалённо', 'Гибрид'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'experience', label: 'Опыт работы', type: 'select', options: ['Без опыта', 'До года', '1–3 года', '3–6 лет', 'Более 6 лет'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'schedule', label: 'График', type: 'select', options: ['5/2', '2/2', '6/1', 'Сменный', 'Свободный'], step: 2, filterable: true, filterKind: 'select', showInCard: true },

      // ── Только вакансия ──
        { key: 'company', label: 'Название компании', type: 'text', required: true, step: 2, deals: ['vacancy'], showInCard: true },
        { key: 'duties', label: 'Обязанности', type: 'textarea', required: true, step: 2, deals: ['vacancy'], hint: 'Что человек будет делать каждый день.' },
        { key: 'requirements', label: 'Требования', type: 'textarea', step: 2, deals: ['vacancy'] },
        { key: 'conditions', label: 'Условия', type: 'textarea', step: 2, deals: ['vacancy'], hint: 'Оформление, отпуск, что оплачивается.' },
        { key: 'registration', label: 'Оформление', type: 'select', options: ['По ТК РФ', 'Самозанятость', 'Договор ГПХ', 'Без оформления'], step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'payoutFrequency', label: 'Выплаты', type: 'select', options: ['Два раза в месяц', 'Раз в месяц', 'Еженедельно', 'Ежедневно'], step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'noExperienceOk', label: 'Можно без опыта', type: 'toggle', step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'forStudents', label: 'Подходит студентам', type: 'toggle', step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select' },

      // ── Только резюме ──
        { key: 'age', label: 'Возраст', type: 'number', unit: 'лет', step: 2, deals: ['resume'], hint: 'Необязательно. Требовать возраст в вакансиях запрещено законом.' },
        { key: 'education', label: 'Образование', type: 'select', options: ['Среднее', 'Среднее специальное', 'Незаконченное высшее', 'Высшее'], step: 2, deals: ['resume'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'lastPosition', label: 'Последнее место работы', type: 'text', step: 2, deals: ['resume'], showInCard: true },
        { key: 'about', label: 'О себе', type: 'textarea', required: true, step: 2, deals: ['resume'], hint: 'Чем занимались, что умеете, чего ищете.' },
        { key: 'skills', label: 'Навыки', type: 'textarea', step: 2, deals: ['resume'] },
        { key: 'hasCar', label: 'Есть автомобиль', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'hasLicense', label: 'Водительские права', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select' },
        { key: 'relocation', label: 'Готов к переезду', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select' },

      // ── Оплата и место ──
        { key: 'price', label: 'Зарплата от', type: 'money', unit: '₽', required: true, step: 3, hint: 'В вакансии — что предлагаете, в резюме — что ожидаете.' },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 3 },
      ],
    },
    {
      id: 'construction',
      title: 'Строительство и ремонт',
      listTitle: 'Строительство и ремонт',
      steps: ['Основное', 'Подробности', 'Оплата и город', 'Предпросмотр'],
      fields: [
      // ── Общее для вакансии и резюме ──
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит человек.' },
        { key: 'profession', label: 'Профессия', type: 'select', reference: 'professions', dependsOn: '@subcategory', required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'employment', label: 'Занятость', type: 'select', options: ['Полная', 'Частичная', 'Подработка', 'Вахта', 'Стажировка'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'format', label: 'Формат работы', type: 'select', options: ['На месте', 'Удалённо', 'Гибрид'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'experience', label: 'Опыт работы', type: 'select', options: ['Без опыта', 'До года', '1–3 года', '3–6 лет', 'Более 6 лет'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'schedule', label: 'График', type: 'select', options: ['5/2', '2/2', '6/1', 'Сменный', 'Свободный'], step: 2, filterable: true, filterKind: 'select', showInCard: true },

      // ── Только вакансия ──
        { key: 'company', label: 'Название компании', type: 'text', required: true, step: 2, deals: ['vacancy'], showInCard: true },
        { key: 'duties', label: 'Обязанности', type: 'textarea', required: true, step: 2, deals: ['vacancy'], hint: 'Что человек будет делать каждый день.' },
        { key: 'requirements', label: 'Требования', type: 'textarea', step: 2, deals: ['vacancy'] },
        { key: 'conditions', label: 'Условия', type: 'textarea', step: 2, deals: ['vacancy'], hint: 'Оформление, отпуск, что оплачивается.' },
        { key: 'registration', label: 'Оформление', type: 'select', options: ['По ТК РФ', 'Самозанятость', 'Договор ГПХ', 'Без оформления'], step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'payoutFrequency', label: 'Выплаты', type: 'select', options: ['Два раза в месяц', 'Раз в месяц', 'Еженедельно', 'Ежедневно'], step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'noExperienceOk', label: 'Можно без опыта', type: 'toggle', step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'forStudents', label: 'Подходит студентам', type: 'toggle', step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select' },

      // ── Только резюме ──
        { key: 'age', label: 'Возраст', type: 'number', unit: 'лет', step: 2, deals: ['resume'], hint: 'Необязательно. Требовать возраст в вакансиях запрещено законом.' },
        { key: 'education', label: 'Образование', type: 'select', options: ['Среднее', 'Среднее специальное', 'Незаконченное высшее', 'Высшее'], step: 2, deals: ['resume'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'lastPosition', label: 'Последнее место работы', type: 'text', step: 2, deals: ['resume'], showInCard: true },
        { key: 'about', label: 'О себе', type: 'textarea', required: true, step: 2, deals: ['resume'], hint: 'Чем занимались, что умеете, чего ищете.' },
        { key: 'skills', label: 'Навыки', type: 'textarea', step: 2, deals: ['resume'] },
        { key: 'hasCar', label: 'Есть автомобиль', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'hasLicense', label: 'Водительские права', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select' },
        { key: 'relocation', label: 'Готов к переезду', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select' },

      // ── Оплата и место ──
        { key: 'price', label: 'Зарплата от', type: 'money', unit: '₽', required: true, step: 3, hint: 'В вакансии — что предлагаете, в резюме — что ожидаете.' },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 3 },
      ],
    },
    {
      id: 'production',
      title: 'Производство',
      listTitle: 'Производство',
      steps: ['Основное', 'Подробности', 'Оплата и город', 'Предпросмотр'],
      fields: [
      // ── Общее для вакансии и резюме ──
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит человек.' },
        { key: 'profession', label: 'Профессия', type: 'select', reference: 'professions', dependsOn: '@subcategory', required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'employment', label: 'Занятость', type: 'select', options: ['Полная', 'Частичная', 'Подработка', 'Вахта', 'Стажировка'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'format', label: 'Формат работы', type: 'select', options: ['На месте', 'Удалённо', 'Гибрид'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'experience', label: 'Опыт работы', type: 'select', options: ['Без опыта', 'До года', '1–3 года', '3–6 лет', 'Более 6 лет'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'schedule', label: 'График', type: 'select', options: ['5/2', '2/2', '6/1', 'Сменный', 'Свободный'], step: 2, filterable: true, filterKind: 'select', showInCard: true },

      // ── Только вакансия ──
        { key: 'company', label: 'Название компании', type: 'text', required: true, step: 2, deals: ['vacancy'], showInCard: true },
        { key: 'duties', label: 'Обязанности', type: 'textarea', required: true, step: 2, deals: ['vacancy'], hint: 'Что человек будет делать каждый день.' },
        { key: 'requirements', label: 'Требования', type: 'textarea', step: 2, deals: ['vacancy'] },
        { key: 'conditions', label: 'Условия', type: 'textarea', step: 2, deals: ['vacancy'], hint: 'Оформление, отпуск, что оплачивается.' },
        { key: 'registration', label: 'Оформление', type: 'select', options: ['По ТК РФ', 'Самозанятость', 'Договор ГПХ', 'Без оформления'], step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'payoutFrequency', label: 'Выплаты', type: 'select', options: ['Два раза в месяц', 'Раз в месяц', 'Еженедельно', 'Ежедневно'], step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'noExperienceOk', label: 'Можно без опыта', type: 'toggle', step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'forStudents', label: 'Подходит студентам', type: 'toggle', step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select' },

      // ── Только резюме ──
        { key: 'age', label: 'Возраст', type: 'number', unit: 'лет', step: 2, deals: ['resume'], hint: 'Необязательно. Требовать возраст в вакансиях запрещено законом.' },
        { key: 'education', label: 'Образование', type: 'select', options: ['Среднее', 'Среднее специальное', 'Незаконченное высшее', 'Высшее'], step: 2, deals: ['resume'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'lastPosition', label: 'Последнее место работы', type: 'text', step: 2, deals: ['resume'], showInCard: true },
        { key: 'about', label: 'О себе', type: 'textarea', required: true, step: 2, deals: ['resume'], hint: 'Чем занимались, что умеете, чего ищете.' },
        { key: 'skills', label: 'Навыки', type: 'textarea', step: 2, deals: ['resume'] },
        { key: 'hasCar', label: 'Есть автомобиль', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'hasLicense', label: 'Водительские права', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select' },
        { key: 'relocation', label: 'Готов к переезду', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select' },

      // ── Оплата и место ──
        { key: 'price', label: 'Зарплата от', type: 'money', unit: '₽', required: true, step: 3, hint: 'В вакансии — что предлагаете, в резюме — что ожидаете.' },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 3 },
      ],
    },
    {
      id: 'it',
      title: 'IT и интернет',
      listTitle: 'IT и интернет',
      steps: ['Основное', 'Подробности', 'Оплата и город', 'Предпросмотр'],
      fields: [
      // ── Общее для вакансии и резюме ──
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит человек.' },
        { key: 'profession', label: 'Профессия', type: 'select', reference: 'professions', dependsOn: '@subcategory', required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'employment', label: 'Занятость', type: 'select', options: ['Полная', 'Частичная', 'Подработка', 'Вахта', 'Стажировка'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'format', label: 'Формат работы', type: 'select', options: ['На месте', 'Удалённо', 'Гибрид'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'experience', label: 'Опыт работы', type: 'select', options: ['Без опыта', 'До года', '1–3 года', '3–6 лет', 'Более 6 лет'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'schedule', label: 'График', type: 'select', options: ['5/2', '2/2', '6/1', 'Сменный', 'Свободный'], step: 2, filterable: true, filterKind: 'select', showInCard: true },

      // ── Только вакансия ──
        { key: 'company', label: 'Название компании', type: 'text', required: true, step: 2, deals: ['vacancy'], showInCard: true },
        { key: 'duties', label: 'Обязанности', type: 'textarea', required: true, step: 2, deals: ['vacancy'], hint: 'Что человек будет делать каждый день.' },
        { key: 'requirements', label: 'Требования', type: 'textarea', step: 2, deals: ['vacancy'] },
        { key: 'conditions', label: 'Условия', type: 'textarea', step: 2, deals: ['vacancy'], hint: 'Оформление, отпуск, что оплачивается.' },
        { key: 'registration', label: 'Оформление', type: 'select', options: ['По ТК РФ', 'Самозанятость', 'Договор ГПХ', 'Без оформления'], step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'payoutFrequency', label: 'Выплаты', type: 'select', options: ['Два раза в месяц', 'Раз в месяц', 'Еженедельно', 'Ежедневно'], step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'noExperienceOk', label: 'Можно без опыта', type: 'toggle', step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'forStudents', label: 'Подходит студентам', type: 'toggle', step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select' },

      // ── Только резюме ──
        { key: 'age', label: 'Возраст', type: 'number', unit: 'лет', step: 2, deals: ['resume'], hint: 'Необязательно. Требовать возраст в вакансиях запрещено законом.' },
        { key: 'education', label: 'Образование', type: 'select', options: ['Среднее', 'Среднее специальное', 'Незаконченное высшее', 'Высшее'], step: 2, deals: ['resume'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'lastPosition', label: 'Последнее место работы', type: 'text', step: 2, deals: ['resume'], showInCard: true },
        { key: 'about', label: 'О себе', type: 'textarea', required: true, step: 2, deals: ['resume'], hint: 'Чем занимались, что умеете, чего ищете.' },
        { key: 'skills', label: 'Навыки', type: 'textarea', step: 2, deals: ['resume'] },
        { key: 'hasCar', label: 'Есть автомобиль', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'hasLicense', label: 'Водительские права', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select' },
        { key: 'relocation', label: 'Готов к переезду', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select' },

      // ── Оплата и место ──
        { key: 'price', label: 'Зарплата от', type: 'money', unit: '₽', required: true, step: 3, hint: 'В вакансии — что предлагаете, в резюме — что ожидаете.' },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 3 },
      ],
    },
    {
      id: 'beauty',
      title: 'Красота и здоровье',
      listTitle: 'Красота и здоровье',
      steps: ['Основное', 'Подробности', 'Оплата и город', 'Предпросмотр'],
      fields: [
      // ── Общее для вакансии и резюме ──
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит человек.' },
        { key: 'profession', label: 'Профессия', type: 'select', reference: 'professions', dependsOn: '@subcategory', required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'employment', label: 'Занятость', type: 'select', options: ['Полная', 'Частичная', 'Подработка', 'Вахта', 'Стажировка'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'format', label: 'Формат работы', type: 'select', options: ['На месте', 'Удалённо', 'Гибрид'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'experience', label: 'Опыт работы', type: 'select', options: ['Без опыта', 'До года', '1–3 года', '3–6 лет', 'Более 6 лет'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'schedule', label: 'График', type: 'select', options: ['5/2', '2/2', '6/1', 'Сменный', 'Свободный'], step: 2, filterable: true, filterKind: 'select', showInCard: true },

      // ── Только вакансия ──
        { key: 'company', label: 'Название компании', type: 'text', required: true, step: 2, deals: ['vacancy'], showInCard: true },
        { key: 'duties', label: 'Обязанности', type: 'textarea', required: true, step: 2, deals: ['vacancy'], hint: 'Что человек будет делать каждый день.' },
        { key: 'requirements', label: 'Требования', type: 'textarea', step: 2, deals: ['vacancy'] },
        { key: 'conditions', label: 'Условия', type: 'textarea', step: 2, deals: ['vacancy'], hint: 'Оформление, отпуск, что оплачивается.' },
        { key: 'registration', label: 'Оформление', type: 'select', options: ['По ТК РФ', 'Самозанятость', 'Договор ГПХ', 'Без оформления'], step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'payoutFrequency', label: 'Выплаты', type: 'select', options: ['Два раза в месяц', 'Раз в месяц', 'Еженедельно', 'Ежедневно'], step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'noExperienceOk', label: 'Можно без опыта', type: 'toggle', step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'forStudents', label: 'Подходит студентам', type: 'toggle', step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select' },

      // ── Только резюме ──
        { key: 'age', label: 'Возраст', type: 'number', unit: 'лет', step: 2, deals: ['resume'], hint: 'Необязательно. Требовать возраст в вакансиях запрещено законом.' },
        { key: 'education', label: 'Образование', type: 'select', options: ['Среднее', 'Среднее специальное', 'Незаконченное высшее', 'Высшее'], step: 2, deals: ['resume'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'lastPosition', label: 'Последнее место работы', type: 'text', step: 2, deals: ['resume'], showInCard: true },
        { key: 'about', label: 'О себе', type: 'textarea', required: true, step: 2, deals: ['resume'], hint: 'Чем занимались, что умеете, чего ищете.' },
        { key: 'skills', label: 'Навыки', type: 'textarea', step: 2, deals: ['resume'] },
        { key: 'hasCar', label: 'Есть автомобиль', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'hasLicense', label: 'Водительские права', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select' },
        { key: 'relocation', label: 'Готов к переезду', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select' },

      // ── Оплата и место ──
        { key: 'price', label: 'Зарплата от', type: 'money', unit: '₽', required: true, step: 3, hint: 'В вакансии — что предлагаете, в резюме — что ожидаете.' },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 3 },
      ],
    },
    {
      id: 'horeca',
      title: 'Рестораны и гостиницы',
      listTitle: 'Рестораны и гостиницы',
      steps: ['Основное', 'Подробности', 'Оплата и город', 'Предпросмотр'],
      fields: [
      // ── Общее для вакансии и резюме ──
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит человек.' },
        { key: 'profession', label: 'Профессия', type: 'select', reference: 'professions', dependsOn: '@subcategory', required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'employment', label: 'Занятость', type: 'select', options: ['Полная', 'Частичная', 'Подработка', 'Вахта', 'Стажировка'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'format', label: 'Формат работы', type: 'select', options: ['На месте', 'Удалённо', 'Гибрид'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'experience', label: 'Опыт работы', type: 'select', options: ['Без опыта', 'До года', '1–3 года', '3–6 лет', 'Более 6 лет'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'schedule', label: 'График', type: 'select', options: ['5/2', '2/2', '6/1', 'Сменный', 'Свободный'], step: 2, filterable: true, filterKind: 'select', showInCard: true },

      // ── Только вакансия ──
        { key: 'company', label: 'Название компании', type: 'text', required: true, step: 2, deals: ['vacancy'], showInCard: true },
        { key: 'duties', label: 'Обязанности', type: 'textarea', required: true, step: 2, deals: ['vacancy'], hint: 'Что человек будет делать каждый день.' },
        { key: 'requirements', label: 'Требования', type: 'textarea', step: 2, deals: ['vacancy'] },
        { key: 'conditions', label: 'Условия', type: 'textarea', step: 2, deals: ['vacancy'], hint: 'Оформление, отпуск, что оплачивается.' },
        { key: 'registration', label: 'Оформление', type: 'select', options: ['По ТК РФ', 'Самозанятость', 'Договор ГПХ', 'Без оформления'], step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'payoutFrequency', label: 'Выплаты', type: 'select', options: ['Два раза в месяц', 'Раз в месяц', 'Еженедельно', 'Ежедневно'], step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'noExperienceOk', label: 'Можно без опыта', type: 'toggle', step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'forStudents', label: 'Подходит студентам', type: 'toggle', step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select' },

      // ── Только резюме ──
        { key: 'age', label: 'Возраст', type: 'number', unit: 'лет', step: 2, deals: ['resume'], hint: 'Необязательно. Требовать возраст в вакансиях запрещено законом.' },
        { key: 'education', label: 'Образование', type: 'select', options: ['Среднее', 'Среднее специальное', 'Незаконченное высшее', 'Высшее'], step: 2, deals: ['resume'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'lastPosition', label: 'Последнее место работы', type: 'text', step: 2, deals: ['resume'], showInCard: true },
        { key: 'about', label: 'О себе', type: 'textarea', required: true, step: 2, deals: ['resume'], hint: 'Чем занимались, что умеете, чего ищете.' },
        { key: 'skills', label: 'Навыки', type: 'textarea', step: 2, deals: ['resume'] },
        { key: 'hasCar', label: 'Есть автомобиль', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'hasLicense', label: 'Водительские права', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select' },
        { key: 'relocation', label: 'Готов к переезду', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select' },

      // ── Оплата и место ──
        { key: 'price', label: 'Зарплата от', type: 'money', unit: '₽', required: true, step: 3, hint: 'В вакансии — что предлагаете, в резюме — что ожидаете.' },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 3 },
      ],
    },
    {
      id: 'education',
      title: 'Образование',
      listTitle: 'Образование',
      steps: ['Основное', 'Подробности', 'Оплата и город', 'Предпросмотр'],
      fields: [
      // ── Общее для вакансии и резюме ──
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит человек.' },
        { key: 'profession', label: 'Профессия', type: 'select', reference: 'professions', dependsOn: '@subcategory', required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'employment', label: 'Занятость', type: 'select', options: ['Полная', 'Частичная', 'Подработка', 'Вахта', 'Стажировка'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'format', label: 'Формат работы', type: 'select', options: ['На месте', 'Удалённо', 'Гибрид'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'experience', label: 'Опыт работы', type: 'select', options: ['Без опыта', 'До года', '1–3 года', '3–6 лет', 'Более 6 лет'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'schedule', label: 'График', type: 'select', options: ['5/2', '2/2', '6/1', 'Сменный', 'Свободный'], step: 2, filterable: true, filterKind: 'select', showInCard: true },

      // ── Только вакансия ──
        { key: 'company', label: 'Название компании', type: 'text', required: true, step: 2, deals: ['vacancy'], showInCard: true },
        { key: 'duties', label: 'Обязанности', type: 'textarea', required: true, step: 2, deals: ['vacancy'], hint: 'Что человек будет делать каждый день.' },
        { key: 'requirements', label: 'Требования', type: 'textarea', step: 2, deals: ['vacancy'] },
        { key: 'conditions', label: 'Условия', type: 'textarea', step: 2, deals: ['vacancy'], hint: 'Оформление, отпуск, что оплачивается.' },
        { key: 'registration', label: 'Оформление', type: 'select', options: ['По ТК РФ', 'Самозанятость', 'Договор ГПХ', 'Без оформления'], step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'payoutFrequency', label: 'Выплаты', type: 'select', options: ['Два раза в месяц', 'Раз в месяц', 'Еженедельно', 'Ежедневно'], step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'noExperienceOk', label: 'Можно без опыта', type: 'toggle', step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'forStudents', label: 'Подходит студентам', type: 'toggle', step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select' },

      // ── Только резюме ──
        { key: 'age', label: 'Возраст', type: 'number', unit: 'лет', step: 2, deals: ['resume'], hint: 'Необязательно. Требовать возраст в вакансиях запрещено законом.' },
        { key: 'education', label: 'Образование', type: 'select', options: ['Среднее', 'Среднее специальное', 'Незаконченное высшее', 'Высшее'], step: 2, deals: ['resume'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'lastPosition', label: 'Последнее место работы', type: 'text', step: 2, deals: ['resume'], showInCard: true },
        { key: 'about', label: 'О себе', type: 'textarea', required: true, step: 2, deals: ['resume'], hint: 'Чем занимались, что умеете, чего ищете.' },
        { key: 'skills', label: 'Навыки', type: 'textarea', step: 2, deals: ['resume'] },
        { key: 'hasCar', label: 'Есть автомобиль', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'hasLicense', label: 'Водительские права', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select' },
        { key: 'relocation', label: 'Готов к переезду', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select' },

      // ── Оплата и место ──
        { key: 'price', label: 'Зарплата от', type: 'money', unit: '₽', required: true, step: 3, hint: 'В вакансии — что предлагаете, в резюме — что ожидаете.' },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 3 },
      ],
    },
    {
      id: 'office',
      title: 'Офис и администрация',
      listTitle: 'Офис и администрация',
      steps: ['Основное', 'Подробности', 'Оплата и город', 'Предпросмотр'],
      fields: [
      // ── Общее для вакансии и резюме ──
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит человек.' },
        { key: 'profession', label: 'Профессия', type: 'select', reference: 'professions', dependsOn: '@subcategory', required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'employment', label: 'Занятость', type: 'select', options: ['Полная', 'Частичная', 'Подработка', 'Вахта', 'Стажировка'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'format', label: 'Формат работы', type: 'select', options: ['На месте', 'Удалённо', 'Гибрид'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'experience', label: 'Опыт работы', type: 'select', options: ['Без опыта', 'До года', '1–3 года', '3–6 лет', 'Более 6 лет'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'schedule', label: 'График', type: 'select', options: ['5/2', '2/2', '6/1', 'Сменный', 'Свободный'], step: 2, filterable: true, filterKind: 'select', showInCard: true },

      // ── Только вакансия ──
        { key: 'company', label: 'Название компании', type: 'text', required: true, step: 2, deals: ['vacancy'], showInCard: true },
        { key: 'duties', label: 'Обязанности', type: 'textarea', required: true, step: 2, deals: ['vacancy'], hint: 'Что человек будет делать каждый день.' },
        { key: 'requirements', label: 'Требования', type: 'textarea', step: 2, deals: ['vacancy'] },
        { key: 'conditions', label: 'Условия', type: 'textarea', step: 2, deals: ['vacancy'], hint: 'Оформление, отпуск, что оплачивается.' },
        { key: 'registration', label: 'Оформление', type: 'select', options: ['По ТК РФ', 'Самозанятость', 'Договор ГПХ', 'Без оформления'], step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'payoutFrequency', label: 'Выплаты', type: 'select', options: ['Два раза в месяц', 'Раз в месяц', 'Еженедельно', 'Ежедневно'], step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'noExperienceOk', label: 'Можно без опыта', type: 'toggle', step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'forStudents', label: 'Подходит студентам', type: 'toggle', step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select' },

      // ── Только резюме ──
        { key: 'age', label: 'Возраст', type: 'number', unit: 'лет', step: 2, deals: ['resume'], hint: 'Необязательно. Требовать возраст в вакансиях запрещено законом.' },
        { key: 'education', label: 'Образование', type: 'select', options: ['Среднее', 'Среднее специальное', 'Незаконченное высшее', 'Высшее'], step: 2, deals: ['resume'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'lastPosition', label: 'Последнее место работы', type: 'text', step: 2, deals: ['resume'], showInCard: true },
        { key: 'about', label: 'О себе', type: 'textarea', required: true, step: 2, deals: ['resume'], hint: 'Чем занимались, что умеете, чего ищете.' },
        { key: 'skills', label: 'Навыки', type: 'textarea', step: 2, deals: ['resume'] },
        { key: 'hasCar', label: 'Есть автомобиль', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'hasLicense', label: 'Водительские права', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select' },
        { key: 'relocation', label: 'Готов к переезду', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select' },

      // ── Оплата и место ──
        { key: 'price', label: 'Зарплата от', type: 'money', unit: '₽', required: true, step: 3, hint: 'В вакансии — что предлагаете, в резюме — что ожидаете.' },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 3 },
      ],
    },
    {
      id: 'finance',
      title: 'Финансы и бухгалтерия',
      listTitle: 'Финансы и бухгалтерия',
      steps: ['Основное', 'Подробности', 'Оплата и город', 'Предпросмотр'],
      fields: [
      // ── Общее для вакансии и резюме ──
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит человек.' },
        { key: 'profession', label: 'Профессия', type: 'select', reference: 'professions', dependsOn: '@subcategory', required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'employment', label: 'Занятость', type: 'select', options: ['Полная', 'Частичная', 'Подработка', 'Вахта', 'Стажировка'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'format', label: 'Формат работы', type: 'select', options: ['На месте', 'Удалённо', 'Гибрид'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'experience', label: 'Опыт работы', type: 'select', options: ['Без опыта', 'До года', '1–3 года', '3–6 лет', 'Более 6 лет'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'schedule', label: 'График', type: 'select', options: ['5/2', '2/2', '6/1', 'Сменный', 'Свободный'], step: 2, filterable: true, filterKind: 'select', showInCard: true },

      // ── Только вакансия ──
        { key: 'company', label: 'Название компании', type: 'text', required: true, step: 2, deals: ['vacancy'], showInCard: true },
        { key: 'duties', label: 'Обязанности', type: 'textarea', required: true, step: 2, deals: ['vacancy'], hint: 'Что человек будет делать каждый день.' },
        { key: 'requirements', label: 'Требования', type: 'textarea', step: 2, deals: ['vacancy'] },
        { key: 'conditions', label: 'Условия', type: 'textarea', step: 2, deals: ['vacancy'], hint: 'Оформление, отпуск, что оплачивается.' },
        { key: 'registration', label: 'Оформление', type: 'select', options: ['По ТК РФ', 'Самозанятость', 'Договор ГПХ', 'Без оформления'], step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'payoutFrequency', label: 'Выплаты', type: 'select', options: ['Два раза в месяц', 'Раз в месяц', 'Еженедельно', 'Ежедневно'], step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'noExperienceOk', label: 'Можно без опыта', type: 'toggle', step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'forStudents', label: 'Подходит студентам', type: 'toggle', step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select' },

      // ── Только резюме ──
        { key: 'age', label: 'Возраст', type: 'number', unit: 'лет', step: 2, deals: ['resume'], hint: 'Необязательно. Требовать возраст в вакансиях запрещено законом.' },
        { key: 'education', label: 'Образование', type: 'select', options: ['Среднее', 'Среднее специальное', 'Незаконченное высшее', 'Высшее'], step: 2, deals: ['resume'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'lastPosition', label: 'Последнее место работы', type: 'text', step: 2, deals: ['resume'], showInCard: true },
        { key: 'about', label: 'О себе', type: 'textarea', required: true, step: 2, deals: ['resume'], hint: 'Чем занимались, что умеете, чего ищете.' },
        { key: 'skills', label: 'Навыки', type: 'textarea', step: 2, deals: ['resume'] },
        { key: 'hasCar', label: 'Есть автомобиль', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'hasLicense', label: 'Водительские права', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select' },
        { key: 'relocation', label: 'Готов к переезду', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select' },

      // ── Оплата и место ──
        { key: 'price', label: 'Зарплата от', type: 'money', unit: '₽', required: true, step: 3, hint: 'В вакансии — что предлагаете, в резюме — что ожидаете.' },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 3 },
      ],
    },
    {
      id: 'marketing',
      title: 'Маркетинг и медиа',
      listTitle: 'Маркетинг и медиа',
      steps: ['Основное', 'Подробности', 'Оплата и город', 'Предпросмотр'],
      fields: [
      // ── Общее для вакансии и резюме ──
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит человек.' },
        { key: 'profession', label: 'Профессия', type: 'select', reference: 'professions', dependsOn: '@subcategory', required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'employment', label: 'Занятость', type: 'select', options: ['Полная', 'Частичная', 'Подработка', 'Вахта', 'Стажировка'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'format', label: 'Формат работы', type: 'select', options: ['На месте', 'Удалённо', 'Гибрид'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'experience', label: 'Опыт работы', type: 'select', options: ['Без опыта', 'До года', '1–3 года', '3–6 лет', 'Более 6 лет'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'schedule', label: 'График', type: 'select', options: ['5/2', '2/2', '6/1', 'Сменный', 'Свободный'], step: 2, filterable: true, filterKind: 'select', showInCard: true },

      // ── Только вакансия ──
        { key: 'company', label: 'Название компании', type: 'text', required: true, step: 2, deals: ['vacancy'], showInCard: true },
        { key: 'duties', label: 'Обязанности', type: 'textarea', required: true, step: 2, deals: ['vacancy'], hint: 'Что человек будет делать каждый день.' },
        { key: 'requirements', label: 'Требования', type: 'textarea', step: 2, deals: ['vacancy'] },
        { key: 'conditions', label: 'Условия', type: 'textarea', step: 2, deals: ['vacancy'], hint: 'Оформление, отпуск, что оплачивается.' },
        { key: 'registration', label: 'Оформление', type: 'select', options: ['По ТК РФ', 'Самозанятость', 'Договор ГПХ', 'Без оформления'], step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'payoutFrequency', label: 'Выплаты', type: 'select', options: ['Два раза в месяц', 'Раз в месяц', 'Еженедельно', 'Ежедневно'], step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'noExperienceOk', label: 'Можно без опыта', type: 'toggle', step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'forStudents', label: 'Подходит студентам', type: 'toggle', step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select' },

      // ── Только резюме ──
        { key: 'age', label: 'Возраст', type: 'number', unit: 'лет', step: 2, deals: ['resume'], hint: 'Необязательно. Требовать возраст в вакансиях запрещено законом.' },
        { key: 'education', label: 'Образование', type: 'select', options: ['Среднее', 'Среднее специальное', 'Незаконченное высшее', 'Высшее'], step: 2, deals: ['resume'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'lastPosition', label: 'Последнее место работы', type: 'text', step: 2, deals: ['resume'], showInCard: true },
        { key: 'about', label: 'О себе', type: 'textarea', required: true, step: 2, deals: ['resume'], hint: 'Чем занимались, что умеете, чего ищете.' },
        { key: 'skills', label: 'Навыки', type: 'textarea', step: 2, deals: ['resume'] },
        { key: 'hasCar', label: 'Есть автомобиль', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'hasLicense', label: 'Водительские права', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select' },
        { key: 'relocation', label: 'Готов к переезду', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select' },

      // ── Оплата и место ──
        { key: 'price', label: 'Зарплата от', type: 'money', unit: '₽', required: true, step: 3, hint: 'В вакансии — что предлагаете, в резюме — что ожидаете.' },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 3 },
      ],
    },
    {
      id: 'legal',
      title: 'Юриспруденция',
      listTitle: 'Юриспруденция',
      steps: ['Основное', 'Подробности', 'Оплата и город', 'Предпросмотр'],
      fields: [
      // ── Общее для вакансии и резюме ──
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит человек.' },
        { key: 'profession', label: 'Профессия', type: 'select', reference: 'professions', dependsOn: '@subcategory', required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'employment', label: 'Занятость', type: 'select', options: ['Полная', 'Частичная', 'Подработка', 'Вахта', 'Стажировка'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'format', label: 'Формат работы', type: 'select', options: ['На месте', 'Удалённо', 'Гибрид'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'experience', label: 'Опыт работы', type: 'select', options: ['Без опыта', 'До года', '1–3 года', '3–6 лет', 'Более 6 лет'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'schedule', label: 'График', type: 'select', options: ['5/2', '2/2', '6/1', 'Сменный', 'Свободный'], step: 2, filterable: true, filterKind: 'select', showInCard: true },

      // ── Только вакансия ──
        { key: 'company', label: 'Название компании', type: 'text', required: true, step: 2, deals: ['vacancy'], showInCard: true },
        { key: 'duties', label: 'Обязанности', type: 'textarea', required: true, step: 2, deals: ['vacancy'], hint: 'Что человек будет делать каждый день.' },
        { key: 'requirements', label: 'Требования', type: 'textarea', step: 2, deals: ['vacancy'] },
        { key: 'conditions', label: 'Условия', type: 'textarea', step: 2, deals: ['vacancy'], hint: 'Оформление, отпуск, что оплачивается.' },
        { key: 'registration', label: 'Оформление', type: 'select', options: ['По ТК РФ', 'Самозанятость', 'Договор ГПХ', 'Без оформления'], step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'payoutFrequency', label: 'Выплаты', type: 'select', options: ['Два раза в месяц', 'Раз в месяц', 'Еженедельно', 'Ежедневно'], step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'noExperienceOk', label: 'Можно без опыта', type: 'toggle', step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'forStudents', label: 'Подходит студентам', type: 'toggle', step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select' },

      // ── Только резюме ──
        { key: 'age', label: 'Возраст', type: 'number', unit: 'лет', step: 2, deals: ['resume'], hint: 'Необязательно. Требовать возраст в вакансиях запрещено законом.' },
        { key: 'education', label: 'Образование', type: 'select', options: ['Среднее', 'Среднее специальное', 'Незаконченное высшее', 'Высшее'], step: 2, deals: ['resume'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'lastPosition', label: 'Последнее место работы', type: 'text', step: 2, deals: ['resume'], showInCard: true },
        { key: 'about', label: 'О себе', type: 'textarea', required: true, step: 2, deals: ['resume'], hint: 'Чем занимались, что умеете, чего ищете.' },
        { key: 'skills', label: 'Навыки', type: 'textarea', step: 2, deals: ['resume'] },
        { key: 'hasCar', label: 'Есть автомобиль', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'hasLicense', label: 'Водительские права', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select' },
        { key: 'relocation', label: 'Готов к переезду', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select' },

      // ── Оплата и место ──
        { key: 'price', label: 'Зарплата от', type: 'money', unit: '₽', required: true, step: 3, hint: 'В вакансии — что предлагаете, в резюме — что ожидаете.' },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 3 },
      ],
    },
    {
      id: 'security',
      title: 'Охрана и безопасность',
      listTitle: 'Охрана и безопасность',
      steps: ['Основное', 'Подробности', 'Оплата и город', 'Предпросмотр'],
      fields: [
      // ── Общее для вакансии и резюме ──
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит человек.' },
        { key: 'profession', label: 'Профессия', type: 'select', reference: 'professions', dependsOn: '@subcategory', required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'employment', label: 'Занятость', type: 'select', options: ['Полная', 'Частичная', 'Подработка', 'Вахта', 'Стажировка'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'format', label: 'Формат работы', type: 'select', options: ['На месте', 'Удалённо', 'Гибрид'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'experience', label: 'Опыт работы', type: 'select', options: ['Без опыта', 'До года', '1–3 года', '3–6 лет', 'Более 6 лет'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'schedule', label: 'График', type: 'select', options: ['5/2', '2/2', '6/1', 'Сменный', 'Свободный'], step: 2, filterable: true, filterKind: 'select', showInCard: true },

      // ── Только вакансия ──
        { key: 'company', label: 'Название компании', type: 'text', required: true, step: 2, deals: ['vacancy'], showInCard: true },
        { key: 'duties', label: 'Обязанности', type: 'textarea', required: true, step: 2, deals: ['vacancy'], hint: 'Что человек будет делать каждый день.' },
        { key: 'requirements', label: 'Требования', type: 'textarea', step: 2, deals: ['vacancy'] },
        { key: 'conditions', label: 'Условия', type: 'textarea', step: 2, deals: ['vacancy'], hint: 'Оформление, отпуск, что оплачивается.' },
        { key: 'registration', label: 'Оформление', type: 'select', options: ['По ТК РФ', 'Самозанятость', 'Договор ГПХ', 'Без оформления'], step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'payoutFrequency', label: 'Выплаты', type: 'select', options: ['Два раза в месяц', 'Раз в месяц', 'Еженедельно', 'Ежедневно'], step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'noExperienceOk', label: 'Можно без опыта', type: 'toggle', step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'forStudents', label: 'Подходит студентам', type: 'toggle', step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select' },

      // ── Только резюме ──
        { key: 'age', label: 'Возраст', type: 'number', unit: 'лет', step: 2, deals: ['resume'], hint: 'Необязательно. Требовать возраст в вакансиях запрещено законом.' },
        { key: 'education', label: 'Образование', type: 'select', options: ['Среднее', 'Среднее специальное', 'Незаконченное высшее', 'Высшее'], step: 2, deals: ['resume'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'lastPosition', label: 'Последнее место работы', type: 'text', step: 2, deals: ['resume'], showInCard: true },
        { key: 'about', label: 'О себе', type: 'textarea', required: true, step: 2, deals: ['resume'], hint: 'Чем занимались, что умеете, чего ищете.' },
        { key: 'skills', label: 'Навыки', type: 'textarea', step: 2, deals: ['resume'] },
        { key: 'hasCar', label: 'Есть автомобиль', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'hasLicense', label: 'Водительские права', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select' },
        { key: 'relocation', label: 'Готов к переезду', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select' },

      // ── Оплата и место ──
        { key: 'price', label: 'Зарплата от', type: 'money', unit: '₽', required: true, step: 3, hint: 'В вакансии — что предлагаете, в резюме — что ожидаете.' },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 3 },
      ],
    },
    {
      id: 'agriculture',
      title: 'Сельское хозяйство',
      listTitle: 'Сельское хозяйство',
      steps: ['Основное', 'Подробности', 'Оплата и город', 'Предпросмотр'],
      fields: [
      // ── Общее для вакансии и резюме ──
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит человек.' },
        { key: 'profession', label: 'Профессия', type: 'select', reference: 'professions', dependsOn: '@subcategory', required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'employment', label: 'Занятость', type: 'select', options: ['Полная', 'Частичная', 'Подработка', 'Вахта', 'Стажировка'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'format', label: 'Формат работы', type: 'select', options: ['На месте', 'Удалённо', 'Гибрид'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'experience', label: 'Опыт работы', type: 'select', options: ['Без опыта', 'До года', '1–3 года', '3–6 лет', 'Более 6 лет'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'schedule', label: 'График', type: 'select', options: ['5/2', '2/2', '6/1', 'Сменный', 'Свободный'], step: 2, filterable: true, filterKind: 'select', showInCard: true },

      // ── Только вакансия ──
        { key: 'company', label: 'Название компании', type: 'text', required: true, step: 2, deals: ['vacancy'], showInCard: true },
        { key: 'duties', label: 'Обязанности', type: 'textarea', required: true, step: 2, deals: ['vacancy'], hint: 'Что человек будет делать каждый день.' },
        { key: 'requirements', label: 'Требования', type: 'textarea', step: 2, deals: ['vacancy'] },
        { key: 'conditions', label: 'Условия', type: 'textarea', step: 2, deals: ['vacancy'], hint: 'Оформление, отпуск, что оплачивается.' },
        { key: 'registration', label: 'Оформление', type: 'select', options: ['По ТК РФ', 'Самозанятость', 'Договор ГПХ', 'Без оформления'], step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'payoutFrequency', label: 'Выплаты', type: 'select', options: ['Два раза в месяц', 'Раз в месяц', 'Еженедельно', 'Ежедневно'], step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'noExperienceOk', label: 'Можно без опыта', type: 'toggle', step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'forStudents', label: 'Подходит студентам', type: 'toggle', step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select' },

      // ── Только резюме ──
        { key: 'age', label: 'Возраст', type: 'number', unit: 'лет', step: 2, deals: ['resume'], hint: 'Необязательно. Требовать возраст в вакансиях запрещено законом.' },
        { key: 'education', label: 'Образование', type: 'select', options: ['Среднее', 'Среднее специальное', 'Незаконченное высшее', 'Высшее'], step: 2, deals: ['resume'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'lastPosition', label: 'Последнее место работы', type: 'text', step: 2, deals: ['resume'], showInCard: true },
        { key: 'about', label: 'О себе', type: 'textarea', required: true, step: 2, deals: ['resume'], hint: 'Чем занимались, что умеете, чего ищете.' },
        { key: 'skills', label: 'Навыки', type: 'textarea', step: 2, deals: ['resume'] },
        { key: 'hasCar', label: 'Есть автомобиль', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'hasLicense', label: 'Водительские права', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select' },
        { key: 'relocation', label: 'Готов к переезду', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select' },

      // ── Оплата и место ──
        { key: 'price', label: 'Зарплата от', type: 'money', unit: '₽', required: true, step: 3, hint: 'В вакансии — что предлагаете, в резюме — что ожидаете.' },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 3 },
      ],
    },
    {
      id: 'utilities',
      title: 'ЖКХ и благоустройство',
      listTitle: 'ЖКХ и благоустройство',
      steps: ['Основное', 'Подробности', 'Оплата и город', 'Предпросмотр'],
      fields: [
      // ── Общее для вакансии и резюме ──
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит человек.' },
        { key: 'profession', label: 'Профессия', type: 'select', reference: 'professions', dependsOn: '@subcategory', required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'employment', label: 'Занятость', type: 'select', options: ['Полная', 'Частичная', 'Подработка', 'Вахта', 'Стажировка'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'format', label: 'Формат работы', type: 'select', options: ['На месте', 'Удалённо', 'Гибрид'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'experience', label: 'Опыт работы', type: 'select', options: ['Без опыта', 'До года', '1–3 года', '3–6 лет', 'Более 6 лет'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'schedule', label: 'График', type: 'select', options: ['5/2', '2/2', '6/1', 'Сменный', 'Свободный'], step: 2, filterable: true, filterKind: 'select', showInCard: true },

      // ── Только вакансия ──
        { key: 'company', label: 'Название компании', type: 'text', required: true, step: 2, deals: ['vacancy'], showInCard: true },
        { key: 'duties', label: 'Обязанности', type: 'textarea', required: true, step: 2, deals: ['vacancy'], hint: 'Что человек будет делать каждый день.' },
        { key: 'requirements', label: 'Требования', type: 'textarea', step: 2, deals: ['vacancy'] },
        { key: 'conditions', label: 'Условия', type: 'textarea', step: 2, deals: ['vacancy'], hint: 'Оформление, отпуск, что оплачивается.' },
        { key: 'registration', label: 'Оформление', type: 'select', options: ['По ТК РФ', 'Самозанятость', 'Договор ГПХ', 'Без оформления'], step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'payoutFrequency', label: 'Выплаты', type: 'select', options: ['Два раза в месяц', 'Раз в месяц', 'Еженедельно', 'Ежедневно'], step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'noExperienceOk', label: 'Можно без опыта', type: 'toggle', step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'forStudents', label: 'Подходит студентам', type: 'toggle', step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select' },

      // ── Только резюме ──
        { key: 'age', label: 'Возраст', type: 'number', unit: 'лет', step: 2, deals: ['resume'], hint: 'Необязательно. Требовать возраст в вакансиях запрещено законом.' },
        { key: 'education', label: 'Образование', type: 'select', options: ['Среднее', 'Среднее специальное', 'Незаконченное высшее', 'Высшее'], step: 2, deals: ['resume'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'lastPosition', label: 'Последнее место работы', type: 'text', step: 2, deals: ['resume'], showInCard: true },
        { key: 'about', label: 'О себе', type: 'textarea', required: true, step: 2, deals: ['resume'], hint: 'Чем занимались, что умеете, чего ищете.' },
        { key: 'skills', label: 'Навыки', type: 'textarea', step: 2, deals: ['resume'] },
        { key: 'hasCar', label: 'Есть автомобиль', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'hasLicense', label: 'Водительские права', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select' },
        { key: 'relocation', label: 'Готов к переезду', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select' },

      // ── Оплата и место ──
        { key: 'price', label: 'Зарплата от', type: 'money', unit: '₽', required: true, step: 3, hint: 'В вакансии — что предлагаете, в резюме — что ожидаете.' },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 3 },
      ],
    },
    {
      id: 'household',
      title: 'Домашний персонал',
      listTitle: 'Домашний персонал',
      steps: ['Основное', 'Подробности', 'Оплата и город', 'Предпросмотр'],
      fields: [
      // ── Общее для вакансии и резюме ──
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит человек.' },
        { key: 'profession', label: 'Профессия', type: 'select', reference: 'professions', dependsOn: '@subcategory', required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'employment', label: 'Занятость', type: 'select', options: ['Полная', 'Частичная', 'Подработка', 'Вахта', 'Стажировка'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'format', label: 'Формат работы', type: 'select', options: ['На месте', 'Удалённо', 'Гибрид'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'experience', label: 'Опыт работы', type: 'select', options: ['Без опыта', 'До года', '1–3 года', '3–6 лет', 'Более 6 лет'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'schedule', label: 'График', type: 'select', options: ['5/2', '2/2', '6/1', 'Сменный', 'Свободный'], step: 2, filterable: true, filterKind: 'select', showInCard: true },

      // ── Только вакансия ──
        { key: 'company', label: 'Название компании', type: 'text', required: true, step: 2, deals: ['vacancy'], showInCard: true },
        { key: 'duties', label: 'Обязанности', type: 'textarea', required: true, step: 2, deals: ['vacancy'], hint: 'Что человек будет делать каждый день.' },
        { key: 'requirements', label: 'Требования', type: 'textarea', step: 2, deals: ['vacancy'] },
        { key: 'conditions', label: 'Условия', type: 'textarea', step: 2, deals: ['vacancy'], hint: 'Оформление, отпуск, что оплачивается.' },
        { key: 'registration', label: 'Оформление', type: 'select', options: ['По ТК РФ', 'Самозанятость', 'Договор ГПХ', 'Без оформления'], step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'payoutFrequency', label: 'Выплаты', type: 'select', options: ['Два раза в месяц', 'Раз в месяц', 'Еженедельно', 'Ежедневно'], step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'noExperienceOk', label: 'Можно без опыта', type: 'toggle', step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'forStudents', label: 'Подходит студентам', type: 'toggle', step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select' },

      // ── Только резюме ──
        { key: 'age', label: 'Возраст', type: 'number', unit: 'лет', step: 2, deals: ['resume'], hint: 'Необязательно. Требовать возраст в вакансиях запрещено законом.' },
        { key: 'education', label: 'Образование', type: 'select', options: ['Среднее', 'Среднее специальное', 'Незаконченное высшее', 'Высшее'], step: 2, deals: ['resume'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'lastPosition', label: 'Последнее место работы', type: 'text', step: 2, deals: ['resume'], showInCard: true },
        { key: 'about', label: 'О себе', type: 'textarea', required: true, step: 2, deals: ['resume'], hint: 'Чем занимались, что умеете, чего ищете.' },
        { key: 'skills', label: 'Навыки', type: 'textarea', step: 2, deals: ['resume'] },
        { key: 'hasCar', label: 'Есть автомобиль', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'hasLicense', label: 'Водительские права', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select' },
        { key: 'relocation', label: 'Готов к переезду', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select' },

      // ── Оплата и место ──
        { key: 'price', label: 'Зарплата от', type: 'money', unit: '₽', required: true, step: 3, hint: 'В вакансии — что предлагаете, в резюме — что ожидаете.' },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 3 },
      ],
    },
    {
      id: 'childcare',
      title: 'Дети и детские услуги',
      listTitle: 'Дети и детские услуги',
      steps: ['Основное', 'Подробности', 'Оплата и город', 'Предпросмотр'],
      fields: [
      // ── Общее для вакансии и резюме ──
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит человек.' },
        { key: 'profession', label: 'Профессия', type: 'select', reference: 'professions', dependsOn: '@subcategory', required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'employment', label: 'Занятость', type: 'select', options: ['Полная', 'Частичная', 'Подработка', 'Вахта', 'Стажировка'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'format', label: 'Формат работы', type: 'select', options: ['На месте', 'Удалённо', 'Гибрид'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'experience', label: 'Опыт работы', type: 'select', options: ['Без опыта', 'До года', '1–3 года', '3–6 лет', 'Более 6 лет'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'schedule', label: 'График', type: 'select', options: ['5/2', '2/2', '6/1', 'Сменный', 'Свободный'], step: 2, filterable: true, filterKind: 'select', showInCard: true },

      // ── Только вакансия ──
        { key: 'company', label: 'Название компании', type: 'text', required: true, step: 2, deals: ['vacancy'], showInCard: true },
        { key: 'duties', label: 'Обязанности', type: 'textarea', required: true, step: 2, deals: ['vacancy'], hint: 'Что человек будет делать каждый день.' },
        { key: 'requirements', label: 'Требования', type: 'textarea', step: 2, deals: ['vacancy'] },
        { key: 'conditions', label: 'Условия', type: 'textarea', step: 2, deals: ['vacancy'], hint: 'Оформление, отпуск, что оплачивается.' },
        { key: 'registration', label: 'Оформление', type: 'select', options: ['По ТК РФ', 'Самозанятость', 'Договор ГПХ', 'Без оформления'], step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'payoutFrequency', label: 'Выплаты', type: 'select', options: ['Два раза в месяц', 'Раз в месяц', 'Еженедельно', 'Ежедневно'], step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'noExperienceOk', label: 'Можно без опыта', type: 'toggle', step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'forStudents', label: 'Подходит студентам', type: 'toggle', step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select' },

      // ── Только резюме ──
        { key: 'age', label: 'Возраст', type: 'number', unit: 'лет', step: 2, deals: ['resume'], hint: 'Необязательно. Требовать возраст в вакансиях запрещено законом.' },
        { key: 'education', label: 'Образование', type: 'select', options: ['Среднее', 'Среднее специальное', 'Незаконченное высшее', 'Высшее'], step: 2, deals: ['resume'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'lastPosition', label: 'Последнее место работы', type: 'text', step: 2, deals: ['resume'], showInCard: true },
        { key: 'about', label: 'О себе', type: 'textarea', required: true, step: 2, deals: ['resume'], hint: 'Чем занимались, что умеете, чего ищете.' },
        { key: 'skills', label: 'Навыки', type: 'textarea', step: 2, deals: ['resume'] },
        { key: 'hasCar', label: 'Есть автомобиль', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'hasLicense', label: 'Водительские права', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select' },
        { key: 'relocation', label: 'Готов к переезду', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select' },

      // ── Оплата и место ──
        { key: 'price', label: 'Зарплата от', type: 'money', unit: '₽', required: true, step: 3, hint: 'В вакансии — что предлагаете, в резюме — что ожидаете.' },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 3 },
      ],
    },
    {
      id: 'sport',
      title: 'Спорт и фитнес',
      listTitle: 'Спорт и фитнес',
      steps: ['Основное', 'Подробности', 'Оплата и город', 'Предпросмотр'],
      fields: [
      // ── Общее для вакансии и резюме ──
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит человек.' },
        { key: 'profession', label: 'Профессия', type: 'select', reference: 'professions', dependsOn: '@subcategory', required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'employment', label: 'Занятость', type: 'select', options: ['Полная', 'Частичная', 'Подработка', 'Вахта', 'Стажировка'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'format', label: 'Формат работы', type: 'select', options: ['На месте', 'Удалённо', 'Гибрид'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'experience', label: 'Опыт работы', type: 'select', options: ['Без опыта', 'До года', '1–3 года', '3–6 лет', 'Более 6 лет'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'schedule', label: 'График', type: 'select', options: ['5/2', '2/2', '6/1', 'Сменный', 'Свободный'], step: 2, filterable: true, filterKind: 'select', showInCard: true },

      // ── Только вакансия ──
        { key: 'company', label: 'Название компании', type: 'text', required: true, step: 2, deals: ['vacancy'], showInCard: true },
        { key: 'duties', label: 'Обязанности', type: 'textarea', required: true, step: 2, deals: ['vacancy'], hint: 'Что человек будет делать каждый день.' },
        { key: 'requirements', label: 'Требования', type: 'textarea', step: 2, deals: ['vacancy'] },
        { key: 'conditions', label: 'Условия', type: 'textarea', step: 2, deals: ['vacancy'], hint: 'Оформление, отпуск, что оплачивается.' },
        { key: 'registration', label: 'Оформление', type: 'select', options: ['По ТК РФ', 'Самозанятость', 'Договор ГПХ', 'Без оформления'], step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'payoutFrequency', label: 'Выплаты', type: 'select', options: ['Два раза в месяц', 'Раз в месяц', 'Еженедельно', 'Ежедневно'], step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'noExperienceOk', label: 'Можно без опыта', type: 'toggle', step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'forStudents', label: 'Подходит студентам', type: 'toggle', step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select' },

      // ── Только резюме ──
        { key: 'age', label: 'Возраст', type: 'number', unit: 'лет', step: 2, deals: ['resume'], hint: 'Необязательно. Требовать возраст в вакансиях запрещено законом.' },
        { key: 'education', label: 'Образование', type: 'select', options: ['Среднее', 'Среднее специальное', 'Незаконченное высшее', 'Высшее'], step: 2, deals: ['resume'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'lastPosition', label: 'Последнее место работы', type: 'text', step: 2, deals: ['resume'], showInCard: true },
        { key: 'about', label: 'О себе', type: 'textarea', required: true, step: 2, deals: ['resume'], hint: 'Чем занимались, что умеете, чего ищете.' },
        { key: 'skills', label: 'Навыки', type: 'textarea', step: 2, deals: ['resume'] },
        { key: 'hasCar', label: 'Есть автомобиль', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'hasLicense', label: 'Водительские права', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select' },
        { key: 'relocation', label: 'Готов к переезду', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select' },

      // ── Оплата и место ──
        { key: 'price', label: 'Зарплата от', type: 'money', unit: '₽', required: true, step: 3, hint: 'В вакансии — что предлагаете, в резюме — что ожидаете.' },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 3 },
      ],
    },
    {
      id: 'art',
      title: 'Искусство и творчество',
      listTitle: 'Искусство и творчество',
      steps: ['Основное', 'Подробности', 'Оплата и город', 'Предпросмотр'],
      fields: [
      // ── Общее для вакансии и резюме ──
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит человек.' },
        { key: 'profession', label: 'Профессия', type: 'select', reference: 'professions', dependsOn: '@subcategory', required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'employment', label: 'Занятость', type: 'select', options: ['Полная', 'Частичная', 'Подработка', 'Вахта', 'Стажировка'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'format', label: 'Формат работы', type: 'select', options: ['На месте', 'Удалённо', 'Гибрид'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'experience', label: 'Опыт работы', type: 'select', options: ['Без опыта', 'До года', '1–3 года', '3–6 лет', 'Более 6 лет'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'schedule', label: 'График', type: 'select', options: ['5/2', '2/2', '6/1', 'Сменный', 'Свободный'], step: 2, filterable: true, filterKind: 'select', showInCard: true },

      // ── Только вакансия ──
        { key: 'company', label: 'Название компании', type: 'text', required: true, step: 2, deals: ['vacancy'], showInCard: true },
        { key: 'duties', label: 'Обязанности', type: 'textarea', required: true, step: 2, deals: ['vacancy'], hint: 'Что человек будет делать каждый день.' },
        { key: 'requirements', label: 'Требования', type: 'textarea', step: 2, deals: ['vacancy'] },
        { key: 'conditions', label: 'Условия', type: 'textarea', step: 2, deals: ['vacancy'], hint: 'Оформление, отпуск, что оплачивается.' },
        { key: 'registration', label: 'Оформление', type: 'select', options: ['По ТК РФ', 'Самозанятость', 'Договор ГПХ', 'Без оформления'], step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'payoutFrequency', label: 'Выплаты', type: 'select', options: ['Два раза в месяц', 'Раз в месяц', 'Еженедельно', 'Ежедневно'], step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'noExperienceOk', label: 'Можно без опыта', type: 'toggle', step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'forStudents', label: 'Подходит студентам', type: 'toggle', step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select' },

      // ── Только резюме ──
        { key: 'age', label: 'Возраст', type: 'number', unit: 'лет', step: 2, deals: ['resume'], hint: 'Необязательно. Требовать возраст в вакансиях запрещено законом.' },
        { key: 'education', label: 'Образование', type: 'select', options: ['Среднее', 'Среднее специальное', 'Незаконченное высшее', 'Высшее'], step: 2, deals: ['resume'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'lastPosition', label: 'Последнее место работы', type: 'text', step: 2, deals: ['resume'], showInCard: true },
        { key: 'about', label: 'О себе', type: 'textarea', required: true, step: 2, deals: ['resume'], hint: 'Чем занимались, что умеете, чего ищете.' },
        { key: 'skills', label: 'Навыки', type: 'textarea', step: 2, deals: ['resume'] },
        { key: 'hasCar', label: 'Есть автомобиль', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'hasLicense', label: 'Водительские права', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select' },
        { key: 'relocation', label: 'Готов к переезду', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select' },

      // ── Оплата и место ──
        { key: 'price', label: 'Зарплата от', type: 'money', unit: '₽', required: true, step: 3, hint: 'В вакансии — что предлагаете, в резюме — что ожидаете.' },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 3 },
      ],
    },
    {
      id: 'science',
      title: 'Наука и инженерия',
      listTitle: 'Наука и инженерия',
      steps: ['Основное', 'Подробности', 'Оплата и город', 'Предпросмотр'],
      fields: [
      // ── Общее для вакансии и резюме ──
        { key: 'title', label: 'Название объявления', type: 'text', required: true, step: 1, hint: 'Коротко и по делу — это первое, что видит человек.' },
        { key: 'profession', label: 'Профессия', type: 'select', reference: 'professions', dependsOn: '@subcategory', required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'employment', label: 'Занятость', type: 'select', options: ['Полная', 'Частичная', 'Подработка', 'Вахта', 'Стажировка'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'format', label: 'Формат работы', type: 'select', options: ['На месте', 'Удалённо', 'Гибрид'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'experience', label: 'Опыт работы', type: 'select', options: ['Без опыта', 'До года', '1–3 года', '3–6 лет', 'Более 6 лет'], required: true, step: 1, filterable: true, filterKind: 'select', showInCard: true },
        { key: 'schedule', label: 'График', type: 'select', options: ['5/2', '2/2', '6/1', 'Сменный', 'Свободный'], step: 2, filterable: true, filterKind: 'select', showInCard: true },

      // ── Только вакансия ──
        { key: 'company', label: 'Название компании', type: 'text', required: true, step: 2, deals: ['vacancy'], showInCard: true },
        { key: 'duties', label: 'Обязанности', type: 'textarea', required: true, step: 2, deals: ['vacancy'], hint: 'Что человек будет делать каждый день.' },
        { key: 'requirements', label: 'Требования', type: 'textarea', step: 2, deals: ['vacancy'] },
        { key: 'conditions', label: 'Условия', type: 'textarea', step: 2, deals: ['vacancy'], hint: 'Оформление, отпуск, что оплачивается.' },
        { key: 'registration', label: 'Оформление', type: 'select', options: ['По ТК РФ', 'Самозанятость', 'Договор ГПХ', 'Без оформления'], step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'payoutFrequency', label: 'Выплаты', type: 'select', options: ['Два раза в месяц', 'Раз в месяц', 'Еженедельно', 'Ежедневно'], step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'noExperienceOk', label: 'Можно без опыта', type: 'toggle', step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'forStudents', label: 'Подходит студентам', type: 'toggle', step: 2, deals: ['vacancy'], filterable: true, filterKind: 'select' },

      // ── Только резюме ──
        { key: 'age', label: 'Возраст', type: 'number', unit: 'лет', step: 2, deals: ['resume'], hint: 'Необязательно. Требовать возраст в вакансиях запрещено законом.' },
        { key: 'education', label: 'Образование', type: 'select', options: ['Среднее', 'Среднее специальное', 'Незаконченное высшее', 'Высшее'], step: 2, deals: ['resume'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'lastPosition', label: 'Последнее место работы', type: 'text', step: 2, deals: ['resume'], showInCard: true },
        { key: 'about', label: 'О себе', type: 'textarea', required: true, step: 2, deals: ['resume'], hint: 'Чем занимались, что умеете, чего ищете.' },
        { key: 'skills', label: 'Навыки', type: 'textarea', step: 2, deals: ['resume'] },
        { key: 'hasCar', label: 'Есть автомобиль', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select', showInCard: true },
        { key: 'hasLicense', label: 'Водительские права', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select' },
        { key: 'relocation', label: 'Готов к переезду', type: 'toggle', step: 2, deals: ['resume'], filterable: true, filterKind: 'select' },

      // ── Оплата и место ──
        { key: 'price', label: 'Зарплата от', type: 'money', unit: '₽', required: true, step: 3, hint: 'В вакансии — что предлагаете, в резюме — что ожидаете.' },
        { key: 'city', label: 'Город', type: 'text', required: true, step: 3 },
      ],
    },
  ],
};
