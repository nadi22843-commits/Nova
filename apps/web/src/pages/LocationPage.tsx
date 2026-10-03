import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocale } from '../categories/core/LocaleStore';
import { usePlace } from '../categories/core/places/PlaceStore';
import { PlacePicker } from '../categories/ui/PlacePicker';
import { displayName } from '../categories/core/places/registry';
import { useT } from '../shared/i18n/useT';

export function LocationPage(){
  const nav = useNavigate();
  const t = useT();
  const { country, language, resetCountry } = useLocale();
  const { selection, select, selectedPlace } = usePlace();
  const [picker, setPicker] = useState(false);
  const place = selectedPlace ? displayName(selectedPlace, language) : t('place.wholeCountry');
  return <main className="feature-page location-page">
    <button className="nova-back" onClick={() => nav(-1)}>‹ {t('app.back')}</button>
    <h1>Страна и город</h1>
    <section className="panel location-panel">
      <button className="location-row" onClick={resetCountry}><span>Страна</span><b>{country?.nativeName}</b><strong>›</strong></button>
      <button className="location-row" onClick={() => setPicker(true)}><span>Город / регион</span><b>{place}</b><strong>›</strong></button>
    </section>
    {picker && <PlacePicker value={selection} onChange={(next) => { select(next); setPicker(false); }} onClose={() => setPicker(false)} />}
  </main>;
}
