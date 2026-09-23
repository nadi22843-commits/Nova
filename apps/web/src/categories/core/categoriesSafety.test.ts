/**
 * Поломка «Работы» не затрагивает «Недвижимость» и «Авто».
 * Используются настоящие конфигурации категорий из packages/core.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { registerCategory, getCategory, getCategories, getRegistryHealth, resetRegistry } from './registry';
import { generateDemoItems } from './demo/generator';
import type { CategoryModule } from './types';

// Динамический импорт: packages/core не помечен как ESM-пакет, и статический
// именованный импорт его .ts-файлов в Node-тестах не распознаётся.
const core = '../../../../../packages/core/src';
const { realtyCategory } = (await import(`${core}/realty/index.ts`)) as { realtyCategory: CategoryModule };
const { autoCategory } = (await import(`${core}/auto/index.ts`)) as { autoCategory: CategoryModule };
const { workCategory } = (await import(`${core}/work/index.ts`)) as { workCategory: CategoryModule };
const { initReferences } = (await import(`${core}/core/references/data/index.ts`)) as { initReferences: () => void };

const quiet = <T>(fn: () => T): T => {
  const { error, warn } = console;
  console.error = () => {};
  console.warn = () => {};
  try { return fn(); } finally { console.error = error; console.warn = warn; }
};

test('все три категории поднимаются в штатном режиме', () => {
  resetRegistry();
  initReferences();
  quiet(() => [realtyCategory, autoCategory, workCategory].forEach(registerCategory));
  assert.ok(getCategory('realty'));
  assert.ok(getCategory('auto'));
  assert.ok(getCategory('work'));
});

test('полностью сломанная «Работа» отключается, «Недвижимость» и «Авто» работают', () => {
  resetRegistry();
  const brokenWork = { ...workCategory, intents: 'сломано', subcategories: null };
  quiet(() => [realtyCategory, brokenWork, autoCategory].forEach(registerCategory));
  assert.equal(getCategory('work'), undefined);
  assert.ok(getCategory('realty'));
  assert.ok(getCategory('auto'));
  assert.equal(getRegistryHealth().failed.some((f) => f.id === 'work'), true);
});

test('«Работа», падающая прямо при чтении конфигурации, не останавливает остальные', () => {
  resetRegistry();
  const exploding = { get id(): string { throw new Error('взрыв'); } };
  quiet(() => [exploding, realtyCategory, autoCategory].forEach(registerCategory));
  assert.deepEqual(getCategories().map((c) => c.id).sort(), ['auto', 'realty']);
});

test('одна сломанная подкатегория «Работы» не отключает всю «Работу»', () => {
  resetRegistry();
  const [first, ...rest] = workCategory.subcategories;
  const partlyBroken = { ...workCategory, subcategories: [{ ...first, fields: 'сломано' }, ...rest] };
  quiet(() => [partlyBroken, realtyCategory].forEach(registerCategory));
  const work = getCategory('work');
  assert.ok(work, '«Работа» должна остаться');
  assert.equal(work!.subcategories.some((s) => s.id === first.id), false);
  assert.ok(getCategory('realty'));
});

test('демоданные строятся для «Недвижимости» и «Авто» даже без «Работы»', () => {
  resetRegistry();
  quiet(() => [realtyCategory, autoCategory].forEach(registerCategory));
  const items = generateDemoItems(getCategories());
  assert.ok(items.some((i) => i.categoryId === 'realty'));
  assert.ok(items.some((i) => i.categoryId === 'auto'));
});

test('в «Работе» есть вакансии и резюме для кнопок отклика и приглашения', () => {
  resetRegistry();
  initReferences();
  quiet(() => registerCategory(workCategory));
  const items = generateDemoItems(getCategories());
  assert.ok(items.some((i) => i.deal === 'vacancy'));
  assert.ok(items.some((i) => i.deal === 'resume'));
});
