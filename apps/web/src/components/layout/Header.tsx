import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { SupportButton } from '../../features/support/components/SupportButton';
import { FavoritesButton } from '../../features/favorites/components/FavoritesButton';
import { LoginButton } from '../../features/auth/components/LoginButton';
import { PublishButton } from '../../features/publish/components/PublishButton';
import { NovaIcon } from '../ui/NovaIcon';
import { ThemeToggle } from '../ui/ThemeToggle';
import { NotificationsButton } from '../../features/notifications/components/NotificationsButton';
import { ActionGuard } from '../safety/SafeBoundary';
import { safe } from '../safety/safeAction';
import { useT } from '../../shared/i18n/useT';

export function Header() {
  const t = useT();
  const [q, setQ] = useState('');
  const nav = useNavigate();

  return <header className="header">
    <Link className="logo" to="/" aria-label={t('app.homeLink')}>
      <NovaIcon name="logo" size={30}/><span>{t('app.name')}</span>
    </Link>

    <form className="header-search" onSubmit={e => { e.preventDefault(); safe(t('app.search'), () => nav(`/search?q=${encodeURIComponent(q.trim())}`))(); }}>
      <NovaIcon name="search" size={19}/>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder={t('app.searchPlaceholder')}/>
      <button className="search-filter-button" type="button" aria-label="Фильтры" title="Фильтры" onClick={() => nav(`/search${q.trim() ? `?q=${encodeURIComponent(q.trim())}&filters=1` : '?filters=1'}`)}><NovaIcon name="filter" size={18}/></button>
      <button className="search-submit-button" type="submit"><NovaIcon name="search" size={17}/><span>{t('app.search')}</span></button>
    </form>

    <nav className="nav-actions" aria-label={t('app.mainNav')}>
      {/* Каждая кнопка шапки под своим предохранителем: сбой одной
          (например, счётчика уведомлений) не убирает остальные. */}
      <ActionGuard name={t('nav.theme')} fallback={null}><ThemeToggle/></ActionGuard>
      <ActionGuard name={t('nav.support')}><SupportButton/></ActionGuard>
      <ActionGuard name={t('nav.notifications')}><NotificationsButton/></ActionGuard>
      <ActionGuard name={t('nav.favorites')}><FavoritesButton/></ActionGuard>
      {/* Публикация перед кабинетом: это главное действие на доске
          объявлений, и оно должно стоять раньше служебного входа. */}
      <ActionGuard name={t('nav.publish')}><PublishButton/></ActionGuard>
      <ActionGuard name={t('nav.account')}><LoginButton/></ActionGuard>
    </nav>
  </header>;
}
