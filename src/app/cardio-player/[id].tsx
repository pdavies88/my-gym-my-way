import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, withTiming, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { EFFORT_COLORS, EffortChip } from '@/components/effort';
import { HeaderButton } from '@/components/header-button';
import { Icon } from '@/components/icon';
import { PressableScale } from '@/components/pressable-scale';
import { ProgressBar } from '@/components/progress-bar';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTraining } from '@/context/training-context';
import { useTheme } from '@/hooks/use-theme';
import { formatCountdown, getCardioSession, positionAt, stepStart, totalSeconds } from '@/lib/cardio';
import { getExercise } from '@/lib/exercises';
import { formatDuration } from '@/lib/time';

export default function CardioPlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const session = getCardioSession(id);
  if (!session) {
    return (
      <SafeAreaView style={styles.fill}>
        <HeaderButton variant="close" />
        <ThemedText themeColor="textSecondary">Session not found.</ThemedText>
      </SafeAreaView>
    );
  }
  return <Player sessionId={session.id} />;
}

function Player({ sessionId }: { sessionId: string }) {
  useKeepAwake();
  const theme = useTheme();
  // Full-screen modals don't get safe-area padding from SafeAreaView here, so pad from the insets directly.
  const insets = useSafeAreaInsets();
  const { logCardio } = useTraining();
  const session = getCardioSession(sessionId)!;
  const { steps } = session;
  const total = totalSeconds(session);

  // The clock is built from timestamps, so it stays right if the phone locks or the app is backgrounded.
  const [startedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const [pausedAt, setPausedAt] = useState<number | null>(null);
  const [pausedMs, setPausedMs] = useState(0);
  const [offset, setOffset] = useState(0);
  const logged = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(timer);
  }, []);

  const elapsed = Math.min(total, ((pausedAt ?? now) - startedAt - pausedMs) / 1000 + offset);
  const pos = positionAt(steps, elapsed);
  const current = steps[pos.index];
  const next = steps[pos.index + 1];
  const secondsLeft = Math.ceil(pos.stepRemaining);
  const paused = pausedAt !== null;

  // A firm tap when a new step starts, and light ticks for the last three seconds of each step.
  useEffect(() => {
    if (pos.index > 0) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [pos.index]);
  useEffect(() => {
    if (!paused && !pos.done && secondsLeft >= 1 && secondsLeft <= 3) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [secondsLeft, paused, pos.done]);

  const exerciseIds = [...new Set(steps.map((s) => s.exerciseId).filter((e): e is string => !!e))];
  const save = () => {
    if (logged.current) return;
    logged.current = true;
    logCardio({
      cardioId: session.id,
      name: session.name,
      startedAt,
      exerciseIds,
    });
  };

  // Save to history once, the moment the last step ends.
  useEffect(() => {
    if (pos.done && !logged.current) {
      save();
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  });

  const togglePause = () => {
    const time = Date.now();
    if (pausedAt === null) {
      setPausedAt(time);
    } else {
      setPausedMs((ms) => ms + (time - pausedAt));
      setPausedAt(null);
      setNow(time);
    }
  };
  const skip = () => setOffset((o) => o + pos.stepRemaining);
  const previous = () => {
    // Within the first 3 seconds of a step, go back a whole step. Otherwise restart this one.
    const target = pos.stepElapsed < 3 && pos.index > 0 ? stepStart(steps, pos.index - 1) : stepStart(steps, pos.index);
    setOffset((o) => o - (elapsed - target));
  };

  const end = () => {
    if (pos.done) return router.back();
    const activeMs = Date.now() - startedAt - pausedMs - (pausedAt === null ? 0 : Date.now() - pausedAt);
    Alert.alert('End this session?', `You’ve trained for ${formatDuration(activeMs)}. Skipped steps don’t count.`, [
      { text: 'Keep going', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => router.back() },
      {
        text: 'Save and end',
        onPress: () => {
          save();
          router.back();
        },
      },
    ]);
  };

  const effortColor = EFFORT_COLORS[current?.effort ?? 'rest'];
  const glowStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(effortColor, { duration: 400 }),
  }));

  if (pos.done) {
    return (
      <View
        style={[
          styles.fill,
          { backgroundColor: theme.background, paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}>
        <View style={styles.doneWrap}>
          <Animated.View
            entering={ZoomIn.springify().damping(12)}
            style={[styles.badge, { backgroundColor: theme.tint }]}>
            <Icon name={{ ios: 'checkmark', android: 'check' }} size={36} color={theme.onTint} />
          </Animated.View>
          <ThemedText type="eyebrow" themeColor="tint">
            Session complete
          </ThemedText>
          <ThemedText type="title" style={styles.center}>
            {session.name}
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.center}>
            {formatDuration(total * 1000)} of guided cardio. It’s saved to your history.
          </ThemedText>
          <Button title="Done" style={styles.doneButton} onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.fill, { backgroundColor: theme.background }]}>
      <Animated.View style={[styles.glow, glowStyle]} />
      <View style={[styles.fill, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.topBar}>
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel="End session"
            onPress={end}
            hitSlop={10}
            style={styles.topButton}>
            <Icon name={{ ios: 'xmark', android: 'close' }} size={18} color={theme.text} />
          </PressableScale>
          <View style={styles.topText}>
            <ThemedText type="eyebrow" themeColor="textSecondary" numberOfLines={1}>
              {session.name}
            </ThemedText>
            <ThemedText type="mono" themeColor="textSecondary">
              {formatCountdown(pos.totalRemaining)} left · step {pos.index + 1} of {steps.length}
            </ThemedText>
          </View>
          <View style={styles.topButton} />
        </View>

        <View style={styles.main}>
          <Animated.View key={pos.index} entering={FadeInDown.duration(300)} style={styles.stepBlock}>
            <EffortChip effort={current.effort} large />
            <ThemedText type="title" style={styles.stepTitle}>
              {current.label}
            </ThemedText>
          </Animated.View>

          <ThemedText
            type="display"
            style={[styles.countdown, paused && { color: theme.textSecondary }]}
            accessibilityLabel={`${secondsLeft} seconds left in this step`}>
            {formatCountdown(pos.stepRemaining)}
          </ThemedText>
          <ProgressBar progress={pos.stepElapsed / current.seconds} />

          <Animated.View key={`cue-${pos.index}`} entering={FadeIn.duration(400)}>
            <ThemedText style={styles.cue}>{current.cue}</ThemedText>
          </Animated.View>

          {current.exerciseId && (
            <PressableScale
              accessibilityRole="link"
              onPress={() =>
                router.push({
                  pathname: '/exercise/[id]',
                  params: { id: current.exerciseId! },
                })
              }
              style={styles.howTo}>
              <Icon name={{ ios: 'play.rectangle.fill', android: 'smart_display' }} size={16} color={theme.accent} />
              <ThemedText type="smallBold" themeColor="textSecondary">
                How to: {getExercise(current.exerciseId)?.name}
              </ThemedText>
            </PressableScale>
          )}
        </View>

        <View style={styles.bottom}>
          {next ? (
            <View style={[styles.next, { borderColor: theme.border, backgroundColor: theme.card }]}>
              <View style={[styles.nextBar, { backgroundColor: EFFORT_COLORS[next.effort] }]} />
              <ThemedText type="eyebrow" themeColor="textSecondary">
                Next
              </ThemedText>
              <ThemedText type="smallBold" style={styles.flex} numberOfLines={1}>
                {next.label}
              </ThemedText>
              <ThemedText type="mono" themeColor="textSecondary">
                {formatCountdown(next.seconds)}
              </ThemedText>
            </View>
          ) : (
            <ThemedText type="eyebrow" themeColor="tint" style={styles.center}>
              Last step
            </ThemedText>
          )}
          <ProgressBar progress={elapsed / total} />
          <View style={styles.controls}>
            <ControlButton
              icon={{ ios: 'backward.end.fill', android: 'skip_previous' }}
              label="Previous step"
              onPress={previous}
            />
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel={paused ? 'Resume' : 'Pause'}
              onPress={togglePause}
              scaleTo={0.92}
              style={[styles.play, { backgroundColor: theme.tint }]}>
              <Icon
                name={paused ? { ios: 'play.fill', android: 'play_arrow' } : { ios: 'pause.fill', android: 'pause' }}
                size={30}
                color={theme.onTint}
              />
            </PressableScale>
            <ControlButton icon={{ ios: 'forward.end.fill', android: 'skip_next' }} label="Next step" onPress={skip} />
          </View>
        </View>
      </View>
    </View>
  );
}

