import { startOfWeek } from './time';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Midnight at the start of the local day. */
export function startOfDay(at: number): number {
  const date = new Date(at);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/** The local days, as midnight timestamps, that have at least one session. */
export function activeDays(startTimes: readonly number[]): Set<number> {
  return new Set(startTimes.map(startOfDay));
}

/**
 * Days in a row with a session, counting back from today. A streak survives until the end of today,
 * so not having trained yet today doesn't break yesterday's streak.
 */
export function dayStreak(startTimes: readonly number[], now: number): number {
  const days = activeDays(startTimes);
  let day = startOfDay(now);
  if (!days.has(day)) day = startOfDay(day - DAY_MS / 2);
  let streak = 0;
  while (days.has(day)) {
    streak++;
    // Step back half a day before rounding, so daylight saving changes can't skip a day.
    day = startOfDay(day - DAY_MS / 2);
  }
  return streak;
}

/** Weeks in a row with at least one session. The current week counts once it has one, and doesn't break the streak before. */
export function weekStreak(startTimes: readonly number[], now: number): number {
  const weeks = new Set(startTimes.map(startOfWeek));
  let week = startOfWeek(now);
  if (!weeks.has(week)) week = startOfWeek(week - DAY_MS);
  let streak = 0;
  while (weeks.has(week)) {
    streak++;
    week = startOfWeek(week - DAY_MS);
  }
  return streak;
}

/**
 * The calendar grid: `weeks` rows of 7 days, ending with the current week. Each cell is the day's
 * midnight timestamp. Weeks start on the same day as `startOfWeek`.
 */
export function calendarWeeks(now: number, weeks: number): number[][] {
  const thisWeek = startOfWeek(now);
  const rows: number[][] = [];
  for (let w = weeks - 1; w >= 0; w--) {
    let day = startOfWeek(thisWeek - w * 7 * DAY_MS + DAY_MS / 2);
    const row: number[] = [];
    for (let d = 0; d < 7; d++) {
      row.push(day);
      day = startOfDay(day + DAY_MS * 1.5);
    }
    rows.push(row);
  }
  return rows;
}
