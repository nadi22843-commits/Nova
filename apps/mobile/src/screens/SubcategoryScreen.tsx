import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { subcategoriesForDeal, translateLabel, type CategoryModule } from '@nova/core';
import { useTheme } from '../theme/ThemeProvider';
import { space, radius, type } from '../theme/tokens';
import { useT, useLocaleLanguage } from '../i18n/LocaleContext';

/**
 * Экран категории: сначала что хочет сделать человек, потом тип объекта.
 *
 * Оба шага на одном экране — на телефоне лишний переход дороже, чем
 * небольшая прокрутка.
 */
export function SubcategoryScreen({
  category,
  intentId,
  onPickIntent,
  onPickSubcategory,
  onBack,
}: {
  category: CategoryModule;
  intentId: string | null;
  onPickIntent: (id: string) => void;
  onPickSubcategory: (subId: string) => void;
  onBack: () => void;
}) {
  const { theme } = useTheme();
  const t = useT();
  const language = useLocaleLanguage();
  const intent = category.intents.find((i) => i.id === intentId);

  return (
    <SafeAreaView style={[s.root, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Pressable onPress={onBack} hitSlop={10}>
          <Text style={{ color: theme.accentText, fontWeight: '700' }}>‹ {t('app.back')}</Text>
        </Pressable>

        <Text style={[type.h1, { color: theme.ink, marginTop: space.md, marginBottom: space.lg }]}>
          {translateLabel(category.title, language)}
        </Text>

        <Text style={[type.label, { color: theme.muted, marginBottom: space.sm }]}>
          {t('category.chooseAction')}
        </Text>
        <View style={s.intents}>
          {category.intents.map((i) => {
            const on = i.id === intentId;
            return (
              <Pressable
                key={i.id}
                onPress={() => onPickIntent(i.id)}
                style={({ pressed }) => [
                  s.intent,
                  {
                    backgroundColor: on ? theme.accent : theme.surface,
                    borderColor: on ? theme.accent : theme.line,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Text style={{ color: on ? theme.accentInk : theme.ink, fontWeight: '700', fontSize: 13.5 }}>
                  {translateLabel(i.title, language)}
                </Text>
                <Text
                  style={{ color: on ? theme.accentInk : theme.muted, fontSize: 11, marginTop: 2 }}
                  numberOfLines={1}
                >
                  {translateLabel(i.subtitle, language)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {intent && (
          <>
            <Text style={[type.label, { color: theme.muted, marginTop: space.xl, marginBottom: space.sm }]}>
              {intent.mode === 'publish' ? t('picker.whatPublish') : t('picker.whatLooking')}
            </Text>
            {/* Только то, что существует в выбранном виде сделки. */}
            {subcategoriesForDeal(category.subcategories, intent.deal).map((sub) => (
              <Pressable
                key={sub.id}
                onPress={() => onPickSubcategory(sub.id)}
                style={({ pressed }) => [
                  s.sub,
                  { backgroundColor: pressed ? theme.surface2 : theme.surface, borderColor: theme.line },
                ]}
              >
                <Text style={{ color: theme.ink, fontWeight: '600', fontSize: 14, flex: 1 }}>
                  {translateLabel(sub.title, language)}
                </Text>
                <Text style={{ color: theme.muted, fontSize: 17 }}>›</Text>
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: space.xxl },
  intents: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  intent: { borderWidth: 1, borderRadius: radius.md, paddingVertical: 11, paddingHorizontal: 14, minWidth: '47%' },
  sub: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: space.sm,
  },
});
