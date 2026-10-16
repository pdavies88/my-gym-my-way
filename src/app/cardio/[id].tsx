import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { EFFORT_COLORS, EffortStrip } from '@/components/effort';
import { ExerciseVideo } from '@/components/exercise-video';
import { Screen, SectionHeader } from '@/components/screen';
import { Tag } from '@/components/tag';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useSettings } from '@/context/settings-context';
import {
  canDoCardio,
  EFFORT_GUIDE,
  EFFORT_LABELS,
  formatCountdown,
  getCardioSession,
  totalSeconds,
  type Effort,
} from '@/lib/cardio';
import { equipmentName } from '@/lib/equipment';
import { getExercise } from '@/lib/exercises';
import { getVideo } from '@/lib/videos';

export default function CardioOverviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { owned } = useSettings();
  const session = getCardioSession(id);

  if (!session) {
    return (
      <Screen tab={false}>
        <ThemedText themeColor="textSecondary">Session not found.</ThemedText>
      </Screen>
    );
  }

  const minutes = Math.round(totalSeconds(session) / 60);
  const available = canDoCardio(session, owned);
  const technique = session.techniqueExerciseId ? getExercise(session.techniqueExerciseId) : undefined;
  const techniqueVideo = technique ? getVideo(technique.id) : undefined;
  const efforts = (['easy', 'moderate', 'hard', 'max', 'rest'] as const).filter((effort) =>
    session.steps.some((s) => s.effort === effort || (effort === 'easy' && s.effort === 'warmup')),
  );

  return (
    <Screen tab={false}>
      <View style={styles.header}>
        <ThemedText type="eyebrow" themeColor="tint">
          Guided cardio
        </ThemedText>
        <ThemedText type="title">{session.name}</ThemedText>
        <ThemedText themeColor="textSecondary">{session.summary}</ThemedText>
        <View style={styles.tags}>
          <Tag label={`${minutes} min`} tone="tint" />
          <Tag label={session.level} />
          {session.needs.length === 0 ? (
            <Tag label="No equipment" />
          ) : (
            session.needs.map((item) => <Tag key={item} label={equipmentName(item)} />)
          )}
        </View>
      </View>

      <EffortStrip segments={session.steps} />

      <Button
        title="Start session"
        icon={{ ios: 'play.fill', android: 'play_arrow' }}
        onPress={() =>
          router.push({
            pathname: '/cardio-player/[id]',
            params: { id: session.id },
          })
        }
      />
      {!available && (
        <ThemedText type="small" themeColor="accent">
          This session uses equipment you haven’t selected. You can still start it.
        </ThemedText>
      )}

      {technique && techniqueVideo && (
        <Animated.View entering={FadeInDown.delay(60).duration(300)} style={styles.group}>
          <SectionHeader title={`Technique: ${technique.name}`} />
          <ExerciseVideo video={techniqueVideo} />
        </Animated.View>
      )}

      <View style={styles.group}>
        <SectionHeader title="How hard is hard?" />
        <Card>
          {efforts.map((effort) => (
            <View key={effort} style={styles.guideRow}>
              <View style={[styles.dot, { backgroundColor: EFFORT_COLORS[effort] }]} />
              <ThemedText type="smallBold" style={styles.guideLabel}>
                {EFFORT_LABELS[effort]}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.flex}>
                {EFFORT_GUIDE[effort as Exclude<Effort, 'warmup'>]}
              </ThemedText>
            </View>
          ))}
        </Card>
      </View>

      <View style={styles.group}>
        <SectionHeader title={`Steps · ${session.steps.length}`} />
        <Card>
          {session.steps.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={[styles.bar, { backgroundColor: EFFORT_COLORS[step.effort] }]} />
              <ThemedText type="small" style={styles.flex} numberOfLines={1}>
                {step.label}
              </ThemedText>
              <ThemedText type="mono" themeColor="textSecondary">
                {formatCountdown(step.seconds)}
              </ThemedText>
            </View>
          ))}
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: Spacing.two },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  group: { gap: Spacing.three },
  guideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: 2,
  },
  guideLabel: { width: 76 },
  dot: { width: 10, height: 10, borderRadius: 2 },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: 3,
  },
  bar: { width: 4, height: 18, borderRadius: 1 },
  flex: { flex: 1 },
});
