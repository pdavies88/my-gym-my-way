import { useRef, useState } from 'react';
import { Keyboard, StyleSheet, TextInput, View } from 'react-native';

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

type Field = 'weight' | 'reps';

/** Caps that keep a typo like "5540" from becoming a logged lift: 999 reps, 999 lb or 450 kg. */
const MAX_REPS = 999;
const MAX_WEIGHT: Record<Units, number> = { us: 999, metric: 450 };

/** Text shown in a field: whole numbers plainly, halves as "22.5", nothing for zero. */
const show = (value: number | undefined) => (value ? String(Math.round(value * 10) / 10) : '');
const parse = (text: string) => {
  const value = Number(text.replace(',', '.'));
  return Number.isFinite(value) && value >= 0 ? value : 0;
};

/**
 * Logs the sets for one exercise: weight (for moves that take one) and reps, or seconds for holds.
 * Shows last time's sets and a suggested next step, and pre-fills each new set from it.
 *
 * Every change is a function of the newest sets, so fast − and + taps all count. Numbers show as
 * text until tapped; only the one field being typed in is a text input. It opens empty, and saves
 * what you typed when it closes. Nothing on screen writes into a field while you type in it.
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
  onChange: (change: (sets: SetEntry[]) => SetEntry[]) => void;
}) {
  const theme = useTheme();
  const target = parseTarget(exercise.prescription);
  const weighted = usesWeight(exercise);
  const suggestion = suggestNext(exercise, last, units);
  const unit = weightUnit(units);
  const amountLabel = target.measure === 'seconds' ? 'sec' : 'reps';
  const [editing, setEditing] = useState<{ index: number; field: Field } | null>(null);
  // The open field and what's typed in it, read by handlers. Saved when the field closes.
  const open = useRef<{ index: number; field: Field } | null>(null);
  const draft = useRef<string | null>(null);

  const withValue = (set: SetEntry, field: Field, value: number): SetEntry => {
    if (field === 'reps') return { ...set, reps: Math.min(MAX_REPS, Math.max(0, Math.round(value))) };
    const weight = Math.min(MAX_WEIGHT[units], value);
    return weight > 0 ? { ...set, weightKg: fromDisplayWeight(weight, units) } : { reps: set.reps };
  };
  const displayValue = (set: SetEntry, field: Field) =>
    field === 'reps' ? set.reps : set.weightKg ? toDisplayWeight(set.weightKg, units) : 0;

  /** Saves what's typed in the open field, if anything, and closes it. Safe to call twice. */
  const commit = () => {
    const field = open.current;
    const text = draft.current;
    open.current = null;
    draft.current = null;
    setEditing(null);
    if (!field || text === null) return;
    onChange((current) =>
      current.map((set, i) => (i === field.index ? withValue(set, field.field, parse(text)) : set)),
    );
  };

  const startEditing = (index: number, field: Field) => {
    commit();
    open.current = { index, field };
    setEditing({ index, field });
  };

  const addSet = () => {
    commit();
    onChange((current) => [
      ...current,
      current[current.length - 1] ?? {
        reps: suggestion.reps,
        ...(weighted && suggestion.weightKg !== undefined ? { weightKg: suggestion.weightKg } : {}),
      },
    ]);
  };

  /** A − or + tap: one rep (or 5 seconds for holds), or one weight step of 5 lb or 2.5 kg. */
  const step = (index: number, field: Field, direction: 1 | -1) => {
    commit();
    Keyboard.dismiss();
    const size = field === 'reps' ? (target.measure === 'seconds' ? 5 : 1) : units === 'us' ? 5 : 2.5;
    onChange((current) =>
      current.map((set, i) =>
        i === index ? withValue(set, field, Math.max(0, displayValue(set, field) + direction * size)) : set,
      ),
    );
  };

  const remove = (index: number) => {
    open.current = null;
    draft.current = null;
    setEditing(null);
    onChange((current) => current.filter((_, i) => i !== index));
  };

  const field = (set: SetEntry, index: number, kind: Field, label: string) => {
    const id = `${exercise.id}-${index}-${kind}`;
    const isOpen = editing?.index === index && editing.field === kind;
    const value = show(displayValue(set, kind));
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
        {isOpen ? (
          <TextInput
            autoFocus
            onChangeText={(text) => {
              draft.current = text;
            }}
            onEndEditing={commit}
            keyboardType={kind === 'weight' ? 'decimal-pad' : 'number-pad'}
            inputAccessoryViewID={id}
            accessibilityLabel={`Set ${index + 1} ${label}`}
            // Opens empty, showing the current number faintly, so typing always replaces it. Closing
            // without typing keeps the number as it was.
            placeholder={value || '0'}
            placeholderTextColor={theme.textSecondary}
            style={[styles.value, styles.input, { color: theme.text }]}
            maxLength={kind === 'weight' ? 5 : 3}
          />
        ) : (
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={`Set ${index + 1} ${label}: ${value || 0}. Tap to type`}
            onPress={() => startEditing(index, kind)}
            style={styles.valueButton}>
            <ThemedText style={[styles.value, !value && { color: theme.textSecondary }]}>{value || '0'}</ThemedText>
          </PressableScale>
        )}
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={`More ${label}, set ${index + 1}`}
          hitSlop={4}
          onPress={() => step(index, kind, 1)}
          style={styles.stepButton}>
          <Icon name={{ ios: 'plus', android: 'add' }} size={16} color={theme.tint} />
        </PressableScale>
        {isOpen && <KeyboardDoneBar id={id} />}
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
          {weighted && field(set, i, 'weight', `weight in ${unit}`)}
          {field(set, i, 'reps', amountLabel)}
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
        repeatDelayMs={0}
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
  valueButton: { flex: 1, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
  value: { textAlign: 'center', fontSize: 18, fontWeight: '700' },
  input: { flex: 1, minWidth: 0, paddingVertical: Spacing.two },
});
