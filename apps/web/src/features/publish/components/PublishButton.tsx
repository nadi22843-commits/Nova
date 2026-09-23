import { useNavigate } from 'react-router-dom';
import { NovaIcon } from '../../../components/ui/NovaIcon';
import { useAuth } from '../../../categories/core/AuthGate';
import { safe } from '../../../components/safety/safeAction';
import { useT } from '../../../shared/i18n/useT';

/**
 * Кнопка размещения объявления.
 *
 * Знает, вошёл ли человек. Незалогиненного уводит на вход и возвращает
 * обратно к публикации — форма не теряется. Раньше кнопка вела на форму
 * всегда, и человек упирался в требование входа только в конце, заполнив
 * все шаги.
 */
export function PublishButton() {
  const t = useT();
  const navigate = useNavigate();
  const { isSignedIn, requireAuth } = useAuth();

  function open() {
    // requireAuth сам уведёт на вход и запомнит, куда вернуть.
    if (!requireAuth('publish')) return;
    navigate('/publish');
  }

  return (
    <button
      className="primary-nav-button"
      onClick={safe(t('nav.publish'), open)}
      title={isSignedIn ? t('nav.publish') : t('login.reason', { action: t('auth.action.publish') })}
    >
      <NovaIcon name="plus" size={18} />
      <span>{t('nav.publish')}</span>
    </button>
  );
}
