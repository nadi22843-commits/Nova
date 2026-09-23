import {useCart} from '../model/CartStore';import {ListingGrid} from '../../listings/components/ListingGrid';
import { useT } from '../../../shared/i18n/useT';
export function CartPage(){
  const t = useT();const {ids}=useCart();return <main className="page"><h1>{t('cart.title')}</h1>{ids.length?<ListingGrid ids={ids}/>:<p>{t('cart.empty')}</p>}</main>}
