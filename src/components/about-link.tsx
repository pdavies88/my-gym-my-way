import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Alert, StyleSheet } from 'react-native';

import { Icon, type IconName } from '@/components/icon';
import { PressableScale } from '@/components/pressable-scale';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** A row that opens a web page in an in-app browser, or a mailto: link in the mail app. */
export function AboutLink({ label, url, icon }: { label: string; url: string; icon: IconName }) {
  const theme = useTheme();
  const isMail = url.startsWith('mailto:');

  const open = () => {
    if (isMail) {
      // No mail app (or none set up): show the address so people can still reach us.
      Linking.openURL(url).catch(() => Alert.alert('Contact', url.replace('mailto:', '')));
    } else {
      WebBrowser.openBrowserAsync(url, {
        controlsColor: theme.tint,
        toolbarColor: theme.background,
        dismissButtonStyle: 'close',
      }).catch(() => {});
    }
  };

  return (
    <PressableScale
      accessibilityRole="link"
      accessibilityHint={isMail ? 'Opens your mail app' : 'Opens in a browser'}
      onPress={open}
      style={[styles.row, { borderTopColor: theme.border }]}>
      <Icon name={icon} size={18} color={theme.tint} />
      <ThemedText type="smallBold" style={styles.label}>
        {label}
      </ThemedText>
      <Icon
        name={isMail ? { ios: 'envelope', android: 'mail' } : { ios: 'arrow.up.right', android: 'open_in_new' }}
        size={14}
        color={theme.textSecondary}
      />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  label: { flex: 1, fontSize: 16 },
});
