import { getReference, entriesOf, referenceStatus } from './registry';
import type { FieldDef } from '../types';

/**
 * Варианты для поля: из справочника или из inline-списка.
 *
 * Ключевое правило автономности: если справочник не загрузился, функция
 * возвращает null. Экран в этом случае показывает обычный ввод текста —
 * человек впишет марку руками. Это лучше, чем пустой список, в котором
 * ничего нельзя выбрать.
 */

export type ResolvedOptions =
  | { kind: 'list'; values: string[] }
  /** Справочник недоступен — поле работает как ввод текста. */
  | { kind: 'free-text'; reason: 'failed' | 'loading' | 'no-parent' };

export function isReferenceField(field: FieldDef): boolean {
  return typeof field.reference === 'string' && field.reference.length > 0;
}

/**
 * Особое значение dependsOn: варианты сужаются не другим полем, а самой
 * подкатегорией. Так профессия зависит от направления: в «Транспорте»
 * предлагаются водитель и логист, а не парикмахер.
 */
export const SUBCATEGORY_SCOPE = '@subcategory';

export function resolveOptions(
  field: FieldDef,
  /** Значения формы — нужны для полей, зависящих от другого поля. */
  values: Record<string, string> = {},
  /** Идентификатор подкатегории — для полей с dependsOn: '@subcategory'. */
  subcategoryId?: string,
): ResolvedOptions {
  if (!isReferenceField(field)) {
    return { kind: 'list', values: [...(field.options ?? [])] };
  }

  const set = getReference(field.reference!);
  if (!set) {
    const status = referenceStatus(field.reference!);
    return { kind: 'free-text', reason: status === 'loading' ? 'loading' : 'failed' };
  }

  // Поле зависит от подкатегории: профессия от направления.
  if (field.dependsOn === SUBCATEGORY_SCOPE) {
    if (!subcategoryId) return { kind: 'free-text', reason: 'no-parent' };
    const scoped = entriesOf(set, subcategoryId);
    if (scoped.length === 0) return { kind: 'free-text', reason: 'no-parent' };
    return { kind: 'list', values: scoped.map((e) => e.name) };
  }

  // Поле зависит от другого: модель от марки, порода от вида.
  if (field.dependsOn) {
    const parentValue = values[field.dependsOn];
    if (!parentValue) return { kind: 'free-text', reason: 'no-parent' };

    const parent = set.entries.find((e) => !e.parentId && e.name === parentValue);
    if (!parent) return { kind: 'free-text', reason: 'no-parent' };

    return { kind: 'list', values: entriesOf(set, parent.id).map((e) => e.name) };
  }

  return { kind: 'list', values: entriesOf(set, null).map((e) => e.name) };
}
