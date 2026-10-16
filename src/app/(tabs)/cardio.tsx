import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { EffortStrip } from '@/components/effort';
import { Icon } from '@/components/icon';
import { PressableScale } from '@/components/pressable-scale';
import { Screen, SectionHeader } from '@/components/screen';
import { SegmentedControl } from '@/components/segmented-control';
import { Tag } from '@/components/tag';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useSettings } from '@/context/settings-context';
import { useTheme } from '@/hooks/use-theme';
import {
  CARDIO_CATEGORY_LABELS,
  CARDIO_SESSIONS,
  canDoCardio,
  totalSeconds,
  type CardioCategory,
  type CardioSession,
} from '@/lib/cardio';
import { equipmentName } from '@/lib/equipment';

const CATEGORY_ORDER: CardioCategory[] = ['rower', 'treadmill', 'bag', 'bike', 'rope', 'bodyweight', 'circuit'];

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

function SessionCard({ session, available }: { session: CardioSession; available: boolean }) {
  const theme = useTheme();
  const minutes = Math.round(totalSeconds(session) / 60);
  return (
    <Link href={{ pathname: '/cardio/[id]', params: { id: session.id } }} asChild>
      {/* Link's asChild slot rejects style arrays, so pass a flat style. */}
      <PressableScale
        style={StyleSheet.flatten([
          styles.card,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            opacity: available ? 1 : 0.55,
          },
        ])}>
        <View style={styles.cardTop}>
          <View style={styles.cardText}>
            <ThemedText type="heading">{session.name}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {session.summary}
            </ThemedText>
          </View>
          <Icon name={{ ios: 'chevron.right', android: 'chevron_right' }} size={16} color={theme.textSecondary} />
        </View>
        <EffortStrip segments={session.steps} />
        <View style={styles.tags}>
          <Tag label={`${minutes} min`} tone="tint" />
          <Tag label={session.level} />
          {session.needs.length === 0 ? (
            <Tag label="No equipment" />
          ) : (
            session.needs.map((item) => <Tag key={item} label={equipmentName(item)} />)
          )}
        </View>
      </PressableScale>
    </Link>
  );
}

const styles = StyleSheet.create({
  group: { gap: Spacing.two },
  card: {
    borderWidth: 1,
    borderRadius: Radius.card,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  cardText: { flex: 1, gap: Spacing.one },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
});
