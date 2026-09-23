import { useMemo, useState } from 'react';
import { usePlace } from '../core/places/PlaceStore';
import { useLocale } from '../core/LocaleStore';
import { childrenOf, levelLabel, ancestorsOf } from '../core/places/registry';
import { searchPlaces, displayName, sortPlaces } from '../core/places/search';
import { hasCoords } from '../core/places/geo';
import type { LocationSelection, Place } from '../core/places/types';
import { safe } from '../../components/safety/safeAction';
import { translateLabel } from '@nova/core';
import { useT } from '../../shared/i18n/useT';

/**
 * Выбор места.
 *
 * Компонент не знает заранее, сколько уровней в стране: он идёт вглубь дерева,
 * пока у выбранного места есть потомки. Для Сингапура это один шаг, для России
 * три. Подписи уровней приходят из справочника страны.
 *
 * Радиус предлагается только там, где у места есть координаты, — иначе
 * получилась бы кнопка, которая ничего не делает.
 */

const RADIUS_OPTIONS = [0, 10, 25, 50, 100, 200];

export function PlacePicker({
  value,
  onChange,
  onClose,
}: {
  value: LocationSelection;
  onChange: (next: LocationSelection) => void;
  onClose: () => void;
}) {
  const t = useT();
  const { tree, loading, hasDetail } = usePlace();
  const { language, country } = useLocale();
  const [query, setQuery] = useState('');
  const [parentId, setParentId] = useState<string | null>(
    value.placeId && tree ? tree.places.find((p) => p.id === value.placeId)?.parentId ?? null : null,
  );

  const level = useMemo(() => {
    if (!tree || !parentId) return [];
    return ancestorsOf(tree, parentId).concat(tree.places.find((p) => p.id === parentId) ?? []);
  }, [tree, parentId]);

  const options = useMemo(() => {
    if (!tree) return [];
    if (query.trim()) return searchPlaces(tree.places, query, 40);
    return sortPlaces(childrenOf(tree, parentId), language);
  }, [tree, parentId, query, language]);

  if (loading) {
    return (
      <div className="nova-place-picker">
        <p className="nova-muted">{t('place.loading')}</p>
      </div>
    );
  }

  // Страна без справочника — не ошибка. Поиск по всей стране работает.
  if (!hasDetail || !tree) {
    return (
      <div className="nova-place-picker">
        <p className="nova-muted">
          {t('place.noDetailYet', { country: country?.nativeName ?? '' })}
        </p>
        <button className="primary-action" onClick={onClose} type="button">
          {t('app.understood')}
        </button>
      </div>
    );
  }

  function choose(place: Place) {
    const kids = childrenOf(tree!, place.id);
    // Есть куда углубиться — предлагаем, но выбор уже засчитан:
    // человек может остановиться на области, не доходя до города.
    // Радиус переносим только на место с координатами: иначе поиск радиусом
    // без центра отсекает все объявления, и список молча пустеет.
    onChange({ placeId: place.id, lat: place.lat, lon: place.lon, radiusKm: hasCoords(place) ? value.radiusKm : undefined });
    if (kids.length > 0) {
      setParentId(place.id);
      setQuery('');
    } else {
      onClose();
    }
  }

  const currentDepth = level.length;
  const label = levelLabel(tree, currentDepth + 1, language);
  const selected = value.placeId ? tree.places.find((p) => p.id === value.placeId) : null;
  const canUseRadius = selected ? hasCoords(selected) : false;

  return (
    <div className="nova-place-picker">
      <div className="nova-place-head">
        <button
          className="nova-back"
          onClick={() => {
            if (parentId) {
              const parent = tree.places.find((p) => p.id === parentId);
              setParentId(parent?.parentId ?? null);
            } else {
              onClose();
            }
          }}
          type="button"
        >
          ‹ {parentId ? t('app.back') : t('app.close')}
        </button>
        <b>{label || t('list.place')}</b>
      </div>

      {/* Цепочка выбранного: «Бавария → Мюнхен» */}
      {level.length > 0 && (
        <p className="nova-breadcrumbs">{level.map((p) => displayName(p, language)).join(' → ')}</p>
      )}

      <input
        className="nova-country-search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`${t('place.searchPrefix')}${label ? `: ${label.toLowerCase()}` : ''}`}
        aria-label={t('place.search')}
      />

      <button
        className={`nova-place-option${value.placeId === null ? ' is-selected' : ''}`}
        onClick={() => {
          onChange({ placeId: null });
          onClose();
        }}
        type="button"
      >
        {t('place.wholeCountry')}
      </button>

      <div className="nova-place-list">
        {options.map((p) => (
          <button
            className={`nova-place-option${value.placeId === p.id ? ' is-selected' : ''}`}
            key={p.id}
            onClick={safe(displayName(p, language), () => choose(p))}
            type="button"
          >
            <span>{displayName(p, language)}</span>
            {childrenOf(tree, p.id).length > 0 && <small>›</small>}
          </button>
        ))}
      </div>

      {options.length === 0 && <p className="nova-muted">{t('place.nothing')}</p>}

      {canUseRadius && (
        <label className="nova-field">
          <span>{t('place.inRadius')}</span>
          <select
            value={value.radiusKm ?? 0}
            onChange={(e) => onChange({ ...value, radiusKm: Number(e.target.value) })}
          >
            {RADIUS_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r === 0 ? t('place.byBorders') : `${r} ${translateLabel('км', language)}`}
              </option>
            ))}
          </select>
          <small className="nova-hint">
            {t('place.radiusNote')}
          </small>
        </label>
      )}
    </div>
  );
}
