import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { NovaIcon } from '../../components/ui/NovaIcon';
import { subcategoriesForDeal, translateLabel } from '@nova/core';
import type { CategoryModule } from '../core/types';
import { safe } from '../../components/safety/safeAction';
import { useLocale } from '../core/LocaleStore';
import { useT } from '../../shared/i18n/useT';

/**
 * Выбор типа объекта.
 *
 * Один компонент на обе ветки: при mode="browse" ведёт в список,
 * при mode="publish" — в мастер публикации.
 */
export function SubcategoryPicker({
  category,
  mode,
  intentId,
}: {
  category: CategoryModule;
  mode: 'browse' | 'publish';
  intentId: string;
}) {
  const t = useT();
  const { language } = useLocale();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const intent = category.intents.find((i) => i.id === intentId);

  const visible = useMemo(() => {
    // Показываем только то, что существует в этом виде сделки:
    // «Сдать» не должно предлагать запчасти, «Купить» — посуточное жильё.
    const available = subcategoriesForDeal(category.subcategories, intent?.deal);
    const q = query.trim().toLowerCase();
    if (!q) return available;
    return available.filter((s) => translateLabel(s.title, language).toLowerCase().includes(q));
  }, [query, category.subcategories, intent, language]);

  const title = mode === 'publish' ? t('picker.whatPublish') : t('picker.whatLooking');

  return (
    <main className="feature-page">
      <section className="work-panel">
        <button className="nova-back" onClick={safe(t('app.back'), () => navigate(category.path))} type="button">
          ‹ {translateLabel(category.title, language)}
        </button>
        <h1>{title}</h1>

        <div className="search-box">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('picker.searchType')}
            aria-label={t('picker.searchType')}
          />
        </div>

        <div className="work-actions">
          {visible.map((s) => (
            <Link
              // Намерение едет дальше в URL: без него список не знает,
              // продажу показывать или аренду, а «Назад» не знает, куда вернуть.
              to={
                mode === 'publish'
                  ? `${category.path}/publish/${intentId}/${s.id}`
                  : `${category.path}/list/${s.id}?intent=${intentId}`
              }
              key={s.id}
            >
              <span>
                <NovaIcon name="more" />
              </span>
              <div>
                <b>{translateLabel(s.title, language)}</b>
              </div>
              <strong>›</strong>
            </Link>
          ))}
        </div>

        {visible.length === 0 && (
          <p className="nova-empty">
            {t('picker.nothingFound', { query })}
          </p>
        )}
      </section>
    </main>
  );
}
