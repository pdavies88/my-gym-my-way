import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Screen, SectionHeader } from '@/components/screen';
import { SessionCard } from '@/components/session-card';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { CARDIO_SESSIONS } from '@/lib/cardio';

const SECTIONS = [
  {
    category: 'mobility',
    title: 'Mobility',
    detail: 'Controlled movement to loosen up. Before you train, or on any day.',
  },
  {
    category: 'stretch',
    title: 'Stretching',
    detail: 'Slow holds to cool down. After you train, or before bed.',
  },
] as const;

export default function RecoverScreen() {
  return (
    <Screen eyebrow="Mobility and stretching" title="Recover">
      <ThemedText type="small" themeColor="textSecondary">
        Guided sessions that need no equipment. Each step shows what to do and links to a demo video.
      </ThemedText>
      {SECTIONS.map((section) => (
        <View key={section.category} style={styles.group}>
          <SectionHeader title={section.title} />
          <ThemedText type="small" themeColor="textSecondary">
            {section.detail}
          </ThemedText>
          {CARDIO_SESSIONS.filter((s) => s.category === section.category).map((session, i) => (
            <Animated.View key={session.id} entering={FadeInDown.delay(i * 40).duration(300)}>
              <SessionCard session={session} available />
            </Animated.View>
          ))}
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { gap: Spacing.two },
});
