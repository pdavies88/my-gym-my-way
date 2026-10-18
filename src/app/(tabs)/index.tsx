import { Link, router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Icon } from '@/components/icon';
import { PressableScale } from '@/components/pressable-scale';
import { ProgressBar } from '@/components/progress-bar';
import { Screen, SectionHeader } from '@/components/screen';
import { Tag } from '@/components/tag';
import { ThemedText } from '@/components/themed-text';
import { AppName } from '@/constants/brand';
import { Radius, Spacing } from '@/constants/theme';
import { useSettings } from '@/context/settings-context';
import { useTraining } from '@/context/training-context';
import { useTheme } from '@/hooks/use-theme';
import { FOCUS_LABELS } from '@/lib/generator';

export default function TrainScreen() {
  const theme = useTheme();
  const { settings, updateSettings } = useSettings();
  const { workouts, active } = useTraining();

  return (
    <Screen eyebrow={AppName} title="Train">
      {active && (
        <Animated.View entering={FadeInDown.duration(350)}>
          <Card accent>
            <ThemedText type="eyebrow" themeColor="tint">
              {active.pausedAt !== undefined ? 'Session paused' : 'Session in progress'}
            </ThemedText>
            <ThemedText type="heading">{active.name}</ThemedText>
            <ProgressBar progress={active.completedIds.length / Math.max(1, active.exerciseIds.length)} />
            <ThemedText type="small" themeColor="textSecondary">
              {active.completedIds.length} of {active.exerciseIds.length} exercises done
            </ThemedText>
            <Button
              title="Resume"
              icon={{ ios: 'play.fill', android: 'play_arrow' }}
              onPress={() => router.push('/session')}
            />
          </Card>
        </Animated.View>
      )}

      {!settings.healthNoteSeen && (
        <Animated.View entering={FadeInDown.delay(30).duration(350)}>
          <Card>
            <ThemedText type="heading">Before you start</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              My Gym My Way gives general fitness guidance for adults. It isn’t medical advice. Check with a doctor
              before you start a new program, especially if you have a health condition, an injury or are pregnant. Stop
              if you feel chest pain or pressure, dizziness, or shortness of breath that’s unusual for you.
            </ThemedText>
            <Button
              title="Got it"
              variant="secondary"
              compact
              onPress={() => updateSettings({ healthNoteSeen: true })}
            />
          </Card>
        </Animated.View>
      )}

      {!settings.equipmentChosen && (
        <Animated.View entering={FadeInDown.delay(60).duration(350)}>
          <Card>
            <ThemedText type="heading">Set up your gym</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Pick the equipment you own. Workouts only use what you have. Bodyweight moves are always included.
            </ThemedText>
            <Button title="Choose equipment" variant="secondary" onPress={() => router.push('/equipment')} />
          </Card>
        </Animated.View>
      )}

      <Animated.View entering={FadeInDown.delay(100).duration(350)} style={styles.actions}>
        <ActionTile
          title="Generate"
          subtitle="Built from your gear"
          icon={{ ios: 'sparkles', android: 'auto_awesome' }}
          primary
          onPress={() => router.push('/generate')}
        />
        <ActionTile
          title="Build"
          subtitle="Pick every move"
          icon={{ ios: 'square.and.pencil', android: 'edit_square' }}
          onPress={() => router.push('/builder')}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(120).duration(350)}>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Exercise library. Every move, with a demo video"
          onPress={() => router.push('/library')}
          style={[styles.workout, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Icon name={{ ios: 'square.grid.2x2', android: 'grid_view' }} size={22} color={theme.tint} />
          <View style={styles.workoutText}>
            <ThemedText type="heading">Exercise library</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Every move, with a demo video
            </ThemedText>
          </View>
          <Icon name={{ ios: 'chevron.right', android: 'chevron_right' }} size={16} color={theme.textSecondary} />
        </PressableScale>
      </Animated.View>

      <SectionHeader title={`Saved workouts · ${workouts.length}`} />
      {workouts.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          Workouts you save show up here, ready to start again.
        </ThemedText>
      ) : (
        <View style={styles.list}>
          {workouts.map((workout, i) => (
            <Animated.View key={workout.id} entering={FadeInDown.delay(140 + i * 40).duration(320)}>
              <Link href={{ pathname: '/workout/[id]', params: { id: workout.id } }} asChild>
                {/* Link's asChild slot rejects style arrays, so pass a flat style. */}
                <PressableScale
                  style={StyleSheet.flatten([
                    styles.workout,
                    { backgroundColor: theme.card, borderColor: theme.border },
                  ])}>
                  <View style={styles.workoutText}>
                    <ThemedText type="heading" numberOfLines={1}>
                      {workout.name}
                    </ThemedText>
                    <View style={styles.tags}>
                      {workout.focus && <Tag label={FOCUS_LABELS[workout.focus]} />}
                      <Tag label={`${workout.exerciseIds.length} moves`} />
                    </View>
                  </View>
                  <Icon
                    name={{ ios: 'chevron.right', android: 'chevron_right' }}
                    size={16}
                    color={theme.textSecondary}
                  />
                </PressableScale>
              </Link>
            </Animated.View>
          ))}
        </View>
      )}
    </Screen>
  );
}

function ActionTile({
  title,
  subtitle,
  icon,
  primary,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: { ios: string; android: string };
  primary?: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const fg = primary ? theme.onTint : theme.text;
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}
      onPress={onPress}
      style={[
        styles.tile,
        primary
          ? { backgroundColor: theme.tint }
          : { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 },
      ]}>
      <Icon name={icon} size={26} color={primary ? theme.onTint : theme.tint} />
      <View>
        <ThemedText type="title" numberOfLines={1} adjustsFontSizeToFit style={[styles.tileTitle, { color: fg }]}>
          {title}
        </ThemedText>
        <ThemedText type="small" style={{ color: fg, opacity: 0.75 }}>
          {subtitle}
        </ThemedText>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: Spacing.three },
  tile: {
    flex: 1,
    minHeight: 150,
    borderRadius: Radius.card,
    padding: Spacing.three,
    justifyContent: 'space-between',
  },
  tileTitle: { fontSize: 24, lineHeight: 28 },
  list: { gap: Spacing.two },
  workout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.card,
    borderWidth: 1,
  },
  workoutText: { flex: 1, gap: Spacing.two },
  tags: { flexDirection: 'row', gap: Spacing.two },
});
