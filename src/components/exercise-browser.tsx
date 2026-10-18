import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ExerciseRow } from '@/components/exercise-row';
import { Icon } from '@/components/icon';
import { SegmentedControl } from '@/components/segmented-control';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { SLOT_LABELS, type Exercise, type Slot } from '@/lib/exercises';
import { MUSCLE_GROUPS, muscleGroupsOf } from '@/lib/muscles';

const SLOT_ORDER: Slot[] = [
  'squat',
  'hinge',
  'lunge',
  'calves',
  'hpush',
  'vpush',
  'hpull',
  'vpull',
  'biceps',
  'triceps',
  'shoulders',
  'core',
  'cardio',
  'mobility',
  'stretch',
];

type GroupBy = 'type' | 'muscle';

interface Group {
  key: string;
  label: string;
  items: Exercise[];
}

function groupsFor(exercises: readonly Exercise[], by: GroupBy): Group[] {
  if (by === 'type') {
    return SLOT_ORDER.map((slot) => ({
      key: slot,
      label: SLOT_LABELS[slot],
      items: exercises.filter((e) => e.slots[0] === slot),
    }));
  }
  return MUSCLE_GROUPS.map((group) => ({
    key: group.id,
    label: group.label,
    items: exercises.filter((e) => muscleGroupsOf(e).includes(group.id)),
  }));
}

/**
 * A searchable exercise list, grouped by movement type or by muscle. Groups start closed so the list
 * stays short. Searching shows every match in one list.
 */
export function ExerciseBrowser({
  exercises,
  trailing,
  dimmed,
  controls,
}: {
  exercises: readonly Exercise[];
  /** Something to show at the end of each row, such as an add button. */
  trailing?: (exercise: Exercise) => ReactNode;
  /** Shows a row faded, such as an exercise your equipment doesn't allow. */
  dimmed?: (exercise: Exercise) => boolean;
  /** Extra controls under the search field. */
  controls?: ReactNode;
}) {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [groupBy, setGroupBy] = useState<GroupBy>('type');
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set());

  const needle = query.trim().toLowerCase();
  const matches = needle
    ? exercises.filter(
        (e) => e.name.toLowerCase().includes(needle) || e.muscles.some((m) => m.toLowerCase().includes(needle)),
      )
    : [];

  const toggle = (key: string) => {
    const next = new Set(open);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setOpen(next);
  };

  const row = (exercise: Exercise) => (
    <View key={exercise.id} style={dimmed?.(exercise) && styles.dimmed}>
      <ExerciseRow exercise={exercise} trailing={trailing?.(exercise)} />
    </View>
  );

  return (
    <View style={styles.browser}>
      <View style={styles.controls}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name or muscle"
          accessibilityLabel="Search exercises"
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text, backgroundColor: theme.card, borderColor: theme.border }]}
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
        {controls}
        {!needle && (
          <SegmentedControl
            accessibilityLabel="Group exercises by"
            options={[
              { value: 'type', label: 'By type' },
              { value: 'muscle', label: 'By muscle' },
            ]}
            value={groupBy}
            onChange={(value) => {
              setGroupBy(value);
              setOpen(new Set());
            }}
          />
        )}
      </View>

      {needle ? (
        <View style={styles.items}>
          {matches.length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary">
              Nothing matches that search.
            </ThemedText>
          ) : (
            matches.map(row)
          )}
        </View>
      ) : (
        groupsFor(exercises, groupBy).map((group) => {
          if (group.items.length === 0) return null;
          const expanded = open.has(group.key);
          return (
            <View key={group.key} style={styles.group}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded }}
                accessibilityLabel={`${group.label}, ${group.items.length} exercises`}
                onPress={() => toggle(group.key)}
                style={({ pressed }) => [
                  styles.groupHeader,
                  { backgroundColor: pressed ? theme.backgroundSelected : theme.card, borderColor: theme.border },
                ]}>
                <ThemedText type="heading" style={styles.groupLabel}>
                  {group.label}
                </ThemedText>
                <ThemedText type="mono" themeColor="textSecondary">
                  {group.items.length}
                </ThemedText>
                <Icon
                  name={
                    expanded
                      ? { ios: 'chevron.up', android: 'keyboard_arrow_up' }
                      : { ios: 'chevron.down', android: 'keyboard_arrow_down' }
                  }
                  size={16}
                  color={theme.textSecondary}
                />
              </Pressable>
              {expanded && (
                <Animated.View entering={FadeIn.duration(180)} style={styles.items}>
                  {groupBy === 'muscle' ? <ByType items={group.items} row={row} /> : group.items.map(row)}
                </Animated.View>
              )}
            </View>
          );
        })
      )}
    </View>
  );
}

/** Inside a muscle group, a second level by movement type, so a big group like Glutes stays easy to scan. */
function ByType({ items, row }: { items: Exercise[]; row: (exercise: Exercise) => ReactNode }) {
  return SLOT_ORDER.map((slot) => {
    const ofType = items.filter((e) => e.slots[0] === slot);
    if (ofType.length === 0) return null;
    return (
      <View key={slot} style={styles.items}>
        <ThemedText type="eyebrow" themeColor="textSecondary" style={styles.subheader}>
          {SLOT_LABELS[slot]}
        </ThemedText>
        {ofType.map(row)}
      </View>
    );
  });
}

const styles = StyleSheet.create({
  browser: { gap: Spacing.three },
  controls: { gap: Spacing.two },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Radius.control,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
  group: { gap: Spacing.two },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    minHeight: 52,
    paddingHorizontal: Spacing.three,
    borderWidth: 1,
    borderRadius: Radius.card,
  },
  groupLabel: { flex: 1, fontSize: 18 },
  items: { gap: Spacing.two },
  subheader: { marginTop: Spacing.two },
  dimmed: { opacity: 0.5 },
});
