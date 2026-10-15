import type { EquipmentId } from './equipment';
import { availableExercises, getExercise, type Exercise, type Slot } from './exercises';

export type Focus = 'full' | 'upper' | 'lower' | 'push' | 'pull' | 'core' | 'conditioning';

export const FOCUS_LABELS: Record<Focus, string> = {
  full: 'Full body',
  upper: 'Upper body',
  lower: 'Lower body',
  push: 'Push',
  pull: 'Pull',
  core: 'Core',
  conditioning: 'Conditioning',
};

/** Short labels for tight controls. */
export const FOCUS_SHORT_LABELS: Record<Focus, string> = {
  full: 'Full',
  upper: 'Upper',
  lower: 'Lower',
  push: 'Push',
  pull: 'Pull',
  core: 'Core',
  conditioning: 'Cardio',
};

export type Length = 'short' | 'medium' | 'long';

export const LENGTHS: Record<Length, { label: string; count: number; minutes: string }> = {
  short: { label: 'Short', count: 4, minutes: '~20 min' },
  medium: { label: 'Medium', count: 6, minutes: '~35 min' },
  long: { label: 'Long', count: 8, minutes: '~50 min' },
};

/**
 * The order slots are filled for each focus. Each entry lists acceptable slots in order of
 * preference, so a missing pull-up bar falls back to a row, for example.
 */
const TEMPLATES: Record<Focus, Slot[][]> = {
  full: [['squat'], ['hpush'], ['hinge'], ['hpull', 'vpull'], ['lunge', 'squat'], ['vpush', 'hpush'], ['core'], ['vpull', 'hpull'], ['cardio', 'core']],
  upper: [['hpush'], ['hpull', 'vpull'], ['vpush', 'hpush'], ['vpull', 'hpull'], ['biceps'], ['triceps'], ['shoulders', 'vpush'], ['hpush'], ['core']],
  lower: [['squat'], ['hinge'], ['lunge', 'squat'], ['hinge', 'squat'], ['calves'], ['core'], ['lunge', 'squat'], ['cardio', 'core']],
  push: [['hpush'], ['vpush', 'hpush'], ['triceps'], ['shoulders', 'vpush'], ['hpush'], ['triceps', 'hpush'], ['core'], ['vpush', 'hpush']],
  pull: [['vpull', 'hpull'], ['hpull'], ['biceps'], ['hinge'], ['shoulders', 'hpull'], ['biceps', 'hpull'], ['core'], ['hpull', 'vpull']],
  core: [['core'], ['core'], ['cardio'], ['core'], ['core'], ['cardio', 'core'], ['core'], ['core']],
  conditioning: [['cardio'], ['squat'], ['hpush'], ['cardio'], ['hinge', 'lunge'], ['core'], ['cardio'], ['hpull', 'vpull']],
};

/** Mulberry32: a small, fast, seedable random number generator. Returns numbers in [0, 1). */
export function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Exercises that use equipment are twice as likely, so owning gear actually changes the plan. */
function weightOf(exercise: Exercise): number {
  return exercise.needs.length === 0 ? 1 : 2;
}

function pickWeighted(candidates: Exercise[], random: () => number): Exercise | undefined {
  const total = candidates.reduce((sum, exercise) => sum + weightOf(exercise), 0);
  let roll = random() * total;
  for (const exercise of candidates) {
    roll -= weightOf(exercise);
    if (roll < 0) return exercise;
  }
  return candidates[candidates.length - 1];
}

/** Whether two exercises share a movement pattern. Used to avoid near-duplicates like two kinds of curl. */
function samePattern(a: Exercise, b: Exercise) {
  return a.pattern === b.pattern;
}

export interface GenerateOptions {
  focus: Focus;
  count: number;
  owned: ReadonlySet<EquipmentId>;
  seed: number;
}

/** Returns exercise ids for a workout. It may return fewer than `count` if the equipment allows few options. */
export function generateWorkout({ focus, count, owned, seed }: GenerateOptions): string[] {
  const random = createRandom(seed);
  const pool = availableExercises(owned);
  const chosen: Exercise[] = [];
  const template = TEMPLATES[focus];
  const isFresh = (exercise: Exercise) => !chosen.some((c) => c.id === exercise.id || samePattern(c, exercise));

  for (let i = 0; chosen.length < count && i < template.length * 2; i++) {
    const preferences = template[i % template.length];
    for (const slot of preferences) {
      // Prefer exercises whose main role is this slot, so a split squat doesn't stand in for a squat.
      const primary = pool.filter((exercise) => exercise.slots[0] === slot && isFresh(exercise));
      const candidates = primary.length
        ? primary
        : pool.filter((exercise) => exercise.slots.includes(slot) && isFresh(exercise));
      const pick = pickWeighted(candidates, random);
      if (pick) {
        chosen.push(pick);
        break;
      }
    }
  }

  // Top up from anything that fits the focus if the template ran dry.
  if (chosen.length < count) {
    const focusSlots = new Set(template.flat());
    const extras = pool.filter((exercise) => exercise.slots.some((slot) => focusSlots.has(slot)) && isFresh(exercise));
    while (chosen.length < count && extras.length > 0) {
      const pick = pickWeighted(extras, random);
      if (!pick) break;
      chosen.push(pick);
      extras.splice(extras.indexOf(pick), 1);
    }
  }

  return chosen.map((exercise) => exercise.id);
}

/**
 * Picks a different exercise for position `index`, preferring one that fills the same slot.
 * Returns null when nothing else fits.
 */
export function swapExercise(ids: string[], index: number, owned: ReadonlySet<EquipmentId>, seed: number): string | null {
  const current = getExercise(ids[index]);
  if (!current) return null;
  const random = createRandom(seed);
  const others = ids.filter((_, i) => i !== index).map(getExercise).filter((e): e is Exercise => !!e);
  const pool = availableExercises(owned).filter(
    (exercise) => exercise.id !== current.id && !others.some((o) => o.id === exercise.id || samePattern(o, exercise)),
  );

  const sameSlot = pool.filter((exercise) => exercise.slots[0] === current.slots[0]);
  const related = pool.filter((exercise) => exercise.slots.some((slot) => current.slots.includes(slot)));
  const pick = pickWeighted(sameSlot.length ? sameSlot : related, random);
  return pick?.id ?? null;
}
