/**
 * Отклики и приглашения «Работы».
 *
 * Отклик — соискатель откликается на вакансию.
 * Приглашение — работодатель зовёт кандидата на собеседование по резюме.
 *
 * Хранилище автономное (localStorage), формат близок к будущей серверной
 * таблице. Файл без React — логика проверяется обычными тестами.
 */

export type WorkActionKind = 'response' | 'invite';

export type WorkActionRecord = {
  id: string;
  kind: WorkActionKind;
  itemId: string;
  categoryId: string;
  title: string;
  createdAt: string;
  status: 'sent';
};

type StorageLike = { getItem(key: string): string | null; setItem(key: string, value: string): void };

export const WORK_ACTIONS_KEY = 'nova.work.actions.v1';
export const WORK_ACTIONS_EVENT = 'nova:work-actions';

const memory = new Map<string, string>();
const memoryStorage: StorageLike = {
  getItem: (k) => memory.get(k) ?? null,
  setItem: (k, v) => void memory.set(k, v),
};

let override: StorageLike | null = null;

/** Только для тестов: подменить хранилище. */
export function setWorkActionsStorage(next: StorageLike | null): void {
  override = next;
}

function storage(): StorageLike {
  if (override) return override;
  try {
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  } catch {
    /* хранилище запрещено — работаем в памяти */
  }
  return memoryStorage;
}

function isRecord(x: unknown): x is WorkActionRecord {
  const r = x as WorkActionRecord;
  return Boolean(r) && typeof r.id === 'string' && (r.kind === 'response' || r.kind === 'invite') && typeof r.itemId === 'string';
}

export function readWorkActions(): WorkActionRecord[] {
  try {
    const parsed = JSON.parse(storage().getItem(WORK_ACTIONS_KEY) || '[]');
    // Повреждённые записи отбрасываем, а не роняем экран.
    return Array.isArray(parsed) ? parsed.filter(isRecord) : [];
  } catch {
    return [];
  }
}

function write(items: WorkActionRecord[]): void {
  try {
    storage().setItem(WORK_ACTIONS_KEY, JSON.stringify(items));
  } catch {
    /* переполнение — действие останется до перезагрузки */
  }
  try {
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new Event(WORK_ACTIONS_EVENT));
    }
  } catch {
    /* событие не критично */
  }
}

export function findWorkAction(kind: WorkActionKind, itemId: string): WorkActionRecord | undefined {
  return readWorkActions().find((r) => r.kind === kind && r.itemId === itemId);
}

/**
 * Добавляет отклик/приглашение. Повторное нажатие не создаёт дубликат.
 * created — true, если запись новая.
 */
export function addWorkAction(
  kind: WorkActionKind,
  item: { id: string; categoryId: string; title: string },
): { record: WorkActionRecord; created: boolean } {
  const existing = findWorkAction(kind, item.id);
  if (existing) return { record: existing, created: false };
  const record: WorkActionRecord = {
    id: `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    kind,
    itemId: item.id,
    categoryId: item.categoryId,
    title: item.title,
    createdAt: new Date().toISOString(),
    status: 'sent',
  };
  write([record, ...readWorkActions()].slice(0, 500));
  return { record, created: true };
}

/** Отмена отклика или приглашения. */
export function removeWorkAction(kind: WorkActionKind, itemId: string): boolean {
  const all = readWorkActions();
  const next = all.filter((r) => !(r.kind === kind && r.itemId === itemId));
  if (next.length === all.length) return false;
  write(next);
  return true;
}
