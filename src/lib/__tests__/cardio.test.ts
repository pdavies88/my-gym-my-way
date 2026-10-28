import { describe, expect, it } from '@jest/globals';

import {
  CARDIO_SESSIONS,
  canDoCardio,
  cuesBetween,
  formatCountdown,
  getCardioSession,
  positionAt,
  sessionExerciseIds,
  stepAnnouncement,
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
    // A summary that names a length must match the real length to within a minute.
    const stated = session.summary.match(/about (\d+) minutes/i);
    if (stated) expect(Math.abs(Number(stated[1]) - totalSeconds(session) / 60)).toBeLessThanOrEqual(1);
    // Every session lasts between 10 minutes and an hour. Stretch and mobility sessions can be shorter.
    expect(totalSeconds(session)).toBeGreaterThanOrEqual(
      session.category === 'stretch' || session.category === 'mobility' ? 300 : 600,
    );
    expect(totalSeconds(session)).toBeLessThanOrEqual(3600);
  });

  it('covers the rower, treadmill and boxing bag', () => {
    const owned = (...items: EquipmentId[]) => new Set<EquipmentId>(items);
    const count = (set: Set<EquipmentId>) => CARDIO_SESSIONS.filter((s) => canDoCardio(s, set)).length;
    expect(count(owned('rower'))).toBeGreaterThan(count(owned()));
    expect(count(owned('treadmill'))).toBeGreaterThan(count(owned()));
    expect(count(owned('heavyBag'))).toBeGreaterThan(count(owned()));
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

  it('keeps short steps, like Tabata intervals, to just the label', () => {
    expect(stepAnnouncement({ label: 'Sprint · 3 of 8', seconds: 20, effort: 'max', cue: '' })).toBe(
      'Sprint · 3 of 8.',
    );
    expect(stepAnnouncement({ label: 'Keep moving', seconds: 10, effort: 'easy', cue: '' })).toBe('Keep moving.');
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

describe('the catalog', () => {
  it('offers at least six sessions for every cardio type', () => {
    const cardioTypes = ['rower', 'treadmill', 'bag', 'kettlebell', 'trx', 'bike', 'rope', 'bodyweight', 'quiet'];
    for (const category of cardioTypes) {
      expect(CARDIO_SESSIONS.filter((s) => s.category === category).length).toBeGreaterThanOrEqual(6);
    }
  });

  it('offers a 5-minute stretch and a 5-minute mobility session', () => {
    for (const category of ['stretch', 'mobility']) {
      expect(CARDIO_SESSIONS.some((s) => s.category === category && totalSeconds(s) === 300)).toBe(true);
    }
  });

  it('never stops you during a Tabata: the 10 seconds between are active recovery', () => {
    const tabatas = CARDIO_SESSIONS.filter((s) => /tabata/i.test(s.name));
    expect(tabatas.length).toBeGreaterThanOrEqual(5);
    for (const session of tabatas) {
      expect(session.steps.some((s) => s.effort === 'rest')).toBe(false);
    }
  });

  it('has boxing and plyometric station sessions, with and without a bag', () => {
    const stations = CARDIO_SESSIONS.filter((s) => s.steps.some((step) => step.label.startsWith('Station')));
    expect(stations.some((s) => s.needs.includes('heavyBag'))).toBe(true);
    expect(stations.some((s) => s.needs.length === 0)).toBe(true);
    for (const session of stations) {
      const ids = new Set(session.steps.map((s) => s.exerciseId));
      expect([...ids].some((id) => id?.startsWith('bag-'))).toBe(true);
      expect(['jump-squat', 'burpee', 'mountain-climber', 'high-knees'].some((id) => ids.has(id))).toBe(true);
    }
  });
});

describe('sessionExerciseIds', () => {
  it('lists every move once, in the order it comes up', () => {
    const ids = sessionExerciseIds(getCardioSession('mobility-morning')!);
    expect(ids[0]).toBe('stretch-cat-cow');
    expect(ids).toContain('mobility-worlds-greatest-stretch');
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('falls back to the technique video when no step has one', () => {
    expect(sessionExerciseIds(getCardioSession('rower-steady-20')!)).toEqual(['rowing-machine']);
  });
});

describe('quiet sessions', () => {
  const quiet = CARDIO_SESSIONS.filter((s) => s.category === 'quiet');
  // Moves that land or stamp, which would wake a sleeping house.
  const LOUD = ['jumping-jack', 'high-knees', 'burpee', 'jump-squat', 'jump-rope', 'mountain-climber'];

  it('offer morning and evening options', () => {
    expect(quiet.some((s) => /morning/i.test(s.name))).toBe(true);
    expect(quiet.some((s) => /evening/i.test(s.name))).toBe(true);
  });

  it.each(quiet.map((s) => [s.id, s] as const))('%s is a quiet 15-minute full-body session', (_, session) => {
    expect(totalSeconds(session)).toBe(900);
    expect(session.needs).toEqual([]);
    expect(session.steps.some((s) => s.effort === 'stretch')).toBe(true);
    for (const step of session.steps) {
      if (step.exerciseId) expect(LOUD).not.toContain(step.exerciseId);
    }
    const slots = new Set(session.steps.flatMap((s) => (s.exerciseId ? getExercise(s.exerciseId)!.slots : [])));
    expect(slots.has('core')).toBe(true);
    expect((['squat', 'lunge', 'hinge'] as const).some((slot) => slots.has(slot))).toBe(true);
    expect((['hpush', 'vpush'] as const).some((slot) => slots.has(slot))).toBe(true);
  });
});

describe('stretch and mobility sessions', () => {
  it('only use their own kind of exercise', () => {
    for (const session of CARDIO_SESSIONS.filter((s) => s.category === 'stretch' || s.category === 'mobility')) {
      for (const step of session.steps) {
        if (!step.exerciseId) continue;
        const slots = getExercise(step.exerciseId)!.slots;
        expect(slots.includes('stretch') || slots.includes('mobility')).toBe(true);
      }
    }
  });

  it('need no equipment', () => {
    for (const session of CARDIO_SESSIONS.filter((s) => s.category === 'stretch' || s.category === 'mobility')) {
      expect(session.needs).toEqual([]);
    }
  });
});

describe('long sessions', () => {
  it.each(['rower', 'treadmill', 'bag'] as const)('offer a 30–45 minute %s session', (category) => {
    const lengths = CARDIO_SESSIONS.filter((s) => s.category === category).map((s) => totalSeconds(s) / 60);
    expect(lengths.some((m) => m >= 30 && m <= 45)).toBe(true);
  });
});
