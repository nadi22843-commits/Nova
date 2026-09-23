import type { ReferenceEntry, ReferenceSet, ReferenceStatus } from './types';
import { normalizeDeep } from '../places/search';
import { isValidId } from './translit';

/**
 * Реестр справочников.
 *
 * Тот же принцип, что у категорий, стран и мест: битая запись отбрасывается
 * по одной, сломанный справочник не роняет форму — поле просто становится
 * вводом текста.
 */

type Loader = () => Promise<{ default: unknown }>;

const loaders = new Map<string, Loader>();
const sets = new Map<string, ReferenceSet>();
const failed = new Map<string, string>();
const inFlight = new Map<string, Promise<ReferenceSet | null>>();

export function registerReference(id: string, loader: Loader): void {
  loaders.set(id, loader);
}

export function hasReference(id: string): boolean {
  return loaders.has(id);
}

function validate(input: unknown, expectedId: string): { set: ReferenceSet | null; dropped: string[]; problems: string[] } {
  const problems: string[] = [];
  const dropped: string[] = [];

  if (!input || typeof input !== 'object') {
    return { set: null, dropped, problems: [`${expectedId}: справочник не является объектом`] };
  }
  const r = input as Partial<ReferenceSet>;

  if (r.id !== expectedId) {
    return { set: null, dropped, problems: [`${expectedId}: справочник объявляет другое имя «${r.id}»`] };
  }
  if (!Array.isArray(r.entries)) {
    return { set: null, dropped, problems: [`${expectedId}: entries не массив`] };
  }

  const byId = new Map<string, ReferenceEntry>();
  for (const raw of r.entries) {
    try {
      const e = raw as Partial<ReferenceEntry>;
      if (typeof e.id !== 'string' || !e.id.trim()) {
        problems.push(`${expectedId}: запись без id`);
        continue;
      }
      // Идентификатор ездит в базу, API и ссылки — только латиница, цифры
      // и дефис. Кириллица в URL кодируется в нечитаемую последовательность.
      if (!isValidId(e.id)) {
        problems.push(`${e.id}: идентификатор должен быть латиницей`);
        dropped.push(e.id);
        continue;
      }
      if (typeof e.name !== 'string' || !e.name.trim()) {
        problems.push(`${e.id}: нет названия`);
        dropped.push(e.id);
        continue;
      }
      if (byId.has(e.id)) {
        problems.push(`${e.id}: дубликат пропущен`);
        dropped.push(e.id);
        continue;
      }
      byId.set(e.id, {
        id: e.id,
        name: e.name,
        parentId: typeof e.parentId === 'string' ? e.parentId : undefined,
        names: e.names,
        aliases: e.aliases,
        popular: e.popular === true,
      });
    } catch (error) {
      problems.push(`${expectedId}: сбой при чтении записи — ${String(error)}`);
    }
  }

  // Запись с несуществующим родителем отбрасывается: иначе в форме появится
  // модель без марки, которую нельзя ни выбрать, ни показать.
  const resolved: ReferenceEntry[] = [];
  for (const entry of byId.values()) {
    if (entry.parentId && !byId.has(entry.parentId)) {
      problems.push(`${entry.id}: родитель «${entry.parentId}» отсутствует`);
      dropped.push(entry.id);
      continue;
    }
    resolved.push(entry);
  }

  if (resolved.length === 0) {
    return { set: null, dropped, problems: [...problems, `${expectedId}: не осталось ни одной записи`] };
  }

  return {
    set: { id: expectedId, depth: typeof r.depth === 'number' && r.depth > 0 ? r.depth : 1, entries: resolved },
    dropped,
    problems,
  };
}

export async function loadReference(id: string): Promise<ReferenceSet | null> {
  const cached = sets.get(id);
  if (cached) return cached;
  if (failed.has(id)) return null;

  const pending = inFlight.get(id);
  if (pending) return pending;

  const loader = loaders.get(id);
  if (!loader) return null;

  const promise = (async () => {
    try {
      const module = await loader();
      const { set, dropped, problems } = validate(module.default, id);

      if (!set) {
        failed.set(id, problems.join('; '));
        console.error(`[Nova/references] справочник «${id}» отклонён:`, problems);
        return null;
      }
      if (dropped.length > 0) {
        console.warn(`[Nova/references] «${id}»: отброшено записей — ${dropped.length}`, dropped.slice(0, 10));
      }

      sets.set(id, set);
      return set;
    } catch (error) {
      failed.set(id, String(error));
      console.error(`[Nova/references] не удалось загрузить «${id}»`, error);
      return null;
    } finally {
      inFlight.delete(id);
    }
  })();

  inFlight.set(id, promise);
  return promise;
}

export function getReference(id: string): ReferenceSet | undefined {
  return sets.get(id);
}

export function referenceStatus(id: string): ReferenceStatus {
  if (sets.has(id)) return 'ok';
  if (failed.has(id)) return 'failed';
  if (inFlight.has(id)) return 'loading';
  return loaders.has(id) ? 'absent' : 'absent';
}

/**
 * Записи нужного уровня.
 * parentId = null — верхний уровень (марки), иначе потомки (модели марки).
 */
export function entriesOf(set: ReferenceSet, parentId: string | null): ReferenceEntry[] {
  const list = set.entries.filter((e) => (parentId ? e.parentId === parentId : !e.parentId));
  // Популярные первыми, остальные по алфавиту: так человек чаще находит
  // свою марку не листая весь список.
  return list.sort((a, b) => {
    if (a.popular !== b.popular) return a.popular ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

/** Поиск внутри уровня. Совпадение по началу важнее вхождения в середину. */
export function searchEntries(entries: ReferenceEntry[], query: string): ReferenceEntry[] {
  const q = normalizeDeep(query);
  if (!q) return entries;

  const scored: { entry: ReferenceEntry; score: number }[] = [];
  for (const entry of entries) {
    const names = [entry.name, ...(entry.aliases ?? []), ...Object.values(entry.names ?? {})];
    let best = 0;
    for (const n of names) {
      const norm = normalizeDeep(n);
      if (norm === q) best = Math.max(best, 100);
      else if (norm.startsWith(q)) best = Math.max(best, 70);
      else if (norm.includes(q)) best = Math.max(best, 40);
    }
    if (best > 0) scored.push({ entry, score: best });
  }

  return scored.sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name)).map((x) => x.entry);
}

export function getReferencesHealth() {
  return {
    registered: [...loaders.keys()],
    loaded: [...sets.entries()].map(([id, set]) => ({ id, entries: set.entries.length })),
    failed: [...failed.entries()].map(([id, reason]) => ({ id, reason })),
  };
}

/** Только для тестов. */
export function resetReferences(): void {
  sets.clear();
  failed.clear();
  inFlight.clear();
}
