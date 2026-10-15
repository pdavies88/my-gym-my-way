import { StyleSheet } from 'react-native';

import { Icon, type IconName } from '@/components/icon';
import { PressableScale } from '@/components/pressable-scale';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function IconButton({
  icon,
  label,
  onPress,
  tone = 'neutral',
  disabled,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  tone?: 'neutral' | 'danger' | 'tint';
  disabled?: boolean;
}) {
  const theme = useTheme();
  const color = tone === 'danger' ? theme.danger : tone === 'tint' ? theme.tint : theme.text;
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}
      scaleTo={0.9}
      style={[styles.button, { backgroundColor: theme.backgroundElement, opacity: disabled ? 0.35 : 1 }]}>
      <Icon name={icon} size={16} color={color} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: Radius.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
