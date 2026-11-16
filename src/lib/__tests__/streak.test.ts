import { describe, expect, it } from '@jest/globals';

import { calendarWeeks, dayStreak, startOfDay, weekStreak } from '../streak';
import { startOfWeek } from '../time';

const at = (y: number, m: number, d: number, h = 9) => new Date(y, m - 1, d, h).getTime();

describe('dayStreak', () => {
  it('counts days in a row up to today', () => {
    expect(dayStreak([at(2026, 11, 13), at(2026, 11, 14), at(2026, 11, 15)], at(2026, 11, 15, 20))).toBe(3);
  });

  it('keeps yesterday’s streak alive until today ends', () => {
    expect(dayStreak([at(2026, 11, 13), at(2026, 11, 14)], at(2026, 11, 15, 20))).toBe(2);
  });

  it('breaks after a missed day', () => {
    expect(dayStreak([at(2026, 11, 12), at(2026, 11, 15)], at(2026, 11, 15, 20))).toBe(1);
    expect(dayStreak([at(2026, 11, 12)], at(2026, 11, 15))).toBe(0);
  });

  it('counts two sessions on one day once', () => {
    expect(dayStreak([at(2026, 11, 15, 7), at(2026, 11, 15, 19)], at(2026, 11, 15, 21))).toBe(1);
  });
});

describe('weekStreak', () => {
  it('counts weeks in a row with a session, the current week included once it has one', () => {
    const sessions = [at(2026, 11, 2), at(2026, 11, 10), at(2026, 11, 16)];
    expect(weekStreak(sessions, at(2026, 11, 17))).toBe(3);
  });

  it('doesn’t break the streak before the current week has a session', () => {
    expect(weekStreak([at(2026, 11, 2), at(2026, 11, 10)], at(2026, 11, 17))).toBe(2);
  });
});

describe('calendarWeeks', () => {
  it('lays out whole weeks, Monday first, ending with this week', () => {
    const now = at(2026, 11, 15);
    const rows = calendarWeeks(now, 5);
    expect(rows).toHaveLength(5);
    expect(rows.every((row) => row.length === 7)).toBe(true);
    expect(rows[4][0]).toBe(startOfWeek(now));
    expect(rows[4]).toContain(startOfDay(now));
    expect(new Date(rows[0][0]).getDay()).toBe(1);
  });
});
