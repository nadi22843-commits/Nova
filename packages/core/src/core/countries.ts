/**
 * Справочник стран.
 *
 * Страна — корень всей локализации: из неё выводятся валюта, язык по умолчанию,
 * формат чисел и дат, телефонный код.
 *
 * Важно: страна и язык связаны не один к одному. В Швейцарии четыре
 * официальных языка, в Канаде два, в Бельгии три. Поэтому страна задаёт язык
 * по умолчанию, а не единственно возможный — пользователь может выбрать другой
 * из списка доступных.
 *
 * Валюта хранится кодом ISO 4217, а не символом: символ зависит от локали
 * отображения и подставляется через Intl.NumberFormat.
 */

export type LanguageCode = 'ru' | 'en' | 'es' | 'de' | 'fr' | 'pt' | 'tr' | 'ar' | 'hi' | 'zh';

export type Country = {
  /** ISO 3166-1 alpha-2. Стабильный ключ — не меняется при переводе. */
  code: string;
  /** Название на родном языке страны. */
  nativeName: string;
  /** Название по-английски — запасной вариант для поиска. */
  englishName: string;
  flag: string;
  /** ISO 4217. */
  currency: string;
  /** Язык, который включается сразу после выбора страны. */
  defaultLanguage: LanguageCode;
  /** Языки, доступные пользователю в этой стране. */
  languages: LanguageCode[];
  /** BCP 47 — для Intl: форматы чисел, дат, валюты. */
  locale: string;
  phoneCode: string;
};

export const COUNTRIES: Country[] = [
  { code: 'RU', nativeName: 'Россия', englishName: 'Russia', flag: '🇷🇺', currency: 'RUB', defaultLanguage: 'ru', languages: ['ru', 'en'], locale: 'ru-RU', phoneCode: '+7' },
  { code: 'KZ', nativeName: 'Қазақстан', englishName: 'Kazakhstan', flag: '🇰🇿', currency: 'KZT', defaultLanguage: 'ru', languages: ['ru', 'en'], locale: 'ru-KZ', phoneCode: '+7' },
  { code: 'BY', nativeName: 'Беларусь', englishName: 'Belarus', flag: '🇧🇾', currency: 'BYN', defaultLanguage: 'ru', languages: ['ru', 'en'], locale: 'ru-BY', phoneCode: '+375' },
  { code: 'UZ', nativeName: "O'zbekiston", englishName: 'Uzbekistan', flag: '🇺🇿', currency: 'UZS', defaultLanguage: 'ru', languages: ['ru', 'en'], locale: 'ru-UZ', phoneCode: '+998' },
  { code: 'GE', nativeName: 'საქართველო', englishName: 'Georgia', flag: '🇬🇪', currency: 'GEL', defaultLanguage: 'en', languages: ['en', 'ru'], locale: 'en-GE', phoneCode: '+995' },
  { code: 'AM', nativeName: 'Հայաստան', englishName: 'Armenia', flag: '🇦🇲', currency: 'AMD', defaultLanguage: 'ru', languages: ['ru', 'en'], locale: 'ru-AM', phoneCode: '+374' },

  { code: 'US', nativeName: 'United States', englishName: 'United States', flag: '🇺🇸', currency: 'USD', defaultLanguage: 'en', languages: ['en', 'es'], locale: 'en-US', phoneCode: '+1' },
  { code: 'GB', nativeName: 'United Kingdom', englishName: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', defaultLanguage: 'en', languages: ['en'], locale: 'en-GB', phoneCode: '+44' },
  { code: 'CA', nativeName: 'Canada', englishName: 'Canada', flag: '🇨🇦', currency: 'CAD', defaultLanguage: 'en', languages: ['en', 'fr'], locale: 'en-CA', phoneCode: '+1' },
  { code: 'DE', nativeName: 'Deutschland', englishName: 'Germany', flag: '🇩🇪', currency: 'EUR', defaultLanguage: 'de', languages: ['de', 'en', 'tr'], locale: 'de-DE', phoneCode: '+49' },
  { code: 'FR', nativeName: 'France', englishName: 'France', flag: '🇫🇷', currency: 'EUR', defaultLanguage: 'fr', languages: ['fr', 'en'], locale: 'fr-FR', phoneCode: '+33' },
  { code: 'ES', nativeName: 'España', englishName: 'Spain', flag: '🇪🇸', currency: 'EUR', defaultLanguage: 'es', languages: ['es', 'en'], locale: 'es-ES', phoneCode: '+34' },
  { code: 'PT', nativeName: 'Portugal', englishName: 'Portugal', flag: '🇵🇹', currency: 'EUR', defaultLanguage: 'pt', languages: ['pt', 'en'], locale: 'pt-PT', phoneCode: '+351' },
  { code: 'CH', nativeName: 'Schweiz', englishName: 'Switzerland', flag: '🇨🇭', currency: 'CHF', defaultLanguage: 'de', languages: ['de', 'fr', 'en'], locale: 'de-CH', phoneCode: '+41' },
  { code: 'PL', nativeName: 'Polska', englishName: 'Poland', flag: '🇵🇱', currency: 'PLN', defaultLanguage: 'en', languages: ['en', 'ru'], locale: 'pl-PL', phoneCode: '+48' },

  { code: 'TR', nativeName: 'Türkiye', englishName: 'Turkey', flag: '🇹🇷', currency: 'TRY', defaultLanguage: 'tr', languages: ['tr', 'en', 'ru'], locale: 'tr-TR', phoneCode: '+90' },
  { code: 'AE', nativeName: 'الإمارات', englishName: 'United Arab Emirates', flag: '🇦🇪', currency: 'AED', defaultLanguage: 'ar', languages: ['ar', 'en', 'ru'], locale: 'ar-AE', phoneCode: '+971' },
  { code: 'SA', nativeName: 'السعودية', englishName: 'Saudi Arabia', flag: '🇸🇦', currency: 'SAR', defaultLanguage: 'ar', languages: ['ar', 'en'], locale: 'ar-SA', phoneCode: '+966' },

  { code: 'BR', nativeName: 'Brasil', englishName: 'Brazil', flag: '🇧🇷', currency: 'BRL', defaultLanguage: 'pt', languages: ['pt', 'en'], locale: 'pt-BR', phoneCode: '+55' },
  { code: 'MX', nativeName: 'México', englishName: 'Mexico', flag: '🇲🇽', currency: 'MXN', defaultLanguage: 'es', languages: ['es', 'en'], locale: 'es-MX', phoneCode: '+52' },
  { code: 'AR', nativeName: 'Argentina', englishName: 'Argentina', flag: '🇦🇷', currency: 'ARS', defaultLanguage: 'es', languages: ['es', 'en'], locale: 'es-AR', phoneCode: '+54' },

  { code: 'IN', nativeName: 'भारत', englishName: 'India', flag: '🇮🇳', currency: 'INR', defaultLanguage: 'hi', languages: ['hi', 'en'], locale: 'hi-IN', phoneCode: '+91' },
  { code: 'CN', nativeName: '中国', englishName: 'China', flag: '🇨🇳', currency: 'CNY', defaultLanguage: 'zh', languages: ['zh', 'en'], locale: 'zh-CN', phoneCode: '+86' },
  { code: 'ID', nativeName: 'Indonesia', englishName: 'Indonesia', flag: '🇮🇩', currency: 'IDR', defaultLanguage: 'en', languages: ['en'], locale: 'id-ID', phoneCode: '+62' },
  { code: 'ZA', nativeName: 'South Africa', englishName: 'South Africa', flag: '🇿🇦', currency: 'ZAR', defaultLanguage: 'en', languages: ['en'], locale: 'en-ZA', phoneCode: '+27' },
  { code: 'NG', nativeName: 'Nigeria', englishName: 'Nigeria', flag: '🇳🇬', currency: 'NGN', defaultLanguage: 'en', languages: ['en'], locale: 'en-NG', phoneCode: '+234' },
  { code: 'EG', nativeName: 'مصر', englishName: 'Egypt', flag: '🇪🇬', currency: 'EGP', defaultLanguage: 'ar', languages: ['ar', 'en'], locale: 'ar-EG', phoneCode: '+20' },
];

export const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  ru: 'Русский',
  en: 'English',
  es: 'Español',
  de: 'Deutsch',
  fr: 'Français',
  pt: 'Português',
  tr: 'Türkçe',
  ar: 'العربية',
  hi: 'हिन्दी',
  zh: '中文',
};

