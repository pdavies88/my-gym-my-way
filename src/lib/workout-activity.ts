import type { LiveActivity } from 'expo-widgets';
import { Platform } from 'react-native';

import type { WorkoutActivityProps } from '@/widgets/workout-activity';

/**
 * Shows a timed session as a Live Activity on iPhone. Live Activities are a convenience: if the
 * person turned them off, or this build doesn't include them (Expo Go), the timer still works.
 */
type Controller = {
  start(props: WorkoutActivityProps): LiveActivity<WorkoutActivityProps>;
  getInstances(): LiveActivity<WorkoutActivityProps>[];
};

let activity: Controller | null | undefined;
let current: LiveActivity<WorkoutActivityProps> | null = null;

/** Loaded on first use, so a build without expo-widgets never touches it. */
function controller(): Controller | null {
  if (activity !== undefined) return activity;
  try {
    // A lazy require, so Expo Go and Android never load the Live Activity's native code.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    activity = Platform.OS === 'ios' ? (require('@/widgets/workout-activity').default as Controller) : null;
  } catch {
    activity = null;
  }
  return activity;
}

/** Starts the Live Activity, or updates the one already showing. */
export function showWorkoutActivity(props: WorkoutActivityProps): void {
  const live = controller();
  if (!live) return;
  try {
    // A relaunch may leave one running from before.
    current ??= live.getInstances()[0] ?? null;
    if (current) void current.update(props).catch(() => undefined);
    else current = live.start(props);
  } catch {
    current = null;
  }
}

export function hideWorkoutActivity(): void {
  const live = controller();
  if (!live) return;
  try {
    for (const instance of current ? [current] : live.getInstances()) {
      void instance.end('immediate').catch(() => undefined);
    }
  } catch {
    // Nothing to end.
  }
  current = null;
}
