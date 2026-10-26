import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { ExerciseVideo } from '@/components/exercise-video';
import { Icon } from '@/components/icon';
import { PressableScale } from '@/components/pressable-scale';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getExercise } from '@/lib/exercises';
import { getVideo } from '@/lib/videos';

/**
 * Every move in a session, each opening its video and cues in place. Only one is open at a time,
 * so the screen never loads more than one embedded player.
 */
export function SessionVideos({ exerciseIds }: { exerciseIds: readonly string[] }) {
  const theme = useTheme();
  const exercises = exerciseIds.map(getExercise).filter((e) => !!e);
  const [open, setOpen] = useState<string | null>(exercises.length === 1 ? exercises[0].id : null);

  return (
    <Card style={styles.card}>
      {exercises.map((exercise, i) => {
        const expanded = open === exercise.id;
        const video = getVideo(exercise.id);
        return (
          <View key={exercise.id} style={[styles.item, i > 0 && { borderTopColor: theme.border, borderTopWidth: 1 }]}>
            <PressableScale
              accessibilityRole="button"
              accessibilityState={{ expanded }}
              accessibilityLabel={`${exercise.name}. ${expanded ? 'Hide' : 'Show'} how to`}
              onPress={() => setOpen(expanded ? null : exercise.id)}
              style={styles.row}>
              <Icon
                name={
                  video
                    ? { ios: 'play.rectangle.fill', android: 'smart_display' }
                    : { ios: 'list.bullet', android: 'list' }
                }
                size={18}
                color={theme.tint}
              />
              <ThemedText type="smallBold" style={styles.flex} numberOfLines={1}>
                {exercise.name}
              </ThemedText>
              <Icon
                name={
                  expanded
                    ? { ios: 'chevron.up', android: 'expand_less' }
                    : { ios: 'chevron.down', android: 'expand_more' }
                }
                size={16}
                color={theme.textSecondary}
              />
            </PressableScale>
            {expanded && (
              <View style={styles.detail}>
                {video && <ExerciseVideo video={video} />}
                {exercise.cues.map((cue, n) => (
                  <View key={cue} style={styles.cue}>
                    <ThemedText type="mono" themeColor="tint" style={styles.cueIndex}>
                      {String(n + 1).padStart(2, '0')}
                    </ThemedText>
                    <ThemedText type="small" style={styles.flex}>
                      {cue}
                    </ThemedText>
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 0, paddingVertical: Spacing.one },
  item: { paddingVertical: Spacing.two },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, minHeight: 32 },
  detail: { gap: Spacing.two, paddingTop: Spacing.three },
  cue: { flexDirection: 'row', gap: Spacing.three },
  cueIndex: { paddingTop: 2 },
  flex: { flex: 1 },
});
