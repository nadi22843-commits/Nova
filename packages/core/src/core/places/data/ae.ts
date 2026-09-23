import type { PlaceTree } from '../types';

/**
 * ОАЭ: страна → эмират → город. Всего три уровня, и верхний называется
 * «эмират» — понятие без аналога в других странах.
 *
 * Названия хранятся по-арабски как основные: это язык страны. Латиница
 * и кириллица идут переводами, поиск работает по всем трём.
 */
const ae: PlaceTree = {
  countryCode: 'AE',
  depth: 3,
  levelLabels: {
    ar: ['إمارة', 'مدينة'],
    en: ['Emirate', 'City'],
    ru: ['Эмират', 'Город'],
  },
  places: [
    { id: 'ae-du', countryCode: 'AE', parentId: null, kind: 'admin1', depth: 1, name: 'دبي', names: { en: 'Dubai', ru: 'Дубай' }, lat: 25.2048, lon: 55.2708, path: [] },
    { id: 'ae-du-marina', countryCode: 'AE', parentId: 'ae-du', kind: 'district', depth: 2, name: 'دبي مارينا', names: { en: 'Dubai Marina', ru: 'Дубай Марина' }, lat: 25.0805, lon: 55.1403, path: [] },
    { id: 'ae-du-deira', countryCode: 'AE', parentId: 'ae-du', kind: 'district', depth: 2, name: 'ديرة', names: { en: 'Deira', ru: 'Дейра' }, lat: 25.2697, lon: 55.3095, path: [] },

    { id: 'ae-az', countryCode: 'AE', parentId: null, kind: 'admin1', depth: 1, name: 'أبو ظبي', names: { en: 'Abu Dhabi', ru: 'Абу-Даби' }, lat: 24.4539, lon: 54.3773, path: [] },
    { id: 'ae-sh', countryCode: 'AE', parentId: null, kind: 'admin1', depth: 1, name: 'الشارقة', names: { en: 'Sharjah', ru: 'Шарджа' }, lat: 25.3463, lon: 55.4209, path: [] },
    { id: 'ae-rk', countryCode: 'AE', parentId: null, kind: 'admin1', depth: 1, name: 'رأس الخيمة', names: { en: 'Ras Al Khaimah', ru: 'Рас-эль-Хайма' }, lat: 25.7895, lon: 55.9432, path: [] },
  ],
};

export default ae;
