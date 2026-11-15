import { requireOptionalNativeModule } from 'expo';
import { Platform } from 'react-native';

import type { CardioCategory } from './cardio';

type WorkoutHealthModule = {
  isAvailable(): boolean;
  supportsLiveWorkouts(): boolean;
  isAuthorized(): boolean;
  requestAccess(): Promise<boolean>;
  startLiveWorkout(activity: string, startMs: number): Promise<boolean>;
  pauseLiveWorkout(): void;
  resumeLiveWorkout(): void;
  endLiveWorkout(endMs: number, save: boolean): Promise<boolean>;
  saveWorkout(activity: string, startMs: number, endMs: number): Promise<boolean>;
};

/** The Swift module in native/WorkoutHealth.swift. Missing on Android, the web and Expo Go. */
const native = Platform.OS === 'ios' ? requireOptionalNativeModule<WorkoutHealthModule>('WorkoutHealth') : null;

/** Workouts shorter than this aren't worth a Health entry. */
export const MIN_WORKOUT_SECONDS = 60;

/** Health's workout type for each kind of session. The Swift module maps these names. */
export type HealthActivity =
  | 'rowing'
  | 'running'
  | 'cycling'
  | 'boxing'
  | 'jumpRope'
  | 'hiit'
  | 'functionalStrength'
  | 'traditionalStrength'
  | 'crossTraining'
  | 'flexibility'
  | 'mixedCardio';

export const CATEGORY_ACTIVITY: Record<CardioCategory, HealthActivity> = {
  rower: 'rowing',
  treadmill: 'running',
  bag: 'boxing',
  kettlebell: 'functionalStrength',
  trx: 'functionalStrength',
  bike: 'cycling',
  rope: 'jumpRope',
  bodyweight: 'hiit',
  quiet: 'functionalStrength',
  stretch: 'flexibility',
  mobility: 'flexibility',
  bootcamp: 'crossTraining',
};

const safely = <T>(run: () => T, fallback: T): T => {
  try {
    return run();
  } catch {
    return fallback;
  }
};

/** True on an iPhone build that includes Health support. */
export function healthAvailable(): boolean {
  return safely(() => native?.isAvailable() ?? false, false);
}

/** True when the timer can keep running on the Lock Screen through a live workout (iOS 26 and later). */
export function liveWorkoutsSupported(): boolean {
  return safely(() => !!native?.supportsLiveWorkouts(), false);
}

/** Whether saving workouts is allowed right now. The person can change this in the Health app. */
export function healthAuthorized(): boolean {
  return safely(() => native?.isAuthorized() ?? false, false);
}

/** Shows the Health permission sheet the first time. Resolves true when saving workouts is allowed. */
export async function requestHealthAccess(): Promise<boolean> {
  if (!native) return false;
  return native.requestAccess().catch(() => false);
}

/**
 * Starts a live workout for a timed session. While it runs, iOS keeps the app going when the phone
 * locks. Resolves false when that isn't possible, and the timer then pauses in the background.
 */
export async function startLiveWorkout(activity: HealthActivity, startMs: number): Promise<boolean> {
  if (!native || !liveWorkoutsSupported() || !healthAuthorized()) return false;
  return native.startLiveWorkout(activity, startMs).catch(() => false);
}

export function pauseLiveWorkout(): void {
  safely(() => native?.pauseLiveWorkout(), undefined);
}

export function resumeLiveWorkout(): void {
  safely(() => native?.resumeLiveWorkout(), undefined);
}

/** Ends the live workout. With `save`, it goes into Health, unless it was shorter than a minute. */
export function endLiveWorkout(endMs: number, save: boolean, activeSeconds: number): void {
  if (!native) return;
  void native.endLiveWorkout(endMs, save && activeSeconds >= MIN_WORKOUT_SECONDS).catch(() => false);
}

/** Saves a finished workout that had no live session, such as a strength checklist. */
export function saveWorkout(activity: HealthActivity, startMs: number, endMs: number): void {
  if (!native || !healthAuthorized() || (endMs - startMs) / 1000 < MIN_WORKOUT_SECONDS) return;
  void native.saveWorkout(activity, startMs, endMs).catch(() => false);
}