/** Языки с письмом справа налево — влияет на направление всего интерфейса. */
export const RTL_LANGUAGES: LanguageCode[] = ['ar'];

export function findCountry(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code.toUpperCase());
}

/** Поиск по обоим названиям и коду — человек может ввести любое. */
export function searchCountries(query: string): Country[] {
  const q = query.trim().toLowerCase();
  if (!q) return COUNTRIES;
  return COUNTRIES.filter(
    (c) =>
      c.nativeName.toLowerCase().includes(q) ||
      c.englishName.toLowerCase().includes(q) ||
      c.code.toLowerCase() === q,
  );
}

/**
 * Подсказка страны по часовому поясу устройства.
 *
 * Это только предзаполнение выбора, а не решение за пользователя: часовой пояс
 * ошибается при VPN и в приграничных зонах, поэтому выбор всё равно
 * подтверждает человек.
 */
export function guessCountry(): Country | undefined {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? '';
    const map: Record<string, string> = {
      'Europe/Moscow': 'RU',
      'Europe/Kaliningrad': 'RU',
      'Asia/Yekaterinburg': 'RU',
      'Asia/Novosibirsk': 'RU',
      'Asia/Vladivostok': 'RU',
      'Asia/Almaty': 'KZ',
      'Asia/Tashkent': 'UZ',
      'Europe/Minsk': 'BY',
      'Asia/Tbilisi': 'GE',
      'Asia/Yerevan': 'AM',
      'Europe/Berlin': 'DE',
      'Europe/Paris': 'FR',
      'Europe/Madrid': 'ES',
      'Europe/Lisbon': 'PT',
      'Europe/Zurich': 'CH',
      'Europe/Warsaw': 'PL',
      'Europe/London': 'GB',
      'Europe/Istanbul': 'TR',
      'America/New_York': 'US',
      'America/Chicago': 'US',
      'America/Los_Angeles': 'US',
      'America/Toronto': 'CA',
      'America/Sao_Paulo': 'BR',
      'America/Mexico_City': 'MX',
      'America/Argentina/Buenos_Aires': 'AR',
      'Asia/Dubai': 'AE',
      'Asia/Riyadh': 'SA',
      'Asia/Kolkata': 'IN',
      'Asia/Shanghai': 'CN',
      'Asia/Jakarta': 'ID',
      'Africa/Johannesburg': 'ZA',
      'Africa/Lagos': 'NG',
      'Africa/Cairo': 'EG',
    };
    return map[tz] ? findCountry(map[tz]) : undefined;
  } catch {
    return undefined;
  }
}
