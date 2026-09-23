import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  initCategories, initCountries, initPlaceLoaders, setStorageAdapter,
  getCountry, isCountryAvailable, getCategoryByPath, getCategory, findItem, loadPlaceTree,
  getLoadedTree, displayName, translate,
  type CatalogItem, type CategoryModule, type Country, type LanguageCode,
  type FilterValues, type LocationSelection,
} from '@nova/core';
import { ThemeProvider, useTheme } from './theme/ThemeProvider';
import { LocaleProvider } from './i18n/LocaleContext';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { HomeScreen } from './screens/HomeScreen';
import { SubcategoryScreen } from './screens/SubcategoryScreen';
import { ListScreen } from './screens/ListScreen';
import { DetailScreen } from './screens/DetailScreen';
import { FiltersScreen } from './screens/FiltersScreen';
import { PlaceScreen } from './screens/PlaceScreen';
import { PublishScreen } from './screens/PublishScreen';
import { PublishedScreen } from './screens/PublishedScreen';

/**
 * Точка входа мобильного приложения.
 *
 * Реестры поднимаются один раз до отрисовки — те же самые, что в веб-версии.
 * Разница только в хранилище: AsyncStorage вместо localStorage.
 */

/**
 * AsyncStorage асинхронный, а ядро ожидает синхронный доступ. Держим зеркало
 * в памяти: при старте читаем всё разом, дальше читаем из памяти, пишем в обе
 * стороны.
 */
const mirror = new Map<string, string>();

async function primeStorage(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const pairs = await AsyncStorage.multiGet(keys.filter((k) => k.startsWith('nova.')));
    for (const [k, v] of pairs) if (v !== null) mirror.set(k, v);
  } catch (error) {
    console.warn('[Nova] не удалось прочитать хранилище', error);
  }

  setStorageAdapter({
    getItem: (k) => mirror.get(k) ?? null,
    setItem: (k, v) => {
      mirror.set(k, v);
      void AsyncStorage.setItem(k, v).catch(() => {});
    },
    removeItem: (k) => {
      mirror.delete(k);
      void AsyncStorage.removeItem(k).catch(() => {});
    },
  });
}

const LOCALE_KEY = 'nova.locale';

