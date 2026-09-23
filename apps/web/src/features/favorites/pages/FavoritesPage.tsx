import { useFavorites } from '../model/FavoritesStore';import { ListingGrid } from '../../listings/components/ListingGrid';
import { useT } from '../../../shared/i18n/useT';
export function FavoritesPage(){
  const t = useT();const {ids}=useFavorites();return <main className="page"><h1>{t('favorites.title')}</h1>{ids.length?<ListingGrid ids={ids}/>:<p>{t('favorites.empty')}</p>}</main>}
