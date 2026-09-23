import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { space, radius, type } from '../theme/tokens';
import { useT } from '../i18n/LocaleContext';

/** Экран после публикации. Ведёт в «Мои объявления», а не на главную. */
export function PublishedScreen({
  title,
  onMyListings,
  onHome,
}: {
  title: string;
  onMyListings: () => void;
  onHome: () => void;
}) {
  const { theme } = useTheme();
  const t = useT();

  return (
    <SafeAreaView style={[s.root, { backgroundColor: theme.bg }]}>
      <View style={s.center}>
        <View style={[s.mark, { borderColor: theme.accent }]}>
          <Text style={{ color: theme.accentText, fontSize: 30 }}>✓</Text>
        </View>

        <Text style={[type.h1, { color: theme.ink, textAlign: 'center' }]}>{t('published.moderation')}</Text>
        <Text style={{ color: theme.muted, textAlign: 'center', lineHeight: 21, maxWidth: 300 }}>
          {t('published.textModeration', { title })}
        </Text>

        <Pressable
          onPress={onMyListings}
          style={({ pressed }) => [s.cta, { backgroundColor: theme.accent, opacity: pressed ? 0.85 : 1 }]}
        >
          <Text style={{ color: theme.accentInk, fontWeight: '700', fontSize: 15 }}>{t('published.myListings')}</Text>
        </Pressable>

        <Pressable onPress={onHome} style={[s.cta, s.ghost, { borderColor: theme.line }]}>
          <Text style={{ color: theme.ink2, fontWeight: '700', fontSize: 15 }}>{t('app.toHome')}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md, paddingHorizontal: space.xl },
  mark: { width: 66, height: 66, borderRadius: 33, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginBottom: space.sm },
  cta: { padding: 15, borderRadius: radius.md, alignItems: 'center', width: '100%', maxWidth: 320, marginTop: space.sm },
  ghost: { backgroundColor: 'transparent', borderWidth: 1.5 },
});
