import type { PlaceTree } from '../types';

/**
 * Германия: страна → федеральная земля → город → округ города.
 * Уровень admin1 называется Bundesland — не «область» и не «штат».
 * Именно поэтому подписи уровней живут в данных страны.
 */
const de: PlaceTree = {
  countryCode: 'DE',
  depth: 3,
  levelLabels: {
    de: ['Bundesland', 'Stadt', 'Bezirk'],
    en: ['State', 'City', 'District'],
    ru: ['Земля', 'Город', 'Округ'],
  },
  places: [
    { id: 'de-by', countryCode: 'DE', parentId: null, kind: 'admin1', depth: 1, name: 'Bayern', names: { en: 'Bavaria', ru: 'Бавария' }, lat: 48.7904, lon: 11.4979, path: [] },
    { id: 'de-by-muc', countryCode: 'DE', parentId: 'de-by', kind: 'city', depth: 2, name: 'München', names: { en: 'Munich', ru: 'Мюнхен' }, lat: 48.1351, lon: 11.5820, path: [] },
    { id: 'de-by-nue', countryCode: 'DE', parentId: 'de-by', kind: 'city', depth: 2, name: 'Nürnberg', names: { en: 'Nuremberg', ru: 'Нюрнберг' }, lat: 49.4521, lon: 11.0767, path: [] },

    { id: 'de-be', countryCode: 'DE', parentId: null, kind: 'admin1', depth: 1, name: 'Berlin', names: { ru: 'Берлин' }, lat: 52.5200, lon: 13.4050, path: [] },
    { id: 'de-be-mitte', countryCode: 'DE', parentId: 'de-be', kind: 'district', depth: 2, name: 'Mitte', names: { ru: 'Митте' }, lat: 52.5200, lon: 13.4050, path: [] },
    { id: 'de-be-kreuzberg', countryCode: 'DE', parentId: 'de-be', kind: 'district', depth: 2, name: 'Kreuzberg', names: { ru: 'Кройцберг' }, lat: 52.4977, lon: 13.4030, path: [] },

    { id: 'de-hh', countryCode: 'DE', parentId: null, kind: 'admin1', depth: 1, name: 'Hamburg', names: { ru: 'Гамбург' }, lat: 53.5511, lon: 9.9937, path: [] },
    { id: 'de-nw', countryCode: 'DE', parentId: null, kind: 'admin1', depth: 1, name: 'Nordrhein-Westfalen', names: { en: 'North Rhine-Westphalia', ru: 'Северный Рейн-Вестфалия' }, lat: 51.4332, lon: 7.6616, path: [] },
    { id: 'de-nw-koeln', countryCode: 'DE', parentId: 'de-nw', kind: 'city', depth: 2, name: 'Köln', names: { en: 'Cologne', ru: 'Кёльн' }, lat: 50.9375, lon: 6.9603, path: [] },
  ],
};

export default de;
