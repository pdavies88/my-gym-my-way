import { Link } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icon';
import { PressableScale } from '@/components/pressable-scale';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { SLOT_LABELS, type Exercise } from '@/lib/exercises';

/** One exercise in a list. Tapping it opens the 3D demonstration. */
export function ExerciseRow({
  exercise,
  index,
  trailing,
}: {
  exercise: Exercise;
  index?: number;
  trailing?: ReactNode;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.row, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Link href={{ pathname: '/exercise/[id]', params: { id: exercise.id } }} asChild>
        <PressableScale
          accessibilityRole="button"
          accessibilityHint="Shows a 3D demonstration"
          style={styles.main}>
          {index !== undefined && (
            <ThemedText type="mono" themeColor="tint" style={styles.index}>
              {String(index + 1).padStart(2, '0')}
            </ThemedText>
          )}
          <View style={styles.text}>
            <ThemedText type="smallBold" style={styles.name}>
              {exercise.name}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
              {SLOT_LABELS[exercise.slots[0]]} · {exercise.muscles.join(', ')}
            </ThemedText>
          </View>
          {!trailing && <Icon name={{ ios: 'cube.transparent', android: 'view_in_ar' }} size={18} color={theme.textSecondary} />}
        </PressableScale>
      </Link>
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.card,
    paddingRight: Spacing.two,
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingLeft: Spacing.three,
    paddingRight: Spacing.two,
  },
  index: { width: 22 },
  text: { flex: 1, gap: 2 },
  name: { fontSize: 16 },
});
