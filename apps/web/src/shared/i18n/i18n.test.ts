import assert from 'node:assert/strict';
import test from 'node:test';
import { translate, TRANSLATED_LANGUAGES, hasTranslation, ru, en, de, es, fr, pt, tr, ar, hi, zh } from './index';

const NON_RU: Record<string, Record<string, string>> = { en, de, es, fr, pt, tr, ar, hi, zh };

test('во всех словарях одинаковый набор ключей', () => {
  const keys = Object.keys(ru).sort();
  for (const [name, dict] of Object.entries(NON_RU)) {
    assert.deepEqual(Object.keys(dict).sort(), keys, `${name}: набор ключей отличается от ru`);
  }
});

test('ни один перевод не пустой', () => {
  for (const [name, dict] of [['ru', ru], ...Object.entries(NON_RU)] as const) {
    for (const [key, value] of Object.entries(dict)) {
      assert.ok(value.trim().length > 0, `${name}: пустой перевод ${key}`);
    }
  }
});

test('подстановки совпадают между языками', () => {
  const holders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(',');
  for (const key of Object.keys(ru) as (keyof typeof ru)[]) {
    for (const [name, dict] of Object.entries(NON_RU)) {
      assert.equal(holders(dict[key]), holders(ru[key]), `${name}: ${key}`);
    }
  }
});

test('язык без словаря показывает английский, а не пустоту', () => {
  assert.equal(hasTranslation('unknown-lang' as never), false);
  assert.equal(translate('unknown-lang' as never, 'nav.favorites'), en['nav.favorites']);
});

test('подстановка значений работает', () => {
  assert.equal(translate('en', 'search.results', { count: 12 }), 'Found: 12');
  assert.equal(translate('de', 'list.showCount', { count: 3 }), '3 anzeigen');
});

test('переведённые языки объявлены', () => {
  assert.deepEqual(
    [...TRANSLATED_LANGUAGES].sort(),
    ['ar', 'de', 'en', 'es', 'fr', 'hi', 'pt', 'ru', 'tr', 'zh'],
  );
});
