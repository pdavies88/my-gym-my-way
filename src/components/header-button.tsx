import { StyleSheet } from 'react-native';

import { Icon } from '@/components/icon';
import { PressableScale } from '@/components/pressable-scale';
import { useTheme } from '@/hooks/use-theme';
import { goBackOrHome } from '@/lib/navigation';

/**
 * The top-left button on every stacked screen: a back chevron, or a close X on modals.
 *
 * The native back button disappears in some cases, such as a screen pushed on top of a modal or
 * one opened from a link with nothing behind it. This button always shows, and it goes home when
 * there is nothing to go back to, so no screen can trap you.
 */
export function HeaderButton({ variant = 'back' }: { variant?: 'back' | 'close' }) {
  const theme = useTheme();
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={variant === 'close' ? 'Close' : 'Back'}
      hitSlop={10}
      scaleTo={0.88}
      onPress={goBackOrHome}
      style={styles.button}>
      <Icon
        name={variant === 'close' ? { ios: 'xmark', android: 'close' } : { ios: 'chevron.left', android: 'arrow_back' }}
        size={variant === 'close' ? 17 : 20}
        color={theme.text}
      />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
});
