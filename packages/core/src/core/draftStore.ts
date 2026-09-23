import type { DraftRecord } from './types';
import { storage } from './storage';

/**
 * Черновики форм публикации.
 *
 * На телефоне форма из 6 шагов без сохранения — гарантированная потеря данных:
 * входящий звонок, свернул приложение, случайный «назад».
 *
 * Черновик изолирован по ключу «категория:подкатегория», поэтому мусор в одном
 * черновике не мешает другим.
 */

const PREFIX = 'nova.draft.';

function key(categoryId: string, subcategoryId: string) {
  return `${PREFIX}${categoryId}:${subcategoryId}`;
}

export function loadDraft(categoryId: string, subcategoryId: string): DraftRecord | null {
  try {
    const raw = storage.get(key(categoryId, subcategoryId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DraftRecord;
    if (!parsed || typeof parsed !== 'object' || typeof parsed.values !== 'object') return null;
    return parsed;
  } catch {
    // Повреждённый черновик не должен ронять экран — просто начинаем с чистого.
    clearDraft(categoryId, subcategoryId);
    return null;
  }
}

export function saveDraft(record: DraftRecord): void {
  storage.set(
    key(record.categoryId, record.subcategoryId),
    JSON.stringify({ ...record, updatedAt: Date.now() }),
  );
}

export function clearDraft(categoryId: string, subcategoryId: string): void {
  storage.remove(key(categoryId, subcategoryId));
}
