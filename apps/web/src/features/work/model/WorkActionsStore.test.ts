import assert from 'node:assert/strict';
import test from 'node:test';
import {
  addWorkAction, findWorkAction, readWorkActions, removeWorkAction, setWorkActionsStorage, WORK_ACTIONS_KEY,
} from './WorkActionsStore';

function memoryStorage() {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), m };
}

const vacancy = { id: 'work-sales-1', categoryId: 'work', title: 'Продавец-консультант' };

test('отклик сохраняется и не дублируется при повторном нажатии', () => {
  setWorkActionsStorage(memoryStorage());
  assert.equal(addWorkAction('response', vacancy).created, true);
  assert.equal(addWorkAction('response', vacancy).created, false);
  assert.equal(readWorkActions().length, 1);
  assert.ok(findWorkAction('response', vacancy.id));
});

test('отклик и приглашение по одному id — разные записи; отмена удаляет только своё', () => {
  setWorkActionsStorage(memoryStorage());
  addWorkAction('response', vacancy);
  addWorkAction('invite', vacancy);
  assert.equal(removeWorkAction('response', vacancy.id), true);
  assert.equal(findWorkAction('response', vacancy.id), undefined);
  assert.ok(findWorkAction('invite', vacancy.id));
});

test('повреждённое хранилище не роняет «Работу»', () => {
  const s = memoryStorage();
  setWorkActionsStorage(s);
  s.setItem(WORK_ACTIONS_KEY, '{битый json');
  assert.deepEqual(readWorkActions(), []);
  s.setItem(WORK_ACTIONS_KEY, JSON.stringify([null, 42, { id: 'x' }, { id: 'ok', kind: 'response', itemId: 'a' }]));
  assert.equal(readWorkActions().length, 1);
  assert.equal(addWorkAction('response', vacancy).created, true);
  setWorkActionsStorage(null);
});
