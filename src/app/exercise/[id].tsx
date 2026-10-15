import { Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Card } from '@/components/card';
import { ExerciseVideo } from '@/components/exercise-video';
import { Screen, SectionHeader } from '@/components/screen';
import { Tag } from '@/components/tag';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useSettings } from '@/context/settings-context';
import { equipmentName } from '@/lib/equipment';
import { canDo, getExercise, SLOT_LABELS } from '@/lib/exercises';
import { getVideo } from '@/lib/videos';

export default function ExerciseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { owned } = useSettings();
  const exercise = getExercise(id);

  if (!exercise) {
    return (
      <Screen tab={false}>
        <ThemedText themeColor="textSecondary">Exercise not found.</ThemedText>
      </Screen>
    );
  }

  const gear =
    exercise.needs.length === 0
      ? 'Bodyweight only'
      : exercise.needs.map((option) => option.map(equipmentName).join(' + ')).join(' or ');
  const available = canDo(exercise, owned);
  const video = getVideo(exercise.id);

  return (
    <Screen tab={false}>
      <Stack.Screen options={{ title: '' }} />
      <View style={styles.header}>
        <ThemedText type="eyebrow" themeColor="tint">
          {exercise.slots.map((slot) => SLOT_LABELS[slot]).join(' · ')}
        </ThemedText>
        <ThemedText type="title">{exercise.name}</ThemedText>
      </View>

      {video && <ExerciseVideo video={video} />}

      <Animated.View entering={FadeInDown.delay(80).duration(320)} style={styles.tags}>
        {exercise.muscles.map((muscle) => (
          <Tag key={muscle} label={muscle} />
        ))}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(140).duration(320)} style={styles.group}>
        <SectionHeader title="How to" />
        <Card>
          {exercise.cues.map((cue, i) => (
            <View key={cue} style={styles.cue}>
              <ThemedText type="mono" themeColor="tint" style={styles.cueIndex}>
                {String(i + 1).padStart(2, '0')}
              </ThemedText>
              <ThemedText style={styles.cueText}>{cue}</ThemedText>
            </View>
          ))}
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(320)} style={styles.stats}>
        <Card style={styles.stat}>
          <ThemedText type="eyebrow" themeColor="textSecondary">
            Start with
          </ThemedText>
          <ThemedText type="smallBold">{exercise.prescription}</ThemedText>
        </Card>
        <Card style={styles.stat} accent={!available}>
          <ThemedText type="eyebrow" themeColor={available ? 'textSecondary' : 'accent'}>
            {available ? 'Equipment' : 'Needs'}
          </ThemedText>
          <ThemedText type="smallBold">{gear}</ThemedText>
        </Card>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: Spacing.one },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  group: { gap: Spacing.three },
  cue: { flexDirection: 'row', gap: Spacing.three, paddingVertical: Spacing.one },
  cueIndex: { paddingTop: 4 },
  cueText: { flex: 1 },
  stats: { flexDirection: 'row', gap: Spacing.two },
  stat: { flex: 1 },
});
