import { Pressable, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { radius } from '../theme/tokens';
import { useT } from '../i18n/LocaleContext';

/**
 * Полумесяц — переключатель темы.
 *
 * Область нажатия 44×44 — минимум, ниже которого палец промахивается.
 */
export function MoonToggle() {
  const { theme, name, toggle } = useTheme();
  const t = useT();

  return (
    <Pressable
      onPress={toggle}
      accessibilityRole="button"
      accessibilityLabel={t('theme.switchTo', { mode: name === 'dark' ? t('theme.dayShort') : t('theme.nightShort') })}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: theme.surface2,
          borderColor: theme.line,
          opacity: pressed ? 0.7 : 1,
          transform: [{ scale: pressed ? 0.94 : 1 }],
        },
      ]}
      hitSlop={6}
    >
      <Text style={{ fontSize: 17, color: theme.accentText }}>{name === 'dark' ? '☾' : '☀'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
