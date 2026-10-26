import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Button } from '@/components/button';
import { ExerciseRow } from '@/components/exercise-row';
import { Screen, SectionHeader } from '@/components/screen';
import { Tag } from '@/components/tag';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useSettings } from '@/context/settings-context';
import { useTraining } from '@/context/training-context';
import { circuitParams, normalizePlan, STATION_NAMES } from '@/lib/circuit';
import { canDo, getExercise } from '@/lib/exercises';
import { FOCUS_LABELS } from '@/lib/generator';
import { goBackOrHome } from '@/lib/navigation';

export default function WorkoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { workouts, deleteWorkout, startSession, active } = useTraining();
  const { owned } = useSettings();
  const workout = workouts.find((w) => w.id === id);

  if (!workout) {
    return (
      <Screen tab={false}>
        <ThemedText themeColor="textSecondary">This workout was deleted.</ThemedText>
      </Screen>
    );
  }

  const exercises = workout.exerciseIds.map(getExercise).filter((e) => !!e);
  const missingGear = exercises.filter((e) => !canDo(e, owned));
  const bootcamp = workout.circuit ? normalizePlan(workout.circuit) : null;

  const start = () => {
    const begin = () => {
      startSession({ name: workout.name, exerciseIds: workout.exerciseIds, workoutId: workout.id });
      router.push('/session');
    };
    if (active) {
      Alert.alert('Replace the current session?', `“${active.name}” is still in progress.`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Replace', style: 'destructive', onPress: begin },
      ]);
    } else {
      begin();
    }
  };

  const confirmDelete = () =>
    Alert.alert('Delete this workout?', 'Your session history stays.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          goBackOrHome();
          deleteWorkout(workout.id);
        },
      },
    ]);

  return (
    <Screen tab={false}>
      <Stack.Screen options={{ title: '' }} />
      <View style={styles.header}>
        <ThemedText type="eyebrow" themeColor="tint">
          Saved workout
        </ThemedText>
        <ThemedText type="title">{workout.name}</ThemedText>
        <View style={styles.tags}>
          {workout.focus && <Tag label={FOCUS_LABELS[workout.focus]} tone="tint" />}
          {bootcamp && <Tag label={`${bootcamp.minutes} min bootcamp`} />}
          <Tag label={`${exercises.length} moves`} />
        </View>
      </View>

      <View style={styles.startButtons}>
        {bootcamp && (
          <Button
            title="Start bootcamp"
            icon={{ ios: 'play.fill', android: 'play_arrow' }}
            onPress={() =>
              router.push({
                pathname: '/cardio-player/[id]',
                params: circuitParams(workout.name, workout.exerciseIds, bootcamp),
              })
            }
          />
        )}
        <Button
          title={bootcamp ? 'Start as sets' : 'Start workout'}
          variant={bootcamp ? 'secondary' : 'primary'}
          icon={bootcamp ? undefined : { ios: 'play.fill', android: 'play_arrow' }}
          onPress={start}
        />
        {bootcamp && (
          <ThemedText type="small" themeColor="textSecondary">
            A {bootcamp.minutes}-minute bootcamp:{' '}
            {[...bootcamp.stations.map((s) => STATION_NAMES[s].toLowerCase()), 'floor'].join(', ')} stations. The moves
            below make up the floor station.
          </ThemedText>
        )}
      </View>

      <View style={styles.group}>
        <SectionHeader title="Exercises" />
        {missingGear.length > 0 && (
          <ThemedText type="small" themeColor="accent">
            {missingGear.length === 1 ? 'One exercise needs' : `${missingGear.length} exercises need`} equipment you
            haven’t selected.
          </ThemedText>
        )}
        {exercises.map((exercise, i) => (
          <Animated.View key={exercise.id} entering={FadeInDown.delay(i * 40).duration(300)}>
            <ExerciseRow exercise={exercise} index={i} />
          </Animated.View>
        ))}
      </View>

      <View style={styles.row}>
        <Button
          title="Edit"
          variant="secondary"
          style={styles.flex}
          onPress={() => router.push({ pathname: '/builder', params: { id: workout.id } })}
        />
        <Button title="Delete" variant="destructive" style={styles.flex} onPress={confirmDelete} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: Spacing.two },
  startButtons: { gap: Spacing.two },
  tags: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.one },
  group: { gap: Spacing.two },
  row: { flexDirection: 'row', gap: Spacing.two },
  flex: { flex: 1 },
});
