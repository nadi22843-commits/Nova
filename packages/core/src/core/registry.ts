import { validateCategory } from './validate';
import type { CategoryModule, RegisteredCategory, Subcategory } from './types';

/**
 * Реестр категорий.
 *
 * Категории регистрируются данными, а не ветвлениями в коде. Ошибка при
 * регистрации одной категории не мешает зарегистрироваться остальным.
 */

const registry = new Map<string, RegisteredCategory>();
const failed: { id: string; problems: string[] }[] = [];

export function registerCategory(input: unknown): void {
  let id = 'unknown';
  try {
    id = (input as Partial<CategoryModule>)?.id ?? 'unknown';
    const { module, droppedSubcategories, problems } = validateCategory(input);

    if (!module) {
      failed.push({ id, problems });
      console.error(`[Nova/categories] «${id}» не зарегистрирована:`, problems);
      return;
    }

    if (registry.has(module.id)) {
      console.warn(`[Nova/categories] «${module.id}» уже зарегистрирована, повтор пропущен`);
      return;
    }

    const status = droppedSubcategories.length > 0 ? 'degraded' : 'ok';
    registry.set(module.id, { module, status, droppedSubcategories, problems });

    if (status === 'degraded') {
      console.warn(
        `[Nova/categories] «${module.id}» работает частично. Отключены подкатегории:`,
        droppedSubcategories,
      );
    }
  } catch (error) {
    // Модуль упал прямо в момент регистрации — приложение продолжает работу.
    failed.push({ id, problems: [String(error)] });
    console.error(`[Nova/categories] сбой при регистрации «${id}»`, error);
  }
}

export function getCategories(): CategoryModule[] {
  return [...registry.values()].map((r) => r.module);
}

export function getCategory(id: string): CategoryModule | undefined {
  return registry.get(id)?.module;
}

export function getCategoryByPath(path: string): CategoryModule | undefined {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return [...registry.values()].find((r) => r.module.path === normalized)?.module;
}

export function getSubcategory(categoryId: string, subId: string): Subcategory | undefined {
  return registry.get(categoryId)?.module.subcategories.find((s) => s.id === subId);
}

/** Диагностика: что зарегистрировано, что деградировало, что не поднялось. */
export function getRegistryHealth() {
  return {
    ok: [...registry.values()].filter((r) => r.status === 'ok').map((r) => r.module.id),
    degraded: [...registry.values()]
      .filter((r) => r.status === 'degraded')
      .map((r) => ({ id: r.module.id, dropped: r.droppedSubcategories })),
    failed: failed.map((f) => ({ id: f.id, problems: f.problems })),
  };
}

/** Только для тестов. */
export function resetRegistry(): void {
  registry.clear();
  failed.length = 0;
}
