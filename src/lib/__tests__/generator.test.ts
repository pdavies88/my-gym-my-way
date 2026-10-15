import { describe, expect, it } from '@jest/globals';

import { EQUIPMENT_IDS, type EquipmentId } from '../equipment';
import { canDo, getExercise } from '../exercises';
import { generateWorkout, swapExercise, type Focus } from '../generator';

const FOCUSES: Focus[] = ['full', 'upper', 'lower', 'push', 'pull', 'core', 'conditioning'];
const everything = new Set<EquipmentId>(EQUIPMENT_IDS);
const nothing = new Set<EquipmentId>();
const dumbbellsOnly = new Set<EquipmentId>(['dumbbells']);

describe('generateWorkout', () => {
  it('is repeatable for the same seed', () => {
    const a = generateWorkout({ focus: 'full', count: 6, owned: everything, seed: 42 });
    const b = generateWorkout({ focus: 'full', count: 6, owned: everything, seed: 42 });
    expect(a).toEqual(b);
  });

  it('changes with the seed', () => {
    const results = new Set(
      [1, 2, 3, 4, 5].map((seed) => generateWorkout({ focus: 'full', count: 6, owned: everything, seed }).join()),
    );
    expect(results.size).toBeGreaterThan(1);
  });

  it.each(FOCUSES)('fills a %s workout with no duplicates using only owned equipment', (focus) => {
    for (const owned of [everything, dumbbellsOnly, nothing]) {
      for (let seed = 0; seed < 20; seed++) {
        const ids = generateWorkout({ focus, count: 6, owned, seed });
        expect(new Set(ids).size).toBe(ids.length);
        expect(ids.length).toBeGreaterThanOrEqual(3);
        for (const id of ids) expect(canDo(getExercise(id)!, owned)).toBe(true);
      }
    }
  });

  it('reaches the requested length with a full home gym', () => {
    for (const focus of FOCUSES) {
      expect(generateWorkout({ focus, count: 8, owned: everything, seed: 7 })).toHaveLength(8);
    }
  });

  it('never picks two exercises with the same movement pattern', () => {
    for (let seed = 0; seed < 50; seed++) {
      const ids = generateWorkout({ focus: 'upper', count: 8, owned: everything, seed });
      const patterns = ids.map((id) => getExercise(id)!.pattern);
      expect(new Set(patterns).size).toBe(patterns.length);
    }
  });

  it('fills the squat slot with a squat, not a lunge that can also squat', () => {
    for (let seed = 0; seed < 50; seed++) {
      const [first] = generateWorkout({ focus: 'full', count: 6, owned: everything, seed });
      expect(getExercise(first)!.slots[0]).toBe('squat');
    }
  });
});

describe('swapExercise', () => {
  it('returns a different, owned exercise that is not already in the workout', () => {
    const ids = generateWorkout({ focus: 'full', count: 6, owned: dumbbellsOnly, seed: 3 });
    for (let i = 0; i < ids.length; i++) {
      const replacement = swapExercise(ids, i, dumbbellsOnly, 99);
      if (replacement === null) continue;
      expect(ids).not.toContain(replacement);
      expect(canDo(getExercise(replacement)!, dumbbellsOnly)).toBe(true);
    }
  });
});
