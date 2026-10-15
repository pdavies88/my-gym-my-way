import { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Card } from '@/components/card';
import { KeyboardDoneBar } from '@/components/keyboard-done-bar';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useSettings } from '@/context/settings-context';
import { useTheme } from '@/hooks/use-theme';
import {
  BMI_CATEGORY_LABELS,
  bmiCategory,
  calculateBmi,
  cmToFeetInches,
  healthyWeightRangeKg,
  inchesToCm,
  kgToPounds,
  poundsToKg,
  type BmiCategory,
} from '@/lib/bmi';

const SCALE_MIN = 15;
const SCALE_MAX = 40;

const SEGMENTS: { category: BmiCategory; from: number; to: number; color: string }[] = [
  { category: 'underweight', from: SCALE_MIN, to: 18.5, color: '#5CC8FF' },
  { category: 'healthy', from: 18.5, to: 25, color: '#C8FF2E' },
  { category: 'overweight', from: 25, to: 30, color: '#FFC233' },
  { category: 'obese', from: 30, to: SCALE_MAX, color: '#FF5A36' },
];

const toNumber = (text: string) => {
  const value = parseFloat(text.replace(',', '.'));
  return Number.isFinite(value) ? value : NaN;
};

const fmt = (value: number | undefined, digits = 0) =>
  value === undefined ? '' : String(Number(value.toFixed(digits)));

