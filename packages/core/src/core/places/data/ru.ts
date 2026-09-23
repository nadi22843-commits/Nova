import type { PlaceTree } from '../types';

/**
 * Россия: страна → субъект → город → район города.
 * Четыре уровня. Демонстрационный срез, не полный справочник.
 */
const ru: PlaceTree = {
  countryCode: 'RU',
  depth: 4,
  levelLabels: {
    ru: ['Регион', 'Город', 'Район'],
    en: ['Region', 'City', 'District'],
  },
  places: [
    { id: 'ru-msk', countryCode: 'RU', parentId: null, kind: 'admin1', depth: 1, name: 'Москва', names: { en: 'Moscow' }, lat: 55.7558, lon: 37.6173, path: [] },
    { id: 'ru-msk-cao', countryCode: 'RU', parentId: 'ru-msk', kind: 'district', depth: 2, name: 'Центральный округ', names: { en: 'Central District' }, lat: 55.7558, lon: 37.6173, path: [] },
    { id: 'ru-msk-zao', countryCode: 'RU', parentId: 'ru-msk', kind: 'district', depth: 2, name: 'Западный округ', names: { en: 'Western District' }, lat: 55.7280, lon: 37.4400, path: [] },

    { id: 'ru-mo', countryCode: 'RU', parentId: null, kind: 'admin1', depth: 1, name: 'Московская область', names: { en: 'Moscow Oblast' }, lat: 55.5043, lon: 37.5136, path: [] },
    { id: 'ru-mo-khimki', countryCode: 'RU', parentId: 'ru-mo', kind: 'city', depth: 2, name: 'Химки', names: { en: 'Khimki' }, lat: 55.8970, lon: 37.4297, path: [] },
    { id: 'ru-mo-podolsk', countryCode: 'RU', parentId: 'ru-mo', kind: 'city', depth: 2, name: 'Подольск', names: { en: 'Podolsk' }, lat: 55.4312, lon: 37.5447, path: [] },

    { id: 'ru-spb', countryCode: 'RU', parentId: null, kind: 'admin1', depth: 1, name: 'Санкт-Петербург', names: { en: 'Saint Petersburg' }, aliases: ['Питер', 'СПб', 'Petersburg'], lat: 59.9311, lon: 30.3609, path: [] },
    { id: 'ru-lo', countryCode: 'RU', parentId: null, kind: 'admin1', depth: 1, name: 'Ленинградская область', names: { en: 'Leningrad Oblast' }, lat: 59.7000, lon: 31.0000, path: [] },
    { id: 'ru-krd', countryCode: 'RU', parentId: null, kind: 'admin1', depth: 1, name: 'Краснодарский край', names: { en: 'Krasnodar Krai' }, lat: 45.0355, lon: 38.9753, path: [] },
    { id: 'ru-krd-sochi', countryCode: 'RU', parentId: 'ru-krd', kind: 'city', depth: 2, name: 'Сочи', names: { en: 'Sochi' }, lat: 43.5855, lon: 39.7231, path: [] },
    { id: 'ru-tat', countryCode: 'RU', parentId: null, kind: 'admin1', depth: 1, name: 'Республика Татарстан', names: { en: 'Tatarstan' }, lat: 55.7963, lon: 49.1088, path: [] },
    { id: 'ru-tat-kazan', countryCode: 'RU', parentId: 'ru-tat', kind: 'city', depth: 2, name: 'Казань', names: { en: 'Kazan' }, lat: 55.7963, lon: 49.1088, path: [] },
    { id: 'ru-tver', countryCode: 'RU', parentId: null, kind: 'admin1', depth: 1, name: 'Тверская область', names: { en: 'Tver Oblast' }, lat: 56.8587, lon: 35.9176, path: [] },
  ],
};

export default ru;
