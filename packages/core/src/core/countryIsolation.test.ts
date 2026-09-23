/**
 * Автономность стран.
 *
 * Проверяем то же правило, что и для категорий: одна сломанная страна
 * отключается сама, остальные продолжают работать.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { initCountries, getCountries, getCountry, isCountryAvailable, getCountriesHealth, resetCountries } from './countryRegistry';

const china = {
  code: 'CN',
  nativeName: '中国',
  englishName: 'China',
  flag: '🇨🇳',
  currency: 'CNY',
  defaultLanguage: 'zh',
  languages: ['zh', 'en'],
  locale: 'zh-CN',
  phoneCode: '+86',
};

const germany = {
  code: 'DE',
  nativeName: 'Deutschland',
  englishName: 'Germany',
  flag: '🇩🇪',
  currency: 'EUR',
  defaultLanguage: 'de',
  languages: ['de', 'en'],
  locale: 'de-DE',
  phoneCode: '+49',
};

test('сломанная Индия не мешает Китаю и Германии', () => {
  resetCountries();
  const brokenIndia = { ...china, code: 'IN', nativeName: 'भारत', englishName: 'India', currency: 'RUPEE', locale: 'hi-IN' };

  initCountries([brokenIndia, china, germany]);

  const codes = getCountries().map((c) => c.code);
  assert.ok(!codes.includes('IN'), 'Индия должна быть отключена');
  assert.deepEqual(codes.sort(), ['CN', 'DE']);
  assert.equal(getCountriesHealth().dropped.length, 1);
});

test('запись, падающая при чтении, не останавливает загрузку остальных', () => {
  resetCountries();
  const exploding = {
    get code(): string {
      throw new Error('битая запись страны');
    },
  };

  assert.doesNotThrow(() => initCountries([exploding, china]));
  assert.ok(getCountry('CN'), 'Китай должен загрузиться после упавшей записи');
});

test('язык по умолчанию вне списка доступных заменяется, страна выживает', () => {
  resetCountries();
  initCountries([{ ...china, defaultLanguage: 'fr' }]);

  const cn = getCountry('CN')!;
  assert.ok(cn, 'страна должна остаться');
  assert.ok(cn.languages.includes(cn.defaultLanguage), 'язык по умолчанию обязан быть в списке');
  assert.equal(cn.defaultLanguage, 'zh');
});

test('неизвестный язык отбрасывается, страна остаётся с рабочими', () => {
  resetCountries();
  initCountries([{ ...china, languages: ['zh', 'klingon', 'en'] }]);

  assert.deepEqual(getCountry('CN')!.languages, ['zh', 'en']);
});

test('валюта, которую среда не умеет форматировать, отключает страну целиком', () => {
  resetCountries();
  initCountries([{ ...china, currency: 'XXZ' }, germany]);

  assert.equal(isCountryAvailable('CN'), false);
  assert.equal(isCountryAvailable('DE'), true);
});

test('дубликат не перезаписывает уже загруженную страну', () => {
  resetCountries();
  initCountries([china, { ...china, nativeName: 'подделка' }]);

  assert.equal(getCountry('CN')!.nativeName, '中国');
  assert.equal(getCountries().length, 1);
});

test('валюта каждой страны форматируется своей локалью', () => {
  resetCountries();
  initCountries([china, germany]);

  const money = (c: { locale: string; currency: string }, n: number) =>
    new Intl.NumberFormat(c.locale, { style: 'currency', currency: c.currency, maximumFractionDigits: 0 }).format(n);

  const cn = money(getCountry('CN')!, 300000);
  const de = money(getCountry('DE')!, 300000);

  assert.ok(cn.includes('¥'), `юань ожидался, получено: ${cn}`);
  assert.ok(de.includes('€'), `евро ожидалось, получено: ${de}`);
  assert.notEqual(cn, de, 'одна сумма в разных странах не должна выглядеть одинаково');
});
