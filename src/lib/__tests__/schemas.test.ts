import { describe, expect, it } from '@jest/globals';
import { z } from 'zod';

import { ActiveSessionSchema, SavedWorkoutSchema, SessionLogSchema, SettingsSchema } from '../storage/schemas';

// Data in the shape earlier versions of the app saved. Updates must keep reading it.
describe('stored data from earlier versions', () => {
  it('keeps settings, and drops only equipment ids that no longer exist', () => {
    const parsed = SettingsSchema.parse({
      units: 'us',
      equipment: ['dumbbells', 'bench', 'retired-item'],
      equipmentChosen: true,
      heightCm: 178,
      weightKg: 79,
    });
    expect(parsed.equipment).toEqual(['dumbbells', 'bench']);
    expect(parsed.heightCm).toBe(178);
  });

  it('reads workouts, sessions and an active session saved before the newer fields', () => {
    expect(
      SavedWorkoutSchema.safeParse({ id: 'w', name: 'Legs', exerciseIds: ['push-up'], createdAt: 1, updatedAt: 1 })
        .success,
    ).toBe(true);
    const oldLog = {
      id: 's',
      name: 'Full body',
      exerciseIds: ['push-up'],
      completedIds: [],
      startedAt: 1,
      finishedAt: 2,
    };
    expect(
      z.array(SessionLogSchema).safeParse([oldLog, { ...oldLog, kind: 'cardio', cardioId: 'bag-basics' }]).success,
    ).toBe(true);
    expect(ActiveSessionSchema.safeParse({ name: 'x', exerciseIds: [], completedIds: [], startedAt: 1 }).success).toBe(
      true,
    );
  });

  it('keeps workouts and logs saved with a pre-1.2 circuit preset, minus the preset', () => {
    const workout = SavedWorkoutSchema.parse({
      id: 'w',
      name: 'Legs',
      exerciseIds: ['push-up'],
      circuit: 'standard',
      createdAt: 1,
      updatedAt: 1,
    });
    expect(workout.circuit).toBeUndefined();
    const log = SessionLogSchema.parse({
      id: 's',
      name: 'Full body circuit',
      kind: 'circuit',
      exerciseIds: ['push-up'],
      completedIds: [],
      startedAt: 1,
      finishedAt: 2,
      circuit: { rounds: 3, workSeconds: 40, restSeconds: 20, roundRestSeconds: 90 },
    });
    expect(log.circuit).toBeUndefined();
  });
});
