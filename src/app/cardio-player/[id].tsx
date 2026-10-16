import { useKeepAwake } from 'expo-keep-awake';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, withTiming, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { EFFORT_COLORS, EffortChip } from '@/components/effort';
import { HeaderButton } from '@/components/header-button';
import { HowToSheet } from '@/components/how-to-sheet';
import { Icon } from '@/components/icon';
import { PressableScale } from '@/components/pressable-scale';
import { ProgressBar } from '@/components/progress-bar';
import { ThemedText } from '@/components/themed-text';
import { DisplayFont, Radius, Spacing } from '@/constants/theme';
import { useSettings } from '@/context/settings-context';
import { useTraining } from '@/context/training-context';
import { useCardioCues } from '@/hooks/use-cardio-cues';
import { useTheme } from '@/hooks/use-theme';
import {
  cuesBetween,
  formatCountdown,
  getCardioSession,
  INTENSITY,
  positionAt,
  stepStart,
  totalSeconds,
  type Effort,
} from '@/lib/cardio';
import { getExercise } from '@/lib/exercises';
import { formatDuration } from '@/lib/time';
import { goBackOrHome } from '@/lib/navigation';

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
  const [howTo, setHowTo] = useState<string | null>(null);
  const cues = useCardioCues();

  const elapsed = Math.min(total, ((pausedAt ?? now) - startedAt - pausedMs) / 1000 + offset);
  const pos = positionAt(steps, elapsed);
  const current = steps[pos.index];
  const next = steps[pos.index + 1];
  const secondsLeft = Math.ceil(pos.stepRemaining);
  const paused = pausedAt !== null;
  // Tick five times a second until the session ends. Stopping then freezes the clock for the done screen.
  useEffect(() => {
    if (pos.done) return;
    const timer = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(timer);
  }, [pos.done]);

  /** Time actually spent training: wall-clock time minus pauses. Skipping ahead doesn't add to it. */
  const activeMs = (at: number) => at - startedAt - pausedMs - (pausedAt === null ? 0 : at - pausedAt);

  // Pause whenever another screen covers the player, such as a "How to" video, and stop any speech.
  useFocusEffect(
    useCallback(
      () => () => {
        setPausedAt((p) => p ?? Date.now());
        cues.silence();
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [],
    ),
  );

  const finalCount = !paused && !pos.done && current.seconds > 4 && secondsLeft >= 1 && secondsLeft <= 3;

  const { settings, updateSettings } = useSettings();
  const muted = settings.sounds === false && settings.voice === false;

  // Beeps, voice and haptics. Each clock reading plays whatever cues the clock just passed.
  const lastElapsed = useRef<number | null>(null);
  useEffect(() => {
    if (lastElapsed.current === null) {
      cues.start(steps[0].seconds, steps[0].label);
    } else {
      for (const cue of cuesBetween(steps, lastElapsed.current, elapsed)) cues.play(cue);
    }
    lastElapsed.current = elapsed;
  });

  const exerciseIds = [...new Set(steps.map((s) => s.exerciseId).filter((e): e is string => !!e))];
  /** Saves the session to history once. `at` is when it ended, for the time trained. */
  const save = (at: number) => {
    if (logged.current) return;
    logged.current = true;
    logCardio({
      cardioId: session.id,
      name: session.name,
      startedAt,
      durationMs: activeMs(at),
      exerciseIds,
    });
  };

  // Save to history once, the moment the last step ends.
  useEffect(() => {
    if (pos.done && !logged.current) save(now);
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
    const index = pos.stepElapsed < 3 && pos.index > 0 ? pos.index - 1 : pos.index;
    setOffset((o) => o - (elapsed - stepStart(steps, index)));
    cues.play({ kind: 'step', index, step: steps[index] });
  };

  const end = () => {
    if (pos.done) return goBackOrHome();
    // Hold the clock while the question is open, so nothing ends or speaks behind the alert.
    const pauseStart = Date.now();
    const wasRunning = pausedAt === null;
    if (wasRunning) setPausedAt(pauseStart);
    cues.silence();
    Alert.alert(
      'End this session?',
      `You’ve trained for ${formatDuration(activeMs(pauseStart))}. Skipped steps don’t count.`,
      [
        {
          text: 'Keep going',
          style: 'cancel',
          onPress: () => {
            if (!wasRunning) return;
            const time = Date.now();
            setPausedMs((ms) => ms + (time - pauseStart));
            setPausedAt(null);
            setNow(time);
          },
        },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            logged.current = true;
            goBackOrHome();
          },
        },
        {
          text: 'Save and end',
          onPress: () => {
            save(pauseStart);
            goBackOrHome();
          },
        },
      ],
    );
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
            {formatDuration(activeMs(now))} of guided cardio. It’s saved to your history.
          </ThemedText>
          <Button title="Done" style={styles.doneButton} onPress={goBackOrHome} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.fill, { backgroundColor: theme.background }]}>
      <Animated.View style={[styles.glow, glowStyle]} />
      <HowToSheet exerciseId={howTo} onClose={() => setHowTo(null)} />
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
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={muted ? 'Turn sound and voice on' : 'Mute sound and voice'}
            onPress={() => {
              if (!muted) cues.silence();
              updateSettings({ sounds: muted, voice: muted });
            }}
            hitSlop={10}
            style={styles.topButton}>
            <Icon
              name={
                muted
                  ? { ios: 'speaker.slash.fill', android: 'volume_off' }
                  : { ios: 'speaker.wave.2.fill', android: 'volume_up' }
              }
              size={18}
              color={muted ? theme.textSecondary : theme.text}
            />
          </PressableScale>
        </View>

        <View style={styles.main}>
          <Animated.View key={pos.index} entering={FadeInDown.duration(300)} style={styles.stepBlock}>
            <EffortChip effort={current.effort} large />
            <ThemedText type="title" style={styles.stepTitle}>
              {current.label}
            </ThemedText>
          </Animated.View>

          {finalCount ? (
            // The last three seconds of a step become a big 3-2-1 in the next step's color.
            <View style={styles.countdownRow}>
              <Animated.Text
                key={secondsLeft}
                entering={ZoomIn.duration(220)}
                accessibilityLabel={`${secondsLeft}`}
                style={[styles.finalCount, { color: EFFORT_COLORS[next?.effort ?? 'easy'] }]}>
                {secondsLeft}
              </Animated.Text>
              <ThemedText type="eyebrow" themeColor="textSecondary" style={styles.finalLabel}>
                {next ? `Next: ${next.label}` : 'Last one'}
              </ThemedText>
            </View>
          ) : (
            <ThemedText
              type="display"
              style={[styles.countdown, paused && { color: theme.textSecondary }]}
              accessibilityLabel={`${secondsLeft} seconds left in this step`}>
              {formatCountdown(pos.stepRemaining)}
            </ThemedText>
          )}
          <ProgressBar progress={pos.stepElapsed / current.seconds} />

          <IntensityMeter effort={current.effort} />

          <Animated.View key={`cue-${pos.index}`} entering={FadeIn.duration(400)}>
            <ThemedText style={styles.cue}>{current.cue}</ThemedText>
          </Animated.View>

          {current.exerciseId && (
            <PressableScale
              accessibilityRole="link"
              hitSlop={12}
              onPress={() => {
                setPausedAt((p) => p ?? Date.now());
                cues.silence();
                setHowTo(current.exerciseId!);
              }}
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

/**
 * How hard to go right now: a 1–10 effort scale with the target range lit up, plus what it should
 * feel like and a rough heart-rate zone for watch wearers.
 */
function IntensityMeter({ effort }: { effort: Effort }) {
  const theme = useTheme();
  const { rpe, heartRate, feel } = INTENSITY[effort];
  const color = EFFORT_COLORS[effort];
  return (
    <View
      style={styles.meter}
      accessible
      accessibilityLabel={`Effort ${rpe[0]} to ${rpe[1]} out of 10. ${feel} Heart rate ${heartRate}.`}>
      <View style={styles.meterHeader}>
        <ThemedText type="eyebrow" themeColor="textSecondary">
          Effort
        </ThemedText>
        <ThemedText type="mono" style={{ color }}>
          {rpe[0]}–{rpe[1]} / 10
        </ThemedText>
      </View>
      <View style={styles.meterBar}>
        {Array.from({ length: 10 }, (_, i) => {
          const level = i + 1;
          const lit = level >= rpe[0] && level <= rpe[1];
          return (
            <View
              key={level}
              style={[
                styles.meterCell,
                { backgroundColor: lit ? color : theme.backgroundElement, height: 6 + i * 1.6 },
              ]}
            />
          );
        })}
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        {feel} Heart rate {heartRate}.
      </ThemedText>
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
  countdownRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, height: 104 },
  finalCount: { fontFamily: DisplayFont.bold, fontWeight: 'normal', fontSize: 104, lineHeight: 108 },
  finalLabel: { flex: 1 },
  meter: { gap: Spacing.two },
  meterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  meterBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  meterCell: { flex: 1, borderRadius: 1 },
  countdown: { fontSize: 96, lineHeight: 104, letterSpacing: -3 },
  cue: { fontSize: 18, lineHeight: 25 },
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
