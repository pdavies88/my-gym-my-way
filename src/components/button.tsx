import { ActivityIndicator, StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '@/components/icon';
import { PressableScale } from '@/components/pressable-scale';
import { ThemedText } from '@/components/themed-text';
import { DisplayFont, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  icon?: IconName;
  loading?: boolean;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({ title, variant = 'primary', icon, loading = false, compact, disabled, style, ...rest }: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const backgroundColor =
    variant === 'primary' ? theme.tint : variant === 'ghost' ? 'transparent' : theme.backgroundElement;
  const textColor =
    variant === 'primary' ? theme.onTint : variant === 'destructive' ? theme.danger : theme.text;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={[
        styles.button,
        compact && styles.compact,
        { backgroundColor, opacity: isDisabled ? 0.45 : 1 },
        variant === 'ghost' && { borderWidth: 1, borderColor: theme.border },
        style,
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={styles.row}>
          {icon && <Icon name={icon} size={compact ? 15 : 17} color={textColor} />}
          <ThemedText style={[styles.label, compact && styles.compactLabel, { color: textColor }]}>{title}</ThemedText>
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: Radius.control,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compact: { minHeight: 40, paddingHorizontal: Spacing.three },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  label: {
    fontFamily: DisplayFont.bold,
    fontWeight: 'normal',
    fontSize: 16,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  compactLabel: { fontSize: 13, letterSpacing: 1 },
});
