import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { normalizeDeep, translateLabel } from '@nova/core';
// Реестр и каталог — из тех же модулей, куда их записывает приложение
// (initCategories, initUserListings). Импорт allItems/getCategories из
// '@nova/core' давал второй экземпляр состояния: там не было ни
// сгенерированных объявлений, ни объявлений пользователя, ни категорий.
import { allItems } from '../../../categories/core/catalogData';
import { getCategories } from '../../../categories/core/registry';
import { useLocale } from '../../../categories/core/LocaleStore';
import { useT } from '../../../shared/i18n/useT';
import { useCatalogVersion } from '../../../shared/api/useServerCatalog';

/**
 * Поиск по всем категориям.
 *
 * Раньше кнопка «Найти» была без обработчика, а список брался из шести
 * старых записей мимо реестра категорий.
 *
 * Ищем по названию, описанию и значениям атрибутов: человек вводит «BMW»
 * или «двухкомнатная» и ожидает найти это где угодно, а не только
 * в заголовке.
 */
export function SearchPage() {
  const t = useT();
  const [params, setParams] = useSearchParams();
  const { formatMoney, country, language } = useLocale();

  const q = params.get('q') ?? '';

  const catalogVersion = useCatalogVersion();
  const results = useMemo(() => {
    const needle = normalizeDeep(q);
    if (needle.length < 2) return [];

    return allItems()
      // Только объявления выбранной страны — как и в списках категорий.
      .filter((item) => !country || item.countryCode === country.code)
      .filter((item) => {
        const description = (item as { description?: string }).description ?? '';
        const haystack = [item.title, description, ...Object.values(item.attrs)]
          .join(' ');
        return normalizeDeep(haystack).includes(needle);
      })
      .slice(0, 60);
  }, [q, country, catalogVersion]);

  const categoryTitle = useMemo(() => {
    const map = new Map(getCategories().map((c) => [c.id, c.title]));
    return (id: string) => map.get(id) ?? id;
  }, []);

  // Путь категории не всегда равен её id: «Для дома» — id 'home', путь '/home-goods'.
  // Ссылка вида `/${categoryId}` вела в несуществующий маршрут и пустой экран.
  const categoryPath = useMemo(() => {
    const map = new Map(getCategories().map((c) => [c.id, c.path]));
    return (id: string) => map.get(id) ?? `/${id}`;
  }, []);

  return (
    <main className="page">
      <h1>{t('search.title')}</h1>

      <div className="search-results-toolbar">
        <div><span>Результаты поиска</span><strong>{q ? `«${q}»` : 'Все категории'}</strong></div>
        <button className="search-filter-chip" type="button" onClick={() => setParams(q ? { q, filters: params.get('filters') === '1' ? '0' : '1' } : { filters: params.get('filters') === '1' ? '0' : '1' })}>Фильтры</button>
      </div>
      {params.get('filters') === '1' && <div className="search-filter-panel"><span>Категория</span><div>{getCategories().slice(0,8).map(c => <Link key={c.id} to={c.path}>{translateLabel(c.title, language)}</Link>)}</div></div>}

      {q.length >= 2 && (
        <p className="nova-counter">
          {results.length === 0 ? t('search.nothing') : t('search.results', { count: results.length })}
        </p>
      )}

      {q.length >= 2 && results.length === 0 && (
        <div className="nova-empty">
          <p>{t('search.emptyDetail', { query: q })}</p>
          <Link className="primary-action" to="/">
            {t('search.toCategories')}
          </Link>
        </div>
      )}

      <div className="listing-grid">
        {results.map((item) => (
          <article className="listing-card" key={item.id}>
            <Link className="listing-link" to={`${categoryPath(item.categoryId)}/item/${item.id}`}>
              <div className="listing-media">
                <div className="listing-image" style={{ backgroundImage: `url(${item.image})` }} />
              </div>
              <div className="listing-body">
                <strong>{formatMoney(item.price, item.currency)}</strong>
                <h3>{item.title}</h3>
                <small>{translateLabel(categoryTitle(item.categoryId), language)}</small>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
