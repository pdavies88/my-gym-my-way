import * as Haptics from 'expo-haptics';

import { useSettings } from '@/context/settings-context';

/**
 * Haptic feedback that respects the Haptics setting. Use it sparingly: for toggles and picks,
 * finishing something, and moments you can't look at the screen, like cardio step changes.
 */
export function useFeedback() {
  const { settings } = useSettings();
  const on = settings.haptics !== false;
  return {
    /** A light click for picking an option or toggling a switch. */
    select: () => on && void Haptics.selectionAsync(),
    /** A soft tap, such as ticking an exercise off or swapping one. */
    tap: () => on && void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
    /** A firm tap, such as a cardio step changing. */
    thump: () => on && void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
    /** Finishing a workout or a whole session. */
    success: () => on && void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    /** Before something destructive, such as discarding a session. */
    warning: () => on && void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  };
}
