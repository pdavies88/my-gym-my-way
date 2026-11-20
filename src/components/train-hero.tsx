import { Image, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { AppName } from '@/constants/brand';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const ICON = require('@/assets/images/icon.png');

/** "Good morning" before noon, "Good afternoon" until 5 PM, then "Good evening". */
function greeting(now: number): string {
  const hour = new Date(now).getHours();
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
}

/** The top of the Train tab: the app icon and name, a greeting, and this week at a glance. */
export function TrainHero({ now, thisWeek, weekStreak }: { now: number; thisWeek: number; weekStreak: number }) {
  const theme = useTheme();
  const line =
    thisWeek === 0
      ? 'No sessions yet this week. A short one counts.'
      : `${thisWeek} ${thisWeek === 1 ? 'session' : 'sessions'} this week${
          weekStreak > 1 ? ` · ${weekStreak} weeks in a row` : ''
        }`;

  return (
    <Animated.View entering={FadeInDown.duration(380)} style={styles.hero}>
      <View style={styles.brand}>
        <Image source={ICON} style={[styles.icon, { borderColor: theme.border }]} accessibilityIgnoresInvertColors />
        <ThemedText type="eyebrow" themeColor="tint">
          {AppName}
        </ThemedText>
      </View>
      <ThemedText type="title">{greeting(now)}</ThemedText>
      <ThemedText themeColor="textSecondary">{line}</ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  hero: { gap: Spacing.two, paddingTop: Spacing.two },
  brand: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, marginBottom: Spacing.one },
  icon: { width: 56, height: 56, borderRadius: 14, borderWidth: 1 },
});
