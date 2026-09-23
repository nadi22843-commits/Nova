import { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getLoadedTree, childrenOf, ancestorsOf, levelLabel, searchPlaces, displayName, sortPlaces, hasCoords,
  translateLabel,
  type Country, type LocationSelection, type Place, type LanguageCode,
} from '@nova/core';
import { useTheme } from '../theme/ThemeProvider';
import { space, radius, type } from '../theme/tokens';
import { useT } from '../i18n/LocaleContext';

const RADIUS_OPTIONS = [0, 10, 25, 50, 100, 200];

/**
 * Выбор места.
 *
 * Экран не знает заранее, сколько уровней в стране: идёт вглубь дерева, пока
 * у места есть потомки. Для Сингапура это один шаг, для России три.
 * Подписи уровней приходят из справочника страны.
 */
export function PlaceScreen({
  country,
  language,
  value,
  onApply,
  onBack,
}: {
  country: Country;
  language: LanguageCode;
  value: LocationSelection;
  onApply: (next: LocationSelection) => void;
  onBack: () => void;
}) {
  const { theme } = useTheme();
  const t = useT();
  const tree = getLoadedTree(country.code);
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState<LocationSelection>(value);
  const [parentId, setParentId] = useState<string | null>(
    value.placeId && tree ? tree.places.find((p) => p.id === value.placeId)?.parentId ?? null : null,
  );

  const trail = useMemo(() => {
    if (!tree || !parentId) return [];
    const self = tree.places.find((p) => p.id === parentId);
    return self ? [...ancestorsOf(tree, parentId), self] : [];
  }, [tree, parentId]);

  const options = useMemo(() => {
    if (!tree) return [];
    if (query.trim()) return searchPlaces(tree.places, query, 40);
    return sortPlaces(childrenOf(tree, parentId), language);
  }, [tree, parentId, query, language]);

  // Страна без справочника — не ошибка, поиск по всей стране работает.
  if (!tree) {
    return (
      <SafeAreaView style={[s.root, { backgroundColor: theme.bg }]}>
        <View style={s.pad}>
          <Pressable onPress={onBack} hitSlop={10}>
            <Text style={{ color: theme.accentText, fontWeight: '700' }}>‹ {t('app.back')}</Text>
          </Pressable>
          <Text style={{ color: theme.muted, marginTop: space.xl, lineHeight: 21 }}>
            {t('place.noDetailYet', { country: country.nativeName })}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const label = levelLabel(tree, trail.length + 1, language);
  const selected = draft.placeId ? tree.places.find((p) => p.id === draft.placeId) : null;
  const canUseRadius = selected ? hasCoords(selected) : false;

  function choose(place: Place) {
    setDraft({ placeId: place.id, lat: place.lat, lon: place.lon, radiusKm: draft.radiusKm });
    // Есть куда углубиться — предлагаем, но выбор уже засчитан: человек может
    // остановиться на области, не доходя до города.
    if (childrenOf(tree!, place.id).length > 0) {
      setParentId(place.id);
      setQuery('');
    }
  }

  return (
    <SafeAreaView style={[s.root, { backgroundColor: theme.bg }]}>
      <View style={s.pad}>
        <View style={s.head}>
          <Pressable
            onPress={() => {
              if (parentId) {
                setParentId(tree.places.find((p) => p.id === parentId)?.parentId ?? null);
              } else {
                onBack();
              }
            }}
            hitSlop={10}
          >
            <Text style={{ color: theme.accentText, fontWeight: '700' }}>
              {parentId ? `‹ ${t('app.back')}` : `‹ ${t('app.close')}`}
            </Text>
          </Pressable>
          <Text style={[type.label, { color: theme.ink }]}>{label || t('list.place')}</Text>
        </View>

        {trail.length > 0 && (
          <Text style={{ color: theme.muted, fontSize: 12, marginBottom: space.sm }}>
            {trail.map((p) => displayName(p, language)).join(' → ')}
          </Text>
        )}

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('place.search')}
          placeholderTextColor={theme.muted}
          style={[s.search, { borderColor: theme.line, backgroundColor: theme.surface2, color: theme.ink }]}
        />

        <Pressable
          onPress={() => setDraft({ placeId: null })}
          style={[
            s.item,
            {
              borderColor: draft.placeId === null ? theme.accent : theme.line,
              backgroundColor: draft.placeId === null ? theme.accentSoft : theme.surface,
            },
          ]}
        >
          <Text style={{ color: theme.ink, fontWeight: '700', flex: 1 }}>{t('place.wholeCountry')}</Text>
        </Pressable>
      </View>

      <FlatList
        data={options}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ paddingHorizontal: space.lg }}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => {
          const on = draft.placeId === item.id;
          const hasKids = childrenOf(tree, item.id).length > 0;
          return (
            <Pressable
              onPress={() => choose(item)}
              style={({ pressed }) => [
                s.item,
                {
                  borderColor: on ? theme.accent : theme.line,
                  backgroundColor: on ? theme.accentSoft : pressed ? theme.surface2 : theme.surface,
                },
              ]}
            >
              <Text style={{ color: theme.ink, fontWeight: '600', flex: 1 }}>
                {displayName(item, language)}
              </Text>
              {hasKids && <Text style={{ color: theme.muted, fontSize: 17 }}>›</Text>}
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <Text style={{ color: theme.muted, textAlign: 'center', paddingVertical: space.xl }}>
            {t('place.nothing')}
          </Text>
        }
      />

      <View style={[s.footer, { borderTopColor: theme.line }]}>
        {canUseRadius && (
          <>
            <Text style={[type.label, { color: theme.ink2, marginBottom: space.sm }]}>
              {t('place.inRadius')}
            </Text>
            <View style={s.radiusRow}>
              {RADIUS_OPTIONS.map((r) => {
                const on = (draft.radiusKm ?? 0) === r;
                return (
                  <Pressable
                    key={r}
                    onPress={() => setDraft({ ...draft, radiusKm: r })}
                    style={[
                      s.radius,
                      {
                        backgroundColor: on ? theme.accent : theme.surface,
                        borderColor: on ? theme.accent : theme.line,
                      },
                    ]}
                  >
                    <Text style={{ color: on ? theme.accentInk : theme.ink2, fontSize: 12, fontWeight: '700' }}>
                      {r === 0 ? t('place.byBorders') : `${r} ${translateLabel('км', language)}`}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        <Pressable
          onPress={() => onApply(draft)}
          style={({ pressed }) => [s.cta, { backgroundColor: theme.accent, opacity: pressed ? 0.85 : 1 }]}
        >
          <Text style={{ color: theme.accentInk, fontWeight: '700', fontSize: 15 }}>{t('place.done')}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  pad: { paddingHorizontal: space.lg, paddingTop: space.md },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.sm },
  search: { borderWidth: 1, borderRadius: radius.sm, padding: 12, fontSize: 15, marginBottom: space.sm },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 13,
    marginBottom: space.sm,
  },
  footer: { padding: space.lg, borderTopWidth: 1 },
  radiusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginBottom: space.md },
  radius: { borderWidth: 1, borderRadius: radius.pill, paddingVertical: 7, paddingHorizontal: 12 },
  cta: { padding: 15, borderRadius: radius.md, alignItems: 'center' },
});
