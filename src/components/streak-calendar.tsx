import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { activeDays, calendarWeeks, dayStreak, startOfDay, weekStreak } from '@/lib/streak';

const WEEKS = 5;
const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/** The last five weeks, Monday first, with each day you trained filled in, and both streaks. */
export function StreakCalendar({ startTimes, now }: { startTimes: readonly number[]; now: number }) {
  const theme = useTheme();
  const trained = activeDays(startTimes);
  const today = startOfDay(now);
  const days = dayStreak(startTimes, now);
  const weeks = weekStreak(startTimes, now);

  return (
    <Card>
      <View style={styles.streaks}>
        <View style={styles.streak}>
          <ThemedText type="display" style={styles.number}>
            {days}
          </ThemedText>
          <ThemedText type="eyebrow" themeColor="textSecondary">
            {days === 1 ? 'Day streak' : 'Days in a row'}
          </ThemedText>
        </View>
        <View style={styles.streak}>
          <ThemedText type="display" style={[styles.number, { color: theme.tint }]}>
            {weeks}
          </ThemedText>
          <ThemedText type="eyebrow" themeColor="textSecondary">
            {weeks === 1 ? 'Week streak' : 'Weeks in a row'}
          </ThemedText>
        </View>
      </View>
      <View
        style={styles.grid}
        accessibilityLabel={`You trained on ${[...trained].filter((d) => d > today - WEEKS * 7 * 86400000).length} days in the last ${WEEKS} weeks`}>
        <View style={styles.row}>
          {DAY_LETTERS.map((letter, i) => (
            <ThemedText key={i} type="eyebrow" themeColor="textSecondary" style={styles.letter}>
              {letter}
            </ThemedText>
          ))}
        </View>
        {calendarWeeks(now, WEEKS).map((week) => (
          <View key={week[0]} style={styles.row}>
            {week.map((day) => {
              const done = trained.has(day);
              const future = day > today;
              return (
                <View key={day} style={styles.cellSlot}>
                  <View
                    style={[
                      styles.cell,
                      {
                        backgroundColor: done ? theme.tint : future ? 'transparent' : theme.backgroundElement,
                        borderColor: day === today ? theme.tint : 'transparent',
                      },
                    ]}>
                    <ThemedText
                      type="small"
                      style={[
                        styles.date,
                        { color: done ? theme.onTint : future ? theme.border : theme.textSecondary },
                      ]}>
                      {new Date(day).getDate()}
                    </ThemedText>
                  </View>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  streaks: { flexDirection: 'row', gap: Spacing.five },
  streak: { gap: 2 },
  number: { fontSize: 40, lineHeight: 44 },
  grid: { gap: Spacing.one, marginTop: Spacing.two },
  row: { flexDirection: 'row', gap: Spacing.one },
  letter: { flex: 1, textAlign: 'center', fontSize: 10 },
  cellSlot: { flex: 1, aspectRatio: 1 },
  cell: { flex: 1, borderRadius: 6, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  date: { fontSize: 12, fontWeight: '600' },
});
