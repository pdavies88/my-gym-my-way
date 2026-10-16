import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { ExerciseRow } from '@/components/exercise-row';
import { Screen, SectionHeader } from '@/components/screen';
import { SegmentedControl } from '@/components/segmented-control';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useSettings } from '@/context/settings-context';
import { useTheme } from '@/hooks/use-theme';
import { canDo, EXERCISES, SLOT_LABELS, type Slot } from '@/lib/exercises';

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
];

export default function LibraryScreen() {
  const theme = useTheme();
  const { owned } = useSettings();
  const [scope, setScope] = useState<'mine' | 'all'>('mine');
  const [query, setQuery] = useState('');

  const needle = query.trim().toLowerCase();
  const visible = EXERCISES.filter(
    (e) =>
      (scope === 'all' || canDo(e, owned)) &&
      (!needle || e.name.toLowerCase().includes(needle) || e.muscles.some((m) => m.toLowerCase().includes(needle))),
  );

  return (
    <Screen eyebrow={`${visible.length} exercises`} title="Library">
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
        <SegmentedControl
          accessibilityLabel="Which exercises to show"
          options={[
            { value: 'mine', label: 'My gym' },
            { value: 'all', label: 'Everything' },
          ]}
          value={scope}
          onChange={setScope}
        />
      </View>

      {visible.length === 0 && (
        <ThemedText type="small" themeColor="textSecondary">
          Nothing matches that search.
        </ThemedText>
      )}

      {SLOT_ORDER.map((slot) => {
        const items = visible.filter((e) => e.slots[0] === slot);
        if (items.length === 0) return null;
        return (
          <View key={slot} style={styles.group}>
            <SectionHeader title={SLOT_LABELS[slot]} />
            {items.map((exercise) => (
              <View key={exercise.id} style={!canDo(exercise, owned) && styles.locked}>
                <ExerciseRow exercise={exercise} />
              </View>
            ))}
          </View>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  controls: { gap: Spacing.two },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Radius.control,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
  group: { gap: Spacing.two },
  locked: { opacity: 0.5 },
});
