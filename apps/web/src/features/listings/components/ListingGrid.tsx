import {Link} from 'react-router-dom';
import {listings} from '../model/listingsData';
import {FavoriteButton} from '../../favorites/components/FavoriteButton';
import {NovaIcon} from '../../../components/ui/NovaIcon';
import {findItem} from '../../../categories/core/catalogData';
import {getCategory} from '../../../categories/core/registry';
import {useLocale} from '../../../categories/core/LocaleStore';
import {translateLabel} from '@nova/core';
import {ActionGuard,BlockGuard} from '../../../components/safety/SafeBoundary';
import { useT } from '../../../shared/i18n/useT';

/**
 * Сетка объявлений для главной, избранного и корзины.
 *
 * Избранное общее для всего приложения: сердечко ставится и на старых
 * витринных карточках (id '9', '4'…), и на объявлениях категорий
 * (r-1, auto-cars-12, user-…). Раньше сетка знала только витринный список,
 * поэтому объявления из категорий в «Избранном» не появлялись, хотя счётчик
 * в шапке их учитывал.
 */
export function ListingGrid({query='',ids}:{query?:string;ids?:string[]}){
  const t = useT();
  const {formatMoney,language}=useLocale();
  const q=query.toLowerCase();
  const data=listings.filter(x=>(!ids||ids.includes(x.id))&&(!q||`${x.title} ${x.location} ${x.category}`.toLowerCase().includes(q)));
  const known=new Set(listings.map(x=>x.id));
  // Объявления каталога — только когда сетке передан явный список id
  // (избранное, корзина). Порядок — как в списке id.
  const catalogItems=ids?ids.filter(id=>!known.has(id)).map(id=>findItem(id)).filter((x):x is NonNullable<typeof x>=>Boolean(x)):[];
  return <div className="listing-grid">{data.map(x=><article className="listing-card" key={x.id}>
    <div className="listing-media">
      <Link className="listing-image-link" to={`/listing/${x.id}`} aria-label={x.title}>
        <div className="listing-image" style={{backgroundImage:`url(${x.image})`}}/>
      </Link>
      <ActionGuard name={t('nav.favorites')} fallback={null}><FavoriteButton id={x.id}/></ActionGuard>
    </div>
    <Link className="listing-link" to={`/listing/${x.id}`}>
      <div className="listing-body"><strong>{formatMoney(x.price,'RUB')}</strong><h3>{x.title}</h3><p><NovaIcon name="location" size={12}/>{x.location}, {t('app.today')}</p></div>
    </Link>
  </article>)}{catalogItems.map(x=>{
    // Путь категории берём из реестра: у «Для дома» id 'home', а путь '/home-goods'.
    const to=`${getCategory(x.categoryId)?.path??`/${x.categoryId}`}/item/${x.id}`;
    // Карточка объявления каталога под своим предохранителем: одна битая запись
    // (например, из повреждённого localStorage) не убирает всю сетку.
    return <BlockGuard key={x.id} name={t('published.listingWord')} fallback={null}><article className="listing-card">
      <div className="listing-media">
        <Link className="listing-image-link" to={to} aria-label={x.title}>
          <div className="listing-image" style={{backgroundImage:`url(${x.image})`}}/>
        </Link>
        <ActionGuard name={t('nav.favorites')} fallback={null}><FavoriteButton id={x.id}/></ActionGuard>
      </div>
      <Link className="listing-link" to={to}>
        <div className="listing-body"><strong>{formatMoney(x.price,x.currency)}</strong><h3>{x.title}</h3><p><NovaIcon name="location" size={12}/>{translateLabel(getCategory(x.categoryId)?.title,language)}</p></div>
      </Link>
    </article></BlockGuard>})}</div>
}
