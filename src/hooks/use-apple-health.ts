import { Alert } from 'react-native';

import { useSettings } from '@/context/settings-context';
import { healthAvailable, liveWorkoutsSupported, requestHealthAccess } from '@/lib/health';

/**
 * The Apple Health setting. Turning it on shows the Health permission sheet the first time, and
 * the setting stays off when saving workouts isn't allowed.
 */
export function useAppleHealth() {
  const { settings, updateSettings } = useSettings();

  const setEnabled = async (on: boolean) => {
    if (!on) {
      updateSettings({ appleHealth: false });
      return;
    }
    const granted = await requestHealthAccess();
    updateSettings({ appleHealth: granted });
    if (!granted) {
      Alert.alert(
        'Apple Health is off',
        'To save workouts, allow it in the Health app: tap your profile, then Apps, then My Gym My Way, and turn on Workouts.',
      );
    }
  };

  return {
    /** False on Android, the web and Expo Go, where there is nothing to turn on. */
    available: healthAvailable(),
    /** True on iOS 26 and later, where Apple Health also keeps timers running on the Lock Screen. */
    lockScreen: liveWorkoutsSupported(),
    enabled: settings.appleHealth === true,
    /** False until the person has turned it on or said no. */
    asked: settings.appleHealth !== undefined,
    setEnabled,
  };
}
