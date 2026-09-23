import { useMemo, useState } from 'react';
import { View, Text, Pressable, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  itemsFor, matchItem, sortItems, cardFields,
  getLoadedTree, displayName, translateLabel,
  type CategoryModule, type Subcategory, type CatalogItem,
  type FilterValues, type SortKey, type LocationSelection, type TranslationKey,
} from '@nova/core';
import { useTheme } from '../theme/ThemeProvider';
import { ListingCard } from '../components/ListingCard';
import { space, radius, type } from '../theme/tokens';
import { useT, useLocaleLanguage, usePluralListings } from '../i18n/LocaleContext';

const SORT_LABEL_KEYS: Record<SortKey, TranslationKey> = {
  new: 'list.sortNew',
  'price-asc': 'list.sortPriceAsc',
  'price-desc': 'list.sortPriceDesc',
};

/**
 * Список объявлений.
 *
 * Тот же контракт, что в веб-версии: намерение задаёт сделку, место и фильтры
 * приходят снаружи. Логика фильтрации — общая, из ядра.
 */
export function ListScreen({
  category,
  sub,
  intentId,
  filters,
  location,
  money,
  onOpenItem,
  onOpenFilters,
  onOpenPlace,
  onBack,
  placeLabel,
}: {
  category: CategoryModule;
  sub: Subcategory;
  intentId?: string;
  filters: FilterValues;
  location: LocationSelection;
  money: (amount: number, currency?: string) => string;
  onOpenItem: (item: CatalogItem) => void;
  onOpenFilters: () => void;
  onOpenPlace: () => void;
  onBack: () => void;
  placeLabel: string;
}) {
  const { theme } = useTheme();
  const t = useT();
  const language = useLocaleLanguage();
  const pluralListings = usePluralListings();
  const [sort, setSort] = useState<SortKey>('new');

  const browseIntents = category.intents.filter((i) => i.mode === 'browse');
  const intent = browseIntents.find((i) => i.id === intentId) ?? browseIntents[0];

  const found = useMemo(() => {
    const all = itemsFor(category.id, sub.id);
    const filtered = all.filter((item) => {
      const itemTree = getLoadedTree(item.countryCode);
      const path = itemTree?.places.find((p) => p.id === item.placeId)?.path;
      return matchItem(item, sub, filters, location, intent?.deal, path);
    });
    return sortItems(filtered, sort);
  }, [category.id, sub, filters, location, intent, sort]);

  const rows = cardFields(sub, intent?.deal).slice(0, 3);
  const hasFilters = Object.keys(filters).length > 0;

  /** Подзаголовок карточки: два-три самых говорящих атрибута плюс место. */
  function subtitleFor(item: CatalogItem): string {
    const itemTree = getLoadedTree(item.countryCode);
    const place = itemTree?.places.find((p) => p.id === item.placeId);
    const attrs = rows
      .map((f) => (item.attrs[f.key] ? `${translateLabel(item.attrs[f.key], language)}${f.unit ? ` ${translateLabel(f.unit, language)}` : ''}` : null))
      .filter(Boolean);
    const where = place ? displayName(place, language) : '';
    return [...attrs, where].filter(Boolean).join(' · ');
  }

  function cycleSort() {
    const order: SortKey[] = ['new', 'price-asc', 'price-desc'];
    setSort(order[(order.indexOf(sort) + 1) % order.length]);
  }

  return (
    <SafeAreaView style={[s.root, { backgroundColor: theme.bg }]}>
      <View style={s.head}>
        <Pressable onPress={onBack} hitSlop={10}>
          <Text style={{ color: theme.accentText, fontWeight: '700' }}>‹ {t('app.back')}</Text>
        </Pressable>

        <Text style={[type.h2, { color: theme.ink, marginTop: space.md }]}>
          {translateLabel(sub.listTitle ?? sub.title, language)}
          {intent && browseIntents.length > 1 ? ` — ${translateLabel(intent.title, language).toLowerCase()}` : ''}
        </Text>
        <Text style={{ color: theme.muted, fontSize: 12, marginTop: 2 }}>
          {pluralListings(found.length)}
        </Text>

        <View style={s.chips}>
          <Chip label={`◎ ${placeLabel}`} onPress={onOpenPlace} active={Boolean(location.placeId)} />
          <Chip label={hasFilters ? `${t('list.filters')} •` : t('list.filters')} onPress={onOpenFilters} active={hasFilters} />
          <Chip label={t(SORT_LABEL_KEYS[sort])} onPress={cycleSort} active={sort !== 'new'} />
        </View>
      </View>

      <FlatList
        data={found}
        keyExtractor={(i) => i.id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ListingCard
            item={item}
            money={money(item.price, item.currency)}
            subtitle={subtitleFor(item)}
            onPress={() => onOpenItem(item)}
          />
        )}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ color: theme.muted, textAlign: 'center', lineHeight: 21 }}>
              {hasFilters || location.placeId
                ? t('list.emptyFilters')
                : t('list.emptySection')}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function Chip({ label, onPress, active }: { label: string; onPress: () => void; active: boolean }) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        s.chip,
        {
          backgroundColor: active ? theme.accent : theme.surface,
          borderColor: active ? theme.accent : theme.line,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Text style={{ color: active ? theme.accentInk : theme.ink2, fontSize: 11.5, fontWeight: '700' }}>
        {label}
      </Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  head: { paddingHorizontal: space.lg, paddingTop: space.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.md, marginBottom: space.md },
  chip: { borderWidth: 1, borderRadius: radius.pill, paddingVertical: 7, paddingHorizontal: 12 },
  list: { paddingHorizontal: space.lg, paddingBottom: space.xxl },
  empty: { paddingVertical: 48, paddingHorizontal: space.lg },
});
