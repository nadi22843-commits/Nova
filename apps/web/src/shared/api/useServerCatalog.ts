import { useEffect, useState } from 'react';
import { useLocale } from '../../categories/core/LocaleStore';
import { loadServerCatalog, SERVER_CATALOG_EVENT } from './ServerCatalog';

/**
 * Подгружает объявления сервера для выбранной страны.
 * Вызывается один раз в App — экраны об этом ничего не знают.
 */
export function useServerCatalog(): void {
  const { country } = useLocale();
  const code = country?.code ?? '';

  useEffect(() => {
    if (!code) return;
    let live = true;
    void loadServerCatalog(code).then((result) => {
      if (live && import.meta.env?.DEV) console.info(`[Nova/api] каталог страны ${code}: ${result}`);
    });
    return () => {
      live = false;
    };
  }, [code]);
}

/**
 * Число, растущее при каждом обновлении серверной корзины каталога.
 *
 * Списки читают каталог через `itemsFor`/`allItems` в `useMemo` — сам по себе
 * такой `useMemo` не замечает, что где-то в модуле обновился массив: загрузка
 * с сервера асинхронная и почти всегда заканчивается уже после первого
 * рендера экрана. Без этого хука страница, открытая раньше, чем пришёл ответ
 * API, навсегда остаётся с одними демоданными — компонент, добавивший это
 * число в зависимости своего `useMemo`, пересчитает список, когда корзина
 * обновится.
 */
export function useCatalogVersion(): number {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const bump = () => setVersion((v) => v + 1);
    window.addEventListener(SERVER_CATALOG_EVENT, bump);
    return () => window.removeEventListener(SERVER_CATALOG_EVENT, bump);
  }, []);

  return version;
}
