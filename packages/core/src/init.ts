import { registerCategory, getCategories, getRegistryHealth } from './core/registry';
import { generateDemoItems } from './core/demo/generator';
import { setGeneratedItems } from './core/catalogData';
import { initReferences } from './core/references/data';
import { realtyCategory } from './realty';
import { autoCategory } from './auto';
import { servicesCategory } from './services';
import { homeCategory } from './home';
import { electronicsCategory } from './electronics';
import { personalCategory } from './personal';
import { hobbyCategory } from './hobby';
import { petsCategory } from './pets';
import { travelCategory } from './travel';
import { kidsCategory } from './kids';
import { workCategory } from './work';
import type { CategoryModule } from './core/types';

/**
 * Единственное место, где объявляются категории.
 *
 * Чтобы добавить категорию: создать папку с конфигурацией и дописать одну
 * строку ниже. Одинаково работает для веба и мобильного приложения.
 *
 * Категория «Работа» подключается снаружи — у неё свой интерфейс, и он
 * разный на вебе и в мобильном.
 */
let initialized = false;

export function initCategories(extra: CategoryModule[] = []): void {
  if (initialized) return;
  initialized = true;

  // Справочники значений регистрируются до категорий: поля на них ссылаются.
  initReferences();

  registerCategory(realtyCategory);
  registerCategory(autoCategory);
  registerCategory(servicesCategory);
  registerCategory(homeCategory);
  registerCategory(electronicsCategory);
  registerCategory(personalCategory);
  registerCategory(hobbyCategory);
  registerCategory(petsCategory);
  registerCategory(travelCategory);
  registerCategory(kidsCategory);
  registerCategory(workCategory);

  for (const c of extra) registerCategory(c);

  try {
    setGeneratedItems(generateDemoItems(getCategories()));
  } catch (error) {
    console.error('[Nova/demo] не удалось построить демоданные', error);
  }

  if (typeof __DEV__ !== 'undefined' ? __DEV__ : false) {
    console.info('[Nova/categories] состояние реестра', getRegistryHealth());
  }
}

declare const __DEV__: boolean | undefined;
