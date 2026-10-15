import { Colors } from '@/constants/theme';

/** The app is dark only, so this always returns the dark palette. */
export function useTheme() {
  return Colors.dark;
}
