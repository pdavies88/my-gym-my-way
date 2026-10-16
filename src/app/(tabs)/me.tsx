import Constants from 'expo-constants';
import { router } from 'expo-router';
import { StyleSheet, Switch, View } from 'react-native';

import { AboutLink } from '@/components/about-link';
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
import { useBestVoice } from '@/hooks/use-best-voice';
import { useFeedback } from '@/hooks/use-feedback';
import { useTheme } from '@/hooks/use-theme';
import { equipmentName } from '@/lib/equipment';
import { availableExercises } from '@/lib/exercises';
import { couldUpgradeVoice } from '@/lib/voice';

export default function MeScreen() {
  const { settings, owned, updateSettings } = useSettings();
  const { voice, loaded } = useBestVoice();

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
        <SectionHeader title="Feedback" />
        <Card style={styles.toggles}>
          <ToggleRow
            label="Sounds"
            detail="Soft chimes for the 3-2-1 countdown and step changes in cardio"
            value={settings.sounds !== false}
            onChange={(sounds) => updateSettings({ sounds })}
          />
          <ToggleRow
            label="Voice"
            detail={`Announces each cardio step and a 10-second heads-up${loaded ? `. Using ${voice ? voice.name : 'the system voice'}.` : ''}`}
            value={settings.voice !== false}
            onChange={(voice) => updateSettings({ voice })}
          />
          <ToggleRow
            label="Haptics"
            detail="Taps when you tick, pick or finish something"
            value={settings.haptics !== false}
            onChange={(haptics) => updateSettings({ haptics })}
          />
          {loaded && couldUpgradeVoice(voice) && (
            <ThemedText type="small" themeColor="textSecondary">
              For a more natural voice, download an Enhanced or Premium English voice, such as Ava or Zoe: iPhone
              Settings → Accessibility → Read & Speak → Voices. The app picks it up next time.
            </ThemedText>
          )}
        </Card>
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
          <View style={styles.links}>
            <AboutLink
              label="Privacy policy"
              url="https://pdavies88.github.io/my-gym-my-way/privacy/"
              icon={{ ios: 'hand.raised', android: 'privacy_tip' }}
            />
            <AboutLink
              label="Support"
              url="https://pdavies88.github.io/my-gym-my-way/support/"
              icon={{ ios: 'questionmark.circle', android: 'help' }}
            />
            <AboutLink
              label="Contact"
              url="mailto:preston5@protonmail.com"
              icon={{ ios: 'envelope', android: 'mail' }}
            />
          </View>
          <ThemedText type="mono" themeColor="textSecondary">
            v{Constants.expoConfig?.version ?? '1.0.0'}
          </ThemedText>
        </Card>
      </View>
    </Screen>
  );
}

function ToggleRow({
  label,
  detail,
  value,
  onChange,
}: {
  label: string;
  detail: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  const theme = useTheme();
  const feedback = useFeedback();
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleText}>
        <ThemedText type="smallBold" style={styles.toggleLabel}>
          {label}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {detail}
        </ThemedText>
      </View>
      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={(next) => {
          feedback.select();
          onChange(next);
        }}
        trackColor={{ true: theme.tint, false: theme.backgroundSelected }}
        thumbColor={value ? theme.onTint : theme.textSecondary}
        ios_backgroundColor={theme.backgroundSelected}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  toggles: { gap: Spacing.three },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  toggleText: { flex: 1, gap: 2 },
  toggleLabel: { fontSize: 16 },
  group: { gap: Spacing.three },
  links: { marginVertical: Spacing.one },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
});
