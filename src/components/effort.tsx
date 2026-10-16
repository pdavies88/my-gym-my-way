import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { EFFORT_LABELS, type Effort } from '@/lib/cardio';

/** One color per effort level, from cool and easy to hot and hard. Shared with the BMI scale's palette. */
export const EFFORT_COLORS: Record<Effort, string> = {
  warmup: '#5CC8FF',
  easy: '#5CC8FF',
  moderate: '#C8FF2E',
  hard: '#FFC233',
  max: '#FF5A36',
  rest: '#6B7270',
};

export function EffortChip({ effort, large }: { effort: Effort; large?: boolean }) {
  return (
    <View style={[styles.chip, large && styles.large, { backgroundColor: EFFORT_COLORS[effort] }]}>
      <ThemedText type="eyebrow" style={[styles.label, large && styles.largeLabel]}>
        {EFFORT_LABELS[effort]}
      </ThemedText>
    </View>
  );
}

/** A thin bar split by how long the session spends at each effort, in order. */
export function EffortStrip({ segments }: { segments: { effort: Effort; seconds: number }[] }) {
  return (
    <View style={styles.strip}>
      {segments.map((segment, i) => (
        <View
          key={i}
          style={{
            flex: segment.seconds,
            backgroundColor: EFFORT_COLORS[segment.effort],
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    borderRadius: Radius.control,
  },
  large: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.one },
  label: { color: '#0A0B0A', fontSize: 11, lineHeight: 14 },
  largeLabel: { fontSize: 14, lineHeight: 18 },
  strip: {
    flexDirection: 'row',
    height: 8,
    gap: 2,
    borderRadius: 1,
    overflow: 'hidden',
  },
});
