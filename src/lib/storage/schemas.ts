import { z } from 'zod';

import { EQUIPMENT_IDS } from '@/lib/equipment';

// Every stored key carries a version. Bump it and add a migration when a shape changes.
export const KEYS = {
  settings: 'settings.v1',
  workouts: 'workouts.v1',
  sessions: 'sessions.v1',
  activeSession: 'activeSession.v1',
} as const;

const FocusSchema = z.enum(['full', 'upper', 'lower', 'push', 'pull', 'core', 'conditioning']);

export const SettingsSchema = z.object({
  units: z.enum(['us', 'metric']),
  equipment: z.array(z.enum(EQUIPMENT_IDS)),
  /** False until the person has looked at the equipment screen once. */
  equipmentChosen: z.boolean(),
  /** Body measurements for the BMI calculator. They stay on this device. */
  heightCm: z.number().min(50).max(272).optional(),
  weightKg: z.number().min(20).max(400).optional(),
});
export type Settings = z.infer<typeof SettingsSchema>;

export const DEFAULT_SETTINGS: Settings = {
  units: 'us',
  equipment: [],
  equipmentChosen: false,
};

export const SavedWorkoutSchema = z.object({
  id: z.string(),
  name: z.string(),
  focus: FocusSchema.optional(),
  exerciseIds: z.array(z.string()),
  createdAt: z.number(),
  updatedAt: z.number(),
});
export type SavedWorkout = z.infer<typeof SavedWorkoutSchema>;

export const ActiveSessionSchema = z.object({
  workoutId: z.string().optional(),
  name: z.string(),
  exerciseIds: z.array(z.string()),
  completedIds: z.array(z.string()),
  startedAt: z.number(),
});
export type ActiveSession = z.infer<typeof ActiveSessionSchema>;

export const SessionLogSchema = ActiveSessionSchema.extend({
  id: z.string(),
  finishedAt: z.number(),
});
export type SessionLog = z.infer<typeof SessionLogSchema>;
