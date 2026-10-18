import { describe, expect, it } from '@jest/globals';

import { EXERCISES } from '../exercises';
import { MUSCLE_GROUPS, muscleGroupsOf } from '../muscles';

describe('muscle groups', () => {
  it('cover every muscle an exercise lists', () => {
    const known = new Set<string>(MUSCLE_GROUPS.flatMap((g) => g.muscles));
    for (const exercise of EXERCISES) for (const muscle of exercise.muscles) expect(known).toContain(muscle);
  });

  it('put every exercise in at least one group', () => {
    for (const exercise of EXERCISES) expect(muscleGroupsOf(exercise).length).toBeGreaterThan(0);
  });

  it('list each group once per exercise', () => {
    expect(muscleGroupsOf({ muscles: ['Lats', 'Upper back', 'Biceps'] })).toEqual(['back', 'arms']);
  });
});
