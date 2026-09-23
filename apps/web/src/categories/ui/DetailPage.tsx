import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { NovaIcon } from '../../components/ui/NovaIcon';
import { GuardedFavorite } from './GuardedFavorite';
import { findItem } from '../core/catalogData';
import { cardFields } from '../core/filtering';
import { translateLabel } from '@nova/core';
import { currencySymbol, useLocale } from '../core/LocaleStore';
import { usePlace } from '../core/places/PlaceStore';
import { ancestorsOf } from '../core/places/registry';
import { displayName } from '../core/places/search';
import { useAuth } from '../core/AuthGate';
import type { CategoryModule } from '../core/types';
import { getDetailActions } from './detailActions';
import { ActionGuard, BlockGuard } from '../../components/safety/SafeBoundary';
import { safe } from '../../components/safety/safeAction';
import { useT } from '../../shared/i18n/useT';
import type { TranslationKey } from '../../shared/i18n';
import { useCatalogVersion } from '../../shared/api/useServerCatalog';

/** Тип продавца хранится кодом, а показывается на языке интерфейса. */
const SELLER_LABEL: Record<string, TranslationKey> = {
  owner: 'seller.owner',
  agent: 'seller.agent',
  company: 'seller.company',
};

/**
 * Карточка объявления.
 *
 * Строки характеристик собираются из тех же FieldDef, что заполнял автор.
 * Карточка не может оказаться беднее формы — это был отдельный дефект схем.
 */
export function DetailPage({ category }: { category: CategoryModule }) {
  const t = useT();
  const { itemId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { requireAuth } = useAuth();
  const { formatMoney, formatDate } = useLocale();
  const [notice, setNotice] = useState('');
  const { tree } = usePlace();
  const { language, country } = useLocale();
  // Прямая ссылка на серверное объявление может открыться раньше, чем
  // подгрузится каталог страны — без этого страница навсегда решала бы,
  // что объявления не существует.
  useCatalogVersion();

  const item = itemId ? findItem(itemId) : undefined;

  if (!item) {
    return (
      <main className="feature-page">
        <section className="work-panel nova-empty">
          <h1>{t('listing.notFound')}</h1>
          <p>{t('listing.notFoundHint')}</p>
          <button className="primary-action" onClick={safe(t('listing.toCategory'), () => navigate(category.path))} type="button">
            {t('listing.toCategory')}
          </button>
        </section>
      </main>
    );
  }

  // Полный адрес через путь предков: «Бавария → Мюнхен».
  const place = tree?.places.find((p) => p.id === item.placeId);
  const locationLabel = place
    ? [...ancestorsOf(tree!, place.id), place].map((p) => displayName(p, language)).join(', ')
    : // Место не найдено в справочнике (объявление без города) — показываем
      // хотя бы страну, а не пустую строку с иконкой.
      country && item.countryCode === country.code
      ? country.nativeName
      : item.countryCode;

  const sub = category.subcategories.find((s) => s.id === item.subcategoryId);
  const extra = getDetailActions(category.id);
  // Поля с учётом вида сделки: у вакансии не показываем поля резюме и наоборот.
  const rows = sub ? cardFields(sub, item.deal) : [];

  function report() {
    if (!requireAuth('contact')) return;
    try {
      const key = 'nova.reports.v1';
      const prev = JSON.parse(localStorage.getItem(key) ?? '[]');
      const reports = Array.isArray(prev) ? prev : [];
      if (!reports.some((r: { itemId?: string }) => r?.itemId === item!.id)) reports.push({ itemId: item!.id, createdAt: new Date().toISOString(), status: 'new' });
      localStorage.setItem(key, JSON.stringify(reports));
    } catch {}
    setNotice(t('listing.reportTaken'));
  }

  function contact(kind: 'call' | 'message') {
    // Правило доступа: позвонить продавцу может и гость, а написать —
    // только после входа.
    if (kind === 'message') {
      if (!requireAuth('contact')) return;
      navigate(`/chat/${item!.id}`);
      return;
    }
    // Канал связи появится вместе с бэкендом. До тех пор кнопка честно
    // говорит о состоянии, а не молчит в консоль.
    setNotice(t('listing.phoneSoon'));
  }

  return (
    <main className="feature-page">
      <section className="work-panel">
        {/* Возврат сохраняет фильтры списка. */}
        <button
          className="nova-back"
          onClick={safe(t('listing.toList'), () => navigate(`${category.path}/list/${item.subcategoryId}?${params.toString()}`))}
          type="button"
        >
          ‹ {t('listing.toList')}
        </button>

        <div className="listing-image large" style={{ backgroundImage: `url(${item.image})` }}>
          <ActionGuard name={t('nav.favorites')} fallback={null}>
            <GuardedFavorite id={item.id} />
          </ActionGuard>
        </div>

        <h1>{formatMoney(item.price, item.currency)}</h1>
        <h2>{item.title}</h2>
        <p className="nova-muted">
          <NovaIcon name="location" size={12} />
          {locationLabel}
        </p>

        <dl className="nova-specs">
          {rows.map((f) =>
            item.attrs[f.key] ? (
              <div key={f.key}>
                <dt>{translateLabel(f.label, language)}</dt>
                <dd>
                  {translateLabel(item.attrs[f.key], language)}
                  {f.type === 'money' ? ` ${currencySymbol(item.currency, country?.locale)}` : f.unit ? ` ${translateLabel(f.unit, language)}` : ''}
                </dd>
              </div>
            ) : null,
          )}
        </dl>

        <div className="nova-seller">
          <b>{item.seller.name}</b>
          <small>
            {t(SELLER_LABEL[item.seller.kind] ?? 'seller.owner')}
            {item.seller.verified ? ` · ${t('seller.verified')}` : ''}
          </small>
          <small className="nova-muted">{formatDate(item.publishedAt)}</small>
        </div>

        {notice && <p className="nova-note">{notice}</p>}

        {/* Свои действия категории (например, отклик в «Работе») — отдельным
            блоком под собственным предохранителем. */}
        {extra && (
          <BlockGuard nameKey={extra.nameKey}>
            <extra.component item={item} />
          </BlockGuard>
        )}

        <div className="nova-actions-row">
          <ActionGuard name={t('listing.call')}>
            <button className="primary-action" onClick={safe(t('listing.call'), () => contact('call'))} type="button">
              {t('listing.call')}
            </button>
          </ActionGuard>
          {!extra?.replacesMessage && (
            <ActionGuard name={t('listing.message')}>
              <button className="secondary-action" onClick={safe(t('listing.message'), () => contact('message'))} type="button">
                {t('listing.message')}
              </button>
            </ActionGuard>
          )}
          <ActionGuard name={t('listing.report')}>
            <button className="secondary-action" onClick={safe(t('listing.report'), report)} type="button">
              {t('listing.report')}
            </button>
          </ActionGuard>
        </div>
      </section>
    </main>
  );
}
