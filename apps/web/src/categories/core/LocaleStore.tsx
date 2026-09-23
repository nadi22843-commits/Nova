import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getCountry, getCountries, isCountryAvailable } from './countryRegistry';
import { RTL_LANGUAGES, type Country, type LanguageCode } from './countries';

/**
 * Локаль приложения.
 *
 * Страна — корень: из неё выводятся валюта, язык по умолчанию и форматы.
 * Язык хранится отдельно, потому что связь страна↔язык не один к одному
 * (Швейцария, Канада, Индия).
 *
 * Всё форматирование денег и дат идёт только отсюда. Нигде в коде не должно
 * быть символа валюты в строке — иначе цена в Берлине покажется в рублях.
 */

const STORAGE_KEY = 'nova.locale';

type StoredLocale = { country: string; language: LanguageCode };

type LocaleContextValue = {
  /** null — страна ещё не выбрана, показываем экран приветствия. */
  country: Country | null;
  language: LanguageCode;
  isRtl: boolean;
  /** Локаль форматирования: язык человека + страна (например, en-DE). */
  locale: string;
  /** true, пока читаем сохранённый выбор — чтобы не мигать экраном выбора. */
  loading: boolean;
  /** language — необязательный язык из списка страны; иначе язык по умолчанию. */
  chooseCountry: (code: string, language?: LanguageCode) => void;
  /** Сбрасывает выбор страны и возвращает экран приветствия. */
  resetCountry: () => void;
  setLanguage: (lang: LanguageCode) => void;
  /** Форматирует сумму в валюте выбранной страны. */
  formatMoney: (amount: number, currencyOverride?: string) => string;
  formatNumber: (value: number) => string;
  formatDate: (value: string | Date) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readStored(): StoredLocale | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredLocale;
    if (!parsed?.country) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStored(value: StoredLocale): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Запрет хранилища не должен мешать работе — выбор просто не переживёт перезапуск.
  }
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [country, setCountry] = useState<Country | null>(null);
  const [language, setLanguageState] = useState<LanguageCode>('en');
  const [loading, setLoading] = useState(true);

  // Восстановление выбора при запуске.
  useEffect(() => {
    const stored = readStored();

    // Страна могла быть отключена в новой версии — тогда сохранённый выбор
    // не проходит проверку, и пользователь выбирает страну заново.
    if (stored && isCountryAvailable(stored.country)) {
      const found = getCountry(stored.country)!;
      setCountry(found);
      setLanguageState(found.languages.includes(stored.language) ? stored.language : found.defaultLanguage);
    } else if (stored) {
      console.warn(`[Nova/locale] сохранённая страна «${stored.country}» недоступна, нужен повторный выбор`);
    }

    setLoading(false);
  }, []);

  const chooseCountry = useCallback((code: string, lang?: LanguageCode) => {
    const found = getCountry(code);
    if (!found) {
      console.error(`[Nova/locale] страна «${code}» недоступна`);
      return;
    }
    // Язык применяется здесь же, в одном действии со страной. Раньше экран
    // приветствия вызывал setLanguage сразу после chooseCountry, но тот видел
    // ещё старое значение country (null) и молча игнорировал выбранный язык.
    const nextLanguage = lang && found.languages.includes(lang) ? lang : found.defaultLanguage;
    setCountry(found);
    setLanguageState(nextLanguage);
    writeStored({ country: found.code, language: nextLanguage });
  }, []);

  const resetCountry = useCallback(() => {
    setCountry(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* хранилище недоступно — выбор сбросится только до перезапуска */
    }
  }, []);

  const setLanguage = useCallback(
    (lang: LanguageCode) => {
      if (!country) return;
      // Язык вне списка страны игнорируем — иначе интерфейс уйдёт в состояние,
      // из которого его не вернуть переключателем.
      if (!country.languages.includes(lang)) return;
      setLanguageState(lang);
      writeStored({ country: country.code, language: lang });
    },
    [country],
  );

  const isRtl = RTL_LANGUAGES.includes(language);

  // Форматирование идёт по связке «язык + страна»: человек, выбравший в
  // Германии английский, видит английские даты, но евро и немецкие правила
  // страны. Раньше локаль зависела только от страны, и выбор языка на числа
  // и даты не влиял.
  const locale = useMemo(() => {
    if (!country) return language;
    const candidate = `${language}-${country.code}`;
    try {
      return Intl.NumberFormat.supportedLocalesOf([candidate]).length > 0 ? candidate : country.locale;
    } catch {
      return country.locale;
    }
  }, [country, language]);

  const formatMoney = useCallback(
    (amount: number, currencyOverride?: string) => {
      const currency = currencyOverride ?? country?.currency ?? 'USD';
      const formatLocale = locale;
      try {
        return new Intl.NumberFormat(formatLocale, {
          style: 'currency',
          currency,
          maximumFractionDigits: 0,
        }).format(amount);
      } catch {
        // Даже если валюта или локаль внезапно неверны, цена должна показаться.
        return `${amount.toLocaleString('en-US')} ${currency}`;
      }
    },
    [country, locale],
  );

  const formatNumber = useCallback(
    (value: number) => {
      try {
        return new Intl.NumberFormat(locale).format(value);
      } catch {
        return String(value);
      }
    },
    [country, locale],
  );

  const formatDate = useCallback(
    (value: string | Date) => {
      const date = typeof value === 'string' ? new Date(value) : value;
      if (Number.isNaN(date.getTime())) return '';
      try {
        return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
      } catch {
        return date.toISOString().slice(0, 10);
      }
    },
    [country, locale],
  );



  // Направление письма и язык страницы — для арабского это не косметика,
  // а работоспособность вёрстки.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = language;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    // lang нужен браузеру и озвучке экрана: перенос слов и голос зависят от него.
    document.documentElement.lang = language;
  }, [language, isRtl]);

  const value = useMemo(
    () => ({ country, language, isRtl, locale, loading, chooseCountry, resetCountry, setLanguage, formatMoney, formatNumber, formatDate }),
    [country, language, isRtl, locale, loading, chooseCountry, resetCountry, setLanguage, formatMoney, formatNumber, formatDate],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale вызван вне LocaleProvider');
  return ctx;
}

/**
 * Язык из сохранённого выбора — для мест, которые находятся выше провайдера
 * (общая граница ошибок). Без выбора — русский.
 */
export function storedLanguage(): LanguageCode {
  try {
    const raw = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null');
    const language = raw?.language;
    return typeof language === 'string' ? (language as LanguageCode) : 'ru';
  } catch {
    return 'ru';
  }
}

/** Символ валюты для подписей полей: «Цена, €» вместо жёсткого «₽». */
export function currencySymbol(currency: string | undefined, locale?: string): string {
  if (!currency) return '';
  try {
    const part = new Intl.NumberFormat(locale ?? 'en-US', { style: 'currency', currency, currencyDisplay: 'narrowSymbol' })
      .formatToParts(0)
      .find((p) => p.type === 'currency');
    return part?.value ?? currency;
  } catch {
    return currency;
  }
}

/** Список стран для экрана выбора — только прошедшие проверку. */
export { getCountries };
