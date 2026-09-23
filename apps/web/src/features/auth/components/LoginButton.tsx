import { useNavigate } from 'react-router-dom';
import { NovaIcon } from '../../../components/ui/NovaIcon';
import { useAuth } from '../../../categories/core/AuthGate';
import { safe } from '../../../components/safety/safeAction';
import { useT } from '../../../shared/i18n/useT';

/**
 * Личный кабинет или вход.
 *
 * Подпись зависит от состояния: вошедшего ведём в кабинет, остальных —
 * на вход. Кнопка «Личный кабинет», которая открывает форму входа,
 * обманывает ожидание.
 */
export function LoginButton() {
  const t = useT();
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();

  return (
    <button
      className="nav-button account-nav"
      onClick={safe(t('nav.account'), () => navigate(isSignedIn ? '/account' : '/login'))}
    >
      <span className="account-avatar">
        <NovaIcon name="user" size={18} />
      </span>
      <span>{isSignedIn ? t('nav.account') : t('nav.login')}</span>
    </button>
  );
}