/** BMI calculator. Height and weight are saved on this device so the result is there next time. */
export function BmiCard() {
  const theme = useTheme();
  const { settings, updateSettings } = useSettings();
  const us = settings.units === 'us';

  const initialFeet = settings.heightCm ? cmToFeetInches(settings.heightCm) : undefined;
  const [feet, setFeet] = useState(fmt(initialFeet?.feet));
  const [inches, setInches] = useState(fmt(initialFeet?.inches));
  const [cm, setCm] = useState(fmt(settings.heightCm));
  const [weight, setWeight] = useState(
    settings.weightKg === undefined ? '' : us ? fmt(kgToPounds(settings.weightKg)) : fmt(settings.weightKg, 1),
  );

  const measure = (f: string, i: string, c: string, w: string) => {
    const heightCm = us ? inchesToCm(toNumber(f || '0') * 12 + toNumber(i || '0')) : toNumber(c);
    const weightKg = us ? poundsToKg(toNumber(w)) : toNumber(w);
    return { heightCm, weightKg, bmi: calculateBmi(heightCm, weightKg) };
  };

  const { heightCm, bmi } = measure(feet, inches, cm, weight);
  const category = bmi === null ? null : bmiCategory(bmi);

  /** Applies one field change and saves the measurements when they make a valid BMI. */
  const change = (setter: (t: string) => void, key: 'feet' | 'inches' | 'cm' | 'weight') => (text: string) => {
    setter(text);
    const next = { feet, inches, cm, weight, [key]: text };
    const result = measure(next.feet, next.inches, next.cm, next.weight);
    if (result.bmi !== null) updateSettings({ heightCm: result.heightCm, weightKg: result.weightKg });
  };

  const marker = useSharedValue(0);
  useEffect(() => {
    if (bmi !== null) {
      marker.set(withSpring((Math.min(SCALE_MAX, Math.max(SCALE_MIN, bmi)) - SCALE_MIN) / (SCALE_MAX - SCALE_MIN), {
        damping: 16,
        stiffness: 120,
      }));
    }
  }, [bmi, marker]);
  const markerStyle = useAnimatedStyle(() => ({ left: `${marker.get() * 100}%` }));

  const range = Number.isFinite(heightCm) && heightCm > 0 ? healthyWeightRangeKg(heightCm) : null;
  const rangeText = range
    ? us
      ? `${Math.round(kgToPounds(range.min))}–${Math.round(kgToPounds(range.max))} lb`
      : `${range.min.toFixed(1)}–${range.max.toFixed(1)} kg`
    : '';

  const input = [styles.input, { color: theme.text, backgroundColor: theme.backgroundElement, borderColor: theme.border }];
  const field = (label: string, value: string, onChange: (t: string) => void, id: string, unit: string, maxLength = 5) => (
    <View style={styles.field}>
      <ThemedText type="eyebrow" themeColor="textSecondary" style={styles.fieldLabel}>
        {label}
      </ThemedText>
      <View style={styles.inputWrap}>
        <TextInput
          value={value}
          onChangeText={onChange}
          keyboardType="decimal-pad"
          inputAccessoryViewID={id}
          accessibilityLabel={`${label} in ${unit}`}
          placeholder="0"
          placeholderTextColor={theme.textSecondary}
          style={input}
          maxLength={maxLength}
        />
        <ThemedText type="small" themeColor="textSecondary" style={styles.unit}>
          {unit}
        </ThemedText>
      </View>
      <KeyboardDoneBar id={id} />
    </View>
  );

  return (
    <Card style={styles.card}>
      <View style={styles.inputs}>
        {us ? (
          <>
            {field('Height', feet, change(setFeet, 'feet'), 'bmi-feet', 'ft', 1)}
            {field(' ', inches, change(setInches, 'inches'), 'bmi-inches', 'in', 2)}
            {field('Weight', weight, change(setWeight, 'weight'), 'bmi-weight-lb', 'lb')}
          </>
        ) : (
          <>
            {field('Height', cm, change(setCm, 'cm'), 'bmi-cm', 'cm')}
            {field('Weight', weight, change(setWeight, 'weight'), 'bmi-weight-kg', 'kg')}
          </>
        )}
      </View>

      <View style={styles.result}>
        <ThemedText type="display" themeColor={bmi === null ? 'textSecondary' : 'text'}>
          {bmi === null ? '--' : bmi.toFixed(1)}
        </ThemedText>
        <ThemedText
          type="eyebrow"
          style={{ color: category ? SEGMENTS.find((s) => s.category === category)!.color : theme.textSecondary }}>
          {category ? BMI_CATEGORY_LABELS[category] : 'Enter height and weight'}
        </ThemedText>
      </View>

      <View style={styles.scale}>
        <View style={styles.segments}>
          {SEGMENTS.map((segment) => (
            <View
              key={segment.category}
              style={{
                flex: segment.to - segment.from,
                backgroundColor: segment.color,
                opacity: category === null || category === segment.category ? 1 : 0.3,
              }}
            />
          ))}
        </View>
        {bmi !== null && <Animated.View style={[styles.marker, { backgroundColor: theme.text }, markerStyle]} />}
      </View>

      {rangeText !== '' && bmi !== null && (
        <ThemedText type="small" themeColor="textSecondary">
          A BMI from 18.5 to 24.9 at your height is {rangeText}.
        </ThemedText>
      )}
      <ThemedText type="small" themeColor="textSecondary" style={styles.disclaimer}>
        BMI is a rough screening number for adults. It doesn’t account for muscle, age or body shape. This is
        general wellness information, not medical advice. Talk to a doctor about your health.
      </ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.three },
  inputs: { flexDirection: 'row', gap: Spacing.two },
  field: { flex: 1, gap: Spacing.one },
  fieldLabel: { fontSize: 10 },
  inputWrap: { justifyContent: 'center' },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: Radius.control,
    paddingLeft: Spacing.three,
    paddingRight: 34,
    fontSize: 20,
    fontWeight: '700',
  },
  unit: { position: 'absolute', right: Spacing.two },
  result: { gap: Spacing.one },
  scale: { height: 18, justifyContent: 'center' },
  segments: { flexDirection: 'row', height: 6, borderRadius: 1, overflow: 'hidden', gap: 2 },
  marker: { position: 'absolute', width: 3, height: 18, marginLeft: -1.5, borderRadius: 1 },
  disclaimer: { fontSize: 12, lineHeight: 17 },
});
