import type { Place } from './types';

/**
 * Поиск мест.
 *
 * Человек вводит название так, как привык: «Мюнхен», «Munich», «munchen»,
 * «München». Все четыре должны находить один город. Поэтому сравниваем не
 * строки, а нормализованные формы, и ищем сразу по всем известным написаниям.
 */

/**
 * Нормализация под сравнение.
 *
 * NFD раскладывает букву с диакритикой на базовую букву и знак, после чего
 * знаки убираются: München → munchen, Łódź → łodz, Ярославль остаётся собой.
 * Это покрывает латиницу с диакритикой, которая есть почти во всех
 * европейских языках, и не портит кириллицу, арабицу и иероглифы.
 */
export function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[ʼ'`’]/g, '')
    .replace(/[-–—_.,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Отдельные пары букв, которые NFD не разбирает, но люди пишут по-разному.
 * Немецкое ß ↔ ss, скандинавские ø ↔ o, æ ↔ ae, польское ł ↔ l.
 */
const LETTER_EQUIVALENTS: [RegExp, string][] = [
  [/ß/g, 'ss'],
  [/ø/g, 'o'],
  [/æ/g, 'ae'],
  [/œ/g, 'oe'],
  [/ł/g, 'l'],
  [/đ/g, 'd'],
  [/ħ/g, 'h'],
  [/ı/g, 'i'],
];

export function normalizeDeep(value: string): string {
  let out = normalize(value);
  for (const [from, to] of LETTER_EQUIVALENTS) out = out.replace(from, to);
  return out;
}

/** Все написания места: основное, переводы, псевдонимы. */
export function allNames(place: Place): string[] {
  const names = [place.name];
  if (place.names) names.push(...Object.values(place.names));
  if (place.aliases) names.push(...place.aliases);
  return names;
}

/** Название для показа: на языке пользователя, иначе на языке страны. */
export function displayName(place: Place, language: string): string {
  return place.names?.[language] ?? place.name;
}

/**
 * Название с оригиналом в скобках: «Мюнхен (München)».
 *
 * Нужно там, где название используется как адрес: человек поедет по нему
 * и будет искать его на указателях в исходном написании.
 */
export function displayNameWithOriginal(place: Place, language: string): string {
  const local = place.names?.[language];
  if (!local || local === place.name) return place.name;
  return `${local} (${place.name})`;
}

export type PlaceMatch = { place: Place; score: number };

/**
 * Поиск с ранжированием.
 *
 * Точное совпадение важнее начала строки, начало важнее вхождения в середину.
 * Без этого «Москва» может уступить «Московской области» просто потому,
 * что та стоит раньше в массиве.
 */
export function searchPlaces(places: Place[], query: string, limit = 50): Place[] {
  const q = normalizeDeep(query);
  if (!q) return places.slice(0, limit);

  const matches: PlaceMatch[] = [];

  for (const place of places) {
    let best = 0;
    for (const name of allNames(place)) {
      const n = normalizeDeep(name);
      if (n === q) best = Math.max(best, 100);
      else if (n.startsWith(q)) best = Math.max(best, 70);
      else if (n.includes(q)) best = Math.max(best, 40);
      // Совпадение по началу слова внутри названия: «нижний» → «Нижний Новгород».
      else if (n.split(' ').some((w) => w.startsWith(q))) best = Math.max(best, 55);
    }
    if (best > 0) {
      // Крупные единицы выше мелких при равном совпадении: область важнее
      // одноимённого посёлка.
      matches.push({ place, score: best - place.depth });
    }
  }

  return matches
    .sort((a, b) => b.score - a.score || a.place.name.localeCompare(b.place.name))
    .slice(0, limit)
    .map((m) => m.place);
}

/**
 * Сортировка списка мест по правилам языка.
 *
 * localeCompare знает, что в шведском ä идёт после z, а в немецком — рядом с a.
 * Простое сравнение строк расставило бы их по кодам символов, то есть неверно
 * для любого языка, кроме английского.
 */
export function sortPlaces(places: Place[], language: string): Place[] {
  try {
    const collator = new Intl.Collator(language, { sensitivity: 'base', numeric: true });
    return [...places].sort((a, b) => collator.compare(displayName(a, language), displayName(b, language)));
  } catch {
    return [...places].sort((a, b) => a.name.localeCompare(b.name));
  }
}
