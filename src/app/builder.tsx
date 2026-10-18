import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';

import { Button } from '@/components/button';
import { ExerciseBrowser } from '@/components/exercise-browser';
import { ExerciseRow } from '@/components/exercise-row';
import { IconButton } from '@/components/icon-button';
import { Screen, SectionHeader } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useSettings } from '@/context/settings-context';
import { alertWorkoutsFull, useTraining } from '@/context/training-context';
import { useTheme } from '@/hooks/use-theme';
import { availableExercises, getExercise } from '@/lib/exercises';

export default function BuilderScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { workouts, saveWorkout } = useTraining();
  const { owned } = useSettings();
  const existing = id ? workouts.find((w) => w.id === id) : undefined;

  const [name, setName] = useState(existing?.name ?? '');
  const [ids, setIds] = useState<string[]>(existing?.exerciseIds ?? []);

  const move = (index: number, delta: number) => {
    const next = [...ids];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    setIds(next);
  };

  const choices = availableExercises(owned).filter((e) => !ids.includes(e.id));

  const inputStyle = [styles.input, { color: theme.text, backgroundColor: theme.card, borderColor: theme.border }];

  return (
    <Screen tab={false}>
      <View style={styles.group}>
        <SectionHeader title="Name" />
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Leg day, Morning burner…"
          accessibilityLabel="Workout name"
          placeholderTextColor={theme.textSecondary}
          style={inputStyle}
          returnKeyType="done"
        />
      </View>

      <View style={styles.group}>
        <SectionHeader title={`Your workout · ${ids.length}`} />
        {ids.length === 0 && (
          <ThemedText type="small" themeColor="textSecondary">
            Add exercises from the list below.
          </ThemedText>
        )}
        {ids.map((exerciseId, i) => {
          const exercise = getExercise(exerciseId);
          if (!exercise) return null;
          return (
            <Animated.View key={exerciseId} entering={FadeIn.duration(220)} layout={LinearTransition.duration(200)}>
              <ExerciseRow
                exercise={exercise}
                index={i}
                trailing={
                  <View style={styles.rowActions}>
                    <IconButton
                      icon={{ ios: 'chevron.up', android: 'keyboard_arrow_up' }}
                      label="Move up"
                      disabled={i === 0}
                      onPress={() => move(i, -1)}
                    />
                    <IconButton
                      icon={{ ios: 'xmark', android: 'close' }}
                      label={`Remove ${exercise.name}`}
                      tone="danger"
                      onPress={() => setIds(ids.filter((x) => x !== exerciseId))}
                    />
                  </View>
                }
              />
            </Animated.View>
          );
        })}
      </View>

      <Button
        title={existing ? 'Save changes' : 'Save workout'}
        disabled={ids.length === 0}
        onPress={() => {
          if (!saveWorkout({ name: name || 'My workout', exerciseIds: ids }, existing?.id)) {
            alertWorkoutsFull();
            return;
          }
          router.back();
        }}
      />

      <View style={styles.group}>
        <SectionHeader title="Add exercises" />
        <ExerciseBrowser
          exercises={choices}
          trailing={(exercise) => (
            <IconButton
              icon={{ ios: 'plus', android: 'add' }}
              label={`Add ${exercise.name}`}
              tone="tint"
              onPress={() => setIds([...ids, exercise.id])}
            />
          )}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { gap: Spacing.three },
  rowActions: { flexDirection: 'row', gap: Spacing.one },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: Radius.control,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
});
