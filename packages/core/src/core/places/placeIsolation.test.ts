/**
 * Автономность справочников мест.
 *
 * Тот же принцип, что у категорий и стран: битое дерево одной страны не
 * трогает другие, а страна без справочника остаётся работоспособной
 * в режиме «вся страна».
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { validatePlaceTree } from './validate';
import { distanceKm, isValidCoord, boundingBox } from './geo';
import { normalizeDeep, searchPlaces } from './search';

const goodTree = {
  countryCode: 'DE',
  depth: 3,
  levelLabels: { de: ['Bundesland', 'Stadt'], en: ['State', 'City'] },
  places: [
    { id: 'de-by', countryCode: 'DE', parentId: null, kind: 'admin1', depth: 1, name: 'Bayern', lat: 48.79, lon: 11.49, path: [] },
    { id: 'de-by-muc', countryCode: 'DE', parentId: 'de-by', kind: 'city', depth: 2, name: 'München', names: { ru: 'Мюнхен' }, lat: 48.13, lon: 11.58, path: [] },
  ],
};

test('битое место отбрасывается, дерево страны выживает', () => {
  const { tree, dropped } = validatePlaceTree(
    {
      ...goodTree,
      places: [
        ...goodTree.places,
        { id: 'de-broken', countryCode: 'DE', parentId: null, kind: 'нечто', depth: 1, name: 'Х', path: [] },
        { id: 'de-noname', countryCode: 'DE', parentId: null, kind: 'city', depth: 1, path: [] },
      ],
    },
    'DE',
  );

  assert.ok(tree, 'дерево должно выжить');
  assert.equal(tree!.places.length, 2);
  assert.deepEqual(dropped.sort(), ['de-broken', 'de-noname']);
});

test('место с несуществующим родителем отбрасывается вместе с поддеревом', () => {
  const { tree, dropped } = validatePlaceTree(
    {
      ...goodTree,
      places: [
        ...goodTree.places,
        { id: 'de-orphan', countryCode: 'DE', parentId: 'de-missing', kind: 'city', depth: 2, name: 'Сирота', path: [] },
        { id: 'de-orphan-child', countryCode: 'DE', parentId: 'de-orphan', kind: 'district', depth: 3, name: 'Потомок сироты', path: [] },
      ],
    },
    'DE',
  );

  assert.ok(dropped.includes('de-orphan'));
  assert.ok(dropped.includes('de-orphan-child'), 'поддерево сироты тоже должно уйти');
  assert.equal(tree!.places.length, 2);
});

test('цикл в иерархии не вешает загрузку', () => {
  const { tree } = validatePlaceTree(
    {
      ...goodTree,
      places: [
        { id: 'a', countryCode: 'DE', parentId: 'b', kind: 'city', depth: 1, name: 'A', path: [] },
        { id: 'b', countryCode: 'DE', parentId: 'a', kind: 'city', depth: 1, name: 'B', path: [] },
        ...goodTree.places,
      ],
    },
    'DE',
  );

  assert.equal(tree!.places.length, 2, 'зацикленная пара должна быть отброшена');
});

test('справочник, объявляющий чужую страну, отклоняется целиком', () => {
  const { tree } = validatePlaceTree({ ...goodTree, countryCode: 'FR' }, 'DE');
  assert.equal(tree, null);
});

test('путь предков строится и даёт проверку вложенности', () => {
  const { tree } = validatePlaceTree(goodTree, 'DE');
  const muc = tree!.places.find((p) => p.id === 'de-by-muc')!;
  assert.deepEqual(muc.path, ['de-by']);
  assert.ok(muc.path.includes('de-by'), 'Мюнхен внутри Баварии');
});

test('недостоверные координаты убираются, место остаётся', () => {
  const { tree } = validatePlaceTree(
    {
      ...goodTree,
      places: [{ ...goodTree.places[0], lat: 0, lon: 0 }],
    },
    'DE',
  );

  const place = tree!.places[0];
  assert.equal(place.lat, undefined, 'точка (0,0) — Гвинейский залив, а не пропущенное поле');
  assert.equal(place.name, 'Bayern', 'само место должно остаться');
});

test('проверка координат', () => {
  assert.equal(isValidCoord(48.13, 11.58), true);
  assert.equal(isValidCoord(0, 0), false);
  assert.equal(isValidCoord(91, 0), false);
  assert.equal(isValidCoord(0, 181), false);
  assert.equal(isValidCoord('48', 11), false);
});

test('расстояние считается корректно, включая 180-й меридиан', () => {
  // Москва — Санкт-Петербург, эталон около 635 км.
  const d = distanceKm(55.7558, 37.6173, 59.9311, 30.3609);
  assert.ok(d > 600 && d < 660, `ожидалось ~635 км, получено ${d.toFixed(0)}`);

  // Точки по разные стороны 180-го меридиана — реально рядом.
  const across = distanceKm(0, 179.9, 0, -179.9);
  assert.ok(across < 30, `через меридиан должно быть близко, получено ${across.toFixed(0)} км`);
});

test('рамка у полюса не переполняется', () => {
  const box = boundingBox(89.9, 0, 100);
  assert.ok(box.maxLat <= 90);
  assert.ok(Number.isFinite(box.minLon) && Number.isFinite(box.maxLon));
});

test('поиск находит по всем написаниям', () => {
  const { tree } = validatePlaceTree(goodTree, 'DE');
  for (const q of ['München', 'Munchen', 'munchen', 'Мюнхен', 'MÜNCHEN']) {
    const found = searchPlaces(tree!.places, q);
    assert.equal(found[0]?.id, 'de-by-muc', `не найдено по запросу «${q}»`);
  }
});

test('нормализация приводит разные написания к одному', () => {
  assert.equal(normalizeDeep('München'), normalizeDeep('Munchen'));
  assert.equal(normalizeDeep('Straße'), 'strasse');
  assert.equal(normalizeDeep('Łódź'), 'lodz');
  assert.equal(normalizeDeep('  Nizhny   Novgorod '), 'nizhny novgorod');
});
