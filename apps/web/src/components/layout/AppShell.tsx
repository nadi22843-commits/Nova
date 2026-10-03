import { Link, Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { SafeBoundary } from '../safety/SafeBoundary';
import { useT } from '../../shared/i18n/useT';
import { NovaIcon } from '../ui/NovaIcon';

function HeaderFallback() {
  const t = useT();
  return <header className="header"><Link className="logo" to="/" aria-label={t('app.homeLink')}><span>{t('app.name')}</span></Link></header>;
}

function MobileBottomNav(){
  const { pathname } = useLocation();
  const items = [
    ['/', 'home', 'Главная'],
    ['/favorites', 'heart', 'Избранное'],
    ['/publish', 'plus', 'Подать'],
    ['/messages', 'chat', 'Сообщения'],
    ['/account', 'user', 'Профиль'],
  ] as const;
  return <nav className="mobile-bottom-nav" aria-label="Мобильная навигация">
    {items.map(([to, icon, label]) => <Link key={to} to={to} className={`${to === '/publish' ? 'mobile-publish' : ''}${pathname === to ? ' active' : ''}`}><NovaIcon name={icon} size={to === '/publish' ? 27 : 23}/><span>{label}</span></Link>)}
  </nav>;
}

export function AppShell() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  return <>
    <SafeBoundary level="block" nameKey="app.mainNav" fallback={<HeaderFallback />}><Header /></SafeBoundary>
    {!isHome && <Link className="global-mobile-back" to="/" aria-label="Вернуться на главную">‹ <span>Главная</span></Link>}
    <main className="page"><Outlet /></main>
    <MobileBottomNav />
  </>;
}
