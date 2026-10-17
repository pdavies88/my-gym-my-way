import { describe, expect, it } from '@jest/globals';

import {
  CARDIO_SESSIONS,
  canDoCardio,
  cuesBetween,
  formatCountdown,
  getCardioSession,
  positionAt,
  stepAnnouncement,
  stepStart,
  suggestStretch,
  suggestStretchAfterCardio,
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
    // A summary that names a length must match the real length to within a minute.
    const stated = session.summary.match(/about (\d+) minutes/i);
    if (stated) expect(Math.abs(Number(stated[1]) - totalSeconds(session) / 60)).toBeLessThanOrEqual(1);
    // Every session lasts between 10 minutes and an hour. Stretch sessions can be shorter.
    expect(totalSeconds(session)).toBeGreaterThanOrEqual(session.category === 'stretch' ? 300 : 600);
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

describe('cuesBetween', () => {
  const steps = [
    { label: 'Warm up', seconds: 60, effort: 'warmup' as const, cue: 'Easy.' },
    { label: 'Hard 1 of 2', seconds: 30, effort: 'hard' as const, cue: 'Go.' },
    { label: 'Rest', seconds: 10, effort: 'rest' as const, cue: 'Breathe.' },
  ];
  /** Runs the clock forward in small ticks, like the timer does, and collects the cues. */
  const play = (from: number, to: number, tick = 0.2) => {
    const cues = [];
    for (let t = from; t < to; t += tick) cues.push(...cuesBetween(steps, t, Math.min(to, t + tick)));
    return cues;
  };

  it('gives a heads-up, then 3-2-1, then the new step', () => {
    const kinds = play(45, 61).map((c) => (c.kind === 'tick' ? `tick${c.secondsLeft}` : c.kind));
    expect(kinds).toEqual(['heads-up', 'tick3', 'tick2', 'tick1', 'step']);
  });

  it('plays each cue only once', () => {
    expect(play(0, 100).filter((c) => c.kind === 'step')).toHaveLength(2);
    expect(play(0, 100).filter((c) => c.kind === 'tick')).toHaveLength(9);
    expect(play(0, 100).filter((c) => c.kind === 'done')).toHaveLength(1);
  });

  it('skips the heads-up on short steps', () => {
    expect(play(60, 100).filter((c) => c.kind === 'heads-up')).toHaveLength(1);
  });

  it('only announces the new step when you skip ahead', () => {
    expect(cuesBetween(steps, 5, 60)).toEqual([{ kind: 'step', index: 1, step: steps[1] }]);
    expect(cuesBetween(steps, 5, 20)).toEqual([]);
  });
});

describe('stepAnnouncement', () => {
  it('reads combos and durations naturally', () => {
    expect(stepAnnouncement({ label: 'Round 3: 1-2-3', seconds: 120, effort: 'hard', cue: '' })).toBe(
      'Hard. Round 3: 1, 2, 3. 2 minutes.',
    );
    expect(stepAnnouncement({ label: 'Rest', seconds: 90, effort: 'rest', cue: '' })).toBe('Rest. 1 minute 30.');
    expect(stepAnnouncement({ label: 'Warm up', seconds: 300, effort: 'warmup', cue: '' })).toBe('Warm up. 5 minutes.');
  });

  it('does not repeat a duration that is already in the label', () => {
    expect(stepAnnouncement({ label: 'Hard 1 min', seconds: 60, effort: 'hard', cue: '' })).toBe('Hard. 1 minute.');
    expect(stepAnnouncement({ label: 'All-out 1 min', seconds: 60, effort: 'max', cue: '' })).toBe(
      'All-out. 1 minute.',
    );
    expect(stepAnnouncement({ label: 'Hard 3 min', seconds: 180, effort: 'hard', cue: '' })).toBe('Hard. 3 minutes.');
  });
});

describe('bag combos', () => {
  it('link each combo to the video for its hardest punch', () => {
    const session = getCardioSession('bag-power-rounds')!;
    const linked = (label: string) => session.steps.find((s) => s.label === label)?.exerciseId;
    expect(linked('Round 1: 1-2')).toBe('bag-jab-cross');
    expect(linked('Round 3: 1-2-3')).toBe('bag-hooks');
    expect(linked('Round 5: 1-2-5-2')).toBe('bag-uppercuts');
  });

  it('explain the punch numbers in every session that uses them', () => {
    for (const session of CARDIO_SESSIONS) {
      const usesNumbers = session.steps.some(
        (s) => /\d-\d/.test(`${s.label} ${s.cue}`) && s.exerciseId?.startsWith('bag-'),
      );
      if (usesNumbers) expect(session.steps.some((s) => s.cue.includes('1 jab, 2 cross'))).toBe(true);
    }
  });
});

describe('stretch suggestions', () => {
  it('match the workout', () => {
    expect(suggestStretch(['back-squat', 'barbell-rdl', 'reverse-lunge', 'push-up'])).toBe('stretch-lower-body');
    expect(suggestStretch(['push-up', 'dumbbell-row', 'lateral-raise', 'goblet-squat'])).toBe('stretch-upper-body');
    expect(suggestStretch(['goblet-squat', 'push-up', 'dumbbell-row', 'reverse-lunge'])).toBe('stretch-full-body');
  });

  it('match cardio, and skip after a stretch', () => {
    expect(suggestStretchAfterCardio(getCardioSession('treadmill-speed')!)).toBe('stretch-lower-body');
    expect(suggestStretchAfterCardio(getCardioSession('bag-basics')!)).toBe('stretch-full-body');
    expect(suggestStretchAfterCardio(getCardioSession('stretch-full-body')!)).toBeNull();
  });

  it('only use stretch exercises in stretch sessions', () => {
    for (const session of CARDIO_SESSIONS.filter((s) => s.category === 'stretch')) {
      for (const step of session.steps)
        if (step.exerciseId) expect(getExercise(step.exerciseId)!.slots).toContain('stretch');
    }
  });
});
