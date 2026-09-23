/**
 * Общее ядро Nova.
 *
 * Здесь только чистая логика — ни одной строки, зависящей от браузера или
 * React Native. Веб-версия и мобильное приложение используют её одинаково.
 *
 * Единственная точка расхождения — хранилище: адаптер подставляется
 * приложением при запуске (setStorageAdapter).
 */

// Контракты
export type {
  CategoryModule, Subcategory, FieldDef, Intent, IntentId, DealType,
  CategoryStatus, RegisteredCategory, DraftRecord,
} from './core/types';

// Реестр категорий
export {
  registerCategory, getCategories, getCategory, getCategoryByPath,
  getSubcategory, getRegistryHealth, resetRegistry,
} from './core/registry';
export { validateCategory } from './core/validate';

// Страны и валюты
export { COUNTRIES, LANGUAGE_NAMES, RTL_LANGUAGES, findCountry, searchCountries, guessCountry } from './core/countries';
export type { Country, LanguageCode } from './core/countries';
export { initCountries, getCountries, getCountry, isCountryAvailable, getCountriesHealth, resetCountries } from './core/countryRegistry';

// Места
export type { Place, PlaceTree, PlaceKind, LocationSelection, ItemLocation, LevelLabels } from './core/places/types';
export { distanceKm, withinRadius, boundingBox, isValidCoord, hasCoords, nearestPlace } from './core/places/geo';
export { normalize, normalizeDeep, searchPlaces, displayName, displayNameWithOriginal, sortPlaces, allNames } from './core/places/search';
export { validatePlaceTree } from './core/places/validate';
export {
  registerPlaceLoader, loadPlaceTree, getLoadedTree, findPlace, childrenOf,
  isWithin, ancestorsOf, levelLabel, hasPlaceData, getPlacesHealth, resetPlaces,
} from './core/places/registry';
export { initPlaceLoaders } from './core/places/data';

// Справочники значений
export type { ReferenceEntry, ReferenceSet, ReferenceStatus } from './core/references/types';
export {
  registerReference, loadReference, getReference, hasReference, referenceStatus,
  entriesOf, searchEntries, getReferencesHealth, resetReferences,
} from './core/references/registry';
export { initReferences } from './core/references/data';
export { resolveOptions, isReferenceField } from './core/references/resolve';
export { toId, toChildId, isValidId } from './core/references/translit';

// Переводы названий категорий/полей (значения конфигураций описаны на русском)
export { translateLabel, LABEL_TRANSLATED_LANGUAGES } from './core/labels';

// Перевод интерфейса — общий для Web и Mobile словарь и функция translate().
export {
  translate, translatePlural, hasTranslation, TRANSLATED_LANGUAGES,
  ru as ruDict, en as enDict, de as deDict, es as esDict, fr as frDict,
  pt as ptDict, tr as trDict, ar as arDict, hi as hiDict, zh as zhDict,
} from './core/i18n';
export type { Dict, TranslationKey, TranslationParams } from './core/i18n';

// Данные и фильтрация
export type { CatalogItem } from './core/catalogData';
export { catalog, allItems, findItem, itemsFor, setGeneratedItems, setUserItems, setServerItems } from './core/catalogData';
export {
  matchItem, matchesLocation, filterableFields, cardFields, fieldsForStep, fieldsForDeal,
  sortItems, pluralListings, SORT_LABELS, subcategoriesForDeal,
} from './core/filtering';
export type { FilterValues, SortKey } from './core/filtering';
export { generateDemoItems } from './core/demo/generator';

// Черновики и хранилище
export { loadDraft, saveDraft, clearDraft } from './core/draftStore';
export { storage, setStorageAdapter, browserStorage } from './core/storage';
export type { StorageAdapter } from './core/storage';

// Сетка главного экрана
export { HOME_TILES, resolveHomeTiles } from './core/homeGrid';
export type { HomeTile, ResolvedTile } from './core/homeGrid';

// Категории
export { realtyCategory } from './realty';
export { autoCategory } from './auto';
export { servicesCategory } from './services';
export { homeCategory } from './home';
export { electronicsCategory } from './electronics';
export { personalCategory } from './personal';
export { hobbyCategory } from './hobby';
export { petsCategory } from './pets';
export { travelCategory } from './travel';
export { kidsCategory } from './kids';
export { workCategory } from './work';

export { initCategories } from './init';
