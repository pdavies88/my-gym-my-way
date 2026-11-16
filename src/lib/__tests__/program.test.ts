import { describe, expect, it } from '@jest/globals';

import { getCardioSession } from '../cardio';
import type { EquipmentId } from '../equipment';
import { canDo, getExercise } from '../exercises';
import { dayKey, DAYS_PER_WEEK, generateProgram, markProgramDay, nextProgramDay, programProgress } from '../program';

const owned = new Set<EquipmentId>(['dumbbells', 'bench', 'rower']);

describe('generateProgram', () => {
  it.each(DAYS_PER_WEEK.map((d) => [d]))('builds %i days a week from the equipment you own', (daysPerWeek) => {
    const program = generateProgram({ owned, daysPerWeek, seed: 7 });
    expect(program.weeks).toBe(4);
    expect(program.days).toHaveLength(daysPerWeek);
    for (const day of program.days) {
      expect(day.exerciseIds.length).toBeGreaterThanOrEqual(4);
      for (const id of day.exerciseIds) expect(canDo(getExercise(id)!, owned)).toBe(true);
    }
    expect(new Set(program.days.map((d) => d.name)).size).toBe(daysPerWeek);
  });

  it('suggests cardio you can do, a different session each week when there are enough', () => {
    const program = generateProgram({ owned, daysPerWeek: 3, seed: 1 });
    expect(program.cardioIds).toHaveLength(4);
    expect(new Set(program.cardioIds).size).toBe(4);
    for (const id of program.cardioIds) {
      expect(getCardioSession(id)!.needs.every((n) => owned.has(n))).toBe(true);
    }
  });

  it('works with no equipment at all', () => {
    const program = generateProgram({ owned: new Set(), daysPerWeek: 3, seed: 3 });
    expect(program.days.every((d) => d.exerciseIds.length > 0)).toBe(true);
    expect(program.cardioIds.length).toBeGreaterThan(0);
  });
});

describe('progress through a program', () => {
  it('walks through every day of every week in order', () => {
    const program = generateProgram({ owned, daysPerWeek: 2, seed: 2 });
    expect(nextProgramDay(program)).toEqual({ week: 1, day: 0 });
    program.done[dayKey(1, 0)] = 'a';
    expect(nextProgramDay(program)).toEqual({ week: 1, day: 1 });
    program.done[dayKey(1, 1)] = 'b';
    expect(nextProgramDay(program)).toEqual({ week: 2, day: 0 });
    expect(programProgress(program)).toEqual({ done: 2, total: 8 });
    for (let w = 1; w <= 4; w++) for (let d = 0; d < 2; d++) program.done[dayKey(w, d)] = 'x';
    expect(nextProgramDay(program)).toBeNull();
  });
});

describe('markProgramDay', () => {
  const program = generateProgram({ owned, daysPerWeek: 3, seed: 4 });

  it('marks the finished day done with its log id', () => {
    const next = markProgramDay(program, { programId: program.id, week: 1, day: 0 }, 'log-1');
    expect(next.done).toEqual({ '1-0': 'log-1' });
    expect(nextProgramDay(next)).toEqual({ week: 1, day: 1 });
  });

  it('leaves the program alone for other sessions or an older program', () => {
    expect(markProgramDay(program, undefined, 'x')).toBe(program);
    expect(markProgramDay(program, { programId: 'old', week: 1, day: 0 }, 'x')).toBe(program);
    expect(markProgramDay(program, { programId: program.id, week: 9, day: 0 }, 'x')).toBe(program);
  });
});
