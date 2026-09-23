import { registerCategory, getCategories, getRegistryHealth } from './core/registry';
import { generateDemoItems } from './core/demo/generator';
import { setGeneratedItems } from './core/catalogData';
import {
  realtyCategory, autoCategory, workCategory, servicesCategory, homeCategory,
  electronicsCategory, personalCategory, hobbyCategory, petsCategory, travelCategory, kidsCategory,
  initReferences,
} from '@nova/core';

/**
 * Единственное место, где объявляются категории.
 *
 * Чтобы добавить категорию: создать папку с конфигурацией и дописать одну
 * строку ниже. Роутинг, список, фильтры, карточка и форма появятся сами.
 *
 * Каждая регистрация изолирована: если одна категория написана с ошибкой,
 * она не поднимется, а остальные продолжат работать.
 */
let initialized = false;

export function initCategories(): void {
  if (initialized) return;
  initialized = true;

  // Shared reference catalogs are registered before category validation/rendering.
  initReferences();

  registerCategory(realtyCategory);
  registerCategory(autoCategory);
  registerCategory(workCategory);
  registerCategory(servicesCategory);
  registerCategory(homeCategory);
  registerCategory(electronicsCategory);
  registerCategory(personalCategory);
  registerCategory(hobbyCategory);
  registerCategory(petsCategory);
  registerCategory(travelCategory);
  registerCategory(kidsCategory);

  // Демонстрационные объявления строятся из уже зарегистрированных категорий,
  // поэтому попадают только валидные подкатегории и настоящие поля.
  try {
    setGeneratedItems(generateDemoItems(getCategories()));
  } catch (error) {
    // Каталог без демоданных — пустые списки, но рабочее приложение.
    console.error('[Nova/demo] не удалось построить демоданные', error);
  }

  if (import.meta.env?.DEV) {
    console.info('[Nova/categories] состояние реестра', getRegistryHealth());
  }
}

export { getCategories, getRegistryHealth };
export { getCategory, getCategoryByPath, getSubcategory } from './core/registry';
