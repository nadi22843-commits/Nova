import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { allItems } from '@nova/core';
import { ListingGrid } from '../features/listings/components/ListingGrid';
import { shortsDemo } from '../features/shorts/model/shortsData';
import { CategoryCarousel } from '../components/layout/CategoryCarousel';
import { resolveHomeTiles } from '../categories/core/homeGrid';
import { useLocale } from '../categories/core/LocaleStore';
import { NovaIcon } from '../components/ui/NovaIcon';
import { BlockGuard } from '../components/safety/SafeBoundary';
import { useT } from '../shared/i18n/useT';
import { HeroSlider } from '../components/layout/HeroSlider';
import { useCatalogVersion } from '../shared/api/useServerCatalog';

const POPULAR_COUNT = 6;

/**
 * Подборка «Популярное» для главной.
 *
 * Раньше это были шесть объявлений, зашитых по id: русские города и «₽»
 * независимо от выбранной страны. Теперь подборка берётся из настоящего
 * каталога, отфильтрованного по стране — цена и место показываются через
 * ListingGrid так же, как в остальном приложении (Intl.NumberFormat, а не
 * жёсткий символ валюты).
 *
 * По одному объявлению на категорию, пока не наберётся нужное число — так
 * подборка не превращается в шесть квартир подряд из-за порядка каталога.
 */
function pickPopularIds(countryCode: string | undefined): string[] {
  const items = countryCode ? allItems().filter((i) => i.countryCode === countryCode) : allItems();
  if (items.length === 0) return [];
  const seenCategories = new Set<string>();
  const first: string[] = [];
  const rest: string[] = [];
  for (const item of items) {
    if (!seenCategories.has(item.categoryId)) {
      seenCategories.add(item.categoryId);
      first.push(item.id);
    } else {
      rest.push(item.id);
    }
  }
  return [...first, ...rest].slice(0, POPULAR_COUNT);
}

export function HomePage(){
  const t = useT();
  const { country, formatMoney } = useLocale();
  const catalogVersion = useCatalogVersion();
  const popularIds = useMemo(() => pickPopularIds(country?.code), [country?.code, catalogVersion]);
  // Считается при рендере, а не при загрузке модуля: initCategories() в App.tsx
  // выполняется позже импорта HomePage, и модульная константа навсегда
  // застывала бы с пустым реестром (все плитки — «скоро»).
  const categories = useMemo(() => resolveHomeTiles(), []);
  return <main className="nova-home">
  <HeroSlider />

  <section className="home-section categories-section">
    <div className="section-title"><h2>{t('home.categories')}</h2><Link to="/search">{t('app.allCategories')}</Link></div>
    <BlockGuard name={t('home.categories')}><CategoryCarousel tiles={categories}/></BlockGuard>
  </section>

  <section className="home-section">
    <div className="section-title"><h2>{t('home.popular')}</h2><Link to="/search">{t('home.seeAll')}</Link></div>
    <BlockGuard name={t('home.popular')}><ListingGrid ids={popularIds}/></BlockGuard>
  </section>

  <section className="home-section shorts-home">
    <div className="section-title"><h2>{t('home.shorts')}</h2><Link to="/shorts">{t('home.seeAll')}</Link></div>
    <BlockGuard name={t('home.shorts')}><div className="shorts-row">{shortsDemo.map(s=><Link to="/shorts" className="home-short" key={s.id} style={{backgroundImage:`linear-gradient(0deg,rgba(8,8,12,.78),rgba(8,8,12,0) 60%),url(${s.image})`}}><span className="play">▶</span><div><small>{s.duration}</small><strong>{s.title}</strong><b>{s.priceFrom ? `${t('listing.priceFrom')} ` : ''}{formatMoney(s.price)}</b><em>{s.seller}</em></div></Link>)}</div></BlockGuard>
  </section>

  <section className="benefits-strip">
    <div><span><NovaIcon name="shield"/></span><p><b>{t('home.safeTitle')}</b><small>{t('home.safeText')}</small></p></div>
    <div><span><NovaIcon name="location"/></span><p><b>{t('home.nearTitle')}</b><small>{t('home.nearText')}</small></p></div>
    <div><span><NovaIcon name="star"/></span><p><b>Nova+</b><small>{t('home.plusText')}</small></p></div>
    <div className="stat"><b>2M+</b><small>{t('home.statListings')}</small></div><div className="stat"><b>500K+</b><small>{t('home.statUsers')}</small></div><div className="stat"><b>50+</b><small>{t('home.statCategories')}</small></div><div className="stat"><b>100%</b><small>{t('home.statSafe')}</small></div>
  </section>
</main>}
