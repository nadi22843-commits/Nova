import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../categories/core/AuthGate';
import { resolveHomeTiles } from '../../../categories/core/homeGrid';
import { NovaIcon, type NovaIconName } from '../../../components/ui/NovaIcon';
import { useT } from '../../../shared/i18n/useT';

/**
 * Начало публикации.
 *
 * Экран закрыт авторизацией и на входе, и здесь: на форму можно попасть
 * по прямой ссылке в обход кнопки, и без этой проверки человек заполнил бы
 * всё и упёрся в требование входа на последнем шаге.
 *
 * Дальше публикация идёт по конфигурации выбранной категории: выбор
 * категории → тип объекта → мастер с полями этого типа.
 */
export function PublishPage() {
  const t = useT();
  const { isSignedIn, requireAuth } = useAuth();

  useEffect(() => {
    // Уводим на вход сразу, а не после заполнения формы.
    if (!isSignedIn) requireAuth('publish', { replace: true });
  }, [isSignedIn, requireAuth]);

  if (!isSignedIn) {
    return (
      <main className="page narrow">
        <h1>{t('nav.publish')}</h1>
        <p className="nova-muted">{t('chat.opening')}</p>
      </main>
    );
  }

  const tiles = resolveHomeTiles().filter((t) => t.available);

  return (
    <main className="page narrow">
      <h1>{t('nav.publish')}</h1>
      <p className="nova-muted">{t('publish.chooseCategory')}</p>

      <Link to="/rental/publish" className="publish-rental-callout"><span className="rental-new">НОВИНКА</span><div><b>Сдать люксовую вещь в аренду</b><small>Цена за день, депозит владельца и прямой контакт с арендатором</small></div><strong>›</strong></Link>

      <div className="nova-categories" style={{ marginTop: 20 }}>
        {tiles.map(({ icon, label, to }) => (
          <Link to={to} className="nova-category" key={label}>
            <span className={`category-icon category-${icon}`}>
              <NovaIcon name={icon as NovaIconName} size={25} />
            </span>
            <b>{label}</b>
          </Link>
        ))}
      </div>
    </main>
  );
}
