import type { CardioSession, CardioStep } from './cardio';
import { getExercise } from './exercises';

/** How a circuit is timed. Every move runs for `workSeconds`, with `restSeconds` to change over. */
export interface CircuitSettings {
  rounds: number;
  workSeconds: number;
  restSeconds: number;
  /** Longer rest after each full round. */
  roundRestSeconds: number;
}

export type CircuitPresetId = 'easy' | 'standard' | 'hard';

export const CIRCUIT_PRESETS: Record<CircuitPresetId, { label: string; settings: CircuitSettings }> = {
  easy: { label: 'Easy · 30/30', settings: { rounds: 2, workSeconds: 30, restSeconds: 30, roundRestSeconds: 90 } },
  standard: {
    label: 'Standard · 40/20',
    settings: { rounds: 3, workSeconds: 40, restSeconds: 20, roundRestSeconds: 90 },
  },
  hard: { label: 'Hard · 45/15', settings: { rounds: 4, workSeconds: 45, restSeconds: 15, roundRestSeconds: 60 } },
};

const WARM_UP = 180;
const COOL_DOWN = 120;

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, Math.round(value)));

/** Keeps settings in a sensible range, whatever a link or old saved data says. */
export function normalizeSettings(settings: Partial<CircuitSettings>): CircuitSettings {
  const base = CIRCUIT_PRESETS.standard.settings;
  return {
    rounds: clamp(settings.rounds ?? base.rounds, 1, 6),
    workSeconds: clamp(settings.workSeconds ?? base.workSeconds, 15, 120),
    restSeconds: clamp(settings.restSeconds ?? base.restSeconds, 0, 120),
    roundRestSeconds: clamp(settings.roundRestSeconds ?? base.roundRestSeconds, 0, 300),
  };
}

/** Moves done one side at a time ("per leg", "per arm") need a reminder to switch halfway. */
const isOneSided = (prescription: string) => /per (arm|leg|side)/i.test(prescription);

/**
 * Turns a list of exercises into a timed circuit for the guided timer: a warm-up, then each move
 * back to back with a short changeover, a longer rest between rounds, and a cool-down.
 */
export function buildCircuit(
  name: string,
  exerciseIds: readonly string[],
  input: Partial<CircuitSettings>,
): CardioSession {
  const settings = normalizeSettings(input);
  const exercises = exerciseIds.map(getExercise).filter((e) => !!e);
  const steps: CardioStep[] = [
    {
      label: 'Warm up',
      seconds: WARM_UP,
      effort: 'warmup',
      cue: `Easy cardio, then a few light reps of ${exercises[0]?.name.toLowerCase() ?? 'the first move'}.`,
    },
  ];
  for (let round = 1; round <= settings.rounds; round++) {
    exercises.forEach((exercise, i) => {
      const sides = isOneSided(exercise.prescription) ? ' Switch sides halfway.' : '';
      steps.push({
        label: `${exercise.name} · round ${round}`,
        seconds: settings.workSeconds,
        effort: 'hard',
        cue: `Steady reps with good form. Use a weight you could lift 12 to 15 times.${sides}`,
        exerciseId: exercise.id,
      });
      const lastInRound = i === exercises.length - 1;
      const lastOverall = lastInRound && round === settings.rounds;
      if (lastOverall) return;
      if (lastInRound && settings.roundRestSeconds > 0) {
        steps.push({
          label: `Round ${round} done`,
          seconds: settings.roundRestSeconds,
          effort: 'rest',
          cue: `Shake out, sip some water. Next: ${exercises[0].name.toLowerCase()}.`,
        });
      } else if (!lastInRound && settings.restSeconds > 0) {
        steps.push({
          label: 'Change over',
          seconds: settings.restSeconds,
          effort: 'rest',
          cue: `Next: ${exercises[i + 1].name.toLowerCase()}. Set up your equipment.`,
        });
      }
    });
  }
  steps.push({
    label: 'Cool down',
    seconds: COOL_DOWN,
    effort: 'easy',
    cue: 'Walk around and let your breathing settle. A stretch session is a good next step.',
  });
  return {
    id: 'circuit',
    name: `${name} circuit`,
    summary: `${settings.rounds} rounds of ${exercises.length} moves, ${settings.workSeconds} seconds on and ${settings.restSeconds} off.`,
    level: settings.workSeconds >= 45 ? 'Advanced' : settings.workSeconds >= 40 ? 'Intermediate' : 'Beginner',
    category: 'weights',
    needs: [],
    steps,
  };
}

/** Route parameters for the timer screen, so a circuit can be opened like any other session. */
export function circuitParams(name: string, exerciseIds: readonly string[], settings: CircuitSettings) {
  return {
    id: 'circuit',
    name,
    ids: exerciseIds.join(','),
    rounds: String(settings.rounds),
    work: String(settings.workSeconds),
    rest: String(settings.restSeconds),
    roundRest: String(settings.roundRestSeconds),
  };
}

/** Reads circuit route parameters back. Unknown exercise ids are dropped; returns null if none are left. */
export function parseCircuitParams(params: Record<string, string | string[] | undefined>): {
  name: string;
  exerciseIds: string[];
  settings: CircuitSettings;
} | null {
  const one = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };
  const exerciseIds = (one('ids') ?? '').split(',').filter((id) => !!getExercise(id));
  if (exerciseIds.length === 0) return null;
  const num = (key: string) => {
    const value = Number(one(key));
    return Number.isFinite(value) ? value : undefined;
  };
  return {
    name: (one('name') ?? 'Weights').slice(0, 40),
    exerciseIds,
    settings: normalizeSettings({
      rounds: num('rounds'),
      workSeconds: num('work'),
      restSeconds: num('rest'),
      roundRestSeconds: num('roundRest'),
    }),
  };
}
