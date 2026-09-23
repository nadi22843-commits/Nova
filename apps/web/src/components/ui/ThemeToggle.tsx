import { useEffect, useState } from 'react';
import { safe } from '../safety/safeAction';
import { useT } from '../../shared/i18n/useT';

const KEY = 'nova.theme';
type ThemeName = 'light' | 'dark';

function initialTheme(): ThemeName {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {}
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeToggle() {
  const t = useT();
  const [theme, setTheme] = useState<ThemeName>(initialTheme);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem(KEY, theme); } catch {}
  }, [theme]);
  const next = theme === 'dark' ? 'light' : 'dark';
  return <button className="theme-toggle" type="button" aria-label={t('theme.switchTo', { mode: next === 'dark' ? t('theme.nightShort') : t('theme.dayShort') })} title={next === 'dark' ? t('theme.night') : t('theme.day')} onClick={safe(t('nav.theme'), () => setTheme(next))}>{theme === 'dark' ? '☀' : '☾'}</button>;
}
