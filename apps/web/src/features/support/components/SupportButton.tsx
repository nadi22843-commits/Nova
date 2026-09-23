import { Link } from 'react-router-dom';
import { NovaIcon } from '../../../components/ui/NovaIcon';
import { useT } from '../../../shared/i18n/useT';

/**
 * Поддержка в основной навигации.
 *
 * Заменила Shorts: на доске объявлений человек чаще ищет помощь по сделке,
 * чем развлекательную ленту. Поддержка нужна ровно в тот момент, когда
 * что-то пошло не так, и искать её в меню в этот момент не должен никто.
 */
export function SupportButton() {
  const t = useT();
  return (
    <Link className="nav-button" to="/support" aria-label={t('nav.support')}>
      <NovaIcon name="shield" />
      <span>{t('nav.support')}</span>
    </Link>
  );
}
