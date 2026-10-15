import '@/global.css';

import { Platform } from 'react-native';

// The app is dark only: near-black surfaces, sharp corners and one acid-lime accent.
const palette = {
  text: '#F4F5F2',
  background: '#0A0B0A',
  backgroundElement: '#1A1D1B',
  backgroundSelected: '#252925',
  card: '#121412',
  textSecondary: '#9BA19D',
  tint: '#C8FF2E',
  onTint: '#0A0B0A',
  accent: '#FF5A36',
  danger: '#FF5A5A',
  border: '#272B28',
  success: '#C8FF2E',
} as const;

export const Colors = { light: palette, dark: palette } as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
export type ThemeColors = (typeof Colors)['light' | 'dark'];

export const Fonts = Platform.select({
  ios: { sans: 'system-ui', serif: 'ui-serif', rounded: 'ui-rounded', mono: 'ui-monospace' },
  default: { sans: 'normal', serif: 'serif', rounded: 'normal', mono: 'monospace' },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

/**
 * Archivo gives headings and buttons a sturdy, athletic look. Body text stays in the system font
 * for legibility. Each weight is its own family, so don't combine these with fontWeight.
 */
export const DisplayFont = {
  medium: 'Archivo_600SemiBold',
  semiBold: 'Archivo_700Bold',
  bold: 'Archivo_800ExtraBold',
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  card: 6,
  control: 4,
  pill: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
