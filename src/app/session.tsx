import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import Animated, {
  FadeInDown,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Button } from '@/components/button';
import { Icon } from '@/components/icon';
import { IconButton } from '@/components/icon-button';
import { PressableScale } from '@/components/pressable-scale';
import { ProgressBar } from '@/components/progress-bar';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTraining } from '@/context/training-context';
import { useFeedback } from '@/hooks/use-feedback';
import { useTheme } from '@/hooks/use-theme';
import { getExercise, SLOT_LABELS, type Exercise } from '@/lib/exercises';
import { formatElapsed } from '@/lib/time';

export default function SessionScreen() {
  const { active, toggleExercise, finishSession, discardSession } = useTraining();
  const feedback = useFeedback();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!active) {
    return (
      <Screen tab={false}>
        <Stack.Screen options={{ headerBackVisible: true }} />
        <ThemedText themeColor="textSecondary">No session in progress.</ThemedText>
        <Button title="Back to Train" variant="secondary" onPress={() => router.dismissAll()} />
      </Screen>
    );
  }

  const exercises = active.exerciseIds.map(getExercise).filter((e) => !!e);
  const done = active.completedIds.length;
  const total = exercises.length;
  const allDone = done === total && total > 0;

  const finish = () => {
    const save = () => {
      const log = finishSession();
      feedback.success();
      if (log) router.replace({ pathname: '/log/[id]', params: { id: log.id, fresh: '1' } });
    };
    if (allDone) return save();
    Alert.alert('Finish early?', `You checked off ${done} of ${total} exercises. Only those are logged as done.`, [
      { text: 'Keep going', style: 'cancel' },
      { text: 'Finish', onPress: save },
    ]);
  };

  const discard = () =>
    Alert.alert('Discard this session?', 'Nothing from it is saved.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => {
          discardSession();
          router.dismissAll();
        },
      },
    ]);

  return (
    <Screen tab={false}>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <IconButton
              icon={{ ios: 'chevron.down', android: 'expand_more' }}
              label="Minimize"
              onPress={() => router.back()}
            />
          ),
        }}
      />
      <View style={styles.header}>
        <ThemedText type="eyebrow" themeColor="tint">
          In progress · {active.name}
        </ThemedText>
        <ThemedText type="display" accessibilityLabel={`Elapsed time ${formatElapsed(now - active.startedAt)}`}>
          {formatElapsed(now - active.startedAt)}
        </ThemedText>
        <ProgressBar progress={total ? done / total : 0} />
        <ThemedText type="eyebrow" themeColor="textSecondary">
          {done} / {total} done
        </ThemedText>
      </View>

      <View style={styles.list}>
        {exercises.map((exercise, i) => (
          <Animated.View key={exercise.id} entering={FadeInDown.delay(i * 40).duration(300)}>
            <CheckRow
              exercise={exercise}
              index={i}
              checked={active.completedIds.includes(exercise.id)}
              onToggle={() => {
                feedback.tap();
                toggleExercise(exercise.id);
              }}
            />
          </Animated.View>
        ))}
      </View>

      <View style={styles.buttons}>
        <Button
          title={allDone ? 'Finish workout' : 'Finish'}
          icon={{ ios: 'flag.checkered', android: 'sports_score' }}
          variant={allDone ? 'primary' : 'secondary'}
          onPress={finish}
        />
        <Button title="Discard" variant="ghost" onPress={discard} />
      </View>
    </Screen>
  );
}

function CheckRow({
  exercise,
  index,
  checked,
  onToggle,
}: {
  exercise: Exercise;
  index: number;
  checked: boolean;
  onToggle: () => void;
}) {
  const theme = useTheme();
  const progress = useDerivedValue(() => withTiming(checked ? 1 : 0, { duration: 200 }));

  const boxStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.get(), [0, 1], ['transparent', theme.tint]),
    borderColor: interpolateColor(progress.get(), [0, 1], [theme.textSecondary, theme.tint]),
    transform: [{ scale: checked ? withSequence(withTiming(1.25, { duration: 110 }), withSpring(1)) : withTiming(1) }],
  }));
  const textStyle = useAnimatedStyle(() => ({ opacity: 1 - progress.get() * 0.45 }));

  return (
    <View style={[styles.row, { backgroundColor: theme.card, borderColor: checked ? theme.tint : theme.border }]}>
      <PressableScale
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        accessibilityLabel={exercise.name}
        onPress={onToggle}
        style={styles.rowMain}>
        <Animated.View style={[styles.box, boxStyle]}>
          {checked && <Icon name={{ ios: 'checkmark', android: 'check' }} size={14} color={theme.onTint} />}
        </Animated.View>
        <Animated.View style={[styles.rowText, textStyle]}>
          <ThemedText type="smallBold" style={[styles.name, checked && styles.struck]}>
            {exercise.name}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            {String(index + 1).padStart(2, '0')} · {SLOT_LABELS[exercise.slots[0]]} · {exercise.prescription}
          </ThemedText>
        </Animated.View>
      </PressableScale>
      <IconButton
        icon={{ ios: 'cube.transparent', android: 'view_in_ar' }}
        label={`Show ${exercise.name} demo`}
        onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: exercise.id } })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { gap: Spacing.two },
  list: { gap: Spacing.two },
  buttons: { gap: Spacing.two },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.card,
    paddingRight: Spacing.two,
  },
  rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.three, padding: Spacing.three },
  box: {
    width: 26,
    height: 26,
    borderRadius: 3,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, gap: 2 },
  name: { fontSize: 16 },
  struck: { textDecorationLine: 'line-through' },
});
