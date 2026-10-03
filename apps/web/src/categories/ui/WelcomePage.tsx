import { useMemo, useState } from 'react';
import { useLocale } from '../core/LocaleStore';
import { getCountries } from '../core/countryRegistry';
import { LANGUAGE_NAMES, type Country, type LanguageCode } from '../core/countries';

export function WelcomePage() {
  const { chooseCountry } = useLocale();
  const countries = getCountries();
  const [step, setStep] = useState<'country'|'language'>('country');
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<Country | null>(null);
  const [language, setLanguage] = useState<LanguageCode | null>(null);

  const visible = useMemo(() => {
    const q=query.trim().toLowerCase();
    if(!q) return countries;
    return countries.filter(c => c.nativeName.toLowerCase().includes(q) || c.englishName.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
  },[countries,query]);

  const choose = (c:Country) => { setPicked(c); setLanguage(c.defaultLanguage); };
  const next = () => { if(picked) setStep('language'); };
  const finish = () => { if(picked) chooseCountry(picked.code, language ?? picked.defaultLanguage); };

  return <main className="welcome-v5">
    <section className="welcome-visual" aria-label="Nova — всё рядом">
      <img src="/assets/welcome-reference-top.jpg" alt="Nova — всё рядом" />
    </section>

    {step === 'country' ? <section className="welcome-picker">
      <h1>Выберите страну</h1>
      <p>Страна определяет валюту и доступные объявления.</p>
      <label className="welcome-search"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Найти страну" /></label>
      <div className="welcome-list">
        {visible.map(c => <button type="button" key={c.code} className={`welcome-row${picked?.code===c.code?' selected':''}`} onClick={()=>choose(c)}>
          <span className="welcome-flag">{c.flag}</span><strong>{c.nativeName}</strong><small>{c.code}</small><span className="welcome-check">{picked?.code===c.code?'✓':''}</span>
        </button>)}
      </div>
      <button type="button" className="welcome-continue" disabled={!picked} onClick={next}>Продолжить</button>
    </section> : <section className="welcome-picker language-picker">
      <button type="button" className="welcome-back" onClick={()=>setStep('country')}>‹ Назад</button>
      <h1>Выберите язык</h1>
      <p>Язык интерфейса Nova можно будет изменить позже в профиле.</p>
      <div className="welcome-list language-list">
        {(picked?.languages ?? []).map(l => <button type="button" key={l} className={`welcome-row${language===l?' selected':''}`} onClick={()=>setLanguage(l)}>
          <strong>{LANGUAGE_NAMES[l]}</strong><span className="language-radio">{language===l?'●':'○'}</span>
        </button>)}
      </div>
      <button type="button" className="welcome-continue" disabled={!language} onClick={finish}>Продолжить</button>
    </section>}
  </main>;
}
