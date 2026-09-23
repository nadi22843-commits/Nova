import { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCountries, guessCountry, LANGUAGE_NAMES, translate, type Country, type LanguageCode } from '@nova/core';
import { useTheme } from '../theme/ThemeProvider';
import { MoonToggle } from '../components/MoonToggle';
import { space, radius, type } from '../theme/tokens';

/**
 * Приветствие: два шага и явная кнопка «Продолжить».
 *
 * Раньше нажатие на страну сразу проваливало дальше — человек не успевал
 * понять, что произошло, и не мог выбрать язык. А в Швейцарии их четыре,
 * в ОАЭ три, в Канаде два.
 */
export function WelcomeScreen({ onDone }: { onDone: (country: string, language: LanguageCode) => void }) {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<Country | null>(null);
  const [language, setLanguage] = useState<LanguageCode | null>(null);
  // Язык интерфейса ещё не выбран: до выбора страны показываем на английском
  // (как и Web) — так экран не может оказаться на непредсказуемом языке.
  const previewLang = picked ? language ?? picked.defaultLanguage : 'en';
  const t = (key: Parameters<typeof translate>[1], params?: Parameters<typeof translate>[2]) =>
    translate(previewLang, key, params);

  const countries = getCountries();
  const suggested = useMemo(() => {
    const guess = guessCountry();
    return guess && countries.some((c) => c.code === guess.code) ? guess : undefined;
  }, [countries]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter(
      (c) =>
        c.nativeName.toLowerCase().includes(q) ||
        c.englishName.toLowerCase().includes(q) ||
        c.code.toLowerCase() === q,
    );
  }, [query, countries]);

  // ── Шаг 2: подтверждение ──
  if (picked) {
    let money = picked.currency;
    try {
      money = new Intl.NumberFormat(picked.locale, {
        style: 'currency',
        currency: picked.currency,
        maximumFractionDigits: 0,
      }).format(2_900_000);
    } catch {
      /* оставляем код валюты */
    }

    return (
      <SafeAreaView style={[s.root, { backgroundColor: theme.bg }]}>
        <View style={s.themeToggle}><MoonToggle /></View>
        <View style={s.pad}>
          <Pressable onPress={() => setPicked(null)} hitSlop={10}>
            <Text style={{ color: theme.accentText, fontWeight: '700', marginBottom: space.lg }}>
              ‹ {t('welcome.otherCountry')}
            </Text>
          </Pressable>

          <Text style={{ fontSize: 48, marginBottom: space.sm }}>{picked.flag}</Text>
          <Text style={[type.h1, { color: theme.ink, marginBottom: space.xs }]}>{picked.nativeName}</Text>
          <Text style={{ color: theme.muted, marginBottom: space.xl }}>
            {t('welcome.summary')}
          </Text>

          <View style={[s.block, { borderColor: theme.line }]}>
            <Text style={[type.label, { color: theme.muted, marginBottom: space.sm }]}>{t('welcome.appLanguage')}</Text>
            {picked.languages.length > 1 ? (
              <View style={s.langRow}>
                {picked.languages.map((l) => {
                  const on = (language ?? picked.defaultLanguage) === l;
                  return (
                    <Pressable
                      key={l}
                      onPress={() => setLanguage(l)}
                      style={[
                        s.lang,
                        {
                          borderColor: on ? theme.accent : theme.line,
                          backgroundColor: on ? theme.accentSoft : 'transparent',
                        },
                      ]}
                    >
                      <Text style={{ color: on ? theme.accentText : theme.ink2, fontWeight: '700' }}>
                        {LANGUAGE_NAMES[l]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <Text style={{ color: theme.ink, fontWeight: '700' }}>
                {LANGUAGE_NAMES[picked.defaultLanguage]}
              </Text>
            )}
          </View>

          <View style={[s.block, { borderColor: theme.line, marginTop: space.md }]}>
            <Text style={[type.label, { color: theme.muted, marginBottom: space.sm }]}>{t('welcome.currency')}</Text>
            <Text style={{ color: theme.ink, fontWeight: '700' }}>
              {t('welcome.currencyPreview', { currency: picked.currency, money })}
            </Text>
          </View>

          <Pressable
            onPress={() => onDone(picked.code, language ?? picked.defaultLanguage)}
            style={({ pressed }) => [
              s.cta,
              { backgroundColor: theme.accent, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={{ color: theme.accentInk, fontWeight: '700', fontSize: 15 }}>{t('welcome.continue')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ── Шаг 1: выбор страны ──
  return (
    <SafeAreaView style={[s.root, { backgroundColor: theme.bg }]}>
      <View style={s.themeToggle}><MoonToggle /></View>
      <View style={s.pad}>
        <Text style={[type.h1, { color: theme.ink, marginBottom: space.xs }]}>{t('welcome.title')}</Text>
        <Text style={{ color: theme.muted, marginBottom: space.lg }}>
          {t('welcome.chooseCountryHint')}
        </Text>

        {suggested && (
          <Pressable
            onPress={() => setPicked(suggested)}
            style={[s.country, { borderColor: theme.accent, backgroundColor: theme.accentSoft }]}
          >
            <Text style={s.flag}>{suggested.flag}</Text>
            <Text style={{ color: theme.ink, fontWeight: '700', flex: 1 }}>{suggested.nativeName}</Text>
            <Text style={{ color: theme.muted, fontSize: 12, fontWeight: '700' }}>{suggested.currency}</Text>
          </Pressable>
        )}

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('welcome.findCountry')}
          placeholderTextColor={theme.muted}
          style={[s.search, { borderColor: theme.line, backgroundColor: theme.surface2, color: theme.ink }]}
        />
      </View>

      <FlatList
        data={visible}
        keyExtractor={(c) => c.code}
        contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: space.xxl }}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setPicked(item)}
            style={({ pressed }) => [
              s.country,
              { borderColor: theme.line, backgroundColor: pressed ? theme.surface2 : theme.surface },
            ]}
          >
            <Text style={s.flag}>{item.flag}</Text>
            <Text style={{ color: theme.ink, fontWeight: '700', flex: 1 }}>{item.nativeName}</Text>
            <Text style={{ color: theme.muted, fontSize: 12, fontWeight: '700' }}>{item.currency}</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={{ color: theme.muted, textAlign: 'center', paddingVertical: space.xl }}>
            {t('welcome.countryNotFound', { query })}
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  themeToggle: { position: 'absolute', top: space.sm, right: space.lg, zIndex: 10 },
  pad: { paddingHorizontal: space.lg, paddingTop: space.lg },
  block: { borderWidth: 1, borderRadius: radius.md, padding: space.lg },
  langRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  lang: { borderWidth: 1.5, borderRadius: radius.sm, paddingVertical: 9, paddingHorizontal: 13 },
  cta: { marginTop: space.xl, padding: 15, borderRadius: radius.md, alignItems: 'center' },
  search: {
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: 13,
    fontSize: 15,
    marginBottom: space.md,
  },
  country: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: space.sm,
  },
  flag: { fontSize: 22 },
});
