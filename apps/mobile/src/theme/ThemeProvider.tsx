import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes, type Theme, type ThemeName } from './tokens';

/**
 * Тема приложения.
 *
 * По умолчанию берём системную настройку телефона: человек уже выбрал,
 * как ему удобно, и приложение не должно спорить. Полумесяц переопределяет
 * выбор, и это запоминается.
 */

const KEY = 'nova.theme';

type ThemeContextValue = { theme: Theme; name: ThemeName; toggle: () => void };

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [override, setOverride] = useState<ThemeName | null>(null);

  useEffect(() => {
    // Читаем тему напрямую из нативного хранилища. ThemeProvider монтируется
    // раньше инициализации общего storage-adapter, поэтому так выбор темы
    // надёжно восстанавливается при каждом запуске приложения.
    void AsyncStorage.getItem(KEY)
      .then((saved) => {
        if (saved === 'dark' || saved === 'light') setOverride(saved);
      })
      .catch(() => {});
  }, []);

  const name: ThemeName = override ?? (system === 'light' ? 'light' : 'dark');

  const toggle = useCallback(() => {
    const next: ThemeName = name === 'dark' ? 'light' : 'dark';
    setOverride(next);
    void AsyncStorage.setItem(KEY, next).catch(() => {});
  }, [name]);

  const value = useMemo(() => ({ theme: themes[name], name, toggle }), [name, toggle]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme вызван вне ThemeProvider');
  return ctx;
}
