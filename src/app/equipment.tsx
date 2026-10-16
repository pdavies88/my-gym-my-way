import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { Button } from '@/components/button';
import { Icon } from '@/components/icon';
import { PressableScale } from '@/components/pressable-scale';
import { Screen, SectionHeader } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useSettings } from '@/context/settings-context';
import { useFeedback } from '@/hooks/use-feedback';
import { useTheme } from '@/hooks/use-theme';
import { EQUIPMENT, EQUIPMENT_GROUPS, type Equipment } from '@/lib/equipment';
import { availableExercises } from '@/lib/exercises';

export default function EquipmentScreen() {
  const { owned, updateSettings } = useSettings();
  const count = availableExercises(owned).length;

  return (
    <Screen tab={false}>
      <ThemedText type="small" themeColor="textSecondary">
        Tap everything you have at home. Bodyweight exercises are always included.
      </ThemedText>
      {EQUIPMENT_GROUPS.map((group) => (
        <View key={group} style={styles.group}>
          <SectionHeader title={group} />
          <View style={styles.grid}>
            {EQUIPMENT.filter((item) => item.group === group).map((item) => (
              <EquipmentTile key={item.id} item={item} />
            ))}
          </View>
        </View>
      ))}
      <Animated.View key={count} entering={FadeIn.duration(250)}>
        <ThemedText type="eyebrow" themeColor="tint">
          {count} exercises unlocked
        </ThemedText>
      </Animated.View>
      <Button
        title="Done"
        onPress={() => {
          updateSettings({ equipmentChosen: true });
          router.back();
        }}
      />
    </Screen>
  );
}

function EquipmentTile({ item }: { item: Equipment }) {
  const theme = useTheme();
  const { owned, toggleEquipment } = useSettings();
  const feedback = useFeedback();
  const selected = owned.has(item.id);

  const checkStyle = useAnimatedStyle(() => ({
    opacity: withTiming(selected ? 1 : 0, { duration: 160 }),
    transform: [{ scale: withTiming(selected ? 1 : 0.4, { duration: 160 }) }],
  }));

  return (
    <PressableScale
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={item.name}
      onPress={() => {
        feedback.select();
        toggleEquipment(item.id);
      }}
      style={[
        styles.tile,
        {
          backgroundColor: selected ? theme.backgroundSelected : theme.card,
          borderColor: selected ? theme.tint : theme.border,
        },
      ]}>
      <View style={styles.tileTop}>
        <Icon name={item.icon} size={22} color={selected ? theme.tint : theme.textSecondary} />
        <Animated.View style={[styles.check, { backgroundColor: theme.tint }, checkStyle]}>
          <Icon name={{ ios: 'checkmark', android: 'check' }} size={11} color={theme.onTint} />
        </Animated.View>
      </View>
      <ThemedText type="smallBold" numberOfLines={2}>
        {item.name}
      </ThemedText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  group: { gap: Spacing.three },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  tile: {
    width: '48.5%',
    minHeight: 92,
    borderRadius: Radius.card,
    borderWidth: 1,
    padding: Spacing.three,
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  tileTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  check: { width: 20, height: 20, borderRadius: 2, alignItems: 'center', justifyContent: 'center' },
});
