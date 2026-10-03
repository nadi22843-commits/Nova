import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { allItems } from '@nova/core';
import { ListingGrid } from '../features/listings/components/ListingGrid';
import { CategoryCarousel } from '../components/layout/CategoryCarousel';
import { resolveHomeTiles } from '../categories/core/homeGrid';
import { useLocale } from '../categories/core/LocaleStore';
import { BlockGuard } from '../components/safety/SafeBoundary';
import { useT } from '../shared/i18n/useT';
import { HeroSlider } from '../components/layout/HeroSlider';
import { useCatalogVersion } from '../shared/api/useServerCatalog';
import { shortsDemo } from '../features/shorts/model/shortsData';

const POPULAR_COUNT=6;
function pickPopularIds(countryCode:string|undefined){
 const items=countryCode?allItems().filter(i=>i.countryCode===countryCode):allItems();
 const seen=new Set<string>(), first:string[]=[], rest:string[]=[];
 for(const item of items){ if(!seen.has(item.categoryId)){seen.add(item.categoryId);first.push(item.id)}else rest.push(item.id) }
 return [...first,...rest].slice(0,POPULAR_COUNT);
}

export function HomePage(){
 const t=useT(); const {country}=useLocale(); const catalogVersion=useCatalogVersion();
 const popularIds=useMemo(()=>pickPopularIds(country?.code),[country?.code,catalogVersion]);
 const categories=useMemo(()=>resolveHomeTiles(),[]);
 return <main className="nova-home home-feed-v5">
   <section className="home-section categories-section">
     <BlockGuard name={t('home.categories')}><CategoryCarousel tiles={categories}/></BlockGuard>
   </section>
   <section className="home-promo"><HeroSlider/></section>
   <section className="home-section home-shorts-section">
     <div className="section-title"><h2>Shorts Nova</h2><Link to="/shorts">Смотреть все →</Link></div>
     <div className="shorts-feed-row">{shortsDemo.slice(0,10).map(s=><Link className="feed-short" to="/shorts" key={s.id} style={{backgroundImage:`linear-gradient(0deg,rgba(6,7,15,.78),rgba(6,7,15,.02) 65%),url(${s.image})`}}><span className="feed-play">▶</span><strong>{s.title}</strong></Link>)}</div>
   </section>
   <section className="home-section popular-feed-section">
     <div className="section-title"><h2>Популярные объявления</h2><Link to="/search">{t('home.seeAll')} →</Link></div>
     <BlockGuard name={t('home.popular')}><ListingGrid ids={popularIds}/></BlockGuard>
   </section>
 </main>;
}
