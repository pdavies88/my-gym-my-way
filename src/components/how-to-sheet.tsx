import { Modal, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExerciseVideo } from '@/components/exercise-video';
import { IconButton } from '@/components/icon-button';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getExercise } from '@/lib/exercises';
import { getVideo } from '@/lib/videos';

/**
 * An exercise's video and cues in a sheet over the cardio timer. A sheet, not a pushed screen,
 * because a screen pushed from a full-screen modal opens underneath it.
 */
export function HowToSheet({ exerciseId, onClose }: { exerciseId: string | null; onClose: () => void }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const exercise = exerciseId ? getExercise(exerciseId) : undefined;
  const video = exercise ? getVideo(exercise.id) : undefined;

  return (
    <Modal visible={!!exercise} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.fill, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <IconButton icon={{ ios: 'xmark', android: 'close' }} label="Close" onPress={onClose} />
          <ThemedText type="eyebrow" themeColor="tint" style={styles.flex}>
            How to · timer paused
          </ThemedText>
        </View>
        {exercise && (
          <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.four }]}>
            <ThemedText type="title" style={styles.title}>
              {exercise.name}
            </ThemedText>
            {video && <ExerciseVideo video={video} />}
            {exercise.cues.map((cue, i) => (
              <View key={cue} style={styles.cue}>
                <ThemedText type="mono" themeColor="tint" style={styles.cueIndex}>
                  {String(i + 1).padStart(2, '0')}
                </ThemedText>
                <ThemedText style={styles.flex}>{cue}</ThemedText>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  content: { paddingHorizontal: Spacing.three, gap: Spacing.three },
  title: { fontSize: 30, lineHeight: 34 },
  cue: { flexDirection: 'row', gap: Spacing.three },
  cueIndex: { paddingTop: 4 },
});
