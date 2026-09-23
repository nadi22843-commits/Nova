import { Suspense, lazy, useMemo, type ReactElement } from 'react';
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { CategoryBoundary } from './CategoryBoundary';
import { CategoryHomePage } from '../ui/CategoryHomePage';
import { SubcategoryPicker } from '../ui/SubcategoryPicker';
import { ListPage } from '../ui/ListPage';
import { FiltersPage } from '../ui/FiltersPage';
import { DetailPage } from '../ui/DetailPage';
import { WizardPage } from '../ui/WizardPage';
import { PublishedPage } from '../ui/PublishedPage';
import type { CategoryModule, Subcategory } from './types';
import { translateLabel } from '@nova/core';
import { useLocale } from './LocaleStore';
import { useT } from '../../shared/i18n/useT';

/**
 * Один роутер на все категории.
 *
 * Добавление категории не требует правок здесь — достаточно зарегистрировать
 * конфигурацию. Каждая подкатегория обёрнута собственным предохранителем.
 */

/** Экран, если подкатегории нет или её отбросила валидация. */
function SubcategoryMissing({ category }: { category: CategoryModule }) {
  const t = useT();
  const { language } = useLocale();
  return (
    <main className="feature-page">
      <section className="work-panel nova-empty">
        <h1>{t('category.sectionUnavailable')}</h1>
        <p>{t('category.sectionUnavailableText', { category: translateLabel(category.title, language) })}</p>
        <a className="primary-action" href={category.path}>
          {t('list.otherSections')}
        </a>
      </section>
    </main>
  );
}

/** Достаёт подкатегорию из URL и изолирует её собственным предохранителем. */
function WithSubcategory({
  category,
  render,
}: {
  category: CategoryModule;
  render: (sub: Subcategory) => ReactElement;
}) {
  const { subId } = useParams();
  const { pathname } = useLocation();
  const { language } = useLocale();
  const sub = category.subcategories.find((s) => s.id === subId);

  if (!sub) return <SubcategoryMissing category={category} />;

  return (
    <CategoryBoundary level="subcategory" scopeName={translateLabel(sub.title, language)} fallbackTo={category.path} resetKey={pathname}>
      {render(sub)}
    </CategoryBoundary>
  );
}

export function CategoryRoutes({ category }: { category: CategoryModule }) {
  const { pathname } = useLocation();
  const { language } = useLocale();
  const t = useT();
  const categoryTitle = translateLabel(category.title, language);
  // Категория со своим роутингом (например, готовый модуль «Работа»).
  const Custom = useMemo(
    () => (category.customRoutes ? lazy(category.customRoutes) : null),
    [category],
  );

  if (Custom) {
    return (
      <CategoryBoundary level="category" scopeName={categoryTitle} resetKey={pathname}>
        <Suspense fallback={<main className="feature-page"><section className="work-panel"><p>{t('app.loading')}</p></section></main>}>
          <Custom />
        </Suspense>
      </CategoryBoundary>
    );
  }

  return (
    <CategoryBoundary level="category" scopeName={categoryTitle} resetKey={pathname}>
      <Routes>
        <Route index element={<CategoryHomePage category={category} />} />

        <Route
          path="browse/:intentId"
          element={<IntentPicker category={category} mode="browse" />}
        />
        <Route
          path="publish/:intentId"
          element={<IntentPicker category={category} mode="publish" />}
        />

        <Route
          path="list/:subId"
          element={<WithSubcategory category={category} render={(sub) => <ListPage category={category} sub={sub} />} />}
        />
        <Route
          path="filters/:subId"
          element={<WithSubcategory category={category} render={(sub) => <FiltersPage category={category} sub={sub} />} />}
        />
        <Route
          path="publish/:intentId/:subId"
          element={<PublishRoute category={category} />}
        />

        {/* Карточка и экран «опубликовано» — под собственными предохранителями:
            сбой карточки не гасит список и остальную категорию. */}
        <Route
          path="item/:itemId"
          element={
            <CategoryBoundary level="subcategory" scopeName={t('nav.listing')} fallbackTo={category.path} resetKey={pathname}>
              <DetailPage category={category} />
            </CategoryBoundary>
          }
        />
        <Route
          path="published"
          element={
            <CategoryBoundary level="subcategory" scopeName={t('nav.publishPage')} fallbackTo={category.path} resetKey={pathname}>
              <PublishedPage category={category} />
            </CategoryBoundary>
          }
        />

        <Route path="*" element={<Navigate to={category.path} replace />} />
      </Routes>
    </CategoryBoundary>
  );
}

/** Мастер публикации знает вид сделки: у аренды и продажи разные поля. */
function PublishRoute({ category }: { category: CategoryModule }) {
  const { intentId } = useParams();
  const intent = category.intents.find((i) => i.id === intentId && i.mode === 'publish');
  // Без существующего намерения мастер не знает вид сделки: показал бы поля
  // и продажи, и аренды сразу, а объявление сохранилось бы как «продажа».
  if (!intent) return <Navigate to={category.path} replace />;
  return (
    <WithSubcategory
      category={category}
      render={(sub) => <WizardPage category={category} sub={sub} deal={intent?.deal} />}
    />
  );
}

function IntentPicker({ category, mode }: { category: CategoryModule; mode: 'browse' | 'publish' }) {
  const { intentId } = useParams();
  // Намерение должно совпадать с веткой: /publish/find-job не должно
  // открывать выбор «что разместить» для просмотра.
  const intent = category.intents.find((i) => i.id === intentId && i.mode === mode);
  if (!intent) return <Navigate to={category.path} replace />;
  return <SubcategoryPicker category={category} mode={mode} intentId={intent.id} />;
}
