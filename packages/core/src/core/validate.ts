import type { CategoryModule, FieldDef, Subcategory } from './types';

/**
 * Проверка конфигурации на этапе регистрации.
 *
 * Правило автономности: битая подкатегория отбрасывается по одной, а не роняет
 * категорию. Битая категория отбрасывается целиком, а не роняет приложение.
 */

export type ValidationResult = {
  /** Категория с вычищенными подкатегориями. null — категория непригодна. */
  module: CategoryModule | null;
  droppedSubcategories: string[];
  problems: string[];
};

const FIELD_TYPES = ['text', 'textarea', 'number', 'money', 'select', 'toggle'];

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function validateField(field: unknown, path: string, problems: string[]): field is FieldDef {
  if (!field || typeof field !== 'object') {
    problems.push(`${path}: поле не является объектом`);
    return false;
  }
  const f = field as Partial<FieldDef>;
  if (!isNonEmptyString(f.key)) {
    problems.push(`${path}: отсутствует key`);
    return false;
  }
  if (!isNonEmptyString(f.label)) {
    problems.push(`${path}.${f.key}: отсутствует label`);
    return false;
  }
  if (!f.type || !FIELD_TYPES.includes(f.type)) {
    problems.push(`${path}.${f.key}: неизвестный тип «${String(f.type)}»`);
    return false;
  }
  // select обязан знать, откуда брать варианты: либо inline-список,
  // либо справочник. Пустой и то и другое — поле бесполезно.
  if (f.type === 'select') {
    const hasInline = Array.isArray(f.options) && f.options.length > 0;
    const hasReference = typeof f.reference === 'string' && f.reference.trim().length > 0;
    if (!hasInline && !hasReference) {
      problems.push(`${path}.${f.key}: select без options и без reference`);
      return false;
    }
  }
  if (typeof f.step !== 'number' || f.step < 1) {
    problems.push(`${path}.${f.key}: некорректный номер шага`);
    return false;
  }
  return true;
}

function validateSubcategory(sub: unknown, categoryId: string, problems: string[]): Subcategory | null {
  if (!sub || typeof sub !== 'object') {
    problems.push(`${categoryId}: подкатегория не является объектом`);
    return null;
  }
  const s = sub as Partial<Subcategory>;
  if (!isNonEmptyString(s.id) || !isNonEmptyString(s.title)) {
    problems.push(`${categoryId}: у подкатегории нет id или title`);
    return null;
  }
  const label = `${categoryId}/${s.id}`;

  if (!Array.isArray(s.steps) || s.steps.length === 0) {
    problems.push(`${label}: не описаны шаги публикации`);
    return null;
  }
  if (!Array.isArray(s.fields)) {
    problems.push(`${label}: не описаны поля`);
    return null;
  }

  const fields = s.fields.filter((f) => validateField(f, label, problems)) as FieldDef[];
  if (fields.length === 0) {
    problems.push(`${label}: не осталось валидных полей`);
    return null;
  }

  // Ключи полей должны быть уникальны в пределах одного вида сделки.
  //
  // Один ключ в разных видах — это нормально и нужно: у продажи поле
  // «Цена», у аренды «Цена за месяц», и это одно и то же поле price
  // с разными подписями. Форма показывает только одно из них, потому что
  // виды не пересекаются.
  //
  // А вот два поля с одним ключом в одном виде — ошибка: форма перезапишет
  // сама себя.
  function dealsOf(f: FieldDef): string[] {
    return f.deals && f.deals.length > 0 ? [...f.deals] : ['*'];
  }

  const claimed = new Map<string, Set<string>>();
  const unique: FieldDef[] = [];

  for (const f of fields) {
    const taken = claimed.get(f.key);
    const mine = dealsOf(f);

    // Пересечение считаем с учётом «*» — поля, действующего во всех видах.
    const conflict =
      taken !== undefined &&
      (taken.has('*') || mine.includes('*') || mine.some((d) => taken.has(d)));

    if (conflict) {
      problems.push(`${label}: поле «${f.key}» дублируется в одном виде сделки, пропущено`);
      continue;
    }

    claimed.set(f.key, new Set([...(taken ?? []), ...mine]));
    unique.push(f);
  }

  // Шаг не должен выходить за пределы объявленных шагов.
  const maxStep = s.steps.length;
  const inRange = unique.filter((f) => {
    if (f.step > maxStep) {
      problems.push(`${label}.${f.key}: шаг ${f.step} за пределами (${maxStep})`);
      return false;
    }
    return true;
  });
  if (inRange.length === 0) {
    problems.push(`${label}: после проверки шагов не осталось полей`);
    return null;
  }

  return {
    id: s.id,
    title: s.title,
    listTitle: s.listTitle,
    deals: s.deals,
    fields: inRange,
    steps: s.steps,
  };
}

export function validateCategory(input: unknown): ValidationResult {
  const problems: string[] = [];
  const dropped: string[] = [];

  if (!input || typeof input !== 'object') {
    return { module: null, droppedSubcategories: [], problems: ['категория не является объектом'] };
  }
  const m = input as Partial<CategoryModule>;

  if (!isNonEmptyString(m.id)) {
    return { module: null, droppedSubcategories: [], problems: ['у категории нет id'] };
  }
  if (!isNonEmptyString(m.title) || !isNonEmptyString(m.path)) {
    return { module: null, droppedSubcategories: [], problems: [`${m.id}: нет title или path`] };
  }
  if (!m.path.startsWith('/')) {
    return { module: null, droppedSubcategories: [], problems: [`${m.id}: path должен начинаться с «/»`] };
  }

  // Категория со своим роутингом (например «Работа») не обязана описывать поля.
  if (m.customRoutes) {
    return {
      module: {
        id: m.id,
        title: m.title,
        icon: m.icon ?? 'more',
        path: m.path,
        intents: Array.isArray(m.intents) ? m.intents : [],
        subcategories: [],
        customRoutes: m.customRoutes,
      },
      droppedSubcategories: [],
      problems,
    };
  }

  if (!Array.isArray(m.intents) || m.intents.length === 0) {
    return { module: null, droppedSubcategories: [], problems: [`${m.id}: не описаны действия пользователя`] };
  }
  if (!Array.isArray(m.subcategories)) {
    return { module: null, droppedSubcategories: [], problems: [`${m.id}: не описаны подкатегории`] };
  }

  const valid: Subcategory[] = [];
  const seenIds = new Set<string>();

  for (const raw of m.subcategories) {
    const before = problems.length;
    const checked = validateSubcategory(raw, m.id, problems);
    if (!checked) {
      const id = (raw as Partial<Subcategory>)?.id ?? '(без id)';
      dropped.push(String(id));
      continue;
    }
    if (seenIds.has(checked.id)) {
      problems.push(`${m.id}: дублирующаяся подкатегория «${checked.id}» пропущена`);
      dropped.push(checked.id);
      continue;
    }
    seenIds.add(checked.id);
    valid.push(checked);
    if (problems.length > before) {
      // Подкатегория выжила, но с замечаниями — это нормально.
    }
  }

  if (valid.length === 0) {
    return {
      module: null,
      droppedSubcategories: dropped,
      problems: [...problems, `${m.id}: не осталось ни одной рабочей подкатегории`],
    };
  }

  return {
    module: {
      id: m.id,
      title: m.title,
      icon: m.icon ?? 'more',
      path: m.path,
      intents: m.intents,
      subcategories: valid,
    },
    droppedSubcategories: dropped,
    problems,
  };
}
