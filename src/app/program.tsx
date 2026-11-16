import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Icon } from '@/components/icon';
import { PressableScale } from '@/components/pressable-scale';
import { ProgressBar } from '@/components/progress-bar';
import { Screen, SectionHeader } from '@/components/screen';
import { SegmentedControl } from '@/components/segmented-control';
import { Tag } from '@/components/tag';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useSettings } from '@/context/settings-context';
import { useTraining } from '@/context/training-context';
import { useStartProgramDay } from '@/hooks/use-start-program-day';
import { useTheme } from '@/hooks/use-theme';
import { getCardioSession, totalSeconds } from '@/lib/cardio';
import { getExercise } from '@/lib/exercises';
import {
  dayKey,
  DAYS_PER_WEEK,
  generateProgram,
  LIGHT_WEEK,
  nextProgramDay,
  programProgress,
  type DaysPerWeek,
} from '@/lib/program';
import type { Program } from '@/lib/storage/schemas';

const newSeed = () => Math.floor(Math.random() * 2 ** 31);

export default function ProgramScreen() {
  const { program } = useTraining();
  return program ? <ProgramPlan program={program} /> : <ProgramSetup />;
}

/** Pick how many days a week, preview the workouts, then start. */
function ProgramSetup() {
  const { owned, settings } = useSettings();
  const { saveProgram } = useTraining();
  const [daysPerWeek, setDaysPerWeek] = useState<DaysPerWeek>(3);
  const [preview, setPreview] = useState(() => generateProgram({ owned, daysPerWeek: 3, seed: newSeed() }));

  const rebuild = (days = daysPerWeek) => setPreview(generateProgram({ owned, daysPerWeek: days, seed: newSeed() }));

  return (
    <Screen tab={false}>
      <View style={styles.header}>
        <ThemedText type="eyebrow" themeColor="tint">
          4-week program
        </ThemedText>
        <ThemedText type="title">Your plan</ThemedText>
        <ThemedText themeColor="textSecondary">
          The same workouts repeat each week, built from your equipment, so you can add a little weight or a few reps
          every time. Week 4 is lighter so your body can recover. Each week also suggests one cardio session.
        </ThemedText>
      </View>

      <View style={styles.group}>
        <SectionHeader title="Days a week" />
        <SegmentedControl
          accessibilityLabel="Workouts a week"
          options={DAYS_PER_WEEK.map((value) => ({ value: String(value), label: `${value} days` }))}
          value={String(daysPerWeek)}
          onChange={(value) => {
            const days = Number(value) as DaysPerWeek;
            setDaysPerWeek(days);
            rebuild(days);
          }}
        />
        {!settings.equipmentChosen && (
          <ThemedText type="small" themeColor="accent">
            You haven’t chosen your equipment yet, so this plan uses bodyweight moves only.
          </ThemedText>
        )}
      </View>

      <View style={styles.group}>
        <SectionHeader
          title="Each week"
          action={
            <Button
              title="Shuffle"
              compact
              variant="ghost"
              icon={{ ios: 'shuffle', android: 'shuffle' }}
              onPress={() => rebuild()}
            />
          }
        />
        {preview.days.map((day, i) => (
          <Animated.View key={`${preview.id}-${i}`} entering={FadeInDown.delay(i * 40).duration(300)}>
            <Card>
              <ThemedText type="eyebrow" themeColor="tint">
                Day {i + 1}
              </ThemedText>
              <ThemedText type="heading">{day.name}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {day.exerciseIds.map((id) => getExercise(id)?.name).join(' · ')}
              </ThemedText>
            </Card>
          </Animated.View>
        ))}
      </View>

      <Button
        title="Start this program"
        icon={{ ios: 'flag.fill', android: 'flag' }}
        onPress={() => saveProgram({ ...preview, createdAt: Date.now() })}
      />
    </Screen>
  );
}

