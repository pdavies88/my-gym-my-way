import { describe, expect, it } from '@jest/globals';

import { totalSeconds } from '../cardio';
import {
  buildCircuit,
  CIRCUIT_MINUTES,
  circuitBlocks,
  circuitParams,
  normalizePlan,
  parseCircuitParams,
  pickStations,
  type CardioStation,
  type CircuitPlan,
} from '../circuit';
import type { EquipmentId } from '../equipment';
import { getExercise } from '../exercises';

const ids = ['goblet-squat', 'push-up', 'dumbbell-row', 'reverse-lunge', 'dead-bug'];
const owned = (...items: EquipmentId[]) => new Set<EquipmentId>(items);

describe('pickStations', () => {
  it('uses floor cardio when you own no machine', () => {
    expect(pickStations(owned('dumbbells'), 1)).toEqual(['floorCardio']);
  });

  it('uses your only machine', () => {
    expect(pickStations(owned('rower', 'dumbbells'), 1)).toEqual(['rower']);
  });

  it('picks two of your machines, treadmill first when it is picked', () => {
    for (let seed = 0; seed < 20; seed++) {
      const picked = pickStations(owned('rower', 'treadmill', 'bike', 'heavyBag'), seed);
      expect(picked).toHaveLength(2);
      expect(new Set(picked).size).toBe(2);
      if (picked.includes('treadmill')) expect(picked[0]).toBe('treadmill');
    }
  });
});

describe('circuitBlocks', () => {
  it('runs two machines once each with the floor between, like Orangetheory', () => {
    const blocks = circuitBlocks({ stations: ['treadmill', 'rower'], minutes: 45 });
    expect(blocks.map((b) => b.station ?? b.kind)).toEqual(['warmup', 'treadmill', 'floor', 'rower', 'cooldown']);
  });

  it('alternates one machine with the floor twice, like Barry’s', () => {
    const blocks = circuitBlocks({ stations: ['treadmill'], minutes: 45 });
    expect(blocks.map((b) => b.station ?? b.kind)).toEqual([
      'warmup',
      'treadmill',
      'floor',
      'treadmill',
      'floor',
      'cooldown',
    ]);
  });
});

describe('buildCircuit', () => {
  const plans: CircuitPlan[] = CIRCUIT_MINUTES.flatMap((minutes) =>
    ([['treadmill', 'rower'], ['bike'], ['floorCardio'], ['heavyBag', 'jumpRope']] as CardioStation[][]).map(
      (stations) => ({ stations, minutes }),
    ),
  );

  it.each(plans.map((p) => [`${p.stations.join('+')} ${p.minutes} min`, p] as const))(
    '%s lasts exactly as long as picked',
    (_, plan) => {
      const session = buildCircuit('Full body', ids, plan);
      expect(totalSeconds(session)).toBe(plan.minutes * 60);
      expect(session.steps[0].effort).toBe('warmup');
      expect(session.steps.at(-1)!.effort).toBe('stretch');
      for (const step of session.steps) {
        expect(step.seconds).toBeGreaterThan(0);
        if (step.exerciseId) expect(getExercise(step.exerciseId)).toBeDefined();
      }
    },
  );

  it('gives every station block at least 5 minutes and leaves at least 3 to cool down', () => {
    for (const plan of plans) {
      const blocks = circuitBlocks(plan);
      for (const block of blocks.filter((b) => b.kind === 'station')) expect(block.seconds).toBeGreaterThanOrEqual(300);
      expect(blocks.at(-1)!.seconds).toBeGreaterThanOrEqual(180);
    }
  });

  it('has base, push and all-out efforts on cardio and every floor move on the floor', () => {
    const session = buildCircuit('Full body', ids, { stations: ['rower', 'treadmill'], minutes: 45 });
    const efforts = new Set(session.steps.map((s) => s.effort));
    for (const effort of ['moderate', 'hard', 'max'] as const) expect(efforts).toContain(effort);
    const floor = session.steps.filter((s) => ids.includes(s.exerciseId ?? ''));
    expect(new Set(floor.map((s) => s.exerciseId))).toEqual(new Set(ids));
    expect(session.steps.some((s) => s.label === 'Move to the floor')).toBe(true);
    expect(session.needs).toEqual(['rower', 'treadmill']);
  });

  it('continues the floor rotation in the second floor block', () => {
    const session = buildCircuit('Full body', ids, { stations: ['bike'], minutes: 30 });
    const floorIds = session.steps.filter((s) => ids.includes(s.exerciseId ?? '')).map((s) => s.exerciseId);
    // Moves cycle in order across both floor blocks, never restarting from the first move.
    floorIds.forEach((id, i) => expect(id).toBe(ids[i % ids.length]));
  });
});

describe('circuit route parameters', () => {
  it('round-trip', () => {
    const plan: CircuitPlan = { stations: ['treadmill', 'rower'], minutes: 60 };
    expect(parseCircuitParams(circuitParams('Upper body', ids, plan))).toEqual({
      name: 'Upper body',
      exerciseIds: ids,
      plan,
    });
  });

  it('fall back to safe values', () => {
    expect(normalizePlan({ stations: ['spaceship', 'rower', 'rower', 'bike', 'treadmill'], minutes: 7 })).toEqual({
      stations: ['rower', 'bike'],
      minutes: 45,
    });
    expect(normalizePlan({})).toEqual({ stations: ['floorCardio'], minutes: 45 });
    expect(parseCircuitParams({ id: 'circuit', ids: 'nope' })).toBeNull();
  });
});
