import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resolveOptions, loadReference, isReferenceField, translateLabel } from '@nova/core';
import { usePlace } from '../core/places/PlaceStore';
import { PlacePicker } from './PlacePicker';
import { displayName } from '../core/places/search';
import { currencySymbol, useLocale } from '../core/LocaleStore';
import { itemsFor } from '../core/catalogData';
import { filterableFields, matchItem, type FilterValues } from '../core/filtering';

import type { CategoryModule, Subcategory } from '../core/types';
import { safe } from '../../components/safety/safeAction';
import { BlockGuard } from '../../components/safety/SafeBoundary';
import { useT, usePluralListings } from '../../shared/i18n/useT';
import { useCatalogVersion } from '../../shared/api/useServerCatalog';

/**
 * Типовые фильтры.
 *
 * Набор полей берётся из конфигурации подкатегории, поэтому для каждого типа
 * объекта показываются только относящиеся к нему фильтры.
 * Счётчик пересчитывается на каждое изменение — кнопка всегда говорит правду.
 */
export function FiltersPage({ category, sub }: { category: CategoryModule; sub: Subcategory }) {
  const t = useT();
  const pluralListings = usePluralListings();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { selection, select, tree } = usePlace();
  const { language, country } = useLocale();

  // Место правится локально и применяется только по кнопке — как остальные
  // фильтры. Раньше оно писалось в глобальный контекст сразу, и «Назад»
  // оставлял изменение, которого человек не подтверждал.
  const [draftPlace, setDraftPlace] = useState(selection);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [values, setValues] = useState<FilterValues>(() => Object.fromEntries(params.entries()));

  const intentParam = params.get('intent');
  const intent = category.intents.find((i) => i.id === intentParam && i.mode === 'browse');
  const backToList = `${category.path}/list/${sub.id}?${params.toString()}`;

  // Фильтры тоже зависят от вида сделки: у аренды свои поля.
  const fields = filterableFields(sub, intent?.deal);

  const [, forceUpdate] = useState(0);
  // Reference-backed filters (brand/model/profession/etc.) are lazy-loaded.
  // Without this, web filters could render an empty select even though the catalog exists.
  // Loading is async: without forcing a re-render once it settles, the select
  // stays stuck showing "reference unavailable" even after the data arrives.
  useEffect(() => {
    let cancelled = false;
    const pending = fields.filter(isReferenceField).map((field) => loadReference(field.reference!));
    if (pending.length > 0) {
      Promise.allSettled(pending).then(() => {
        if (!cancelled) forceUpdate((n) => n + 1);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [sub, intent?.deal]);
  // Счётчик считает по той же выборке, что и список: только выбранная страна.
  const countryCode = country?.code;
  const catalogVersion = useCatalogVersion();
  const all = useMemo(
    () => itemsFor(category.id, sub.id).filter((i) => !countryCode || i.countryCode === countryCode),
    [category.id, sub.id, countryCode, catalogVersion],
  );
  const count = useMemo(
    () =>
      all.filter((i) =>
        matchItem(i, sub, values, draftPlace, intent?.deal, tree?.places.find((p) => p.id === i.placeId)?.path),
      ).length,
    [all, sub, values, draftPlace, intent, tree],
  );

  function set(key: string, value: string) {
    setValues((prev) => {
      const next = { ...prev };
      if (!value) delete next[key];
      else next[key] = value;

      // A dependent value cannot survive a parent change (e.g. BMW/X5 -> Toyota/X5).
      // Clear only direct dependants; the UI and navigation remain unchanged.
      for (const field of fields) {
        if (field.dependsOn === key) delete next[field.key];
      }
      return next;
    });
  }

  function apply() {
    select(draftPlace);
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(values)) if (v) p.set(k, v);
    // Намерение — часть контекста, оно должно пережить применение фильтров.
    if (intentParam) p.set('intent', intentParam);
    navigate(`${category.path}/list/${sub.id}?${p.toString()}`);
  }

  function reset() {
    setValues({});
    setDraftPlace({ placeId: null });
  }

  return (
    <main className="feature-page">
      <section className="work-panel">
        <div className="nova-filters-head">
          {/* Явный путь вместо navigate(-1): по прямой ссылке или после
              возврата с экрана входа история могла увести из приложения. */}
          <button className="nova-back" onClick={safe(t('app.back'), () => navigate(backToList))} type="button">
            ‹ {t('app.back')}
          </button>
          <h1>{t('list.filters')}</h1>
          <button className="nova-reset" onClick={safe(t('list.reset'), reset)} type="button">
            {t('list.reset')}
          </button>
        </div>

        <label className="nova-field">
          <span>{t('list.place')}</span>
          <button className="nova-field-button" onClick={safe(t('list.place'), () => setPickerOpen(true))} type="button">
            {draftPlace.placeId
              ? displayName(tree?.places.find((p) => p.id === draftPlace.placeId) ?? ({ name: t('list.place'), names: {} } as never), language)
              : t('place.wholeCountry')}
            {draftPlace.radiusKm ? ` · ${draftPlace.radiusKm} км` : ''}
          </button>
        </label>

        {pickerOpen && (
          <BlockGuard name={t('filters.placeChoice')}>
            <PlacePicker value={draftPlace} onChange={setDraftPlace} onClose={() => setPickerOpen(false)} />
          </BlockGuard>
        )}

        <div className="nova-field-row">
          <label className="nova-field">
            <span>{t('listing.priceFrom')}{country ? `, ${currencySymbol(country.currency, country.locale)}` : ''}</span>
            <input
              inputMode="numeric"
              value={values.priceFrom ?? ''}
              onChange={(e) => set('priceFrom', e.target.value)}
            />
          </label>
          <label className="nova-field">
            <span>{t('filters.to')}</span>
            <input inputMode="numeric" value={values.priceTo ?? ''} onChange={(e) => set('priceTo', e.target.value)} />
          </label>
        </div>

        {fields.map((f) =>
          f.filterKind === 'range' ? (
            <div className="nova-field-row" key={f.key}>
              <label className="nova-field">
                <span>
                  {translateLabel(f.label, language)}, {f.type === 'money' && country ? currencySymbol(country.currency, country.locale) : f.unit ? translateLabel(f.unit, language) : t('filters.to')}
                </span>
                <input
                  inputMode="numeric"
                  value={values[`${f.key}.from`] ?? ''}
                  onChange={(e) => set(`${f.key}.from`, e.target.value)}
                />
              </label>
              <label className="nova-field">
                <span>{t('filters.to')}</span>
                <input
                  inputMode="numeric"
                  value={values[`${f.key}.to`] ?? ''}
                  onChange={(e) => set(`${f.key}.to`, e.target.value)}
                />
              </label>
            </div>
          ) : (
            <label className="nova-field" key={f.key}>
              <span>{translateLabel(f.label, language)}</span>
              {/* value задан явно и не зависит от языка: сравнение в matchItem
                  идёт по каноническому (русскому) значению, подпись — переводится. */}
              <select value={values[f.key] ?? ''} onChange={(e) => set(f.key, e.target.value)}>
                <option value="">{t('app.any')}</option>
                {f.type === 'toggle' ? (
                  <>
                    <option value="yes">{t('app.yes')}</option>
                    <option value="no">{t('app.no')}</option>
                  </>
                ) : (
                  // Варианты приходят из справочника или из inline-списка.
                  // Недоступный справочник даёт пустой список — поле просто
                  // не отфильтрует, но экран не сломается.
                  (() => {
                    const r = resolveOptions(f, values as Record<string, string>, sub.id);
                    return r.kind === 'list' ? r.values.map((o) => <option key={o} value={o}>{translateLabel(o, language)}</option>) : null;
                  })()
                )}
              </select>
            </label>
          ),
        )}

        <label className="nova-field">
          <span>{t('seller.who')}</span>
          <select value={values.sellerKind ?? ''} onChange={(e) => set('sellerKind', e.target.value)}>
            <option value="">{t('app.any')}</option>
            <option value="owner">{t('seller.owner')}</option>
            <option value="agent">{t('seller.agent')}</option>
            <option value="company">{t('seller.company')}</option>
          </select>
        </label>

        <button className="primary-action nova-sticky-action" onClick={safe(t('filters.show'), apply)} type="button" disabled={count === 0}>
          {count === 0 ? t('filters.nothing') : t('list.showCount', { count: pluralListings(count) })}
        </button>
      </section>
    </main>
  );
}
