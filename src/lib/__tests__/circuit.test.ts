import { describe, expect, it } from '@jest/globals';

import { totalSeconds } from '../cardio';
import { buildCircuit, CIRCUIT_PRESETS, circuitParams, parseCircuitParams } from '../circuit';

const ids = ['goblet-squat', 'push-up', 'dumbbell-row', 'reverse-lunge'];

describe('buildCircuit', () => {
  it('runs every move each round, with rests between moves and rounds', () => {
    const session = buildCircuit('Full body', ids, CIRCUIT_PRESETS.standard.settings);
    const work = session.steps.filter((s) => s.exerciseId);
    expect(work).toHaveLength(ids.length * 3);
    expect(work.map((s) => s.exerciseId).slice(0, 4)).toEqual(ids);
    expect(session.steps.filter((s) => s.label.startsWith('Round ')).map((s) => s.label)).toEqual([
      'Round 1 done',
      'Round 2 done',
    ]);
    // Warm-up first, cool-down last, and no rest straight before the cool-down.
    expect(session.steps[0].effort).toBe('warmup');
    expect(session.steps.at(-1)!.label).toBe('Cool down');
    expect(session.steps.at(-2)!.exerciseId).toBe('reverse-lunge');
  });

  it('adds up to the expected length', () => {
    const session = buildCircuit('Full body', ids, {
      rounds: 3,
      workSeconds: 40,
      restSeconds: 20,
      roundRestSeconds: 90,
    });
    // 3 min warm-up + 12 × 40 s work + 9 × 20 s changeovers + 2 × 90 s round rests + 2 min cool-down.
    expect(totalSeconds(session)).toBe(180 + 480 + 180 + 180 + 120);
  });

  it('reminds you to switch sides on one-sided moves', () => {
    const session = buildCircuit('Legs', ['reverse-lunge'], CIRCUIT_PRESETS.easy.settings);
    expect(session.steps.find((s) => s.exerciseId)!.cue).toContain('Switch sides halfway');
  });

  it('keeps settings in a safe range', () => {
    const session = buildCircuit('X', ids, { rounds: 50, workSeconds: 1, restSeconds: -5, roundRestSeconds: 9999 });
    expect(session.steps.filter((s) => s.exerciseId)).toHaveLength(ids.length * 6);
    expect(session.steps.find((s) => s.exerciseId)!.seconds).toBe(15);
  });
});

describe('circuit route parameters', () => {
  it('round-trip through the URL and drop unknown exercises', () => {
    const params = circuitParams('Upper', [...ids, 'not-real'], CIRCUIT_PRESETS.hard.settings);
    const parsed = parseCircuitParams(params);
    expect(parsed?.exerciseIds).toEqual(ids);
    expect(parsed?.settings).toEqual(CIRCUIT_PRESETS.hard.settings);
    expect(parseCircuitParams({ ids: 'nope' })).toBeNull();
  });
});
