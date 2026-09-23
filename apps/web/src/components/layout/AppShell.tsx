import { Link, Outlet } from 'react-router-dom';
import { Header } from './Header';
import { SafeBoundary } from '../safety/SafeBoundary';
import { useT } from '../../shared/i18n/useT';

/**
 * Каркас приложения.
 *
 * Шапка под своим предохранителем: её сбой раньше ронял всё приложение.
 * Вместо шапки остаётся логотип-ссылка, а экран под ней работает.
 *
 * Общее модальное окно (ModalRoot) удалено: оно не открывалось ни из одного
 * места и не имело стилей. Подтверждения и формы теперь встроены в страницы.
 */
/** Запасная шапка: только логотип, зато на языке интерфейса. */
function HeaderFallback() {
  const t = useT();
  return (
    <header className="header">
      <Link className="logo" to="/" aria-label={t('app.homeLink')}>
        <span>{t('app.name')}</span>
      </Link>
    </header>
  );
}

export function AppShell() {
  return (
    <>
      <SafeBoundary level="block" nameKey="app.mainNav" fallback={<HeaderFallback />}>
        <Header />
      </SafeBoundary>
      <main className="page">
        <Outlet />
      </main>
    </>
  );
}
