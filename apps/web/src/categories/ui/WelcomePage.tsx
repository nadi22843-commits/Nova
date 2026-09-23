import { useMemo, useState } from 'react';
import { useLocale } from '../core/LocaleStore';
import { getCountries } from '../core/countryRegistry';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { guessCountry, LANGUAGE_NAMES, type Country, type LanguageCode } from '../core/countries';
import { safe } from '../../components/safety/safeAction';
import { useT } from '../../shared/i18n/useT';

/**
 * Экран приветствия.
 *
 * Два шага вместо одного. Раньше нажатие на страну сразу проваливало дальше:
 * человек не успевал понять, что произошло, и не мог выбрать язык — а в
 * Швейцарии их четыре, в ОАЭ три, в Канаде два.
 *
 * Теперь страна выбирается, затем показывается, что именно включится —
 * язык и валюта — и только потом «Продолжить». Выбор языка появляется,
 * только если выбирать есть из чего.
 */
export function WelcomePage() {
  const t = useT();
  const { chooseCountry } = useLocale();
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<Country | null>(null);
  const [language, setPickedLanguage] = useState<LanguageCode | null>(null);

  const countries = getCountries();
  const suggested = useMemo(() => {
    const guess = guessCountry();
    return guess && countries.some((c) => c.code === guess.code) ? guess : undefined;
  }, [countries]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter(
      (c) =>
        c.nativeName.toLowerCase().includes(q) ||
        c.englishName.toLowerCase().includes(q) ||
        c.code.toLowerCase() === q,
    );
  }, [query, countries]);

  function select(country: Country) {
    setPicked(country);
    setPickedLanguage(country.defaultLanguage);
  }

  function confirm() {
    if (!picked) return;
    // Страна и язык применяются одним действием: отдельный setLanguage после
    // chooseCountry видел старое состояние и терял выбор языка.
    chooseCountry(picked.code, language ?? undefined);
  }

  // ── Шаг 2: подтверждение ──
  if (picked) {
    let money = picked.currency;
    try {
      money = new Intl.NumberFormat(picked.locale, {
        style: 'currency',
        currency: picked.currency,
        maximumFractionDigits: 0,
      }).format(2_900_000);
    } catch {
      /* оставляем код валюты */
    }

    return (
      <main className="nova-welcome">
        <div className="welcome-theme-toggle"><ThemeToggle/></div>
        <button className="nova-back" onClick={() => setPicked(null)} type="button">
          ‹ {t('welcome.otherCountry')}
        </button>

        <header>
          <div className="nova-welcome-flag" aria-hidden>
            {picked.flag}
          </div>
          <h1>{picked.nativeName}</h1>
          <p>{t('welcome.summary')}</p>
        </header>

        {/* Язык предлагается только там, где есть выбор. */}
        {picked.languages.length > 1 ? (
          <div className="nova-welcome-block">
            <span className="nova-welcome-label">{t('welcome.appLanguage')}</span>
            <div className="nova-lang-row">
              {picked.languages.map((l) => (
                <button
                  className={`nova-lang${language === l ? ' is-selected' : ''}`}
                  key={l}
                  onClick={() => setPickedLanguage(l)}
                  type="button"
                >
                  {LANGUAGE_NAMES[l]}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="nova-welcome-block">
            <span className="nova-welcome-label">{t('welcome.appLanguage')}</span>
            <b>{LANGUAGE_NAMES[picked.defaultLanguage]}</b>
          </div>
        )}

        <div className="nova-welcome-block">
          <span className="nova-welcome-label">{t('welcome.currency')}</span>
          <b>{t('welcome.currencyPreview', { currency: picked.currency, money })}</b>
        </div>

        <button className="primary-action nova-welcome-cta" onClick={safe(t('welcome.continue'), confirm)} type="button">
          {t('welcome.continue')}
        </button>
      </main>
    );
  }

  // ── Шаг 1: выбор страны ──
  return (
    <main className="nova-welcome">
      <div className="welcome-theme-toggle"><ThemeToggle/></div>
      <header>
        <h1>{t('welcome.title')}</h1>
        <p>{t('welcome.chooseCountryHint')}</p>
      </header>

      {suggested && (
        <button className="nova-country nova-country-suggested" onClick={() => select(suggested)} type="button">
          <span aria-hidden>{suggested.flag}</span>
          <b>{suggested.nativeName}</b>
          <small>{suggested.currency}</small>
        </button>
      )}

      <input
        className="nova-country-search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('welcome.findCountry')}
        aria-label={t('welcome.findCountry')}
      />

      <div className="nova-country-list">
        {visible.map((c) => (
          <button className="nova-country" key={c.code} onClick={() => select(c)} type="button">
            <span aria-hidden>{c.flag}</span>
            <b>{c.nativeName}</b>
            <small>{c.currency}</small>
          </button>
        ))}
      </div>

      {visible.length === 0 && (
        <p className="nova-empty">{t('welcome.countryNotFound', { query })}</p>
      )}
    </main>
  );
}
