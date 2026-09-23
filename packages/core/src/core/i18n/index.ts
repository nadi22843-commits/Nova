import { ru, type Dict, type TranslationKey } from './dictionaries/ru';
import { en } from './dictionaries/en';
import { de } from './dictionaries/de';
import { es } from './dictionaries/es';
import { fr } from './dictionaries/fr';
import { pt } from './dictionaries/pt';
import { tr } from './dictionaries/tr';
import { ar } from './dictionaries/ar';
import { hi } from './dictionaries/hi';
import { zh } from './dictionaries/zh';
import type { LanguageCode } from '../countries';

/**
 * Перевод интерфейса.
 *
 * Язык берётся из выбора страны (у каждой страны свой язык по умолчанию) и
 * может быть изменён человеком вручную — выбор сохраняется вместе со страной.
 *
 * Цепочка запасных вариантов: выбранный язык → английский → русский.
 * Поэтому язык без словаря не оставляет пустой экран, а показывает английский.
 *
 * Словари типизированы по русскому: забытый ключ — ошибка сборки, а не
 * пустое место в интерфейсе.
 */

const DICTIONARIES: Partial<Record<LanguageCode, Dict>> = { ru, en, de, es, fr, pt, tr, ar, hi, zh };

/** Языки, для которых перевод интерфейса уже есть. */
export const TRANSLATED_LANGUAGES = Object.keys(DICTIONARIES) as LanguageCode[];

export function hasTranslation(language: LanguageCode): boolean {
  return Boolean(DICTIONARIES[language]);
}

const missingReported = new Set<string>();

/** Подстановки: t('search.results', { count: 12 }). */
export type TranslationParams = Record<string, string | number>;

export function translate(language: LanguageCode, key: TranslationKey, params?: TranslationParams): string {
  const dictionary = DICTIONARIES[language];
  const template = dictionary?.[key] ?? en[key] ?? ru[key];

  if (!template) {
    // Ключа нет нигде — в разработке это видно сразу, в проде показываем ключ.
    if (!missingReported.has(key)) {
      missingReported.add(key);
      console.error(`[Nova/i18n] нет перевода для ключа «${key}»`);
    }
    return key;
  }

  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    params[name] === undefined ? match : String(params[name]),
  );
}

/**
 * Число объявлений с правильной формой множественного числа.
 *
 * Раньше форма была зашита под русский («объявление/объявления/объявлений»)
 * и не менялась с языком. Категория формы (one/few/many/other…) берётся из
 * Intl.PluralRules — так у каждого языка своя грамматика, а не транслитерация
 * русской.
 */
export function translatePlural(language: LanguageCode, count: number): string {
  let category: Intl.LDMLPluralRule = 'other';
  try {
    category = new Intl.PluralRules(language).select(count);
  } catch {
    // Незнакомая языковая метка — используем общую форму.
  }
  const key = `list.count.${category}` as TranslationKey;
  return translate(language, key, { count });
}

export type { Dict, TranslationKey };
export { ru, en, de, es, fr, pt, tr, ar, hi, zh };
