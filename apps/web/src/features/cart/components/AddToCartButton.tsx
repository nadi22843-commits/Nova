import { useCart } from '../model/CartStore';
import { safe } from '../../../components/safety/safeAction';
import { useT } from '../../../shared/i18n/useT';
export function AddToCartButton({id}:{id:string}){
  const t = useT();const {ids,toggle}=useCart();const active=ids.includes(id);return <button className="small-action" onClick={safe(t('nav.cart'),()=>toggle(id))}>{active?t('cart.remove'):t('cart.add')}</button>}