function ControlButton({
  icon,
  label,
  onPress,
}: {
  icon: { ios: string; android: string };
  label: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      scaleTo={0.9}
      style={[styles.control, { backgroundColor: theme.backgroundElement }]}>
      <Icon name={icon} size={22} color={theme.text} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flex: { flex: 1 },
  center: { textAlign: 'center' },
  glow: { position: 'absolute', top: 0, left: 0, right: 0, height: 6 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
  },
  topButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topText: { flex: 1, alignItems: 'center', gap: 2 },
  main: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  stepBlock: { gap: Spacing.two },
  stepTitle: { fontSize: 34, lineHeight: 38 },
  countdown: { fontSize: 104, lineHeight: 112, letterSpacing: -3 },
  cue: { fontSize: 19, lineHeight: 27 },
  howTo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  bottom: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
    gap: Spacing.three,
  },
  next: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: Radius.card,
    padding: Spacing.three,
    overflow: 'hidden',
  },
  nextBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.five,
  },
  control: {
    width: 56,
    height: 56,
    borderRadius: Radius.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  play: {
    width: 84,
    height: 84,
    borderRadius: Radius.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
  badge: {
    width: 72,
    height: 72,
    borderRadius: Radius.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButton: { alignSelf: 'stretch', marginTop: Spacing.three },
});
