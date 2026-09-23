import { createContext, useCallback, useContext, type ReactNode } from 'react';
import { translate, translatePlural, type LanguageCode, type TranslationKey, type TranslationParams } from '@nova/core';

/**
 * Перевод интерфейса Mobile.
 *
 * Словарь и функция translate() общие с Web — оба приложения читают их из
 * @nova/core (packages/core/src/core/i18n), поэтому текст не может разойтись
 * между платформами. Язык хранится в App.tsx вместе со страной и передаётся
 * сюда единственным пропсом.
 */

const LocaleContext = createContext<LanguageCode>('ru');

export function LocaleProvider({ language, children }: { language: LanguageCode; children: ReactNode }) {
  return <LocaleContext.Provider value={language}>{children}</LocaleContext.Provider>;
}

export function useLocaleLanguage(): LanguageCode {
  return useContext(LocaleContext);
}

/** `const t = useT(); t('nav.favorites')` — как на Web. */
export function useT() {
  const language = useLocaleLanguage();
  return useCallback(
    (key: TranslationKey, params?: TranslationParams) => translate(language, key, params),
    [language],
  );
}

/** «5 объявлений» с формой множественного числа под текущий язык. */
export function usePluralListings() {
  const language = useLocaleLanguage();
  return useCallback((count: number) => translatePlural(language, count), [language]);
}
