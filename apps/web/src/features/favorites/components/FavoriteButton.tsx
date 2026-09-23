import { useFavorites } from '../model/FavoritesStore';
import { NovaIcon } from '../../../components/ui/NovaIcon';
import { runSafely } from '../../../components/safety/safeAction';
import { useT } from '../../../shared/i18n/useT';
export function FavoriteButton({id}:{id:string}){
  const t = useT();const {ids,toggle}=useFavorites();const active=ids.includes(id);return <button className={`icon-button${active?' active':''}`} aria-label={active?t('favorite.remove'):t('favorite.add')} onClick={e=>{e.preventDefault();e.stopPropagation();runSafely(t('nav.favorites'),()=>toggle(id))}}><NovaIcon name={active?'heartFilled':'heart'} size={17}/></button>}
