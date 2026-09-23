import { setServerItems } from '../../categories/core/catalogData';
import { ApiError } from './client';
import { fetchListings, type ServerListing } from './listings';

/**
 * Объявления сервера в общем каталоге.
 *
 * Загружаются один раз на страну и кладутся в отдельную корзину каталога
 * рядом с демоданными. Все экраны (списки, поиск, карточка) читают каталог
 * как раньше, поэтому подключение сервера не потребовало их переделки.
 *
 * Сервер выключен — корзина остаётся пустой, приложение работает автономно.
 */

export const SERVER_CATALOG_EVENT = 'nova:server-catalog';

let loadedCountry = '';
let items: ServerListing[] = [];

export function serverCatalogItems(): ServerListing[] {
  return items;
}

function publish(): void {
  setServerItems(items);
  try {
    window.dispatchEvent(new Event(SERVER_CATALOG_EVENT));
  } catch {
    /* событие не критично */
  }
}

/**
 * Загружает объявления страны. force — перезагрузить даже если страна та же
 * (например, после публикации).
 */
export async function loadServerCatalog(countryCode: string, options: { force?: boolean } = {}): Promise<'loaded' | 'skipped' | 'offline'> {
  if (!countryCode) return 'skipped';
  if (!options.force && loadedCountry === countryCode) return 'skipped';

  try {
    const { items: loaded } = await fetchListings({ country: countryCode, limit: 100 });
    loadedCountry = countryCode;
    items = loaded;
    publish();
    return 'loaded';
  } catch (error) {
    if (error instanceof ApiError && error.isOffline) {
      // Автономный режим: демоданные и локальные объявления остаются на месте.
      return 'offline';
    }
    console.error('[Nova/api] объявления сервера не загрузились', error);
    return 'offline';
  }
}

/** Сбрасывает загруженное (например, при смене страны или выходе). */
export function resetServerCatalog(): void {
  loadedCountry = '';
  items = [];
  publish();
}
