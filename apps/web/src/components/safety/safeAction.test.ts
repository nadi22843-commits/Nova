/**
 * Предохранитель кнопок: сбой обработчика не выходит наружу.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { runSafely, safe } from './safeAction';

test('синхронная ошибка в кнопке перехвачена, выполнение продолжается', () => {
  const errors: unknown[] = [];
  const result = runSafely('Позвонить', () => { throw new Error('сбой'); }, (e) => errors.push(e));
  assert.equal(result, undefined);
  assert.equal(errors.length, 1);
});

test('ошибка async-обработчика тоже перехвачена', async () => {
  const errors: unknown[] = [];
  runSafely('Опубликовать', async () => { throw new Error('async сбой'); }, (e) => errors.push(e));
  await new Promise((r) => setTimeout(r, 0));
  assert.equal(errors.length, 1);
});

test('исправная кнопка работает как обычно и получает аргументы', () => {
  let got = '';
  safe('Найти', (q: string) => { got = q; })('BMW');
  assert.equal(got, 'BMW');
});

test('упавшая кнопка не мешает соседней', () => {
  let second = false;
  const originalError = console.error;
  console.error = () => {};
  try {
    safe('Сломанная', () => { throw new Error('x'); })();
    safe('Рабочая', () => { second = true; })();
  } finally {
    console.error = originalError;
  }
  assert.equal(second, true);
});
