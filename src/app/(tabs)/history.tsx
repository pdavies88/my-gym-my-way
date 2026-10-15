import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Card } from '@/components/card';
import { Icon } from '@/components/icon';
import { PressableScale } from '@/components/pressable-scale';
import { Screen, SectionHeader } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTraining } from '@/context/training-context';
import { useTheme } from '@/hooks/use-theme';
import { formatDuration, formatSessionDate, startOfWeek } from '@/lib/time';

export default function HistoryScreen() {
  const theme = useTheme();
  const { sessions } = useTraining();
  // "Now" lives in state and refreshes when the tab gains focus, so week counts stay correct.
  const [now, setNow] = useState(() => Date.now());
  useFocusEffect(useCallback(() => setNow(Date.now()), []));

  const weekStart = startOfWeek(now);
  const thisWeek = sessions.filter((s) => s.startedAt >= weekStart).length;
  const exercisesDone = sessions.reduce((sum, s) => sum + s.completedIds.length, 0);

  return (
    <Screen eyebrow="Your log" title="History">
      <View style={styles.stats}>
        <Stat label="This week" value={thisWeek} highlight />
        <Stat label="Sessions" value={sessions.length} />
        <Stat label="Moves done" value={exercisesDone} />
      </View>

      <SectionHeader title="Sessions" />
      {sessions.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          Finish a workout and it shows up here.
        </ThemedText>
      ) : (
        <View style={styles.list}>
          {sessions.map((session, i) => (
            <Animated.View key={session.id} entering={FadeInDown.delay(Math.min(i, 10) * 35).duration(300)}>
              <Link href={{ pathname: '/log/[id]', params: { id: session.id } }} asChild>
                {/* Link's asChild slot rejects style arrays, so pass a flat style. */}
                <PressableScale
                  style={StyleSheet.flatten([styles.row, { backgroundColor: theme.card, borderColor: theme.border }])}>
                  <View style={[styles.dot, { backgroundColor: session.completedIds.length === session.exerciseIds.length ? theme.tint : theme.accent }]} />
                  <View style={styles.rowText}>
                    <ThemedText type="smallBold" style={styles.name}>
                      {session.name}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {formatSessionDate(session.startedAt, now)} · {formatDuration(session.finishedAt - session.startedAt)} ·{' '}
                      {session.completedIds.length}/{session.exerciseIds.length}
                    </ThemedText>
                  </View>
                  <Icon name={{ ios: 'chevron.right', android: 'chevron_right' }} size={14} color={theme.textSecondary} />
                </PressableScale>
              </Link>
            </Animated.View>
          ))}
        </View>
      )}
    </Screen>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <Card style={styles.stat} accent={highlight}>
      <ThemedText type="display" style={styles.statValue} themeColor={highlight ? 'tint' : 'text'}>
        {value}
      </ThemedText>
      <ThemedText type="eyebrow" themeColor="textSecondary" style={styles.statLabel}>
        {label}
      </ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: Spacing.two },
  stat: { flex: 1, gap: 0 },
  statValue: { fontSize: 36, lineHeight: 42 },
  statLabel: { fontSize: 10 },
  list: { gap: Spacing.two },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.card,
    borderWidth: 1,
  },
  dot: { width: 4, alignSelf: 'stretch', borderRadius: 1 },
  rowText: { flex: 1, gap: 2 },
  name: { fontSize: 16 },
});
