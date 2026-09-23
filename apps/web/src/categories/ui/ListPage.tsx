import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { NovaIcon } from '../../components/ui/NovaIcon';
import { GuardedFavorite } from './GuardedFavorite';
import { ActionGuard, BlockGuard } from '../../components/safety/SafeBoundary';
import { safe } from '../../components/safety/safeAction';
import { usePlace } from '../core/places/PlaceStore';
import { PlacePicker } from './PlacePicker';
import { displayName } from '../core/places/search';
import { itemsFor } from '../core/catalogData';
import { matchItem, sortItems, cardFields, SORT_LABELS, type SortKey } from '../core/filtering';
import { translateLabel } from '@nova/core';
import { currencySymbol, useLocale } from '../core/LocaleStore';
import type { CategoryModule, Subcategory } from '../core/types';
import { useT, usePluralListings } from '../../shared/i18n/useT';
import type { TranslationKey } from '../../shared/i18n';
import { useCatalogVersion } from '../../shared/api/useServerCatalog';

const SORT_LABEL_KEYS: Record<SortKey, TranslationKey> = {
  new: 'list.sortNew',
  'price-asc': 'list.sortPriceAsc',
  'price-desc': 'list.sortPriceDesc',
};

/**
 * Типовой список объявлений.
 *
 * Фильтры живут в URL, поэтому возврат из карточки сохраняет и фильтры,
 * и сортировку — в исходных схемах этот переход был не описан.
 */
export function ListPage({ category, sub }: { category: CategoryModule; sub: Subcategory }) {
  const t = useT();
  const pluralListings = usePluralListings();
  const [params] = useSearchParams();
  const { selection, select, selectedPlace, tree } = usePlace();
  const [pickerOpen, setPickerOpen] = useState(false);
  const { formatMoney, language, country } = useLocale();
  const navigate = useNavigate();

  const values = useMemo(() => Object.fromEntries(params.entries()), [params]);
  const sort = (params.get('sort') as SortKey) || 'new';

  // Намерение, с которым пришли. Если его нет в URL (прямая ссылка), берём
  // первое браузящее — но не молча: заголовок и «Назад» будут ему соответствовать.
  const browseIntents = category.intents.filter((i) => i.mode === 'browse');
  const intent = browseIntents.find((i) => i.id === params.get('intent')) ?? browseIntents[0];
  const publishIntent = category.intents.find((i) => i.mode === 'publish' && i.deal === intent?.deal);

  // Только объявления выбранной страны. Без этого в Германии список показывал
  // российские объявления в рублях (демоданные и объявления есть по нескольким странам).
  const countryCode = country?.code;
  const catalogVersion = useCatalogVersion();
  const all = useMemo(
    () => itemsFor(category.id, sub.id).filter((i) => !countryCode || i.countryCode === countryCode),
    [category.id, sub.id, countryCode, catalogVersion],
  );
  const found = useMemo(
    () => sortItems(all.filter((i) => matchItem(i, sub, values, selection, intent?.deal, tree?.places.find((p) => p.id === i.placeId)?.path)), sort),
    [all, sub, values, selection, sort, intent, tree],
  );

  // «intent» и «sort» — это не фильтры, а контекст экрана.
  const hasFilters = [...params.keys()].some((k) => k !== 'sort' && k !== 'intent');
  const rows = cardFields(sub, intent?.deal).slice(0, 3);

  const runSort = safe(t('list.sort'), (next: SortKey) => changeSort(next));

  function changeSort(next: SortKey) {
    const p = new URLSearchParams(params);
    p.set('sort', next);
    navigate(`?${p.toString()}`, { replace: true });
  }

  return (
    <main className="feature-page">
      {pickerOpen && (
        <BlockGuard name={t('filters.placeChoice')}>
          <PlacePicker value={selection} onChange={select} onClose={() => setPickerOpen(false)} />
        </BlockGuard>
      )}

      <section className="work-panel">
        <button className="nova-back" onClick={safe(t('app.back'), () => navigate(intent ? `${category.path}/browse/${intent.id}` : category.path))} type="button">
          ‹ {t('app.back')}
        </button>

        {/* Заголовок называет и тип объекта, и сделку: «Квартиры — аренда». */}
        <h1>
          {translateLabel(sub.listTitle ?? sub.title, language)}
          {intent && browseIntents.length > 1 ? ` — ${translateLabel(intent.title, language).toLowerCase()}` : ''}
        </h1>
        <p className="nova-counter">{pluralListings(found.length)}</p>

        <div className="nova-list-controls">
          {/* Место известно до открытия списка и видно прямо над ним. */}
          <button className="nova-chip" onClick={safe(t('filters.placeChoice'), () => setPickerOpen(true))} type="button">
            <NovaIcon name="location" size={14} />
            {selectedPlace ? displayName(selectedPlace, language) : t('place.wholeCountry')}
            {selection.radiusKm ? ` · ${selection.radiusKm} км` : ''}
          </button>

          <Link className="nova-chip" to={`${category.path}/filters/${sub.id}?${params.toString()}`}>
            {t('list.filters')}{hasFilters ? ' •' : ''}
          </Link>

          <label className="nova-chip">
            <select value={sort} onChange={(e) => runSort(e.target.value as SortKey)} aria-label={t('list.sort')}>
              {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                <option key={k} value={k}>
                  {t(SORT_LABEL_KEYS[k])}
                </option>
              ))}
            </select>
          </label>
        </div>

        {found.length === 0 ? (
          <div className="nova-empty">
            <p>
              {hasFilters || selection.placeId
                ? t('list.emptyFilters')
                : t('list.emptySection')}
            </p>
            {hasFilters ? (
              <Link className="primary-action" to={`${category.path}/list/${sub.id}`}>
                {t('list.resetFilters')}
              </Link>
            ) : publishIntent ? (
              <Link className="primary-action" to={`${category.path}/publish/${publishIntent.id}/${sub.id}`}>
                {t('nav.publish')}
              </Link>
            ) : (
              <Link className="primary-action" to={category.path}>
                {t('list.otherSections')}
              </Link>
            )}
          </div>
        ) : (
          <div className="listing-grid">
            {found.map((item) => (
              <BlockGuard key={item.id} name={t('published.listingWord')} fallback={null}>
              <article className="listing-card">
                <div className="listing-media">
                  <Link className="listing-image-link" to={`${category.path}/item/${item.id}?${params.toString()}`} aria-label={item.title}>
                    <div className="listing-image" style={{ backgroundImage: `url(${item.image})` }} />
                  </Link>
                  <ActionGuard name={t('nav.favorites')} fallback={null}>
                    <GuardedFavorite id={item.id} />
                  </ActionGuard>
                </div>
                <Link className="listing-link" to={`${category.path}/item/${item.id}?${params.toString()}`}>
                  <div className="listing-body">
                    <strong>{formatMoney(item.price, item.currency)}</strong>
                    <h3>{item.title}</h3>
                    <small>
                      {rows
                        .map((f) => (item.attrs[f.key] ? `${translateLabel(item.attrs[f.key], language)}${f.type === 'money' ? ` ${currencySymbol(item.currency, country?.locale)}` : f.unit ? ` ${f.unit}` : ''}` : null))
                        .filter(Boolean)
                        .join(' · ')}
                    </small>
                    <p>
                      <NovaIcon name="location" size={12} />
                      {tree ? displayName(tree.places.find((p) => p.id === item.placeId) ?? { name: '', names: {} } as never, language) : ''}
                    </p>
                  </div>
                </Link>
              </article>
              </BlockGuard>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
