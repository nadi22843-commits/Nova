import { validatePlaceTree } from './validate';
import type { Place, PlaceTree } from './types';

/**
 * Реестр справочников мест.
 *
 * Справочник каждой страны — отдельный чанк, который грузится только когда
 * пользователь эту страну выбрал. Полный справочник мира — сотни тысяч
 * записей, в бандл он не помещается ни при каком раскладе.
 *
 * Ленивая загрузка заодно даёт автономность: сломанное или недогрузившееся
 * дерево Германии не мешает Франции. Страна без справочника не исчезает —
 * она переходит в режим «только вся страна»: искать по ней можно, выбрать
 * город внутри нельзя.
 */

type LoaderResult = { default: unknown };
type Loader = () => Promise<LoaderResult>;

/** Регистрация загрузчиков. Ключ — код страны. */
const loaders = new Map<string, Loader>();

/** Загруженные и проверенные деревья. */
const trees = new Map<string, PlaceTree>();

/** Страны, для которых загрузка не удалась. Повторно не пытаемся. */
const failed = new Map<string, string>();

/** Незавершённые загрузки — чтобы два экрана не грузили одно дважды. */
const inFlight = new Map<string, Promise<PlaceTree | null>>();

export function registerPlaceLoader(countryCode: string, loader: Loader): void {
  loaders.set(countryCode.toUpperCase(), loader);
}

/** Есть ли для страны детализация мест. */
export function hasPlaceData(countryCode: string): boolean {
  return loaders.has(countryCode.toUpperCase());
}

/**
 * Загрузка дерева страны.
 * Возвращает null, если справочника нет или он не прошёл проверку — вызывающий
 * код в этом случае работает в режиме «вся страна».
 */
export async function loadPlaceTree(countryCode: string): Promise<PlaceTree | null> {
  const code = countryCode.toUpperCase();

  const cached = trees.get(code);
  if (cached) return cached;
  if (failed.has(code)) return null;

  const pending = inFlight.get(code);
  if (pending) return pending;

  const loader = loaders.get(code);
  if (!loader) return null;

  const promise = (async () => {
    try {
      const module = await loader();
      const { tree, dropped, problems } = validatePlaceTree(module.default, code);

      if (!tree) {
        failed.set(code, problems.join('; '));
        console.error(`[Nova/places] справочник «${code}» отклонён:`, problems);
        return null;
      }

      if (dropped.length > 0) {
        console.warn(`[Nova/places] «${code}»: отброшено мест — ${dropped.length}`, dropped.slice(0, 10));
      }

      trees.set(code, tree);
      return tree;
    } catch (error) {
      // Чанк не загрузился — сеть, сборка, что угодно. Страна остаётся
      // работоспособной без детализации.
      failed.set(code, String(error));
      console.error(`[Nova/places] не удалось загрузить справочник «${code}»`, error);
      return null;
    } finally {
      inFlight.delete(code);
    }
  })();

  inFlight.set(code, promise);
  return promise;
}

export function getLoadedTree(countryCode: string): PlaceTree | undefined {
  return trees.get(countryCode.toUpperCase());
}

export function findPlace(countryCode: string, placeId: string): Place | undefined {
  return getLoadedTree(countryCode)?.places.find((p) => p.id === placeId);
}

/** Прямые потомки места. parentId = null — верхний уровень страны. */
export function childrenOf(tree: PlaceTree, parentId: string | null): Place[] {
  return tree.places.filter((p) => p.parentId === parentId);
}

/**
 * Проверка вложенности: находится ли место внутри выбранного.
 *
 * Работает за одно сравнение благодаря заранее посчитанному пути предков.
 * Выбрана область — находятся все её города и районы автоматически.
 */
export function isWithin(place: Place, selectedId: string): boolean {
  return place.id === selectedId || place.path.includes(selectedId);
}

/** Цепочка от верхнего уровня до места — для хлебных крошек и адреса. */
export function ancestorsOf(tree: PlaceTree, placeId: string): Place[] {
  const place = tree.places.find((p) => p.id === placeId);
  if (!place) return [];
  return place.path
    .map((id) => tree.places.find((p) => p.id === id))
    .filter((p): p is Place => Boolean(p));
}

/**
 * Подпись уровня на нужном языке.
 * «Регион» для России, «State» для США, «Emirate» для ОАЭ — это данные
 * страны, а не константы в коде.
 */
export function levelLabel(tree: PlaceTree, depth: number, language: string): string {
  const labels = tree.levelLabels[language] ?? tree.levelLabels[Object.keys(tree.levelLabels)[0]] ?? [];
  return labels[depth - 1] ?? '';
}

export function getPlacesHealth() {
  return {
    registered: [...loaders.keys()],
    loaded: [...trees.keys()].map((code) => ({ code, places: trees.get(code)!.places.length })),
    failed: [...failed.entries()].map(([code, reason]) => ({ code, reason })),
  };
}

/** Только для тестов. */
export function resetPlaces(): void {
  trees.clear();
  failed.clear();
  inFlight.clear();
}
