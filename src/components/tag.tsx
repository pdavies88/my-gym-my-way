import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function Tag({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'tint' }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.tag,
        tone === 'tint' ? { backgroundColor: theme.tint } : { borderColor: theme.border, borderWidth: 1 },
      ]}>
      <ThemedText type="eyebrow" style={[styles.label, { color: tone === 'tint' ? theme.onTint : theme.textSecondary }]}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    borderRadius: Radius.control,
    alignSelf: 'flex-start',
  },
  label: { fontSize: 10, lineHeight: 13, letterSpacing: 1.5 },
});