/** Текущий экран. Простой стек — без библиотеки навигации на этом этапе. */
type Screen =
  | { name: 'home' }
  | { name: 'category'; categoryPath: string; intentId: string | null }
  | { name: 'list'; categoryPath: string; subId: string; intentId: string | null }
  | { name: 'detail'; itemId: string }
  | { name: 'filters'; categoryPath: string; subId: string; intentId: string | null }
  | { name: 'place'; back: Screen }
  | { name: 'publish'; categoryPath: string; subId: string; intentId: string }
  | { name: 'published'; title: string };

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Root />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function Root() {
  const { theme, name } = useTheme();
  const [ready, setReady] = useState(false);
  const [country, setCountry] = useState<Country | null>(null);
  const [language, setLanguageState] = useState<LanguageCode>('ru');
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [filters, setFilters] = useState<FilterValues>({});
  const [location, setLocation] = useState<LocationSelection>({ placeId: null });

  useEffect(() => {
    (async () => {
      await primeStorage();
      initCountries();
      initPlaceLoaders();
      initCategories();

      try {
        const raw = await AsyncStorage.getItem(LOCALE_KEY);
        if (raw) {
          const saved = JSON.parse(raw) as { country?: string; language?: LanguageCode };
          if (saved.country && isCountryAvailable(saved.country)) {
            const found = getCountry(saved.country)!;
            setCountry(found);
            setLanguageState(
              saved.language && found.languages.includes(saved.language) ? saved.language : found.defaultLanguage,
            );
            // Справочник мест грузим заранее: без него список не покажет города.
            void loadPlaceTree(found.code);
          }
        }
      } catch {
        /* повреждённая запись — спросим страну заново */
      }

      setReady(true);
    })();
  }, []);

  /** Форматирование денег идёт только отсюда: нигде в коде нет символа валюты. */
  const money = useCallback(
    (amount: number, currency?: string) => {
      const code = currency ?? country?.currency ?? 'USD';
      try {
        return new Intl.NumberFormat(country?.locale ?? 'en-US', {
          style: 'currency',
          currency: code,
          maximumFractionDigits: 0,
        }).format(amount);
      } catch {
        return `${amount} ${code}`;
      }
    },
    [country],
  );

  const date = useCallback(
    (value: string) => {
      try {
        return new Intl.DateTimeFormat(country?.locale ?? 'en-US', { dateStyle: 'medium' }).format(
          new Date(value),
        );
      } catch {
        return value;
      }
    },
    [country],
  );

  const placeLabel = useMemo(() => {
    if (!location.placeId || !country) return country?.nativeName ?? translate(language, 'place.wholeCountry');
    const tree = getLoadedTree(country.code);
    const place = tree?.places.find((p) => p.id === location.placeId);
    return place ? displayName(place, language) : country.nativeName;
  }, [location, country, language]);

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={theme.accent} />
        <StatusBar style={name === 'dark' ? 'light' : 'dark'} />
      </View>
    );
  }

  if (!country) {
    return (
      <>
        <WelcomeScreen
          onDone={(code: string, pickedLanguage: LanguageCode) => {
            void AsyncStorage.setItem(LOCALE_KEY, JSON.stringify({ country: code, language: pickedLanguage }));
            const found = getCountry(code)!;
            setCountry(found);
            setLanguageState(pickedLanguage);
            void loadPlaceTree(found.code);
          }}
        />
        <StatusBar style={name === 'dark' ? 'light' : 'dark'} />
      </>
    );
  }

  const bar = <StatusBar style={name === 'dark' ? 'light' : 'dark'} />;
  return <LocaleProvider language={language}>{renderScreen()}</LocaleProvider>;

  // Обычная функция, вызванная во время рендера (не JSX-тег), поэтому не
  // создаёт новый тип компонента на каждый рендер — Root не размонтировался бы.
  function renderScreen() {
  if (!country) return fallbackHome();
  if (screen.name === 'category') {
    const category = getCategoryByPath(screen.categoryPath);
    if (!category) return fallbackHome();
    return (
      <>
        <SubcategoryScreen
          category={category}
          intentId={screen.intentId}
          onPickIntent={(id) => setScreen({ ...screen, intentId: id })}
          onPickSubcategory={(subId) => {
            const intent = category.intents.find((i) => i.id === screen.intentId);
            // Намерение решает, куда идти: смотреть объявления или подавать своё.
            setScreen(
              intent?.mode === 'publish'
                ? { name: 'publish', categoryPath: screen.categoryPath, subId, intentId: intent.id }
                : { name: 'list', categoryPath: screen.categoryPath, subId, intentId: screen.intentId },
            );
          }}
          onBack={() => setScreen({ name: 'home' })}
        />
        {bar}
      </>
    );
  }

  if (screen.name === 'list') {
    const category = getCategoryByPath(screen.categoryPath);
    const sub = category?.subcategories.find((x) => x.id === screen.subId);
    if (!category || !sub) return fallbackHome();
    return (
      <>
        <ListScreen
          category={category}
          sub={sub}
          intentId={screen.intentId ?? undefined}
          filters={filters}
          location={location}
          money={money}
          placeLabel={placeLabel}
          onOpenItem={(item: CatalogItem) => setScreen({ name: 'detail', itemId: item.id })}
          onOpenFilters={() =>
            setScreen({
              name: 'filters',
              categoryPath: screen.categoryPath,
              subId: screen.subId,
              intentId: screen.intentId,
            })
          }
          onOpenPlace={() => setScreen({ name: 'place', back: screen })}
          onBack={() =>
            setScreen({ name: 'category', categoryPath: screen.categoryPath, intentId: screen.intentId })
          }
        />
        {bar}
      </>
    );
  }

  if (screen.name === 'filters') {
    const category = getCategoryByPath(screen.categoryPath);
    const sub = category?.subcategories.find((x) => x.id === screen.subId);
    if (!category || !sub) return fallbackHome();
    const back: Screen = {
      name: 'list',
      categoryPath: screen.categoryPath,
      subId: screen.subId,
      intentId: screen.intentId,
    };
    return (
      <>
        <FiltersScreen
          category={category}
          sub={sub}
          intentId={screen.intentId ?? undefined}
          initial={filters}
          location={location}
          onApply={(next) => {
            setFilters(next);
            setScreen(back);
          }}
          onBack={() => setScreen(back)}
        />
        {bar}
      </>
    );
  }

  if (screen.name === 'place') {
    const back = screen.back;
    return (
      <>
        <PlaceScreen
          country={country}
          language={language}
          value={location}
          onApply={(next) => {
            setLocation(next);
            setScreen(back);
          }}
          onBack={() => setScreen(back)}
        />
        {bar}
      </>
    );
  }

  if (screen.name === 'publish') {
    const category = getCategoryByPath(screen.categoryPath);
    const sub = category?.subcategories.find((x) => x.id === screen.subId);
    const intent = category?.intents.find((i) => i.id === screen.intentId);
    if (!category || !sub) return fallbackHome();
    return (
      <>
        <PublishScreen
          category={category}
          sub={sub}
          deal={intent?.deal}
          money={(amount) => money(amount)}
          onDone={(title) => setScreen({ name: 'published', title })}
          onBack={() =>
            setScreen({ name: 'category', categoryPath: screen.categoryPath, intentId: screen.intentId })
          }
        />
        {bar}
      </>
    );
  }

  if (screen.name === 'published') {
    return (
      <>
        <PublishedScreen
          title={screen.title}
          onMyListings={() => setScreen({ name: 'home' })}
          onHome={() => setScreen({ name: 'home' })}
        />
        {bar}
      </>
    );
  }

  if (screen.name === 'detail') {
    const item = findItem(screen.itemId);
    const category = item ? findCategoryFor(item) : undefined;
    if (!item || !category) return fallbackHome();
    return (
      <>
        <DetailScreen
          item={item}
          category={category}
          money={money}
          date={date}
          onBack={() => setScreen({ name: 'home' })}
          onContact={() => {}}
        />
        {bar}
      </>
    );
  }

  return (
    <>
      <HomeScreen
        place={placeLabel}
        onOpenCategory={(path: string) => setScreen({ name: 'category', categoryPath: path, intentId: null })}
        onOpenSystem={() => setScreen({ name: 'place', back: { name: 'home' } })}
      />
      {bar}
    </>
  );

  function fallbackHome() {
    setScreen({ name: 'home' });
    return bar;
  }
  }
}

function findCategoryFor(item: CatalogItem): CategoryModule | undefined {
  // По идентификатору, а не по пути: у части категорий путь отличается от id
  // («home» лежит на /home-goods, потому что /home занят главной).
  return getCategory(item.categoryId);
}
