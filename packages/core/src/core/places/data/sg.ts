import type { PlaceTree } from '../types';

/**
 * Сингапур: страна → район. Всего два уровня.
 *
 * Крайний случай, ради которого модель сделана деревом произвольной глубины:
 * промежуточного административного уровня здесь нет вообще, и любая схема
 * с обязательными полями «регион» и «город» на этой стране ломается.
 */
const sg: PlaceTree = {
  countryCode: 'SG',
  depth: 2,
  levelLabels: {
    en: ['District'],
    ru: ['Район'],
  },
  places: [
    { id: 'sg-central', countryCode: 'SG', parentId: null, kind: 'district', depth: 1, name: 'Central Region', names: { ru: 'Центральный район' }, lat: 1.3048, lon: 103.8318, path: [] },
    { id: 'sg-east', countryCode: 'SG', parentId: null, kind: 'district', depth: 1, name: 'East Region', names: { ru: 'Восточный район' }, lat: 1.3236, lon: 103.9273, path: [] },
    { id: 'sg-north', countryCode: 'SG', parentId: null, kind: 'district', depth: 1, name: 'North Region', names: { ru: 'Северный район' }, lat: 1.4304, lon: 103.8354, path: [] },
    { id: 'sg-west', countryCode: 'SG', parentId: null, kind: 'district', depth: 1, name: 'West Region', names: { ru: 'Западный район' }, lat: 1.3404, lon: 103.7090, path: [] },
  ],
};

export default sg;
