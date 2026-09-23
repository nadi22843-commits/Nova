/**
 * Контракты категорий Nova.
 *
 * Главная идея: одно описание поля (FieldDef) управляет тремя экранами сразу —
 * формой публикации, фильтрами и карточкой объявления. Они физически не могут
 * разойтись, потому что берут данные из одного источника.
 */

/** Что пользователь хочет сделать внутри категории. */
export type IntentId = 'buy' | 'sell' | 'rent' | 'lease' | 'find-job' | 'find-employee' | 'post-vacancy' | 'post-resume' | 'buy-tours';

/**
 * Вид предложения. Отделён от намерения: «купить» и «продать» — разные
 * намерения пользователя, но одно и то же предложение. Объявление хранит
 * именно вид.
 *
 * vacancy и resume — та же механика для работы: работодатель размещает
 * вакансию, соискатель резюме, и это два разных вида в одной категории.
 *
 * service стоит отдельно: услугу не покупают и не арендуют, её заказывают.
 * Отсюда и разница в полях — цена «от», единица расчёта, выезд к заказчику.
 */
export type DealType = 'sale' | 'rent' | 'vacancy' | 'resume' | 'service';

export type Intent = {
  id: IntentId;
  title: string;
  subtitle: string;
  /** Ветка: смотреть объявления или подавать своё. */
  mode: 'browse' | 'publish';
  /**
   * Какие объявления показывает это намерение. Без него «Снять» открывало бы
   * список с объявлениями о продаже.
   */
  deal: DealType;
};

export type FieldType = 'text' | 'textarea' | 'number' | 'money' | 'select' | 'toggle';

export type FieldDef = {
  key: string;
  label: string;
  type: FieldType;
  /**
   * Варианты для select, заданные прямо здесь.
   * Годится для коротких неизменных списков: состояние, тип сделки.
   * Для длинных используйте reference.
   */
  options?: readonly string[];
  /**
   * Имя справочника вместо inline-вариантов: 'auto-brands', 'pet-breeds'.
   * Справочник грузится по требованию. Если он не загрузился, поле
   * превращается в обычный ввод текста — человек впишет значение руками.
   */
  reference?: string;
  /**
   * Ключ поля, от которого зависят варианты.
   * Модель зависит от марки: пока марка не выбрана, список моделей пуст.
   */
  dependsOn?: string;
  required?: boolean;
  unit?: string;
  hint?: string;
  /** Номер шага мастера публикации (начиная с 1). */
  step: number;
  /**
   * Виды предложения, в которых поле участвует. Без указания — во всех.
   *
   * Решает случай, когда одна подкатегория обслуживает разные сделки
   * с разными полями: у аренды квартиры есть залог и комиссия, у продажи
   * нет; у вакансии есть обязанности, у резюме — опыт работы.
   */
  deals?: readonly DealType[];
  /** Показывать ли это поле в фильтрах списка. */
  filterable?: boolean;
  /** Как фильтровать: диапазон «от–до» или выбор из списка. */
  filterKind?: 'range' | 'select';
  /** Показывать ли строкой в карточке объявления. */
  showInCard?: boolean;
};

export type Subcategory = {
  id: string;
  title: string;
  /**
   * Виды предложения, в которых подкатегория существует. Без указания —
   * во всех видах категории.
   *
   * Нужно там, где не всё продаётся и не всё сдаётся: тур можно купить,
   * но нельзя снять; жильё посуточно можно снять, но не купить.
   */
  deals?: readonly DealType[];
  /** Заголовок списка: «Земельные участки — продажа». */
  listTitle?: string;
  fields: readonly FieldDef[];
  /** Шаги мастера публикации по порядку. */
  steps: readonly string[];
};

export type CategoryModule = {
  id: string;
  title: string;
  /** Иконка из NovaIcon. */
  icon: string;
  /** Путь верхнего уровня: /realty, /auto, /work. */
  path: string;
  intents: readonly Intent[];
  subcategories: readonly Subcategory[];
  /**
   * Категория может отрисовывать себя сама вместо типовых шаблонов
   * (так подключён существующий модуль «Работа»).
   */
  customRoutes?: () => Promise<{ default: React.ComponentType }>;
};

/** Состояние категории в реестре. */
export type CategoryStatus = 'ok' | 'degraded' | 'failed';

export type RegisteredCategory = {
  module: CategoryModule;
  status: CategoryStatus;
  /** Подкатегории, отклонённые валидацией. Категория при этом живёт. */
  droppedSubcategories: string[];
  problems: string[];
};

/** Черновик публикации — хранится по ключу категория+подкатегория. */
export type DraftRecord = {
  categoryId: string;
  subcategoryId: string;
  step: number;
  values: Record<string, string>;
  updatedAt: number;
};
