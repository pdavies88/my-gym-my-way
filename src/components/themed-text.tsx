import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { DisplayFont, Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'display' | 'title' | 'heading' | 'eyebrow' | 'small' | 'smallBold' | 'mono';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  return <Text style={[{ color: theme[themeColor ?? 'text'] }, styles[type], style]} {...rest} />;
}

const styles = StyleSheet.create({
  default: { fontSize: 16, lineHeight: 23, fontWeight: 500 },
  small: { fontSize: 14, lineHeight: 20, fontWeight: 500 },
  smallBold: { fontSize: 14, lineHeight: 20, fontWeight: 700 },
  /** Huge numbers, such as the BMI value and the session timer. */
  display: {
    fontFamily: DisplayFont.bold,
    fontWeight: 'normal',
    fontSize: 56,
    lineHeight: 60,
    letterSpacing: -1.5,
    fontVariant: ['tabular-nums'],
  },
  title: {
    fontFamily: DisplayFont.bold,
    fontWeight: 'normal',
    fontSize: 38,
    lineHeight: 40,
    letterSpacing: -0.5,
    textTransform: 'uppercase',
  },
  heading: {
    fontFamily: DisplayFont.semiBold,
    fontWeight: 'normal',
    fontSize: 19,
    lineHeight: 24,
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  /** Small uppercase label above a title or section. */
  eyebrow: {
    fontFamily: DisplayFont.semiBold,
    fontWeight: 'normal',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  mono: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: 700 }) ?? 600,
    fontSize: 13,
    fontVariant: ['tabular-nums'],
  },
});
