import { useCallback } from 'react';
import { useLocale } from '../../categories/core/LocaleStore';
import { translate, translatePlural, type TranslationKey, type TranslationParams } from './index';

/**
 * Переводчик для экранов: `const t = useT(); t('nav.favorites')`.
 * Язык берётся из общего состояния, поэтому смена языка перерисовывает всё.
 */
export function useT() {
  const { language } = useLocale();
  return useCallback(
    (key: TranslationKey, params?: TranslationParams) => translate(language, key, params),
    [language],
  );
}

/** «5 объявлений» с формой множественного числа под текущий язык. */
export function usePluralListings() {
  const { language } = useLocale();
  return useCallback((count: number) => translatePlural(language, count), [language]);
}
