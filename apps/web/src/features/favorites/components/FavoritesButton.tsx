import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../model/FavoritesStore';
import { NovaIcon } from '../../../components/ui/NovaIcon';
import { safe } from '../../../components/safety/safeAction';
import { useT } from '../../../shared/i18n/useT';
export function FavoritesButton(){
  const t = useT();const navigate=useNavigate();const {ids}=useFavorites();return <button className="nav-button" onClick={safe(t('nav.favorites'),()=>navigate('/favorites'))}><NovaIcon name="heart"/><span>{t('nav.favorites')}</span>{ids.length>0&&<b className="nav-count">{ids.length}</b>}</button>}
