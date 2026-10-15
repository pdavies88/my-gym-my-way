import Constants from 'expo-constants';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BmiCard } from '@/components/bmi-card';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Screen, SectionHeader } from '@/components/screen';
import { SegmentedControl } from '@/components/segmented-control';
import { Tag } from '@/components/tag';
import { ThemedText } from '@/components/themed-text';
import { AppName } from '@/constants/brand';
import { Spacing } from '@/constants/theme';
import { useSettings } from '@/context/settings-context';
import { equipmentName } from '@/lib/equipment';
import { availableExercises } from '@/lib/exercises';

export default function MeScreen() {
  const { settings, owned, updateSettings } = useSettings();

  return (
    <Screen eyebrow="Settings and body" title="Me">
      <View style={styles.group}>
        <SectionHeader title="Your gym" />
        <Card>
          <View style={styles.tags}>
            {settings.equipment.length === 0 ? (
              <Tag label="Bodyweight only" />
            ) : (
              settings.equipment.map((id) => <Tag key={id} label={equipmentName(id)} />)
            )}
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            {availableExercises(owned).length} exercises available with this setup.
          </ThemedText>
          <Button title="Edit equipment" variant="secondary" compact onPress={() => router.push('/equipment')} />
        </Card>
      </View>

      <View style={styles.group}>
        <SectionHeader title="Units" />
        <SegmentedControl
          accessibilityLabel="Units"
          options={[
            { value: 'us', label: 'US (lb, ft)' },
            { value: 'metric', label: 'Metric (kg, cm)' },
          ]}
          value={settings.units}
          onChange={(units) => updateSettings({ units })}
        />
      </View>

      <View style={styles.group}>
        <SectionHeader title="BMI calculator" />
        {/* Keyed by units so the fields reset to the right format when units change. */}
        <BmiCard key={settings.units} />
      </View>

      <View style={styles.group}>
        <SectionHeader title="About" />
        <Card>
          <ThemedText type="heading">Free. For real.</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {AppName} has no paywall, no ads, no account and no tracking. Your equipment, workouts, history and body
            measurements stay on this phone.
          </ThemedText>
          <ThemedText type="mono" themeColor="textSecondary">
            v{Constants.expoConfig?.version ?? '1.0.0'}
          </ThemedText>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { gap: Spacing.three },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
});
