import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/button';
import { Icon } from '@/components/icon';
import { IconButton } from '@/components/icon-button';
import { KeyboardDoneBar } from '@/components/keyboard-done-bar';
import { PressableScale } from '@/components/pressable-scale';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Exercise } from '@/lib/exercises';
import {
  fromDisplayWeight,
  parseTarget,
  suggestNext,
  summarizeSets,
  toDisplayWeight,
  usesWeight,
  weightUnit,
  type Units,
} from '@/lib/progress';
import type { SetEntry } from '@/lib/storage/schemas';

/** Text shown in a field: whole numbers plainly, halves as "22.5", nothing for zero. */
const show = (value: number | undefined) => (value ? String(Math.round(value * 10) / 10) : '');
const parse = (text: string) => {
  const value = Number(text.replace(',', '.'));
  return Number.isFinite(value) && value >= 0 ? value : 0;
};

/**
 * Logs the sets for one exercise: weight (for moves that take one) and reps, or seconds for holds.
 * Shows last time's sets and a suggested next step, and pre-fills each new set from it.
 */
export function SetLogger({
  exercise,
  sets,
  last,
  units,
  onChange,
}: {
  exercise: Exercise;
  sets: SetEntry[];
  /** The sets from the last session that logged this move, or null the first time. */
  last: SetEntry[] | null;
  units: Units;
  onChange: (sets: SetEntry[]) => void;
}) {
  const theme = useTheme();
  const target = parseTarget(exercise.prescription);
  const weighted = usesWeight(exercise);
  const suggestion = suggestNext(exercise, last, units);
  // The fields are uncontrolled: typing updates the sets, but the app never pushes text back into a
  // field while it's being edited. A field the app focused and set from code could stop showing new
  // values on React Native 0.88. When − or + or a removal changes a number, bumping this remounts
  // the fields with the new numbers.
  const [revision, setRevision] = useState(0);
  const unit = weightUnit(units);
  const amountLabel = target.measure === 'seconds' ? 'sec' : 'reps';

  const addSet = () => {
    const previous = sets[sets.length - 1];
    onChange([
      ...sets,
      previous ?? {
        reps: suggestion.reps,
        ...(weighted && suggestion.weightKg !== undefined ? { weightKg: suggestion.weightKg } : {}),
      },
    ]);
  };

  /** Sets one field to a number, from typing or from the − and + buttons. */
  const setValue = (index: number, field: 'reps' | 'weight', value: number) =>
    onChange(
      sets.map((set, i) => {
        if (i !== index) return set;
        if (field === 'reps') return { ...set, reps: Math.max(0, Math.round(value)) };
        return value > 0 ? { ...set, weightKg: fromDisplayWeight(value, units) } : { reps: set.reps };
      }),
    );

  const type = (index: number, field: 'reps' | 'weight', text: string) => setValue(index, field, parse(text));

  /** A − or + tap: one rep (or 5 seconds for holds), or one weight step of 5 lb or 2.5 kg. */
  const step = (index: number, field: 'reps' | 'weight', direction: 1 | -1) => {
    const set = sets[index];
    const current = field === 'reps' ? set.reps : set.weightKg ? toDisplayWeight(set.weightKg, units) : 0;
    const size = field === 'reps' ? (target.measure === 'seconds' ? 5 : 1) : units === 'us' ? 5 : 2.5;
    setRevision((r) => r + 1);
    setValue(index, field, Math.max(0, current + direction * size));
  };

  const remove = (index: number) => {
    setRevision((r) => r + 1);
    onChange(sets.filter((_, i) => i !== index));
  };

  const field = (index: number, kind: 'reps' | 'weight', value: string, label: string) => {
    const id = `${exercise.id}-${index}-${kind}`;
    return (
      <View style={[styles.stepper, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={`Less ${label}, set ${index + 1}`}
          hitSlop={4}
          onPress={() => step(index, kind, -1)}
          style={styles.stepButton}>
          <Icon name={{ ios: 'minus', android: 'remove' }} size={16} color={theme.textSecondary} />
        </PressableScale>
        <TextInput
          key={`${kind}-${revision}`}
          defaultValue={value}
          onChangeText={(text) => type(index, kind, text)}
          keyboardType={kind === 'weight' ? 'decimal-pad' : 'number-pad'}
          inputAccessoryViewID={id}
          // Tapping selects the number, so typing replaces it instead of adding to it.
          selectTextOnFocus
          accessibilityLabel={`Set ${index + 1} ${label}`}
          placeholder="0"
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text }]}
          maxLength={kind === 'weight' ? 5 : 4}
        />
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={`More ${label}, set ${index + 1}`}
          hitSlop={4}
          onPress={() => step(index, kind, 1)}
          style={styles.stepButton}>
          <Icon name={{ ios: 'plus', android: 'add' }} size={16} color={theme.tint} />
        </PressableScale>
        <KeyboardDoneBar id={id} />
      </View>
    );
  };

  return (
    <View style={styles.wrap}>
      {last && (
        <ThemedText type="small" themeColor="textSecondary">
          Last time: <ThemedText type="smallBold">{summarizeSets(last, target.measure, units)}</ThemedText>
        </ThemedText>
      )}
      <ThemedText type="small" themeColor="tint">
        {suggestion.text}
      </ThemedText>

      {sets.length > 0 && (
        <View style={styles.row}>
          <View style={styles.index} />
          {weighted && (
            <ThemedText type="eyebrow" themeColor="textSecondary" style={styles.header}>
              Weight ({unit})
            </ThemedText>
          )}
          <ThemedText type="eyebrow" themeColor="textSecondary" style={styles.header}>
            {amountLabel}
          </ThemedText>
          <View style={styles.removeSpace} />
        </View>
      )}

      {sets.map((set, i) => (
        <View key={i} style={styles.row}>
          <ThemedText type="mono" themeColor="textSecondary" style={styles.index}>
            {i + 1}
          </ThemedText>
          {weighted &&
            field(i, 'weight', show(set.weightKg && toDisplayWeight(set.weightKg, units)), `weight in ${unit}`)}
          {field(i, 'reps', show(set.reps), amountLabel)}
          <IconButton
            icon={{ ios: 'xmark', android: 'close' }}
            label={`Remove set ${i + 1}`}
            onPress={() => remove(i)}
          />
        </View>
      ))}

      <Button
        title={sets.length === 0 ? 'Log a set' : `Add set ${sets.length + 1}`}
        compact
        variant="secondary"
        icon={{ ios: 'plus', android: 'add' }}
        onPress={addSet}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.two },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  index: { width: 18, textAlign: 'center' },
  header: { flex: 1, fontSize: 10, textAlign: 'center' },
  removeSpace: { width: 36 },
  stepper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Radius.control,
  },
  stepButton: { width: 36, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, minWidth: 0, textAlign: 'center', fontSize: 18, fontWeight: '700', paddingVertical: Spacing.two },
});
