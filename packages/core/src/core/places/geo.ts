import type { Place } from './types';

/**
 * Географические расчёты.
 *
 * Радиус нужен там, где административные границы не совпадают с тем, как люди
 * живут: пригород за границей города ближе центра, а в приграничье соседняя
 * страна ближе своей столицы. Поиск «в 30 км от меня» решает это, а поиск
 * по названию области — нет.
 */

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Расстояние по большому кругу (формула гаверсинуса).
 *
 * Точность около 0,5% — этого достаточно для поиска объявлений и
 * несопоставимо дешевле геодезических формул. Работает у полюсов и
 * на 180-м меридиане, где простая разница координат врёт.
 */
export function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}

export function hasCoords(p: { lat?: number; lon?: number }): p is { lat: number; lon: number } {
  return typeof p.lat === 'number' && typeof p.lon === 'number';
}

/**
 * Координаты валидны только в реальных пределах.
 * Нули часто означают «поле не заполнили», а точка (0,0) — это Гвинейский
 * залив: без этой проверки туда съезжает половина объявлений с пустыми данными.
 */
export function isValidCoord(lat: unknown, lon: unknown): boolean {
  if (typeof lat !== 'number' || typeof lon !== 'number') return false;
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return false;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return false;
  if (lat === 0 && lon === 0) return false;
  return true;
}

/** Попадает ли точка в радиус от центра. */
export function withinRadius(
  center: { lat: number; lon: number },
  point: { lat?: number; lon?: number },
  radiusKm: number,
): boolean {
  if (!hasCoords(point)) return false;
  return distanceKm(center.lat, center.lon, point.lat, point.lon) <= radiusKm;
}

/**
 * Прямоугольник вокруг точки — грубый предварительный отбор.
 * На сервере это превращается в условие по индексу, которое отсекает почти всё
 * до дорогого расчёта расстояния. Здесь та же логика, чтобы клиент и сервер
 * считали одинаково.
 */
export function boundingBox(lat: number, lon: number, radiusKm: number) {
  const latDelta = radiusKm / 111.32;
  const cosLat = Math.cos(toRadians(lat));
  // У полюсов косинус стремится к нулю и рамка растягивается на весь мир —
  // это корректно, там долгота почти не значит расстояния.
  const lonDelta = Math.abs(cosLat) < 1e-6 ? 180 : radiusKm / (111.32 * Math.abs(cosLat));
  return {
    minLat: Math.max(-90, lat - latDelta),
    maxLat: Math.min(90, lat + latDelta),
    minLon: lon - lonDelta,
    maxLon: lon + lonDelta,
  };
}

/** Ближайшее место из списка — для подсказки «вы, кажется, здесь». */
export function nearestPlace(lat: number, lon: number, places: Place[]): Place | undefined {
  let best: Place | undefined;
  let bestDistance = Infinity;
  for (const p of places) {
    if (!hasCoords(p)) continue;
    const d = distanceKm(lat, lon, p.lat, p.lon);
    if (d < bestDistance) {
      bestDistance = d;
      best = p;
    }
  }
  return best;
}
