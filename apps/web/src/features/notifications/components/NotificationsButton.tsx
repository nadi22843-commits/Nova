import {useEffect,useState} from 'react';import {Link} from 'react-router-dom';import {readNotifications} from '../NotificationStore';import {NovaIcon} from '../../../components/ui/NovaIcon';
import { useT } from '../../../shared/i18n/useT';
// Класс header-action не описан в стилях — ссылка выглядела голым текстом в шапке
// и не сворачивалась в иконку на телефоне. Теперь это такая же nav-button,
// как «Избранное» и «Поддержка», со счётчиком непрочитанных.
export function NotificationsButton(){
  const t = useT();const [n,setN]=useState(()=>readNotifications().filter(x=>!x.read).length);useEffect(()=>{const r=()=>setN(readNotifications().filter(x=>!x.read).length);window.addEventListener('nova:notifications',r);window.addEventListener('storage',r);return()=>{window.removeEventListener('nova:notifications',r);window.removeEventListener('storage',r)}},[]);return <Link className="nav-button" to="/notifications" aria-label={n?t('notifications.unread',{count:n}):t('nav.notifications')}><NovaIcon name="bell"/><span>{t('nav.notifications')}</span>{n>0&&<b className="nav-count">{n}</b>}</Link>}
