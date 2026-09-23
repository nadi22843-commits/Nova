import { Link, useLocation } from 'react-router-dom';
import type { CategoryModule } from '../core/types';
import { useT } from '../../shared/i18n/useT';

/** Экран после публикации. Ведёт в «Мои объявления», а не на главную. */
export function PublishedPage({ category }: { category: CategoryModule }) {
  const t = useT();
  const { state } = useLocation() as { state?: { title?: string; moderation?: boolean; offline?: boolean } };

  return (
    <main className="feature-page">
      <section className="work-panel nova-success">
        <h1>{state?.moderation ? t('published.moderation') : t('published.title')}</h1>
        <p>
          {t(
            state?.moderation ? 'published.textModeration' : state?.offline ? 'published.textOffline' : 'published.textSoon',
            { title: state?.title ? `«${state.title}»` : t('published.listingWord') },
          )}
        </p>
        <div className="nova-actions-row">
          <Link className="primary-action" to="/account">
            {t('published.myListings')}
          </Link>
          <Link className="secondary-action" to={category.path}>
            {t('published.toCategory')}
          </Link>
        </div>
      </section>
    </main>
  );
}
