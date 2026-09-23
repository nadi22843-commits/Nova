/**
 * Хранилище.
 *
 * Единственное место, где веб и мобильное приложение расходятся: в браузере
 * это localStorage, в React Native — AsyncStorage. Логика об этом не знает,
 * она вызывает set/get и всё.
 *
 * Адаптер подставляется при запуске приложения. Пока его не подставили,
 * работает заглушка в памяти — данные не переживут перезапуск, но ничего
 * не сломается.
 */

export type StorageAdapter = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

const memory = new Map<string, string>();

const fallback: StorageAdapter = {
  getItem: (k) => memory.get(k) ?? null,
  setItem: (k, v) => void memory.set(k, v),
  removeItem: (k) => void memory.delete(k),
};

let adapter: StorageAdapter = fallback;

export function setStorageAdapter(next: StorageAdapter): void {
  adapter = next;
}

/** Все операции безопасны: запрет хранилища не должен ронять экран. */
export const storage = {
  get(key: string): string | null {
    try {
      return adapter.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string): void {
    try {
      adapter.setItem(key, value);
    } catch {
      /* переполнение или приватный режим */
    }
  },
  remove(key: string): void {
    try {
      adapter.removeItem(key);
    } catch {
      /* тихо */
    }
  },
};

/** Адаптер для браузера. */
export function browserStorage(): StorageAdapter {
  return {
    getItem: (k) => window.localStorage.getItem(k),
    setItem: (k, v) => window.localStorage.setItem(k, v),
    removeItem: (k) => window.localStorage.removeItem(k),
  };
}
