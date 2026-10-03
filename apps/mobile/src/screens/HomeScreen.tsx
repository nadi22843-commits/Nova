import { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Image, ImageBackground, ImageSourcePropType, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { allItems, resolveHomeTiles, translateLabel, type CatalogItem } from '@nova/core';
import { useTheme } from '../theme/ThemeProvider';
import { MoonToggle } from '../components/MoonToggle';
import { mobileImage } from '../components/ListingCard';
import { useT, useLocaleLanguage } from '../i18n/LocaleContext';

const PURPLE = '#5B21F4';

const CATEGORY_IMAGES: Record<string, ImageSourcePropType> = {
  auto: require('../../assets/car.jpg'),
  realty: require('../../assets/house.jpg'),
  work: require('../../assets/apartment.jpg'),
  services: require('../../assets/hero.jpg'),
  electronics: require('../../assets/laptop.jpg'),
  home: require('../../assets/phone.jpg'),
};

export function HomeScreen({
  onOpenCategory,
  onOpenSystem,
  onOpenItem,
  place,
  money,
}: {
  onOpenCategory: (path: string) => void;
  onOpenSystem: () => void;
  onOpenItem: (item: CatalogItem) => void;
  place: string;
  money: (amount: number, currency?: string) => string;
}) {
  const { theme } = useTheme();
  const t = useT();
  const language = useLocaleLanguage();
  const tiles = resolveHomeTiles().filter((x) => x.available).slice(0, 6);
  const [query, setQuery] = useState('');
  const all = allItems().filter((x) => Boolean(x.image));
  const popular = all.slice(0, 4);
  const results = useMemo(() => {
    const q = query.trim().toLocaleLowerCase(language);
    if (!q) return popular;
    return all.filter((item) => item.title.toLocaleLowerCase(language).includes(q)).slice(0, 12);
  }, [query, language]);
  const heroTile = tiles.find((x) => x.categoryId === 'realty') ?? tiles[0];
  const isDark = theme.bg !== '#ffffff';

  return (
    <SafeAreaView style={[s.root, { backgroundColor: theme.bg }]} edges={['top']}>
      <View style={s.header}>
        <View style={s.brandRow}>
          <View style={s.logoMark}><Text style={s.logoStar}>✦</Text></View>
          <Text style={[s.brand, { color: isDark ? '#FFFFFF' : '#17005C' }]}>Nova</Text>
        </View>
        <View style={s.headerActions}>
          <MoonToggle />
          <Pressable onPress={onOpenSystem} style={[s.location, { backgroundColor: theme.surface2, borderColor: theme.line }]}>
            <Text style={{ fontSize: 14 }}>●</Text>
            <Text numberOfLines={1} style={[s.locationText, { color: theme.ink }]}>{place}</Text>
            <Text style={{ color: theme.muted }}>⌄</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={[s.search, { backgroundColor: theme.surface, borderColor: theme.line }]}>
          <Text style={{ color: theme.muted, fontSize: 21 }}>⌕</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Поиск по объявлениям"
            placeholderTextColor={theme.muted}
            returnKeyType="search"
            style={[s.searchInput, { color: theme.ink }]}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} style={[s.clearSearch, { backgroundColor: theme.surface2 }]} accessibilityLabel="Очистить поиск">
              <Text style={{ color: theme.muted, fontSize: 16 }}>×</Text>
            </Pressable>
          )}
        </View>

        {!query.trim() && <>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.categories}>
          {tiles.map((tile) => (
            <Pressable key={tile.label} onPress={() => onOpenCategory(tile.to)} style={({ pressed }) => [s.category, { opacity: pressed ? 0.82 : 1 }]}>
              <ImageBackground
                source={CATEGORY_IMAGES[tile.categoryId ?? ''] ?? require('../../assets/hero.jpg')}
                style={s.categoryImage}
                imageStyle={s.categoryImageRadius}
              >
                <View style={s.categoryShade}>
                  <Text numberOfLines={2} style={s.categoryLabel}>
                    {tile.categoryId ? translateLabel(tile.label, language) : t('app.allCategories')}
                  </Text>
                </View>
              </ImageBackground>
            </Pressable>
          ))}
        </ScrollView>

        {heroTile && (
          <Pressable onPress={() => onOpenCategory(heroTile.to)} style={s.heroWrap}>
            <ImageBackground source={require('../../assets/house.jpg')} style={s.hero} imageStyle={s.heroImage}>
              <View style={s.heroShade}>
                <Text style={s.heroTitle}>Недвижимость{`\n`}для жизни и инвестиций</Text>
                <Text style={s.heroText}>Квартиры, дома и участки рядом с вами</Text>
                <View style={s.heroCta}><Text style={s.heroCtaText}>Смотреть предложения  →</Text></View>
              </View>
            </ImageBackground>
          </Pressable>
        )}
        </>}

        <View style={s.sectionHead}>
          <Text style={[s.sectionTitle, { color: theme.ink }]}>{query.trim() ? 'Результаты поиска' : 'Популярные объявления'}</Text>
          {!query.trim() && <Pressable onPress={() => heroTile && onOpenCategory(heroTile.to)}><Text style={s.seeAll}>Смотреть все →</Text></Pressable>}
        </View>

        <View style={s.grid}>
          {results.map((item) => (
            <Pressable key={item.id} onPress={() => onOpenItem(item)} style={[s.card, { backgroundColor: theme.surface }]}>
              <View style={s.cardMedia}>
                <Image source={mobileImage(item.image)} style={s.cardImage} resizeMode="cover" />
              </View>
              <View style={s.cardBody}>
                <Text numberOfLines={2} style={[s.cardTitle, { color: theme.ink }]}>{item.title}</Text>
                <Text style={[s.price, { color: theme.ink }]}>{money(item.price, item.currency)}</Text>
                <Text numberOfLines={1} style={{ color: theme.muted, fontSize: 11 }}>⌖ {place}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View style={[s.bottom, { backgroundColor: theme.surface, borderColor: theme.line }]}>
        <View style={s.navItem}><Text style={[s.navIcon, { color: PURPLE }]}>⌂</Text><Text style={[s.navText, { color: PURPLE }]}>Главная</Text></View>
        <Pressable style={s.publish} onPress={() => heroTile && onOpenCategory(heroTile.to)} accessibilityLabel="Подать объявление"><Text style={s.plus}>＋</Text></Pressable>
        <Pressable style={s.navItem} onPress={onOpenSystem}><Text style={[s.navIcon, { color: theme.muted }]}>⌖</Text><Text style={[s.navText, { color: theme.muted }]}>Город</Text></Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 9 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoMark: { width: 33, height: 33, borderWidth: 3, borderColor: PURPLE, borderRadius: 10, transform: [{ rotate: '45deg' }], alignItems: 'center', justifyContent: 'center' },
  logoStar: { color: PURPLE, fontSize: 20, transform: [{ rotate: '-45deg' }] },
  brand: { fontSize: 28, fontWeight: '900', letterSpacing: -1.2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  location: { maxWidth: 132, height: 40, paddingHorizontal: 10, borderRadius: 20, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  locationText: { fontSize: 12, fontWeight: '700', flexShrink: 1 },
  scroll: { paddingHorizontal: 14, paddingBottom: 96 },
  search: { height: 52, borderWidth: 1, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 14, paddingRight: 6, marginBottom: 12 },
  searchInput: { flex: 1, height: '100%', fontSize: 15, paddingVertical: 0 },
  clearSearch: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  categories: { gap: 9, paddingBottom: 14 },
  category: { width: 104, height: 88, borderRadius: 16, overflow: 'hidden' },
  categoryImage: { flex: 1, justifyContent: 'flex-end' },
  categoryImageRadius: { borderRadius: 16 },
  categoryShade: { minHeight: 42, justifyContent: 'flex-end', padding: 9, backgroundColor: 'rgba(8,5,20,.32)' },
  categoryLabel: { color: '#fff', fontSize: 11, fontWeight: '800', lineHeight: 13, textShadowColor: 'rgba(0,0,0,.45)', textShadowRadius: 3 },
  heroWrap: { borderRadius: 18, overflow: 'hidden', marginBottom: 18 },
  hero: { height: 188 },
  heroImage: { borderRadius: 18 },
  heroShade: { flex: 1, padding: 16, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,.30)' },
  heroTitle: { color: '#fff', fontSize: 22, lineHeight: 25, fontWeight: '900', maxWidth: 290, letterSpacing: -.5 },
  heroText: { color: '#fff', fontSize: 12.5, lineHeight: 17, marginTop: 8, fontWeight: '600', maxWidth: 260 },
  heroCta: { alignSelf: 'flex-start', marginTop: 12, backgroundColor: PURPLE, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9 },
  heroCtaText: { color: '#fff', fontSize: 11.5, fontWeight: '800' },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { fontSize: 19, fontWeight: '900', letterSpacing: -.4 },
  seeAll: { color: PURPLE, fontSize: 11.5, fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  card: { width: '48.5%', borderRadius: 16, overflow: 'hidden' },
  cardMedia: { height: 126, position: 'relative' },
  cardImage: { width: '100%', height: '100%' },
  cardBody: { padding: 10, gap: 4 },
  cardTitle: { fontSize: 13, lineHeight: 17, fontWeight: '700', minHeight: 34 },
  price: { fontSize: 15, fontWeight: '900' },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 78, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingBottom: 8, paddingHorizontal: 44 },
  navItem: { minWidth: 64, alignItems: 'center', justifyContent: 'center', gap: 3 },
  navIcon: { fontSize: 22 },
  navText: { fontSize: 9.5, fontWeight: '700' },
  publish: { width: 56, height: 56, borderRadius: 28, backgroundColor: PURPLE, alignItems: 'center', justifyContent: 'center', marginTop: -28, shadowColor: '#000', shadowOpacity: .18, shadowRadius: 8, elevation: 5 },
  plus: { color: '#fff', fontSize: 34, fontWeight: '300', marginTop: -3 },
});
