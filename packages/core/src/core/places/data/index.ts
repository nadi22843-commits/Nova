import { registerPlaceLoader } from '../registry';

/**
 * Регистрация справочников мест.
 *
 * Каждая страна — отдельный динамический импорт, то есть отдельный чанк.
 * Он грузится только когда пользователь выбрал эту страну.
 *
 * Страна, которой нет в этом списке, работает в режиме «вся страна»:
 * искать по ней можно, детализации по городам нет. Добавление справочника
 * позже ничего не ломает — это дописывание одной строки.
 */
export function initPlaceLoaders(): void {
  registerPlaceLoader('RU', () => import('./ru'));
  registerPlaceLoader('DE', () => import('./de'));
  registerPlaceLoader('AE', () => import('./ae'));
  registerPlaceLoader('SG', () => import('./sg'));
}
