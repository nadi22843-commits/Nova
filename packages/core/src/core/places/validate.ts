import type { Place, PlaceKind, PlaceTree } from './types';
import { isValidCoord } from './geo';

/**
 * Проверка справочника мест.
 *
 * Тот же принцип автономности: битое место отбрасывается по одному, дерево
 * страны выживает. Если у страны не осталось ни одного места, она работает
 * в режиме «только вся страна» — поиск по ней возможен, детализации нет.
 *
 * Отдельно важно: место с битым родителем отбрасывается вместе со всем
 * поддеревом. Иначе в интерфейсе появится район без города — выбрать его
 * можно, а показать путь до него нельзя.
 */

const KINDS: PlaceKind[] = ['country', 'admin1', 'admin2', 'city', 'district'];

export type PlaceValidation = {
  tree: PlaceTree | null;
  dropped: string[];
  problems: string[];
};

function isNonEmpty(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

export function validatePlaceTree(input: unknown, expectedCountry: string): PlaceValidation {
  const problems: string[] = [];
  const dropped: string[] = [];

  if (!input || typeof input !== 'object') {
    return { tree: null, dropped, problems: [`${expectedCountry}: справочник не является объектом`] };
  }
  const t = input as Partial<PlaceTree>;

  if (t.countryCode !== expectedCountry) {
    return { tree: null, dropped, problems: [`${expectedCountry}: справочник объявляет другую страну «${t.countryCode}»`] };
  }
  if (!t.levelLabels || typeof t.levelLabels !== 'object' || Object.keys(t.levelLabels).length === 0) {
    return { tree: null, dropped, problems: [`${expectedCountry}: не заданы подписи уровней`] };
  }
  if (!Array.isArray(t.places)) {
    return { tree: null, dropped, problems: [`${expectedCountry}: places не массив`] };
  }

  // Первый проход: отсеиваем формально негодные записи.
  const byId = new Map<string, Place>();
  for (const raw of t.places) {
    try {
      const p = raw as Partial<Place>;
      if (!isNonEmpty(p.id)) {
        problems.push(`${expectedCountry}: место без id`);
        continue;
      }
      if (!isNonEmpty(p.name)) {
        problems.push(`${p.id}: нет названия`);
        dropped.push(p.id);
        continue;
      }
      if (!p.kind || !KINDS.includes(p.kind)) {
        problems.push(`${p.id}: неизвестный тип «${String(p.kind)}»`);
        dropped.push(p.id);
        continue;
      }
      if (typeof p.depth !== 'number' || p.depth < 0) {
        problems.push(`${p.id}: некорректная глубина`);
        dropped.push(p.id);
        continue;
      }
      if (byId.has(p.id)) {
        problems.push(`${p.id}: дубликат пропущен`);
        dropped.push(p.id);
        continue;
      }

      // Координаты необязательны, но если они есть — обязаны быть настоящими.
      // Битые координаты просто убираем: место останется, радиус по нему
      // работать не будет.
      const lat = isValidCoord(p.lat, p.lon) ? p.lat : undefined;
      const lon = isValidCoord(p.lat, p.lon) ? p.lon : undefined;
      if (p.lat !== undefined && lat === undefined) {
        problems.push(`${p.id}: координаты отброшены как недостоверные`);
      }

      byId.set(p.id, {
        id: p.id,
        countryCode: expectedCountry,
        parentId: isNonEmpty(p.parentId) ? p.parentId : null,
        kind: p.kind,
        depth: p.depth,
        name: p.name,
        names: p.names,
        aliases: p.aliases,
        lat,
        lon,
        path: [],
      });
    } catch (error) {
      problems.push(`${expectedCountry}: сбой при чтении места — ${String(error)}`);
    }
  }

  // Второй проход: строим пути предков и отбрасываем сирот вместе с поддеревом.
  const resolved = new Map<string, Place>();
  const orphans = new Set<string>();

  function resolvePath(place: Place, seen: Set<string>): string[] | null {
    if (!place.parentId) return [];
    if (seen.has(place.id)) {
      problems.push(`${place.id}: цикл в иерархии`);
      return null;
    }
    const parent = byId.get(place.parentId);
    if (!parent) {
      problems.push(`${place.id}: родитель «${place.parentId}» отсутствует`);
      return null;
    }
    seen.add(place.id);
    const parentPath = resolvePath(parent, seen);
    if (parentPath === null) return null;
    return [...parentPath, parent.id];
  }

  for (const place of byId.values()) {
    const path = resolvePath(place, new Set());
    if (path === null) {
      orphans.add(place.id);
      dropped.push(place.id);
      continue;
    }
    resolved.set(place.id, { ...place, path });
  }

  if (resolved.size === 0) {
    return {
      tree: null,
      dropped,
      problems: [...problems, `${expectedCountry}: не осталось ни одного места`],
    };
  }

  const maxDepth = Math.max(...[...resolved.values()].map((p) => p.depth));
  const declaredDepth = typeof t.depth === 'number' && t.depth > 0 ? t.depth : maxDepth + 1;

  return {
    tree: {
      countryCode: expectedCountry,
      depth: Math.max(declaredDepth, maxDepth + 1),
      levelLabels: t.levelLabels,
      places: [...resolved.values()],
    },
    dropped,
    problems,
  };
}
