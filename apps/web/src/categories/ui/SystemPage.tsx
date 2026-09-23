import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategories, getRegistryHealth } from '../core/registry';
import { getCountriesHealth } from '../core/countryRegistry';
import { getPlacesHealth, loadPlaceTree } from '../core/places/registry';
import { allItems } from '../core/catalogData';
import { getCountries } from '../core/countryRegistry';
import { useT } from '../../shared/i18n/useT';
import { useCatalogVersion } from '../../shared/api/useServerCatalog';

/**
 * Состояние системы.
 *
 * Экран показывает, что реально поднялось в трёх реестрах: категории, страны,
 * справочники мест. Это не украшение — это тот же источник, по которому
 * приложение решает, что показывать пользователю.
 *
 * Практический смысл: когда что-то отключилось, здесь видно что именно
 * и почему, без чтения консоли.
 */

type Health = {
  categories: ReturnType<typeof getRegistryHealth>;
  countries: ReturnType<typeof getCountriesHealth>;
  places: ReturnType<typeof getPlacesHealth>;
};

export function SystemPage() {
  const t = useT();
  useCatalogVersion();
  const [health, setHealth] = useState<Health | null>(null);

  useEffect(() => {
    // Справочники мест грузятся лениво, поэтому для полной картины
    // подтягиваем все зарегистрированные — иначе экран покажет пустоту
    // там, где данные просто ещё не понадобились.
    const pending = getPlacesHealth().registered.map((code) => loadPlaceTree(code));
    Promise.allSettled(pending).then(() => {
      setHealth({
        categories: getRegistryHealth(),
        countries: getCountriesHealth(),
        places: getPlacesHealth(),
      });
    });
  }, []);

  if (!health) {
    return (
      <main className="feature-page">
        <section className="work-panel">
          <p className="nova-muted">{t('system.collecting')}</p>
        </section>
      </main>
    );
  }

  const categories = getCategories();
  const subcategories = categories.reduce((n, c) => n + c.subcategories.length, 0);
  const fields = categories.reduce(
    (n, c) => n + c.subcategories.reduce((m, s) => m + s.fields.length, 0),
    0,
  );
  const items = allItems();
  const countries = getCountries();
  const currencies = new Set(countries.map((c) => c.currency));
  const languages = new Set(countries.flatMap((c) => c.languages));
  const places = health.places.loaded.reduce((n, p) => n + p.places, 0);

  const problems =
    health.categories.failed.length +
    health.categories.degraded.length +
    health.countries.dropped.length +
    health.places.failed.length;

  return (
    <main className="feature-page">
      <section className="work-panel">
        <Link className="nova-back" to="/">
          ‹ На главную
        </Link>

        <h1>{t('nav.system')}</h1>
        <p className="nova-counter">
          {problems === 0 ? t('system.allModules') : `Замечаний: ${problems}`}
        </p>

        <div className="nova-stats">
          <Stat value={categories.length} label="категорий" />
          <Stat value={subcategories} label="подкатегорий" />
          <Stat value={fields} label="полей" />
          <Stat value={items.length} label="объявлений" />
          <Stat value={countries.length} label="стран" />
          <Stat value={currencies.size} label="валют" />
          <Stat value={languages.size} label="языков" />
          <Stat value={places} label="мест" />
        </div>

        <Block title={t('home.categories')}>
          {categories.map((c) => {
            const degraded = health.categories.degraded.find((d) => d.id === c.id);
            return (
              <Row
                key={c.id}
                name={c.title}
                detail={
                  c.subcategories.length > 0
                    ? `${c.subcategories.length} подкатегорий`
                    : 'собственный интерфейс'
                }
                status={degraded ? 'degraded' : 'ok'}
                note={degraded ? `отключено: ${degraded.dropped.join(', ')}` : undefined}
              />
            );
          })}
          {health.categories.failed.map((f) => (
            <Row key={f.id} name={f.id} detail="не поднялась" status="failed" note={f.problems[0]} />
          ))}
        </Block>

        <Block title={t('system.places')}>
          {health.places.loaded.map((p) => (
            <Row key={p.code} name={p.code} detail={`${p.places} мест`} status="ok" />
          ))}
          {health.places.failed.map((f) => (
            <Row key={f.code} name={f.code} detail="не загрузился" status="failed" note={f.reason} />
          ))}
          <Row
            name={t('system.otherCountries')}
            detail={`${countries.length - health.places.registered.length} — поиск по всей стране`}
            status="ok"
          />
        </Block>

        <Block title={t('system.countries')}>
          <Row name={t('system.available')} detail={health.countries.ok.join(', ')} status="ok" />
          {health.countries.dropped.map((d) => (
            <Row key={d.code} name={d.code} detail="отключена" status="failed" note={d.reason} />
          ))}
        </Block>

        <p className="nova-hint">
          Категории, страны и справочники мест изолированы друг от друга: сбой одного модуля
          отключает только его, остальные продолжают работать.
        </p>
      </section>
    </main>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="nova-stat">
      <b>{value}</b>
      <small>{label}</small>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="nova-health-block">
      <h2>{title}</h2>
      {children}
    </div>
  );
}

function Row({
  name,
  detail,
  status,
  note,
}: {
  name: string;
  detail: string;
  status: 'ok' | 'degraded' | 'failed';
  note?: string;
}) {
  const mark = status === 'ok' ? '●' : status === 'degraded' ? '◐' : '○';
  return (
    <div className={`nova-health-row is-${status}`}>
      <span className="nova-health-mark" aria-hidden>
        {mark}
      </span>
      <b>{name}</b>
      <small>{detail}</small>
      {note && <em>{note}</em>}
    </div>
  );
}
