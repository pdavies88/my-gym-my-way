import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Exercise } from '@/lib/exercises';
import {
  lastSets,
  parseTarget,
  progressHistory,
  suggestNext,
  summarizeSets,
  toDisplayWeight,
  usesWeight,
  weightUnit,
  type Units,
} from '@/lib/progress';
import type { SessionLog } from '@/lib/storage/schemas';

const BARS = 10;
const CHART_HEIGHT = 96;

/**
 * Your history with one exercise: a bar for each of the last ten sessions that logged it (the
 * heaviest set, or the most reps for bodyweight moves), your best, and what to aim for next time.
 */
export function ExerciseProgress({
  exercise,
  sessions,
  units,
}: {
  exercise: Exercise;
  sessions: readonly SessionLog[];
  units: Units;
}) {
  const theme = useTheme();
  const history = progressHistory(sessions, exercise.id);
  const target = parseTarget(exercise.prescription);
  const byWeight = usesWeight(exercise) && history.some((p) => p.topWeightKg !== undefined);
  const value = (p: (typeof history)[number]) => (byWeight ? toDisplayWeight(p.topWeightKg ?? 0, units) : p.bestReps);
  const unit = byWeight ? weightUnit(units) : target.measure === 'seconds' ? 'sec' : 'reps';

  if (history.length === 0) {
    return (
      <Card>
        <ThemedText type="small" themeColor="textSecondary">
          Log your sets during a workout and your progress shows up here, with a suggestion for next time.
        </ThemedText>
      </Card>
    );
  }

  const recent = history.slice(-BARS);
  const max = Math.max(...recent.map(value), 1);
  const best = Math.max(...history.map(value));
  const last = lastSets(sessions, exercise.id)!;
  const next = suggestNext(exercise, last.sets, units);

  return (
    <Card>
      <View style={styles.stats}>
        <View style={styles.stat}>
          <ThemedText type="eyebrow" themeColor="textSecondary">
            Best
          </ThemedText>
          <ThemedText type="heading">
            {best} {unit}
          </ThemedText>
        </View>
        <View style={styles.stat}>
          <ThemedText type="eyebrow" themeColor="textSecondary">
            Sessions
          </ThemedText>
          <ThemedText type="heading">{history.length}</ThemedText>
        </View>
      </View>
      <View
        style={styles.chart}
        accessibilityLabel={`${byWeight ? 'Heaviest set' : 'Most reps'} in your last ${recent.length} sessions: ${recent.map(value).join(', ')} ${unit}`}>
        {recent.map((point, i) => (
          <View key={point.at} style={styles.barSlot}>
            <View
              style={[
                styles.bar,
                {
                  height: Math.max(4, (value(point) / max) * CHART_HEIGHT),
                  backgroundColor: i === recent.length - 1 ? theme.tint : theme.backgroundSelected,
                },
              ]}
            />
          </View>
        ))}
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        {byWeight ? 'Heaviest set' : target.measure === 'seconds' ? 'Longest hold' : 'Most reps'} in each session. Last
        time: {summarizeSets(last.sets, target.measure, units)}.
      </ThemedText>
      <ThemedText type="small" themeColor="tint">
        {next.text}
      </ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: Spacing.four },
  stat: { gap: 2 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: CHART_HEIGHT, gap: Spacing.one },
  barSlot: { flex: 1, justifyContent: 'flex-end' },
  bar: { borderRadius: 2 },
});
