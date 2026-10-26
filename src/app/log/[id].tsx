import { router, useLocalSearchParams } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Icon } from '@/components/icon';
import { Screen, SectionHeader } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTraining } from '@/context/training-context';
import { useTheme } from '@/hooks/use-theme';
import { circuitParams, normalizePlan } from '@/lib/circuit';
import { getExercise } from '@/lib/exercises';
import { SESSION_KIND_LABELS, sessionKind } from '@/lib/session-kind';
import { formatDuration } from '@/lib/time';
import { goBackOrHome, goHome } from '@/lib/navigation';

export default function SessionLogScreen() {
  const theme = useTheme();
  const { id, fresh } = useLocalSearchParams<{ id: string; fresh?: string }>();
  const { sessions, deleteSession, startSession, active } = useTraining();
  const log = sessions.find((s) => s.id === id);

  if (!log) {
    return (
      <Screen tab={false}>
        <ThemedText themeColor="textSecondary">This session was deleted.</ThemedText>
      </Screen>
    );
  }

  const exercises = log.exerciseIds.map(getExercise).filter((e) => !!e);
  const done = log.completedIds.length;
  const date = new Date(log.startedAt).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const kind = sessionKind(log);
  const isCardio = kind !== 'strength';

  const repeat = () => {
    if (kind === 'circuit') {
      router.replace({
        pathname: '/cardio-player/[id]',
        params: circuitParams(log.name.replace(/ bootcamp$/, ''), log.exerciseIds, normalizePlan(log.circuit ?? {})),
      });
      return;
    }
    if (isCardio && log.cardioId) {
      router.replace({
        pathname: '/cardio/[id]',
        params: { id: log.cardioId },
      });
      return;
    }
    if (active) {
      Alert.alert('A session is already in progress', 'Finish or discard it first.');
      return;
    }
    startSession({
      name: log.name,
      exerciseIds: log.exerciseIds,
      workoutId: log.workoutId,
    });
    router.replace('/session');
  };

  return (
    <Screen tab={false}>
      <View style={styles.header}>
        {fresh && (
          <Animated.View entering={FadeIn.duration(250)} style={[styles.badge, { backgroundColor: theme.tint }]}>
            <Icon name={{ ios: 'checkmark', android: 'check' }} size={30} color={theme.onTint} />
          </Animated.View>
        )}
        <ThemedText type="eyebrow" themeColor="tint">
          {fresh ? 'Workout complete' : isCardio ? `${SESSION_KIND_LABELS[kind]} · ${date}` : date}
        </ThemedText>
        <ThemedText type="title">{log.name}</ThemedText>
      </View>

      <Animated.View entering={FadeInDown.delay(80).duration(320)} style={styles.stats}>
        <Stat label="Time" value={formatDuration(log.finishedAt - log.startedAt)} />
        {isCardio ? (
          <Stat label="Type" value={SESSION_KIND_LABELS[kind]} />
        ) : (
          <Stat label="Done" value={`${done}/${exercises.length}`} />
        )}
      </Animated.View>

      {exercises.length > 0 && (
        <View style={styles.list}>
          <SectionHeader title={isCardio ? 'Moves in this session' : 'Exercises'} />
          {exercises.map((exercise) => {
            const completed = log.completedIds.includes(exercise.id);
            return (
              <View key={exercise.id} style={[styles.item, { borderColor: theme.border }]}>
                <Icon
                  name={
                    completed
                      ? { ios: 'checkmark.square.fill', android: 'check_box' }
                      : { ios: 'square', android: 'check_box_outline_blank' }
                  }
                  size={20}
                  color={completed ? theme.tint : theme.textSecondary}
                />
                <ThemedText type="smallBold" themeColor={completed ? 'text' : 'textSecondary'} style={styles.itemText}>
                  {exercise.name}
                </ThemedText>
              </View>
            );
          })}
        </View>
      )}

      <View style={styles.buttons}>
        {fresh ? (
          <Button title="Done" onPress={goHome} />
        ) : (
          <Button title="Do it again" icon={{ ios: 'arrow.clockwise', android: 'replay' }} onPress={repeat} />
        )}
        <Button
          title="Delete from history"
          variant="ghost"
          onPress={() =>
            Alert.alert('Delete this session?', undefined, [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                  goBackOrHome();
                  deleteSession(log.id);
                },
              },
            ])
          }
        />
      </View>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card style={styles.stat}>
      <ThemedText type="eyebrow" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="heading" style={styles.statValue}>
        {value}
      </ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { gap: Spacing.two },
  badge: {
    width: 56,
    height: 56,
    borderRadius: Radius.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  stats: { flexDirection: 'row', gap: Spacing.two },
  stat: { flex: 1 },
  statValue: { fontSize: 26, lineHeight: 30 },
  list: { gap: Spacing.three },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingBottom: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemText: { flex: 1, fontSize: 16 },
  buttons: { gap: Spacing.two },
});
