import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeServerItem } from './listings';
import { normalizePhone } from './auth';
import { apiRequest, ApiError, getApiStatus } from './client';

test('объявление сервера приводится к формату каталога', () => {
  const item = normalizeServerItem({
    id: 'abc', categoryId: 'auto', subcategoryId: 'cars', deal: 'sale', title: 'BMW X5',
    price: 5490000, currency: 'EUR', countryCode: 'de', placeId: 'de-by', publishedAt: '2026-09-18T10:00:00.000Z',
    seller: { name: 'Алексей', kind: 'owner', verified: true }, attrs: { year: 2020, brand: 'BMW' },
  });
  assert.ok(item);
  assert.equal(item!.countryCode, 'DE');
  assert.equal(item!.publishedAt, '2026-09-18');
  assert.deepEqual(item!.attrs, { year: '2020', brand: 'BMW' });
});

test('неполные записи отбрасываются, а не ломают список', () => {
  assert.equal(normalizeServerItem(null), null);
  assert.equal(normalizeServerItem({ id: '', title: 'x' }), null);
  assert.equal(normalizeServerItem({ id: 'a', categoryId: 'auto', subcategoryId: 'cars', title: '' }), null);
});

test('пропуски заполняются безопасными значениями', () => {
  const item = normalizeServerItem({ id: 'a', categoryId: 'auto', subcategoryId: 'cars', title: 'Авто' });
  assert.ok(item);
  assert.equal(item!.deal, 'sale');
  assert.equal(item!.price, 0);
  assert.equal(item!.seller.kind, 'owner');
  assert.equal(item!.image, '/assets/placeholder.jpg');
});

test('телефон приводится к международному виду', () => {
  assert.equal(normalizePhone('8 (999) 123-45-67'), '+79991234567');
  assert.equal(normalizePhone('+7 999 123 45 67'), '+79991234567');
  assert.equal(normalizePhone('123'), null);
});

test('выключенный сервер даёт ошибку offline, а не зависание', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = (() => Promise.reject(new Error('ECONNREFUSED'))) as typeof fetch;
  try {
    await assert.rejects(
      () => apiRequest('/listings', { query: { country: 'RU' } }),
      (error: unknown) => error instanceof ApiError && error.isOffline && error.code === 'offline',
    );
    assert.equal(getApiStatus(), 'offline');
  } finally {
    globalThis.fetch = original;
  }
});

test('ошибка сервера доносится кодом и статусом', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = (() =>
    Promise.resolve({ ok: false, status: 400, json: () => Promise.resolve({ error: 'bad_request' }) })) as unknown as typeof fetch;
  try {
    await assert.rejects(
      () => apiRequest('/listings', {}),
      (error: unknown) => error instanceof ApiError && error.code === 'bad_request' && error.status === 400,
    );
  } finally {
    globalThis.fetch = original;
  }
});

test('параметры запроса уходят в строку адреса', async () => {
  const original = globalThis.fetch;
  let seen = '';
  globalThis.fetch = ((url: string) => {
    seen = String(url);
    return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ items: [] }) });
  }) as unknown as typeof fetch;
  try {
    await apiRequest('/listings', { query: { country: 'RU', limit: 100, cursor: undefined } });
    assert.ok(seen.includes('country=RU'));
    assert.ok(seen.includes('limit=100'));
    assert.ok(!seen.includes('cursor'));
  } finally {
    globalThis.fetch = original;
  }
});
