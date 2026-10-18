import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { EffortStrip } from '@/components/effort';
import { Icon } from '@/components/icon';
import { PressableScale } from '@/components/pressable-scale';
import { Tag } from '@/components/tag';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { totalSeconds, type CardioSession } from '@/lib/cardio';
import { equipmentName } from '@/lib/equipment';

/** A guided session in a list. Tapping it opens the session overview. */
export function SessionCard({ session, available }: { session: CardioSession; available: boolean }) {
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
