import { z } from 'zod';

import { EQUIPMENT_IDS, type EquipmentId } from '@/lib/equipment';

// Every stored key carries a version. Prefer adding optional fields. If a shape must change, bump
// the key and read the old one once to migrate it.
export const KEYS = {
  settings: 'settings.v1',
  workouts: 'workouts.v1',
  sessions: 'sessions.v1',
  activeSession: 'activeSession.v1',
} as const;

const FocusSchema = z.enum(['full', 'upper', 'lower', 'push', 'pull', 'core', 'conditioning']);

export const SettingsSchema = z.object({
  units: z.enum(['us', 'metric']),
  // Unknown ids (for example equipment removed in an update) are dropped instead of failing the whole read.
  equipment: z
    .array(z.string())
    .transform((ids) => ids.filter((id): id is EquipmentId => (EQUIPMENT_IDS as readonly string[]).includes(id))),
  /** False until the person has looked at the equipment screen once. */
  equipmentChosen: z.boolean(),
  /** Body measurements for the BMI calculator. They stay on this device. */
  heightCm: z.number().min(50).max(272).optional(),
  weightKg: z.number().min(20).max(400).optional(),
  /** Feedback preferences. Missing means on. */
  sounds: z.boolean().optional(),
  voice: z.boolean().optional(),
  haptics: z.boolean().optional(),
  /** True once the person has read and closed the "before you start" health note. */
  healthNoteSeen: z.boolean().optional(),
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
  /** Strength sessions are checklists. Cardio sessions are guided timers. Older logs are strength. */
  kind: z.enum(['strength', 'cardio']).optional(),
  /** The guided cardio session this log came from. */
  cardioId: z.string().optional(),
});
export type SessionLog = z.infer<typeof SessionLogSchema>;
