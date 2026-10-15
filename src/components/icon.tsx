import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import type { ColorValue } from 'react-native';

export type IconName = { ios: string; android: string };

/** SF Symbol on iOS, Material Symbol on Android. */
export function Icon({ name, size = 20, color }: { name: IconName; size?: number; color: ColorValue }) {
  return <SymbolView name={name as SymbolViewProps['name']} size={size} tintColor={color} weight="semibold" />;
}
