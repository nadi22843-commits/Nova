/**
 * Проверка автономности.
 *
 * Запуск: node --test (после установки зависимостей) либо через npm run test:isolation.
 * Тест намеренно не зависит от React — проверяется слой данных.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { registerCategory, getCategories, getCategory, getRegistryHealth, resetRegistry } from './registry';
import { validateCategory } from './validate';

const healthy = {
  id: 'healthy',
  title: 'Рабочая категория',
  icon: 'home',
  path: '/healthy',
  intents: [{ id: 'buy', title: 'Купить', subtitle: '', mode: 'browse' }],
  subcategories: [
    {
      id: 'good',
      title: 'Исправная подкатегория',
      steps: ['Основное', 'Предпросмотр'],
      fields: [{ key: 'area', label: 'Площадь', type: 'number', step: 1 }],
    },
  ],
};

test('битая подкатегория отбрасывается, остальные выживают', () => {
  const result = validateCategory({
    ...healthy,
    id: 'mixed',
    path: '/mixed',
    subcategories: [
      ...healthy.subcategories,
      // Нет steps — подкатегория непригодна.
      { id: 'broken', title: 'Сломанная', fields: [] },
      // select без options — тоже непригодна.
      {
        id: 'broken-2',
        title: 'Сломанная 2',
        steps: ['Шаг'],
        fields: [{ key: 'x', label: 'X', type: 'select', step: 1 }],
      },
    ],
  });

  assert.ok(result.module, 'категория должна выжить');
  assert.equal(result.module!.subcategories.length, 1);
  assert.equal(result.module!.subcategories[0].id, 'good');
  assert.deepEqual(result.droppedSubcategories.sort(), ['broken', 'broken-2']);
});

test('категория без единой рабочей подкатегории не регистрируется, но не роняет реестр', () => {
  resetRegistry();
  registerCategory(healthy);
  registerCategory({ id: 'dead', title: 'Мёртвая', icon: 'more', path: '/dead', intents: [], subcategories: [] });

  const ids = getCategories().map((c) => c.id);
  assert.deepEqual(ids, ['healthy']);
  assert.equal(getRegistryHealth().failed.length, 1);
});

test('исключение при регистрации перехватывается', () => {
  resetRegistry();
  const exploding = {
    get id(): string {
      throw new Error('модуль упал при чтении конфигурации');
    },
  };

  assert.doesNotThrow(() => registerCategory(exploding));
  registerCategory(healthy);
  assert.ok(getCategory('healthy'), 'здоровая категория регистрируется после упавшей');
});

test('дублирующиеся ключи полей не перезаписывают форму', () => {
  const result = validateCategory({
    ...healthy,
    id: 'dupes',
    path: '/dupes',
    subcategories: [
      {
        id: 'sub',
        title: 'Подкатегория',
        steps: ['Шаг', 'Предпросмотр'],
        fields: [
          { key: 'area', label: 'Площадь', type: 'number', step: 1 },
          { key: 'area', label: 'Площадь ещё раз', type: 'text', step: 1 },
        ],
      },
    ],
  });

  assert.equal(result.module!.subcategories[0].fields.length, 1);
});

test('поле с шагом за пределами мастера отбрасывается', () => {
  const result = validateCategory({
    ...healthy,
    id: 'steps',
    path: '/steps',
    subcategories: [
      {
        id: 'sub',
        title: 'Подкатегория',
        steps: ['Один', 'Предпросмотр'],
        fields: [
          { key: 'ok', label: 'Норма', type: 'text', step: 1 },
          { key: 'far', label: 'Шаг 9', type: 'text', step: 9 },
        ],
      },
    ],
  });

  const keys = result.module!.subcategories[0].fields.map((f) => f.key);
  assert.deepEqual(keys, ['ok']);
});
