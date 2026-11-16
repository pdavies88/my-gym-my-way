import { z } from 'zod';

import { EQUIPMENT_IDS, type EquipmentId } from '@/lib/equipment';

// Every stored key carries a version. Prefer adding optional fields. If a shape must change, bump
// the key and read the old one once to migrate it.
export const KEYS = {
  settings: 'settings.v1',
  workouts: 'workouts.v1',
  sessions: 'sessions.v1',
  activeSession: 'activeSession.v1',
  program: 'program.v1',
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
  /** No longer used. Kept so settings saved by version 1.0 still parse. */
  haptics: z.boolean().optional(),
  /**
   * Save workouts to Apple Health and keep timers running on the Lock Screen. Missing means the
   * person hasn't been asked yet; false means they said no or turned it off.
   */
  appleHealth: z.boolean().optional(),
  /** True once the person has read and closed the "before you start" health note. */
  healthNoteSeen: z.boolean().optional(),
});
export type Settings = z.infer<typeof SettingsSchema>;

export const DEFAULT_SETTINGS: Settings = {
  units: 'us',
  equipment: [],
  equipmentChosen: false,
};

/**
 * A bootcamp plan. Read back through normalizePlan, so unknown stations are dropped. Anything else,
 * such as a circuit preset saved before version 1.2, is ignored instead of discarding the whole entry.
 */
const CircuitPlanSchema = z
  .object({ stations: z.array(z.string()), minutes: z.number() })
  .optional()
  .catch(undefined);

export const SavedWorkoutSchema = z.object({
  id: z.string(),
  name: z.string(),
  focus: FocusSchema.optional(),
  exerciseIds: z.array(z.string()),
  /** Saved from Generate as a bootcamp: its cardio stations and length. */
  circuit: CircuitPlanSchema,
  createdAt: z.number(),
  updatedAt: z.number(),
});
export type SavedWorkout = z.infer<typeof SavedWorkoutSchema>;

/**
 * One logged set. `reps` counts seconds for timed holds such as a plank. Weight is always stored in
 * kilograms and shown in the person's units; it is missing for bodyweight moves.
 */
export const SetEntrySchema = z.object({
  reps: z.number().min(0).max(9999),
  weightKg: z.number().min(0).max(1000).optional(),
});
export type SetEntry = z.infer<typeof SetEntrySchema>;

/** Which program day a session was, so finishing it ticks the day off. */
const ProgramDayRefSchema = z.object({ programId: z.string(), week: z.number(), day: z.number() });
export type ProgramDayRef = z.infer<typeof ProgramDayRefSchema>;

export const ActiveSessionSchema = z.object({
  workoutId: z.string().optional(),
  name: z.string(),
  exerciseIds: z.array(z.string()),
  completedIds: z.array(z.string()),
  startedAt: z.number(),
  /** When the timer was paused, or undefined while it runs. */
  pausedAt: z.number().optional(),
  /** Total time spent paused before the current pause. */
  pausedMs: z.number().optional(),
  /** Logged sets for each exercise id. Sessions from before version 1.3 have none. */
  sets: z.record(z.string(), z.array(SetEntrySchema)).optional(),
  programDay: ProgramDayRefSchema.optional(),
});
export type ActiveSession = z.infer<typeof ActiveSessionSchema>;

export const SessionLogSchema = ActiveSessionSchema.extend({
  id: z.string(),
  finishedAt: z.number(),
  /** Strength sessions are checklists. Cardio sessions are guided timers. Older logs are strength. */
  kind: z.enum(['strength', 'cardio', 'circuit', 'stretch', 'mobility']).optional(),
  /** The guided cardio session this log came from. */
  cardioId: z.string().optional(),
  /** A bootcamp's stations and length, so it can be run again from history. */
  circuit: CircuitPlanSchema,
});
export type SessionLog = z.infer<typeof SessionLogSchema>;

export const ProgramSchema = z.object({
  id: z.string(),
  createdAt: z.number(),
  weeks: z.number().min(1).max(12),
  /** The same days repeat every week, so the weights can climb from week to week. */
  days: z.array(z.object({ name: z.string(), focus: FocusSchema, exerciseIds: z.array(z.string()) })),
  /** A suggested cardio session for each week, by cardio session id. */
  cardioIds: z.array(z.string()),
  /** Finished days, as "week-day" keys such as "2-1", mapped to the session log id. */
  done: z.record(z.string(), z.string()),
});
export type Program = z.infer<typeof ProgramSchema>;
