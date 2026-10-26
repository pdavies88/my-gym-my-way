import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { EffortStrip } from '@/components/effort';
import { ExerciseRow } from '@/components/exercise-row';
import { IconButton } from '@/components/icon-button';
import { Screen, SectionHeader } from '@/components/screen';
import { SegmentedControl } from '@/components/segmented-control';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useSettings } from '@/context/settings-context';
import { alertWorkoutsFull, useTraining } from '@/context/training-context';
import { equipmentName } from '@/lib/equipment';
import {
  buildCircuit,
  CIRCUIT_MINUTES,
  circuitBlocks,
  circuitParams,
  FLOOR_MOVES,
  pickStations,
  STATION_NAMES,
  type CircuitMinutes,
} from '@/lib/circuit';
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
  const [focus, setFocus] = useState<Focus>('full');
  const [length, setLength] = useState<Length>('medium');
  const [style, setStyle] = useState<'sets' | 'bootcamp'>('sets');
  const [minutes, setMinutes] = useState<CircuitMinutes>(45);
  const [stationSeed, setStationSeed] = useState(newSeed);
  const [batch, setBatch] = useState(0);
  const [ids, setIds] = useState(() =>
    generateWorkout({ focus: 'full', count: LENGTHS.medium.count, owned, seed: newSeed() }),
  );

  /** In a bootcamp, the moves make up the floor station, so their number follows the length in minutes. */
  const moveCount = (nextStyle = style, nextLength = length, nextMinutes = minutes) =>
    nextStyle === 'bootcamp' ? FLOOR_MOVES[nextMinutes] : LENGTHS[nextLength].count;

  const regenerate = (nextFocus = focus, count = moveCount()) => {
    setIds(generateWorkout({ focus: nextFocus, count, owned, seed: newSeed() }));
    setBatch((b) => b + 1);
  };

  const swap = (index: number) => {
    const replacement = swapExercise(ids, index, owned, newSeed());
    if (replacement) setIds(ids.map((id, i) => (i === index ? replacement : id)));
  };

  const name = FOCUS_LABELS[focus];
  const exercises = ids.map(getExercise).filter((e) => !!e);
  // Stations follow your equipment, so changing it from this screen updates the plan.
  const stations = pickStations(owned, stationSeed);
  const plan = { stations, minutes };
  const blocks = circuitBlocks(plan);
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
              regenerate(value);
            }}
          />
        ))}
      </View>

      <View style={styles.group}>
        <SectionHeader title="Style" />
        <SegmentedControl
          accessibilityLabel="Workout style"
          options={[
            { value: 'sets', label: 'Sets' },
            { value: 'bootcamp', label: 'Bootcamp' },
          ]}
          value={style}
          onChange={(value) => {
            setStyle(value);
            regenerate(focus, moveCount(value));
          }}
        />
        <ThemedText type="small" themeColor="textSecondary">
          {style === 'sets'
            ? 'Do each exercise’s sets, then tick it off. You set your own pace.'
            : 'Rotate between stations on one timer, like a class. Base, push and all-out efforts on cardio, strength moves on the floor. Guided with chimes and a voice.'}
        </ThemedText>
      </View>

      <View style={styles.group}>
        {style === 'sets' ? (
          <>
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
                regenerate(focus, moveCount(style, value));
              }}
            />
          </>
        ) : (
          <>
            <SectionHeader title={`Length · ${minutes} min`} />
            <SegmentedControl
              accessibilityLabel="Bootcamp length"
              options={CIRCUIT_MINUTES.map((value) => ({ value: String(value), label: `${value} min` }))}
              value={String(minutes)}
              onChange={(value) => {
                const next = Number(value) as CircuitMinutes;
                setMinutes(next);
                regenerate(focus, moveCount(style, length, next));
              }}
            />
            <Card>
              <EffortStrip segments={buildCircuit(name, ids, plan).steps} />
              {blocks.map((block, i) => (
                <View key={i} style={styles.blockRow}>
                  <ThemedText type={block.kind === 'station' ? 'smallBold' : 'small'} style={styles.flex}>
                    {block.kind === 'warmup'
                      ? 'Warm up'
                      : block.kind === 'cooldown'
                        ? 'Cool down and stretch'
                        : STATION_NAMES[block.station!]}
                  </ThemedText>
                  <ThemedText type="mono" themeColor="textSecondary">
                    {Math.round(block.seconds / 60)} min
                  </ThemedText>
                </View>
              ))}
              <ThemedText type="small" themeColor="textSecondary">
                {stations[0] === 'floorCardio'
                  ? 'No cardio machine selected, so floor cardio is the cardio station.'
                  : 'Cardio stations come from your equipment. Shuffle to change them.'}{' '}
                A minute to move between stations is included.
              </ThemedText>
            </Card>
          </>
        )}
      </View>

      <View style={styles.group}>
        <SectionHeader
          title={style === 'bootcamp' ? `Floor station · ${exercises.length} moves` : name}
          action={
            <Button
              title="Shuffle"
              compact
              variant="ghost"
              icon={{ ios: 'shuffle', android: 'shuffle' }}
              onPress={() => {
                regenerate();
                if (style === 'bootcamp') setStationSeed(newSeed());
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
          title={style === 'bootcamp' ? 'Start bootcamp' : 'Start now'}
          icon={{ ios: 'play.fill', android: 'play_arrow' }}
          disabled={exercises.length === 0}
          onPress={() => {
            if (style === 'bootcamp') {
              router.back();
              router.push({ pathname: '/cardio-player/[id]', params: circuitParams(name, ids, plan) });
              return;
            }
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
            const workout = saveWorkout({
              name,
              exerciseIds: ids,
              focus,
              ...(style === 'bootcamp' ? { circuit: plan } : {}),
            });
            if (!workout) {
              alertWorkoutsFull();
              return;
            }
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
  blockRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  flex: { flex: 1 },
});
