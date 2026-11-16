import { CARDIO_SESSIONS, canDoCardio, totalSeconds } from './cardio';
import type { EquipmentId } from './equipment';
import { createRandom, FOCUS_LABELS, generateWorkout, type Focus } from './generator';
import { newId } from './id';
import type { Program, ProgramDayRef } from './storage/schemas';

export const PROGRAM_WEEKS = 4;
export const DAYS_PER_WEEK = [2, 3, 4, 5] as const;
export type DaysPerWeek = (typeof DAYS_PER_WEEK)[number];

/** Moves in each program workout. Enough for about 35–45 minutes with rests. */
const MOVES_PER_DAY = 5;

/** The split for each number of days a week: every muscle group gets hit at least twice a week. */
const SPLITS: Record<DaysPerWeek, Focus[]> = {
  2: ['full', 'full'],
  3: ['full', 'upper', 'lower'],
  4: ['upper', 'lower', 'upper', 'lower'],
  5: ['push', 'pull', 'lower', 'upper', 'full'],
};

/** The lighter last week: fewer sets and the same weights, so the body can catch up. */
export const LIGHT_WEEK = PROGRAM_WEEKS;

/**
 * Builds a 4-week program from the equipment you own. The same workouts repeat every week, so the
 * set logger can suggest a little more each time. Each week also suggests one cardio session.
 */
export function generateProgram({
  owned,
  daysPerWeek,
  seed,
}: {
  owned: ReadonlySet<EquipmentId>;
  daysPerWeek: DaysPerWeek;
  seed: number;
}): Program {
  const random = createRandom(seed);
  const split = SPLITS[daysPerWeek];
  const seen = new Map<Focus, number>();
  const days = split.map((focus) => {
    // A focus that repeats, like upper twice a week, gets a second, different workout.
    const nth = (seen.get(focus) ?? 0) + 1;
    seen.set(focus, nth);
    return {
      name: `${FOCUS_LABELS[focus]}${nth > 1 ? ' B' : split.filter((f) => f === focus).length > 1 ? ' A' : ''}`,
      focus,
      exerciseIds: generateWorkout({ focus, count: MOVES_PER_DAY, owned, seed: Math.floor(random() * 2 ** 31) }),
    };
  });

  // Cardio you can actually do: machines you own or no equipment, 13 to 30 minutes, nothing quiet or
  // restorative. A different one each week, shuffled by the seed.
  const cardio = CARDIO_SESSIONS.filter(
    (s) =>
      canDoCardio(s, owned) &&
      !['quiet', 'stretch', 'mobility'].includes(s.category) &&
      totalSeconds(s) >= 13 * 60 &&
      totalSeconds(s) <= 30 * 60,
  )
    .map((s) => ({ id: s.id, order: random() }))
    .sort((a, b) => a.order - b.order)
    .map((s) => s.id);

  return {
    id: newId(),
    createdAt: Date.now(),
    weeks: PROGRAM_WEEKS,
    days,
    cardioIds: Array.from({ length: PROGRAM_WEEKS }, (_, i) => cardio[i % Math.max(1, cardio.length)]).filter(
      (id): id is string => !!id,
    ),
    done: {},
  };
}

export const dayKey = (week: number, day: number) => `${week}-${day}`;

/** The first day not done yet, in order, or null once the whole program is finished. */
export function nextProgramDay(program: Program): { week: number; day: number } | null {
  for (let week = 1; week <= program.weeks; week++) {
    for (let day = 0; day < program.days.length; day++) {
      if (!program.done[dayKey(week, day)]) return { week, day };
    }
  }
  return null;
}

export function programProgress(program: Program): { done: number; total: number } {
  return { done: Object.keys(program.done).length, total: program.weeks * program.days.length };
}

/** The session name for a program day, for example "Week 2 · Upper body A". */
export const programDayName = (program: Program, week: number, day: number) =>
  `Week ${week} · ${program.days[day]?.name ?? 'Workout'}`;

/**
 * The program after a session finishes: its day is marked done when the session came from this
 * program. Otherwise the program is returned unchanged.
 */
export function markProgramDay(program: Program, ref: ProgramDayRef | undefined, logId: string): Program {
  if (!ref || ref.programId !== program.id || !program.days[ref.day] || ref.week > program.weeks) return program;
  return { ...program, done: { ...program.done, [dayKey(ref.week, ref.day)]: logId } };
}
