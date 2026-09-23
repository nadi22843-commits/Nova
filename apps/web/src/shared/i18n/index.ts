/**
 * Единый источник — словари и функция перевода теперь в @nova/core
 * (packages/core/src/core/i18n), чтобы Web и Mobile использовали один и тот
 * же перевод интерфейса, а не два независимых набора текстов.
 */
export {
  translate, translatePlural, hasTranslation, TRANSLATED_LANGUAGES,
  ruDict as ru, enDict as en, deDict as de, esDict as es, frDict as fr,
  ptDict as pt, trDict as tr, arDict as ar, hiDict as hi, zhDict as zh,
} from '@nova/core';
export type { Dict, TranslationKey, TranslationParams } from '@nova/core';
