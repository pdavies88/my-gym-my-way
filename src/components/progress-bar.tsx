import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { useTheme } from '@/hooks/use-theme';

/** A thin bar that springs to the new value whenever `progress` (0 to 1) changes. */
export function ProgressBar({ progress }: { progress: number }) {
  const theme = useTheme();
  const value = useSharedValue(progress);

  useEffect(() => {
    value.set(withSpring(progress, { damping: 18, stiffness: 140 }));
  }, [progress, value]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${Math.min(1, Math.max(0, value.get())) * 100}%` }));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
      style={[styles.track, { backgroundColor: theme.backgroundElement }]}>
      <Animated.View style={[styles.fill, { backgroundColor: theme.tint }, fillStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 6, borderRadius: 1, overflow: 'hidden' },
  fill: { height: '100%' },
});
