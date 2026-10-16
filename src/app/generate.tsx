import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';

import { Button } from '@/components/button';
import { ExerciseRow } from '@/components/exercise-row';
import { IconButton } from '@/components/icon-button';
import { Screen, SectionHeader } from '@/components/screen';
import { SegmentedControl } from '@/components/segmented-control';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useSettings } from '@/context/settings-context';
import { useTraining } from '@/context/training-context';
import { equipmentName } from '@/lib/equipment';
import { useFeedback } from '@/hooks/use-feedback';
import { getExercise } from '@/lib/exercises';
import {
  FOCUS_LABELS,
  FOCUS_SHORT_LABELS,
  generateWorkout,
  LENGTHS,
  swapExercise,
  type Focus,
  type Length,
} from '@/lib/generator';

const FOCUS_ROWS: Focus[][] = [
  ['full', 'upper', 'lower'],
  ['push', 'pull', 'core', 'conditioning'],
];

const newSeed = () => Math.floor(Math.random() * 2 ** 31);

export default function GenerateScreen() {
  const { owned, settings } = useSettings();
  const { saveWorkout, startSession, active } = useTraining();
  const feedback = useFeedback();
  const [focus, setFocus] = useState<Focus>('full');
  const [length, setLength] = useState<Length>('medium');
  const [batch, setBatch] = useState(0);
  const [ids, setIds] = useState(() =>
    generateWorkout({ focus: 'full', count: LENGTHS.medium.count, owned, seed: newSeed() }),
  );

  const regenerate = (nextFocus = focus, nextLength = length) => {
    setIds(generateWorkout({ focus: nextFocus, count: LENGTHS[nextLength].count, owned, seed: newSeed() }));
    setBatch((b) => b + 1);
  };

  const swap = (index: number) => {
    const replacement = swapExercise(ids, index, owned, newSeed());
    if (replacement) setIds(ids.map((id, i) => (i === index ? replacement : id)));
  };

  const name = FOCUS_LABELS[focus];
  const exercises = ids.map(getExercise).filter((e) => !!e);
  const gear = settings.equipment.length ? settings.equipment.map(equipmentName).join(', ') : 'Bodyweight only';

  return (
    <Screen tab={false}>
      <View style={styles.group}>
        <SectionHeader title="Focus" />
        {FOCUS_ROWS.map((row) => (
          <SegmentedControl
            key={row.join()}
            accessibilityLabel="Workout focus"
            options={row.map((value) => ({ value, label: FOCUS_SHORT_LABELS[value] }))}
            value={row.includes(focus) ? focus : ('' as Focus)}
            onChange={(value) => {
              setFocus(value);
              regenerate(value, length);
            }}
          />
        ))}
      </View>

      <View style={styles.group}>
        <SectionHeader title={`Length · ${LENGTHS[length].count} moves · ${LENGTHS[length].minutes}`} />
        <SegmentedControl
          accessibilityLabel="Workout length"
          options={(Object.keys(LENGTHS) as Length[]).map((value) => ({
            value,
            label: LENGTHS[value].label,
          }))}
          value={length}
          onChange={(value) => {
            setLength(value);
            regenerate(focus, value);
          }}
        />
      </View>

      <View style={styles.group}>
        <SectionHeader
          title={name}
          action={
            <Button
              title="Shuffle"
              compact
              variant="ghost"
              icon={{ ios: 'shuffle', android: 'shuffle' }}
              onPress={() => {
                feedback.tap();
                regenerate();
              }}
            />
          }
        />
        <View style={styles.list}>
          {exercises.map((exercise, i) => (
            <Animated.View
              key={`${batch}-${exercise.id}`}
              entering={FadeInDown.delay(i * 45).duration(300)}
              layout={LinearTransition.duration(200)}>
              <ExerciseRow
                exercise={exercise}
                index={i}
                trailing={
                  <IconButton
                    icon={{ ios: 'arrow.triangle.2.circlepath', android: 'swap_horiz' }}
                    label={`Swap ${exercise.name}`}
                    onPress={() => {
                      feedback.tap();
                      swap(i);
                    }}
                  />
                }
              />
            </Animated.View>
          ))}
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          Using: {gear}.{' '}
          <Link href="/equipment" style={styles.link}>
            <ThemedText type="smallBold" themeColor="tint">
              Change
            </ThemedText>
          </Link>
        </ThemedText>
      </View>

      <View style={styles.buttons}>
        <Button
          title="Start now"
          icon={{ ios: 'play.fill', android: 'play_arrow' }}
          disabled={exercises.length === 0}
          onPress={() => {
            const begin = () => {
              startSession({ name, exerciseIds: ids });
              router.back();
              router.push('/session');
            };
            if (!active) return begin();
            Alert.alert('Replace the current session?', `“${active.name}” is still in progress.`, [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Replace', style: 'destructive', onPress: begin },
            ]);
          }}
        />
        <Button
          title="Save workout"
          variant="secondary"
          disabled={exercises.length === 0}
          onPress={() => {
            const workout = saveWorkout({ name, exerciseIds: ids, focus });
            router.back();
            router.push({ pathname: '/workout/[id]', params: { id: workout.id } });
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { gap: Spacing.three },
  list: { gap: Spacing.two },
  buttons: { gap: Spacing.two },
  link: { textDecorationLine: 'none' },
});
