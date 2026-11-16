import type { Exercise } from './exercises';
import type { SessionLog, SetEntry } from './storage/schemas';

export type Units = 'us' | 'metric';

/** What a prescription asks for: "3 sets × 8–12 reps" is 3 sets of 8 to 12 reps. */
export interface Target {
  sets: number;
  /** Reps, or seconds for timed holds. Missing for "as many as you can". */
  low?: number;
  high?: number;
  measure: 'reps' | 'seconds';
}

const LB_PER_KG = 2.20462;

/** Reads a prescription such as "3 sets × 8–12 reps", "3 × 30 seconds" or "Hold 30–60 seconds". */
export function parseTarget(prescription: string): Target {
  const text = prescription.replace(/[–—]/g, '-').trim();
  // "3 sets × 8-12 reps": the count before "×" is the sets, and the rest is the range.
  const split = text.match(/^(\d+)\s*(?:sets|rounds)?\s*×\s*(.*)$/i);
  const sets = split ? Number(split[1]) : 3;
  const rest = split ? split[2] : text.replace(/^Hold\s+/i, '');
  const range = rest.match(/^(\d+)(?:-(\d+))?\s*([a-z]*)/i);
  if (!range || /as many as/i.test(rest)) return { sets, measure: 'reps' };
  const minutes = /^minute/i.test(range[3]);
  const scale = minutes ? 60 : 1;
  return {
    sets,
    low: Number(range[1]) * scale,
    high: Number(range[2] ?? range[1]) * scale,
    measure: minutes || /^sec/i.test(range[3]) ? 'seconds' : 'reps',
  };
}

/** True for moves done with a weight you can change: dumbbells, barbell, kettlebell, cable or ball. */
export function usesWeight(exercise: Pick<Exercise, 'needs'>): boolean {
  const weighted = ['dumbbells', 'barbell', 'kettlebell', 'cable', 'medicineBall'];
  return exercise.needs.length > 0 && exercise.needs.every((option) => option.some((item) => weighted.includes(item)));
}

export function toDisplayWeight(kg: number, units: Units): number {
  const value = units === 'us' ? kg * LB_PER_KG : kg;
  return Math.round(value * 2) / 2;
}

export function fromDisplayWeight(value: number, units: Units): number {
  return units === 'us' ? value / LB_PER_KG : value;
}

export const weightUnit = (units: Units) => (units === 'us' ? 'lb' : 'kg');

/** One step up: 5 lb in US units, 2.5 kg in metric. */
const weightStepKg = (units: Units) => (units === 'us' ? 5 / LB_PER_KG : 2.5);

/** The most recent finished session that logged sets for this exercise, newest first. */
export function lastSets(sessions: readonly SessionLog[], exerciseId: string): { at: number; sets: SetEntry[] } | null {
  for (const session of sessions) {
    const sets = session.sets?.[exerciseId];
    if (sets?.length) return { at: session.startedAt, sets };
  }
  return null;
}

export interface Suggestion {
  /** Pre-fills each new set. */
  reps: number;
  weightKg?: number;
  sets: number;
  /** A short line for the screen, such as "Try 30 lb × 8 this time". */
  text: string;
}

const formatSet = (set: SetEntry, measure: Target['measure'], units: Units) => {
  const amount = measure === 'seconds' ? `${set.reps} sec` : `${set.reps}`;
  return set.weightKg ? `${toDisplayWeight(set.weightKg, units)} ${weightUnit(units)} × ${amount}` : amount;
};

/** "3 × 10 at 25 lb" style summary of a set list, or each set when they differ. */
export function summarizeSets(sets: readonly SetEntry[], measure: Target['measure'], units: Units): string {
  if (sets.length === 0) return '';
  const same = sets.every((s) => s.reps === sets[0].reps && s.weightKg === sets[0].weightKg);
  if (!same) return sets.map((s) => formatSet(s, measure, units)).join(', ');
  const amount = measure === 'seconds' ? `${sets[0].reps} sec` : `${sets[0].reps}`;
  const weight = sets[0].weightKg ? ` at ${toDisplayWeight(sets[0].weightKg, units)} ${weightUnit(units)}` : '';
  return `${sets.length} × ${amount}${weight}`;
}

/**
 * The next step up, using double progression: add reps until every set reaches the top of the
 * range, then add weight and drop back to the bottom of the range.
 */
export function suggestNext(
  exercise: Pick<Exercise, 'prescription' | 'needs'>,
  last: SetEntry[] | null,
  units: Units,
): Suggestion {
  const target = parseTarget(exercise.prescription);
  const weighted = usesWeight(exercise);
  const unit = target.measure === 'seconds' ? ' sec' : '';
  const low = target.low ?? 10;
  const high = target.high ?? low;

  if (!last?.length) {
    const range =
      target.low === undefined ? 'as many as you can' : low === high ? `${low}${unit}` : `${low}–${high}${unit}`;
    return {
      reps: low,
      sets: target.sets,
      text: weighted
        ? `First time: ${target.sets} × ${range}. Pick a weight you could lift about ${high} times.`
        : `First time: ${target.sets} × ${range}.`,
    };
  }

  const top = last.reduce((best, set) => ((set.weightKg ?? 0) > (best.weightKg ?? 0) ? set : best), last[0]);
  const topWeight = top.weightKg;
  const hitTop = last.length >= target.sets && last.every((set) => set.reps >= high);
  const bestReps = Math.max(...last.map((s) => s.reps));

  if (target.measure === 'seconds') {
    const reps = hitTop ? bestReps + 5 : Math.min(high, bestReps + 5);
    return { reps, sets: target.sets, text: `Try ${reps} seconds this time.` };
  }

  if (weighted && topWeight !== undefined) {
    if (hitTop) {
      const next = topWeight + weightStepKg(units);
      return {
        reps: low,
        weightKg: next,
        sets: target.sets,
        text: `You hit ${high} on every set. Try ${toDisplayWeight(next, units)} ${weightUnit(units)} × ${low}.`,
      };
    }
    const reps = Math.min(high, Math.min(...last.map((s) => s.reps)) + 1);
    return {
      reps,
      weightKg: topWeight,
      sets: target.sets,
      text: `Same weight, aim for ${reps} reps on every set.`,
    };
  }

  if (hitTop && target.low !== undefined) {
    return {
      reps: high,
      sets: target.sets + (last.length > target.sets ? 0 : 1),
      text: `You hit ${high} on every set. Add a set, or try a harder version.`,
    };
  }
  const reps = target.low === undefined ? bestReps + 1 : Math.min(high, bestReps + 1);
  return { reps, sets: target.sets, text: `Aim for ${reps} reps this time.` };
}

export interface ProgressPoint {
  at: number;
  /** The heaviest set, or undefined for bodyweight moves. */
  topWeightKg?: number;
  /** The most reps (or seconds) in one set. */
  bestReps: number;
  sets: number;
}

/** One point per session that logged this exercise, oldest first. */
export function progressHistory(sessions: readonly SessionLog[], exerciseId: string): ProgressPoint[] {
  const points: ProgressPoint[] = [];
  for (const session of sessions) {
    const sets = session.sets?.[exerciseId];
    if (!sets?.length) continue;
    const weights = sets.map((s) => s.weightKg).filter((w): w is number => w !== undefined);
    points.push({
      at: session.startedAt,
      topWeightKg: weights.length ? Math.max(...weights) : undefined,
      bestReps: Math.max(...sets.map((s) => s.reps)),
      sets: sets.length,
    });
  }
  return points.reverse();
}