/** Where you are in the program, what's next, and every week's days. */
function ProgramPlan({ program }: { program: Program }) {
  const theme = useTheme();
  const { saveProgram } = useTraining();
  const startDay = useStartProgramDay();
  const next = nextProgramDay(program);
  const { done, total } = programProgress(program);

  const endProgram = () =>
    Alert.alert('End this program?', 'Your logged workouts stay in History. You can build a new program after.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'End program', style: 'destructive', onPress: () => saveProgram(null) },
    ]);

  return (
    <Screen tab={false}>
      <View style={styles.header}>
        <ThemedText type="eyebrow" themeColor="tint">
          {next ? `Week ${next.week} of ${program.weeks}` : 'Program complete'}
        </ThemedText>
        <ThemedText type="title">Your program</ThemedText>
        <ProgressBar progress={done / total} />
        <ThemedText type="small" themeColor="textSecondary">
          {done} of {total} workouts done
        </ThemedText>
      </View>

      {next ? (
        <Card accent>
          <ThemedText type="eyebrow" themeColor="tint">
            Up next · week {next.week}, day {next.day + 1}
          </ThemedText>
          <ThemedText type="heading">{program.days[next.day].name}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {program.days[next.day].exerciseIds.map((id) => getExercise(id)?.name).join(' · ')}
          </ThemedText>
          {next.week === LIGHT_WEEK && (
            <ThemedText type="small" themeColor="textSecondary">
              Lighter week: one set fewer than usual, same weights.
            </ThemedText>
          )}
          <Button title="Start workout" icon={{ ios: 'play.fill', android: 'play_arrow' }} onPress={() => startDay()} />
        </Card>
      ) : (
        <Card accent>
          <ThemedText type="heading">You finished all {program.weeks} weeks</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Build a new program to keep going. Your logged weights carry over, so the suggestions start from where you
            are now.
          </ThemedText>
          <Button title="Build a new program" onPress={() => saveProgram(null)} />
        </Card>
      )}

      {Array.from({ length: program.weeks }, (_, w) => w + 1).map((week) => {
        const cardio = program.cardioIds[week - 1] ? getCardioSession(program.cardioIds[week - 1]) : undefined;
        return (
          <View key={week} style={styles.group}>
            <SectionHeader title={`Week ${week}${week === LIGHT_WEEK ? ' · lighter' : ''}`} />
            {program.days.map((day, d) => {
              const finished = !!program.done[dayKey(week, d)];
              const isNext = next?.week === week && next.day === d;
              return (
                <PressableScale
                  key={d}
                  accessibilityRole="button"
                  accessibilityLabel={`${day.name}, week ${week}${finished ? ', done' : ''}. Start this workout`}
                  onPress={() => startDay({ week, day: d })}
                  style={[
                    styles.dayRow,
                    { backgroundColor: theme.card, borderColor: isNext ? theme.tint : theme.border },
                  ]}>
                  <Icon
                    name={
                      finished
                        ? { ios: 'checkmark.circle.fill', android: 'check_circle' }
                        : { ios: 'circle', android: 'radio_button_unchecked' }
                    }
                    size={22}
                    color={finished ? theme.tint : theme.textSecondary}
                  />
                  <View style={styles.flex}>
                    <ThemedText type="smallBold">{day.name}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      Day {d + 1} · {day.exerciseIds.length} moves
                    </ThemedText>
                  </View>
                  <Icon name={{ ios: 'play.fill', android: 'play_arrow' }} size={14} color={theme.textSecondary} />
                </PressableScale>
              );
            })}
            {cardio && (
              <Link href={{ pathname: '/cardio/[id]', params: { id: cardio.id } }} asChild>
                <PressableScale
                  style={StyleSheet.flatten([
                    styles.dayRow,
                    { backgroundColor: theme.card, borderColor: theme.border },
                  ])}>
                  <Icon name={{ ios: 'heart.fill', android: 'favorite' }} size={20} color={theme.accent} />
                  <View style={styles.flex}>
                    <ThemedText type="smallBold">Bonus cardio: {cardio.name}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      Any day this week · {Math.round(totalSeconds(cardio) / 60)} min
                    </ThemedText>
                  </View>
                  <Tag label="Optional" />
                </PressableScale>
              </Link>
            )}
          </View>
        );
      })}

      <View style={styles.footer}>
        <Button
          title="Build a different program"
          variant="secondary"
          onPress={() =>
            Alert.alert('Build a different program?', 'This one ends. Your logged workouts stay in History.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Build new', onPress: () => saveProgram(null) },
            ])
          }
        />
        <Button title="End program" variant="ghost" onPress={endProgram} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: Spacing.two },
  group: { gap: Spacing.two },
  flex: { flex: 1, gap: 2 },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderWidth: 1,
    borderRadius: Radius.card,
  },
  footer: { gap: Spacing.two },
});
