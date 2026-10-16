import { describe, expect, it } from '@jest/globals';

import {
  CARDIO_SESSIONS,
  canDoCardio,
  formatCountdown,
  getCardioSession,
  positionAt,
  stepStart,
  totalSeconds,
} from '../cardio';
import { EQUIPMENT_IDS, type EquipmentId } from '../equipment';
import { getExercise } from '../exercises';

describe('cardio sessions', () => {
  it('have unique ids', () => {
    expect(new Set(CARDIO_SESSIONS.map((s) => s.id)).size).toBe(CARDIO_SESSIONS.length);
  });

  it.each(CARDIO_SESSIONS.map((s) => [s.id, s] as const))('%s is well formed', (_, session) => {
    expect(session.steps.length).toBeGreaterThan(1);
    for (const step of session.steps) {
      expect(step.seconds).toBeGreaterThan(0);
      expect(Number.isInteger(step.seconds)).toBe(true);
      expect(step.cue.length).toBeGreaterThan(0);
      if (step.exerciseId) expect(getExercise(step.exerciseId)).toBeDefined();
    }
    for (const item of session.needs) expect(EQUIPMENT_IDS).toContain(item);
    if (session.techniqueExerciseId) expect(getExercise(session.techniqueExerciseId)).toBeDefined();
    // Every session lasts between 10 minutes and an hour.
    expect(totalSeconds(session)).toBeGreaterThanOrEqual(600);
    expect(totalSeconds(session)).toBeLessThanOrEqual(3600);
  });

  it('covers the rower, treadmill and boxing bag, alone and together', () => {
    const owned = (...items: EquipmentId[]) => new Set<EquipmentId>(items);
    const count = (set: Set<EquipmentId>) => CARDIO_SESSIONS.filter((s) => canDoCardio(s, set)).length;
    expect(count(owned('rower'))).toBeGreaterThan(count(owned()));
    expect(count(owned('treadmill'))).toBeGreaterThan(count(owned()));
    expect(count(owned('heavyBag'))).toBeGreaterThan(count(owned()));
    expect(CARDIO_SESSIONS.some((s) => s.needs.length > 1)).toBe(true);
  });

  it('always offers a no-equipment session', () => {
    expect(CARDIO_SESSIONS.some((s) => canDoCardio(s, new Set()))).toBe(true);
  });
});

describe('positionAt', () => {
  const session = getCardioSession('rower-steady-20')!;

  it('starts at the first step', () => {
    expect(positionAt(session.steps, 0)).toMatchObject({ index: 0, stepElapsed: 0, done: false });
  });

  it('moves to the next step exactly at its start', () => {
    const at = stepStart(session.steps, 1);
    expect(positionAt(session.steps, at)).toMatchObject({ index: 1, stepElapsed: 0 });
    expect(positionAt(session.steps, at - 0.5)).toMatchObject({ index: 0 });
  });

  it('counts down the step and the session', () => {
    const p = positionAt(session.steps, 100);
    expect(p.stepRemaining).toBe(session.steps[0].seconds - 100);
    expect(p.totalRemaining).toBe(totalSeconds(session) - 100);
  });

  it('finishes at the end', () => {
    expect(positionAt(session.steps, totalSeconds(session))).toMatchObject({ done: true, index: session.steps.length });
  });
});

describe('formatCountdown', () => {
  it('rounds up and pads seconds', () => {
    expect(formatCountdown(65)).toBe('1:05');
    expect(formatCountdown(0.2)).toBe('0:01');
    expect(formatCountdown(0)).toBe('0:00');
  });
});
