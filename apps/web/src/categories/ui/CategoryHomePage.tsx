import { Link } from 'react-router-dom';
import { NovaIcon } from '../../components/ui/NovaIcon';
import type { CategoryModule } from '../core/types';
import { allItems } from '../core/catalogData';
import { useLocale, currencySymbol } from '../core/LocaleStore';
import { translateLabel } from '@nova/core';
import { useT } from '../../shared/i18n/useT';
import type { TranslationKey } from '../../shared/i18n';
import { useCatalogVersion } from '../../shared/api/useServerCatalog';

const DEAL_LABEL: Record<string, TranslationKey> = {
  vacancy: 'deal.vacancy',
  resume: 'deal.resume',
  rent: 'deal.rent',
  service: 'deal.service',
};

/**
 * Landing screen for every category.
 *
 * Important UX rule: entering a category must never lead to an empty search
 * screen. The user sees the available actions first and a small, believable
 * sample of listings immediately below them. The data still comes from the
 * shared catalog, so cards, filters and detail pages cannot drift apart.
 */
export function CategoryHomePage({ category }: { category: CategoryModule }) {
  const t = useT();
  const { country, language } = useLocale();
  // Каталог не мемоизирован, поэтому чтения хватает — но компонент должен
  // перерисоваться, когда объявления сервера подгрузятся асинхронно.
  useCatalogVersion();
  const categoryTitle = translateLabel(category.title, language);
  const browse = category.intents.filter((i) => i.mode === 'browse');
  const publish = category.intents.filter((i) => i.mode === 'publish');
  const preview = allItems()
    .filter((item) => item.categoryId === category.id && (!country || item.countryCode === country.code))
    .slice(0, 8);

  const money = (value: number, currency: string) =>
    `${new Intl.NumberFormat(country?.locale ?? 'ru-RU').format(value)} ${currencySymbol(currency, country?.locale)}`;

  return (
    <main className="feature-page category-landing">
      <section className="category-landing-head">
        <div>
          <span className="eyebrow">Nova · {categoryTitle}</span>
          <h1>{categoryTitle}</h1>
          <p>{t('category.subtitle')}</p>
        </div>
      </section>

      <section className="category-action-panel" aria-label={t('category.chooseAction')}>
        <h2>{t('category.chooseAction')}</h2>
        <div className="category-action-grid">
          {browse.map((intent) => (
            <Link className="category-action-card is-browse" to={`${category.path}/browse/${intent.id}`} key={intent.id}>
              <span className="category-action-icon"><NovaIcon name="search" size={24} /></span>
              <span><b>{translateLabel(intent.title, language)}</b><small>{translateLabel(intent.subtitle, language)}</small></span><strong>→</strong>
            </Link>
          ))}
          {publish.map((intent) => (
            <Link className="category-action-card" to={`${category.path}/publish/${intent.id}`} key={intent.id}>
              <span className="category-action-icon"><NovaIcon name="plus" size={24} /></span>
              <span><b>{translateLabel(intent.title, language)}</b><small>{translateLabel(intent.subtitle, language)}</small></span><strong>→</strong>
            </Link>
          ))}
        </div>
      </section>

      <section className="category-preview-section">
        <div className="category-preview-title">
          <div>
            <span>{t('category.demoLabel')}</span>
            <h2>{category.id === 'work' ? t('category.freshWork') : t('category.freshListings', { category: categoryTitle })}</h2>
          </div>
          <small>{t('category.demoNote')}</small>
        </div>
        {preview.length > 0 ? (
          <div className="category-preview-grid">
            {preview.map((item) => (
              <Link className="category-preview-card" to={`${category.path}/item/${item.id}`} key={item.id}>
                <div className="category-preview-media"><img src={item.image} alt="" loading="lazy" /></div>
                <div className="category-preview-body">
                  <small>{t(DEAL_LABEL[item.deal] ?? 'deal.listing')}</small>
                  <h3>{item.title}</h3>
                  <b>{money(item.price, item.currency)}</b>
                </div>
              </Link>
            ))}
          </div>
        ) : <p className="nova-empty">{t('category.emptyDemo')}</p>}
      </section>
    </main>
  );
}
