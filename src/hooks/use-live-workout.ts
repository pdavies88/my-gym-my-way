import { setAudioModeAsync } from 'expo-audio';
import { useEffect, useRef, useState } from 'react';

import { endLiveWorkout, startLiveWorkout, type HealthActivity } from '@/lib/health';
import { hideWorkoutActivity } from '@/lib/workout-activity';

/**
 * Runs a live Apple Health workout alongside a timed session, when the person turned Apple Health
 * on. While it runs, iOS keeps the app going on the Lock Screen, so the timer and voice cues carry
 * on. `live` is false until it starts, and stays false when it can't (Android, Expo Go, iOS 25 or
 * earlier, or no Health permission).
 */
export function useLiveWorkout(activity: HealthActivity, enabled: boolean) {
  const [live, setLive] = useState(false);
  const liveRef = useRef(false);
  const ended = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    void startLiveWorkout(activity, Date.now()).then((ok) => {
      if (cancelled) {
        if (ok) void endLiveWorkout(Date.now(), false, 0);
        return;
      }
      liveRef.current = ok;
      setLive(ok);
      // Keep the audio session going in the background, so chimes and the voice play while locked.
      if (ok) {
        void setAudioModeAsync({
          playsInSilentMode: true,
          interruptionMode: 'duckOthers',
          shouldPlayInBackground: true,
        }).catch(() => {});
      }
    });
    return () => {
      cancelled = true;
      // Leaving the timer without finishing drops the workout rather than saving part of it.
      if (liveRef.current && !ended.current) endLiveWorkout(Date.now(), false, 0);
      hideWorkoutActivity();
    };
    // Starts once per timer screen. Restarting the timer keeps the same workout going.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    live,
    /** Read inside event listeners, which would otherwise see a stale `live`. */
    liveRef,
    /** Ends the live workout once. Returns false when there was none, so the caller can save another way. */
    finish(endMs: number, save: boolean, activeSeconds: number): boolean {
      if (!liveRef.current || ended.current) return false;
      ended.current = true;
      endLiveWorkout(endMs, save, activeSeconds);
      hideWorkoutActivity();
      return true;
    },
  };
}
