import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { loadPlaceTree, getLoadedTree, hasPlaceData } from './registry';
import type { LocationSelection, Place, PlaceTree } from './types';

/**
 * Выбранное место поиска.
 *
 * Заменяет прежний RegionStore, где был захардкожен список из девяти русских
 * областей. Он противоречил выбору страны: человек выбирал Германию и видел
 * в фильтре «Московская область».
 *
 * Теперь место всегда принадлежит выбранной стране, а справочник грузится
 * ленивым чанком. Страна без справочника работает в режиме «вся страна» —
 * это не ошибка, а нормальное состояние для страны, куда мы ещё не завезли
 * детализацию.
 */

const STORAGE_KEY = 'nova.location';

type PlaceContextValue = {
  /** Дерево мест текущей страны. null — детализации нет. */
  tree: PlaceTree | null;
  loading: boolean;
  /** Что выбрано. placeId null — вся страна. */
  selection: LocationSelection;
  select: (selection: LocationSelection) => void;
  clear: () => void;
  /** Выбранное место целиком, если оно есть в дереве. */
  selectedPlace: Place | null;
  /** Есть ли у страны детализация вообще. */
  hasDetail: boolean;
};

const PlaceContext = createContext<PlaceContextValue | null>(null);

function readStored(countryCode: string): LocationSelection | null {
  try {
    const raw = window.localStorage.getItem(`${STORAGE_KEY}.${countryCode}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LocationSelection;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function writeStored(countryCode: string, selection: LocationSelection): void {
  try {
    window.localStorage.setItem(`${STORAGE_KEY}.${countryCode}`, JSON.stringify(selection));
  } catch {
    /* хранилище недоступно — выбор просто не переживёт перезапуск */
  }
}

export function PlaceProvider({ countryCode, children }: { countryCode: string; children: ReactNode }) {
  const [tree, setTree] = useState<PlaceTree | null>(() => getLoadedTree(countryCode) ?? null);
  const [loading, setLoading] = useState(false);
  const [selection, setSelection] = useState<LocationSelection>({ placeId: null });

  // Смена страны сбрасывает выбор места: место одной страны бессмысленно
  // в другой, а оставленный «Берлин» при переезде в Россию — это дефект.
  useEffect(() => {
    let cancelled = false;

    setSelection({ placeId: null });
    setTree(getLoadedTree(countryCode) ?? null);

    if (!hasPlaceData(countryCode)) {
      setLoading(false);
      return;
    }

    setLoading(true);
    loadPlaceTree(countryCode)
      .then((loaded) => {
        if (cancelled) return;
        setTree(loaded);

        // Восстанавливаем прошлый выбор, только если место всё ещё существует:
        // справочник мог измениться между версиями.
        const stored = readStored(countryCode);
        if (stored?.placeId && loaded?.places.some((p) => p.id === stored.placeId)) {
          setSelection(stored);
        }
      })
      .catch((error) => {
        // Сбой чанка справочника — режим «вся страна», а не необработанная ошибка.
        console.error(`[Nova/places] справочник ${countryCode} не загрузился`, error);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [countryCode]);

  const select = useCallback(
    (next: LocationSelection) => {
      setSelection(next);
      writeStored(countryCode, next);
    },
    [countryCode],
  );

  const clear = useCallback(() => {
    select({ placeId: null });
  }, [select]);

  const selectedPlace = useMemo(
    () => (selection.placeId && tree ? tree.places.find((p) => p.id === selection.placeId) ?? null : null),
    [selection.placeId, tree],
  );

  const value = useMemo(
    () => ({ tree, loading, selection, select, clear, selectedPlace, hasDetail: hasPlaceData(countryCode) }),
    [tree, loading, selection, select, clear, selectedPlace, countryCode],
  );

  return <PlaceContext.Provider value={value}>{children}</PlaceContext.Provider>;
}

export function usePlace(): PlaceContextValue {
  const ctx = useContext(PlaceContext);
  if (!ctx) throw new Error('usePlace вызван вне PlaceProvider');
  return ctx;
}
