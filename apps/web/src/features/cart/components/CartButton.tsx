import { useNavigate } from 'react-router-dom';
import { useCart } from '../model/CartStore';
import { NovaIcon } from '../../../components/ui/NovaIcon';
import { useT } from '../../../shared/i18n/useT';
export function CartButton(){
  const t = useT();const n=useNavigate();const {ids}=useCart();return <button className="nav-button" onClick={()=>n('/cart')}><NovaIcon name="cart"/><span>{t('nav.cart')}</span>{ids.length>0&&<b className="nav-count">{ids.length}</b>}</button>}
