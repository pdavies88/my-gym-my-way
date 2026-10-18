import { router, Stack, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import Animated, {
  FadeInDown,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
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
import { useTheme } from '@/hooks/use-theme';
import { getExercise, SLOT_LABELS, type Exercise } from '@/lib/exercises';
import { activeMs } from '@/lib/session-clock';
import { formatElapsed } from '@/lib/time';
import { goBackOrHome, goHome } from '@/lib/navigation';

export default function SessionScreen() {
  const { active, toggleExercise, finishSession, discardSession, pauseSession, resumeSession, restartSessionTimer } =
    useTraining();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Leaving this screen (minimizing it, or opening another tab) pauses the timer.
  useFocusEffect(
    useCallback(
      () => () => pauseSession(),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [],
    ),
  );

  if (!active) {
    return (
      <Screen tab={false}>
        <Stack.Screen options={{ headerBackVisible: true }} />
        <ThemedText themeColor="textSecondary">No session in progress.</ThemedText>
        <Button title="Back to Train" variant="secondary" onPress={goHome} />
      </Screen>
    );
  }

  const exercises = active.exerciseIds.map(getExercise).filter((e) => !!e);
  const done = active.completedIds.length;
  const total = exercises.length;
  const allDone = done === total && total > 0;
  const paused = active.pausedAt !== undefined;
  const elapsed = formatElapsed(activeMs(active, now));

  const confirmRestart = () =>
    Alert.alert('Restart the timer?', 'The clock goes back to 0:00. Your ticked exercises stay ticked.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Restart', onPress: restartSessionTimer },
    ]);

  const finish = () => {
    const save = () => {
      const log = finishSession();
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
          goHome();
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
              onPress={goBackOrHome}
            />
          ),
        }}
      />
      <View style={styles.header}>
        <ThemedText type="eyebrow" themeColor={paused ? 'textSecondary' : 'tint'}>
          {paused ? 'Paused' : 'In progress'} · {active.name}
        </ThemedText>
        <ThemedText
          type="display"
          themeColor={paused ? 'textSecondary' : 'text'}
          accessibilityLabel={`${paused ? 'Paused at' : 'Elapsed time'} ${elapsed}`}>
          {elapsed}
        </ThemedText>
        <View style={styles.timerButtons}>
          <Button
            compact
            title={paused ? 'Resume' : 'Pause'}
            variant={paused ? 'primary' : 'secondary'}
            icon={paused ? { ios: 'play.fill', android: 'play_arrow' } : { ios: 'pause.fill', android: 'pause' }}
            onPress={() => {
              if (paused) resumeSession();
              else pauseSession();
            }}
            style={styles.flex}
          />
          <Button
            compact
            title="Restart timer"
            variant="ghost"
            icon={{ ios: 'arrow.counterclockwise', android: 'restart_alt' }}
            onPress={confirmRestart}
            style={styles.flex}
          />
        </View>
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
        icon={{ ios: 'play.rectangle', android: 'smart_display' }}
        label={`Show ${exercise.name} demo`}
        onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: exercise.id } })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { gap: Spacing.two },
  timerButtons: { flexDirection: 'row', gap: Spacing.two },
  flex: { flex: 1 },
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
