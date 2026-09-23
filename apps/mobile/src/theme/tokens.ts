/**
 * Токены Nova.
 *
 * Те же имена, что в веб-версии, — экраны не знают, какая тема включена.
 * Тёмная по умолчанию, светлая переключается полумесяцем.
 *
 * Про два зелёных. Заливка кнопок в обеих темах остаётся неоновой: на ней
 * тёмный текст, контраст 9:1. А акцентный ТЕКСТ на белом должен быть глубже —
 * кислотный зелёный на белом даёт 1.6:1 и не читается на солнце.
 */

export type ThemeName = 'dark' | 'light';

export type Theme = {
  bg: string;
  surface: string;
  surface2: string;
  line: string;
  ink: string;
  ink2: string;
  muted: string;
  accent: string;
  accentInk: string;
  accentSoft: string;
  accentText: string;
  danger: string;
};

export const themes: Record<ThemeName, Theme> = {
  dark: {
    bg: '#0d1210',
    surface: '#131a17',
    surface2: '#1a231f',
    line: '#222e28',
    ink: '#f0f4f2',
    ink2: '#b3c0ba',
    muted: '#6f7d76',
    accent: '#4ade80',
    accentInk: '#07120b',
    accentSoft: '#1c2f24',
    accentText: '#4ade80',
    danger: '#f87171',
  },
  light: {
    bg: '#ffffff',
    surface: '#ffffff',
    surface2: '#f5f8f6',
    line: '#e4eae7',
    ink: '#0c1512',
    ink2: '#3f4b46',
    muted: '#79877f',
    accent: '#34d97a',
    accentInk: '#06170e',
    accentSoft: '#e8fbef',
    accentText: '#0f8a49',
    danger: '#b3261e',
  },
};

/** Шкала отступов — кратна 4, чтобы вёрстка не расползалась. */
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 9, md: 13, lg: 16, pill: 999 } as const;

export const type = {
  brand: { fontSize: 23, fontWeight: '800' as const, letterSpacing: -0.8 },
  h1: { fontSize: 24, fontWeight: '800' as const, letterSpacing: -0.5 },
  h2: { fontSize: 17, fontWeight: '700' as const },
  price: { fontSize: 17, fontWeight: '800' as const, letterSpacing: -0.4 },
  body: { fontSize: 14, fontWeight: '500' as const },
  label: { fontSize: 12, fontWeight: '700' as const },
  meta: { fontSize: 11, fontWeight: '500' as const },
};
