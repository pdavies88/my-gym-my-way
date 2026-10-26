import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Screen, SectionHeader } from '@/components/screen';
import { SessionCard } from '@/components/session-card';
import { SegmentedControl } from '@/components/segmented-control';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useSettings } from '@/context/settings-context';
import { CARDIO_CATEGORY_LABELS, CARDIO_SESSIONS, canDoCardio, type CardioCategory } from '@/lib/cardio';

const CATEGORY_ORDER: CardioCategory[] = [
  'quiet',
  'rower',
  'treadmill',
  'bag',
  'kettlebell',
  'trx',
  'bike',
  'rope',
  'bodyweight',
];

export default function CardioScreen() {
  const { owned } = useSettings();
  const [scope, setScope] = useState<'mine' | 'all'>('mine');
  const visible = CARDIO_SESSIONS.filter((s) => scope === 'all' || canDoCardio(s, owned));

  return (
    <Screen eyebrow="Guided sessions" title="Cardio">
      <ThemedText type="small" themeColor="textSecondary">
        Timed sessions that tell you what to do and how hard to go, step by step. Finished sessions go into your
        history.
      </ThemedText>
      <SegmentedControl
        accessibilityLabel="Which sessions to show"
        options={[
          { value: 'mine', label: 'My gym' },
          { value: 'all', label: 'Everything' },
        ]}
        value={scope}
        onChange={setScope}
      />
      {CATEGORY_ORDER.map((category) => {
        const items = visible.filter((s) => s.category === category);
        if (items.length === 0) return null;
        return (
          <View key={category} style={styles.group}>
            <SectionHeader title={CARDIO_CATEGORY_LABELS[category]} />
            {items.map((session, i) => (
              <Animated.View key={session.id} entering={FadeInDown.delay(i * 40).duration(300)}>
                <SessionCard session={session} available={canDoCardio(session, owned)} />
              </Animated.View>
            ))}
          </View>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { gap: Spacing.two },
});
