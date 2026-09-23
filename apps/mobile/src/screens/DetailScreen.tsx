import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cardFields, getLoadedTree, ancestorsOf, displayName, translateLabel, type CatalogItem, type CategoryModule, type TranslationKey } from '@nova/core';
import { useTheme } from '../theme/ThemeProvider';
import { space, radius, type } from '../theme/tokens';
import { useT, useLocaleLanguage } from '../i18n/LocaleContext';
import { mobileImage } from '../components/ListingCard';

const SELLER_LABEL: Record<string, TranslationKey> = {
  owner: 'seller.owner',
  agent: 'seller.agent',
  company: 'seller.company',
};

/**
 * Карточка объявления.
 *
 * Строки характеристик собираются из тех же полей, что заполнял автор,
 * поэтому карточка не может оказаться беднее формы.
 */
export function DetailScreen({
  item,
  category,
  money,
  date,
  onBack,
  onContact,
}: {
  item: CatalogItem;
  category: CategoryModule;
  money: (amount: number, currency?: string) => string;
  date: (value: string) => string;
  onBack: () => void;
  onContact: (kind: 'call' | 'message') => void;
}) {
  const { theme } = useTheme();
  const t = useT();
  const language = useLocaleLanguage();
  const [notice, setNotice] = useState('');

  const sub = category.subcategories.find((x) => x.id === item.subcategoryId);
  const rows = sub ? cardFields(sub) : [];

  const tree = getLoadedTree(item.countryCode);
  const place = tree?.places.find((p) => p.id === item.placeId);
  const where = place ? [...ancestorsOf(tree!, place.id), place].map((p) => displayName(p, language)).join(', ') : '';

  function contact(kind: 'call' | 'message') {
    onContact(kind);
    setNotice(kind === 'call' ? t('listing.phoneSoon') : t('listing.chatSoon'));
  }

  return (
    <SafeAreaView style={[s.root, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Pressable onPress={onBack} hitSlop={10}>
          <Text style={{ color: theme.accentText, fontWeight: '700', marginBottom: space.md }}>‹ {t('listing.toList')}</Text>
        </Pressable>

        <Image source={mobileImage(item.image)} style={[s.photo, { backgroundColor: theme.surface2 }]} resizeMode="cover" />

        <Text style={[type.h1, { color: theme.ink, marginTop: space.lg }]}>
          {money(item.price, item.currency)}
        </Text>
        <Text style={[type.h2, { color: theme.ink2, marginTop: space.xs }]}>{item.title}</Text>
        {where !== '' && (
          <Text style={{ color: theme.muted, fontSize: 12, marginTop: space.xs }}>◎ {where}</Text>
        )}

        <View style={[s.specs, { borderColor: theme.line }]}>
          {rows
            .filter((f) => item.attrs[f.key])
            .map((f, index) => (
              <View
                key={f.key}
                style={[
                  s.specRow,
                  { borderTopWidth: index === 0 ? 0 : 1, borderTopColor: theme.line },
                ]}
              >
                <Text style={{ color: theme.muted, fontSize: 13 }}>{translateLabel(f.label, language)}</Text>
                <Text style={{ color: theme.ink, fontSize: 13, fontWeight: '700', flexShrink: 1, textAlign: 'right' }}>
                  {translateLabel(item.attrs[f.key], language)}
                  {f.unit ? ` ${translateLabel(f.unit, language)}` : ''}
                </Text>
              </View>
            ))}
        </View>

        <View style={[s.seller, { borderColor: theme.line }]}>
          <Text style={{ color: theme.ink, fontWeight: '700', fontSize: 14 }}>{item.seller.name}</Text>
          <Text style={{ color: theme.muted, fontSize: 12, marginTop: 2 }}>
            {t(SELLER_LABEL[item.seller.kind])}
            {item.seller.verified ? ` · ${t('seller.verified')}` : ''}
          </Text>
          <Text style={{ color: theme.muted, fontSize: 12, marginTop: 2 }}>
            {t('listing.publishedOn', { date: date(item.publishedAt) })}
          </Text>
        </View>

        {notice !== '' && (
          <View style={[s.notice, { backgroundColor: theme.accentSoft, borderColor: theme.line }]}>
            <Text style={{ color: theme.ink2, fontSize: 12.5, lineHeight: 18 }}>{notice}</Text>
          </View>
        )}

        <Pressable
          onPress={() => contact('call')}
          style={({ pressed }) => [s.cta, { backgroundColor: theme.accent, opacity: pressed ? 0.85 : 1 }]}
        >
          <Text style={{ color: theme.accentInk, fontWeight: '700', fontSize: 15 }}>{t('listing.call')}</Text>
        </Pressable>

        <Pressable
          onPress={() => contact('message')}
          style={({ pressed }) => [
            s.cta,
            s.ctaGhost,
            { borderColor: theme.accent, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={{ color: theme.accentText, fontWeight: '700', fontSize: 15 }}>{t('listing.message')}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: space.xxl },
  photo: { height: 220, borderRadius: radius.lg },
  specs: { borderWidth: 1, borderRadius: radius.md, marginTop: space.xl, overflow: 'hidden' },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: space.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  seller: { borderWidth: 1, borderRadius: radius.md, padding: space.lg, marginTop: space.md },
  notice: { borderWidth: 1, borderRadius: radius.sm, padding: space.md, marginTop: space.md },
  cta: { marginTop: space.md, padding: 15, borderRadius: radius.md, alignItems: 'center' },
  ctaGhost: { backgroundColor: 'transparent', borderWidth: 1.5 },
});
