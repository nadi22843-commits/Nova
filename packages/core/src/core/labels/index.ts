import type { LanguageCode } from '../countries';
import { labels as en } from './en';
import { labels as de } from './de';
import { labels as es } from './es';
import { labels as fr } from './fr';
import { labels as pt } from './pt';
import { labels as tr } from './tr';
import { labels as ar } from './ar';
import { labels as hi } from './hi';
import { labels as zh } from './zh';

/**
 * Перевод текста категорий/подкатегорий/полей/значений.
 *
 * Конфигурации категорий (packages/core/src/<category>/index.ts) описаны на
 * русском — это удобно для правки и не разъезжается с фильтрами/карточкой
 * (см. CATEGORIES.md, «одно поле — три экрана»). Но пользователю нужно видеть
 * текст на выбранном языке, поэтому оригинальная русская строка — это ключ
 * словаря переводов, а не текст для показа.
 *
 * Отсутствие перевода не ломает экран: показывается русский оригинал —
 * тот же принцип запасного варианта, что и в shared/i18n.
 */
const LABEL_MAPS: Partial<Record<LanguageCode, Record<string, string>>> = { en, de, es, fr, pt, tr, ar, hi, zh };

export function translateLabel(text: string | undefined, language: LanguageCode): string {
  if (!text) return '';
  if (language === 'ru') return text;
  const map = LABEL_MAPS[language];
  return map?.[text] ?? text;
}

/** Языки, для которых карта переводов категорий подключена. */
export const LABEL_TRANSLATED_LANGUAGES = Object.keys(LABEL_MAPS) as LanguageCode[];
