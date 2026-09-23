import { COUNTRIES, type Country, type LanguageCode, LANGUAGE_NAMES } from './countries';

/**
 * Реестр стран.
 *
 * Тот же принцип автономности, что и у категорий: битая страна отбрасывается
 * по одной. Если запись про Индию сломана, Индия исчезает из списка — Китай,
 * Германия и все остальные работают.
 *
 * Отдельный случай: страна ломается не при сборке, а после релиза — например,
 * пользователь уже выбрал Индию, а в новой версии её запись стала невалидной.
 * Тогда сохранённый выбор не проходит проверку, и человек попадает на экран
 * выбора страны заново, а не в неработающее приложение.
 */

export type CountryStatus = 'ok' | 'dropped';

const registry = new Map<string, Country>();
const dropped: { code: string; reason: string }[] = [];

function isNonEmpty(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

/** ISO 4217 — три заглавные буквы. Проверяем формально, а не по списку. */
function isCurrencyCode(v: unknown): v is string {
  return typeof v === 'string' && /^[A-Z]{3}$/.test(v);
}

/** ISO 3166-1 alpha-2. */
function isCountryCode(v: unknown): v is string {
  return typeof v === 'string' && /^[A-Z]{2}$/.test(v);
}

/**
 * Проверка того, что среда умеет форматировать деньги этой валютой и локалью.
 *
 * Одной проверки формата мало: Intl принимает любой трёхбуквенный код и молча
 * печатает его как есть, поэтому опечатка вида «XXZ» доехала бы до экрана
 * пользователя в виде «XXZ 300 000». Сверяемся со списком валют, который знает
 * сама среда, и только потом пробуем отформатировать.
 */
function canFormat(locale: string, currency: string): boolean {
  try {
    const known = typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('currency') : null;
    if (known && !known.includes(currency)) return false;
    new Intl.NumberFormat(locale, { style: 'currency', currency }).format(1);
    return true;
  } catch {
    return false;
  }
}

function validateCountry(input: unknown): { country: Country | null; reason?: string } {
  if (!input || typeof input !== 'object') return { country: null, reason: 'запись не является объектом' };
  const c = input as Partial<Country>;

  if (!isCountryCode(c.code)) return { country: null, reason: 'некорректный код страны' };
  if (!isNonEmpty(c.nativeName) || !isNonEmpty(c.englishName)) {
    return { country: null, reason: `${c.code}: нет названия` };
  }
  if (!isCurrencyCode(c.currency)) return { country: null, reason: `${c.code}: некорректный код валюты` };
  if (!isNonEmpty(c.locale)) return { country: null, reason: `${c.code}: не указана локаль` };

  if (!Array.isArray(c.languages) || c.languages.length === 0) {
    return { country: null, reason: `${c.code}: не указаны языки` };
  }

  // Отбрасываем языки, для которых нет словаря названий, — но страну оставляем,
  // если хотя бы один язык уцелел.
  const languages = c.languages.filter((l): l is LanguageCode => Boolean(LANGUAGE_NAMES[l as LanguageCode]));
  if (languages.length === 0) return { country: null, reason: `${c.code}: ни один язык не поддерживается` };

  // Язык по умолчанию обязан быть среди доступных, иначе интерфейс включится
  // на языке, которого нет в переключателе.
  const defaultLanguage = languages.includes(c.defaultLanguage as LanguageCode)
    ? (c.defaultLanguage as LanguageCode)
    : languages[0];

  if (!canFormat(c.locale, c.currency)) {
    return { country: null, reason: `${c.code}: среда не может отформатировать ${c.currency} в локали ${c.locale}` };
  }

  return {
    country: {
      code: c.code,
      nativeName: c.nativeName,
      englishName: c.englishName,
      flag: isNonEmpty(c.flag) ? c.flag : '🏳️',
      currency: c.currency,
      defaultLanguage,
      languages,
      locale: c.locale,
      phoneCode: isNonEmpty(c.phoneCode) ? c.phoneCode : '',
    },
  };
}

let initialized = false;

export function initCountries(source: unknown[] = COUNTRIES): void {
  if (initialized) return;
  initialized = true;

  for (const raw of source) {
    let code = 'unknown';
    try {
      code = (raw as Partial<Country>)?.code ?? 'unknown';
      const { country, reason } = validateCountry(raw);
      if (!country) {
        dropped.push({ code, reason: reason ?? 'не прошла проверку' });
        continue;
      }
      if (registry.has(country.code)) {
        dropped.push({ code: country.code, reason: 'дубликат' });
        continue;
      }
      registry.set(country.code, country);
    } catch (error) {
      // Запись упала прямо при чтении — следующие страны это не касается.
      dropped.push({ code, reason: String(error) });
    }
  }

  if (dropped.length > 0) {
    console.warn('[Nova/countries] отключены страны:', dropped);
  }
}

export function getCountries(): Country[] {
  // Сортируем по названию в порядке, понятном человеку.
  return [...registry.values()].sort((a, b) => a.englishName.localeCompare(b.englishName));
}

export function getCountry(code: string): Country | undefined {
  return registry.get(code.toUpperCase());
}

/** Страна доступна, только если прошла проверку. */
export function isCountryAvailable(code: string): boolean {
  return registry.has(code.toUpperCase());
}

export function getCountriesHealth() {
  return { ok: [...registry.keys()], dropped: [...dropped] };
}

/** Только для тестов. */
export function resetCountries(): void {
  registry.clear();
  dropped.length = 0;
  initialized = false;
}
