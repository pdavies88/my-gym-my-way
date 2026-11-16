import { describe, expect, it } from '@jest/globals';

import { getExercise } from '../exercises';
import {
  fromDisplayWeight,
  lastSets,
  parseTarget,
  progressHistory,
  suggestNext,
  summarizeSets,
  toDisplayWeight,
  usesWeight,
} from '../progress';
import type { SessionLog } from '../storage/schemas';

const log = (startedAt: number, sets: SessionLog['sets']): SessionLog => ({
  id: String(startedAt),
  name: 'Full body',
  exerciseIds: Object.keys(sets ?? {}),
  completedIds: [],
  startedAt,
  finishedAt: startedAt + 1,
  sets,
});

describe('parseTarget', () => {
  it('reads sets and rep ranges', () => {
    expect(parseTarget('3 sets × 8–12 reps')).toEqual({ sets: 3, low: 8, high: 12, measure: 'reps' });
    expect(parseTarget('4 sets × 5–8 reps')).toEqual({ sets: 4, low: 5, high: 8, measure: 'reps' });
    expect(parseTarget('3 sets × 8–12 per leg')).toEqual({ sets: 3, low: 8, high: 12, measure: 'reps' });
    expect(parseTarget('3 sets × 15 reps')).toEqual({ sets: 3, low: 15, high: 15, measure: 'reps' });
  });

  it('reads timed holds in seconds', () => {
    expect(parseTarget('3 × 30 seconds')).toEqual({ sets: 3, low: 30, high: 30, measure: 'seconds' });
    expect(parseTarget('Hold 30–60 seconds')).toEqual({ sets: 3, low: 30, high: 60, measure: 'seconds' });
    expect(parseTarget('3 rounds × 2 minutes')).toEqual({ sets: 3, low: 120, high: 120, measure: 'seconds' });
  });

  it('leaves the range open for as many as you can', () => {
    expect(parseTarget('3 sets × as many as you can')).toEqual({ sets: 3, measure: 'reps' });
  });

  it('reads every prescription in the library without falling over', () => {
    for (const id of ['push-up', 'plank', 'goblet-squat', 'farmer-carry', 'kettlebell-swing']) {
      const target = parseTarget(getExercise(id)!.prescription);
      expect(target.sets).toBeGreaterThan(0);
    }
  });
});

describe('weights', () => {
  it('knows which moves take a weight', () => {
    expect(usesWeight(getExercise('goblet-squat')!)).toBe(true);
    expect(usesWeight(getExercise('push-up')!)).toBe(false);
    expect(usesWeight(getExercise('trx-row')!)).toBe(false);
  });

  it('converts pounds and kilograms both ways', () => {
    expect(toDisplayWeight(fromDisplayWeight(25, 'us'), 'us')).toBe(25);
    expect(toDisplayWeight(20, 'metric')).toBe(20);
  });
});

describe('suggestNext', () => {
  const squat = getExercise('goblet-squat')!; // 3 sets × 8–12 reps, dumbbells or kettlebell
  const pushUp = getExercise('push-up')!;
  const kg = (lb: number) => fromDisplayWeight(lb, 'us');

  it('starts from the prescription the first time', () => {
    const first = suggestNext(squat, null, 'us');
    expect(first).toMatchObject({ reps: 8, sets: 3 });
    expect(first.text).toMatch(/Pick a weight you could lift about 12 times/);
  });

  it('adds reps at the same weight until every set reaches the top of the range', () => {
    const next = suggestNext(
      squat,
      [
        { reps: 10, weightKg: kg(25) },
        { reps: 9, weightKg: kg(25) },
        { reps: 8, weightKg: kg(25) },
      ],
      'us',
    );
    expect(next.reps).toBe(9);
    expect(toDisplayWeight(next.weightKg!, 'us')).toBe(25);
  });

  it('adds 5 lb, or 2.5 kg, and drops to the bottom of the range once every set hits the top', () => {
    const sets = [12, 12, 12].map((reps) => ({ reps, weightKg: kg(25) }));
    const us = suggestNext(squat, sets, 'us');
    expect(toDisplayWeight(us.weightKg!, 'us')).toBe(30);
    expect(us.reps).toBe(8);
    expect(us.text).toBe('You hit 12 on every set. Try 30 lb × 8.');
    const metric = suggestNext(
      squat,
      [12, 12, 12].map((reps) => ({ reps, weightKg: 10 })),
      'metric',
    );
    expect(metric.weightKg).toBe(12.5);
  });

  it('adds a rep for bodyweight moves', () => {
    expect(suggestNext(pushUp, [{ reps: 9 }, { reps: 8 }], 'us').reps).toBe(10);
  });
});

describe('history', () => {
  const sessions = [
    log(3000, {
      'goblet-squat': [
        { reps: 10, weightKg: 12 },
        { reps: 12, weightKg: 14 },
      ],
    }),
    log(2000, { 'push-up': [{ reps: 15 }] }),
    log(1000, { 'goblet-squat': [{ reps: 12, weightKg: 10 }] }),
  ];

  it('finds the most recent sets for a move', () => {
    expect(lastSets(sessions, 'goblet-squat')?.at).toBe(3000);
    expect(lastSets(sessions, 'plank')).toBeNull();
  });

  it('lists progress oldest first with the heaviest set', () => {
    expect(progressHistory(sessions, 'goblet-squat')).toEqual([
      { at: 1000, topWeightKg: 10, bestReps: 12, sets: 1 },
      { at: 3000, topWeightKg: 14, bestReps: 12, sets: 2 },
    ]);
  });

  it('summarizes sets', () => {
    expect(
      summarizeSets(
        [
          { reps: 10, weightKg: 10 },
          { reps: 10, weightKg: 10 },
        ],
        'reps',
        'metric',
      ),
    ).toBe('2 × 10 at 10 kg');
    expect(summarizeSets([{ reps: 30 }], 'seconds', 'us')).toBe('1 × 30 sec');
  });
});
