import type { CardioLevel, CardioSession, CardioStep, Effort } from './cardio';
import type { EquipmentId } from './equipment';
import { getExercise } from './exercises';
import { createRandom } from './generator';

/**
 * A bootcamp is a station circuit that works like a class at Orangetheory or Barry's: blocks on cardio machines with
 * base, push and all-out efforts, and blocks of strength moves on the floor, all on one timer.
 */

/** A cardio station. Floor cardio stands in when you own no machine. */
export type CardioStation = 'treadmill' | 'rower' | 'bike' | 'heavyBag' | 'jumpRope' | 'floorCardio';

export const CARDIO_STATIONS: readonly CardioStation[] = [
  'treadmill',
  'rower',
  'bike',
  'heavyBag',
  'jumpRope',
  'floorCardio',
];

export const STATION_NAMES: Record<CardioStation | 'floor', string> = {
  treadmill: 'Treadmill',
  rower: 'Rower',
  bike: 'Bike',
  heavyBag: 'Boxing bag',
  jumpRope: 'Jump rope',
  floorCardio: 'Floor cardio',
  floor: 'Floor',
};

/** The equipment each cardio station needs. Floor cardio needs none. */
const STATION_GEAR: Record<CardioStation, EquipmentId | null> = {
  treadmill: 'treadmill',
  rower: 'rower',
  bike: 'bike',
  heavyBag: 'heavyBag',
  jumpRope: 'jumpRope',
  floorCardio: null,
};

export const CIRCUIT_MINUTES = [30, 45, 60] as const;
export type CircuitMinutes = (typeof CIRCUIT_MINUTES)[number];

/** How many strength moves the floor station rotates through. */
export const FLOOR_MOVES: Record<CircuitMinutes, number> = { 30: 4, 45: 5, 60: 6 };

export interface CircuitPlan {
  /** One or two cardio stations. */
  stations: CardioStation[];
  minutes: CircuitMinutes;
}

/**
 * Picks the cardio stations from the equipment you own. With more than two machines, two are
 * chosen at random, so a shuffle can change them. With none, floor cardio is the station.
 */
export function pickStations(owned: ReadonlySet<EquipmentId>, seed: number): CardioStation[] {
  const machines = CARDIO_STATIONS.filter((station) => {
    const gear = STATION_GEAR[station];
    return gear !== null && owned.has(gear);
  });
  if (machines.length === 0) return ['floorCardio'];
  const random = createRandom(seed);
  const shuffled = [...machines].sort(() => random() - 0.5);
  // Keep the picked stations in catalog order, so the treadmill leads like it does in class.
  return machines.filter((station) => shuffled.slice(0, 2).includes(station));
}

/** One block of the circuit, for showing the plan before you start. */
export interface CircuitBlock {
  kind: 'warmup' | 'station' | 'cooldown';
  station?: CardioStation | 'floor';
  seconds: number;
}

const TRANSITION = 60;

/**
 * The order and length of each block. Two cardio stations get one long block each with the floor
 * between, like Orangetheory. One station alternates with the floor twice, like Barry's.
 */
export function circuitBlocks(plan: CircuitPlan): CircuitBlock[] {
  const total = plan.minutes * 60;
  const [first, second] = plan.stations;
  const order: (CardioStation | 'floor')[] = second ? [first, 'floor', second] : [first, 'floor', first, 'floor'];
  const warmUp = plan.minutes === 30 ? 240 : 300;
  const transitions = (order.length - 1) * TRANSITION;
  // Blocks are whole minutes. Whatever is left over goes to the cool-down, which is at least 3 minutes.
  const block = Math.floor((total - warmUp - transitions - 180) / order.length / 60) * 60;
  const coolDown = total - warmUp - transitions - block * order.length;
  return [
    { kind: 'warmup', seconds: warmUp },
    ...order.map((station) => ({ kind: 'station' as const, station, seconds: block })),
    { kind: 'cooldown', seconds: coolDown },
  ];
}

type Zone = 'base' | 'push' | 'allOut' | 'recover';

const ZONE_EFFORT: Record<Zone, Effort> = { base: 'moderate', push: 'hard', allOut: 'max', recover: 'easy' };
const ZONE_LABELS: Record<Zone, string> = { base: 'base', push: 'push', allOut: 'all out', recover: 'recover' };

/** A 4-minute wave of efforts that repeats through each cardio block. */
const WAVE: [Zone, number][] = [
  ['base', 120],
  ['push', 60],
  ['allOut', 30],
  ['recover', 30],
];
const WAVE_SECONDS = WAVE.reduce((sum, [, seconds]) => sum + seconds, 0);

interface StationGuide {
  /** Library exercise whose video teaches the station. */
  exerciseId: string;
  warmUp: string;
  cues: Record<Zone, string>;
}

const GUIDES: Record<CardioStation, StationGuide> = {
  treadmill: {
    exerciseId: 'treadmill-run',
    warmUp: 'Walk, then an easy jog. Walkers can raise the incline instead of the speed all session.',
    cues: {
      base: 'A jog or brisk walk you could hold all day, about 6–9 km/h (3.7–5.5 mph).',
      push: 'Add 1–2 km/h (about 1 mph) or 2% incline. Breathing hard, still in control.',
      allOut: 'Your fastest safe speed, or a steep incline walk. Hold on to nothing.',
      recover: 'Slow to a walk. Let your breathing come back.',
    },
  },
  rower: {
    exerciseId: 'rowing-machine',
    warmUp: 'Easy rowing at 18–20 strokes a minute. Legs, then body, then arms.',
    cues: {
      base: 'Rate 22–24. Long, strong strokes you could hold all day.',
      push: 'Rate 26–28. Drive harder with the legs.',
      allOut: 'Everything you have. Fast hands away, big legs.',
      recover: 'Light paddle at rate 18–20.',
    },
  },
  bike: {
    exerciseId: 'exercise-bike',
    warmUp: 'Spin easy with light resistance.',
    cues: {
      base: 'Moderate resistance at a steady cadence you could hold all day.',
      push: 'Add resistance and keep your cadence up.',
      allOut: 'Sprint. Fastest cadence you can hold.',
      recover: 'Drop the resistance and spin easy.',
    },
  },
  heavyBag: {
    exerciseId: 'bag-jab-cross',
    warmUp: 'Shadowbox, then light 1-2s on the bag. 1 is a jab, 2 a cross, 3 a lead hook.',
    cues: {
      base: 'Steady 1-2s. Stay light on your feet and snap each punch back.',
      push: 'Combos: 1-2-3, then 2-3-2. Turn your hips into the hooks.',
      allOut: 'Fast straight punches nonstop, both hands.',
      recover: 'Drop your hands, shake out your arms and keep your feet moving.',
    },
  },
  jumpRope: {
    exerciseId: 'jump-rope',
    warmUp: 'Easy bounces, then a few minutes of light skipping.',
    cues: {
      base: 'Easy two-foot bounce. Small jumps, wrists turn the rope.',
      push: 'Faster turns, or alternate feet like a light jog.',
      allOut: 'As fast as you can turn it.',
      recover: 'Put the rope down. Walk and breathe.',
    },
  },
  floorCardio: {
    exerciseId: 'high-knees',
    warmUp: 'March in place, then easy jumping jacks.',
    cues: {
      base: 'Steady jumping jacks. Arms all the way overhead.',
      push: 'High knees. Pump your arms.',
      allOut: 'Burpees at your fastest safe pace. Step back instead of jumping if you need to.',
      recover: 'March in place and breathe.',
    },
  },
};

/** Floor cardio switches moves with the effort, so each zone links to its own video. */
const FLOOR_CARDIO_MOVES: Record<Zone, string> = {
  base: 'jumping-jack',
  push: 'high-knees',
  allOut: 'burpee',
  recover: 'high-knees',
};

function cardioBlock(station: CardioStation, seconds: number): CardioStep[] {
  const guide = GUIDES[station];
  const name = STATION_NAMES[station];
  const exerciseFor = (zone: Zone) =>
    station === 'floorCardio' ? (zone === 'recover' ? undefined : FLOOR_CARDIO_MOVES[zone]) : guide.exerciseId;
  const make = (zone: Zone, length: number): CardioStep => {
    const exerciseId = exerciseFor(zone);
    return {
      label: `${name} · ${ZONE_LABELS[zone]}`,
      seconds: length,
      effort: ZONE_EFFORT[zone],
      cue: guide.cues[zone],
      ...(exerciseId ? { exerciseId } : {}),
    };
  };
  const steps: CardioStep[] = [];
  // Whatever doesn't fit a full wave becomes a longer base to settle in.
  const settle = seconds % WAVE_SECONDS;
  if (settle > 0) steps.push(make('base', settle));
  for (let i = 0; i < Math.floor(seconds / WAVE_SECONDS); i++) {
    for (const [zone, length] of WAVE) steps.push(make(zone, length));
  }
  return steps;
}

/** Moves done one side at a time ("per leg", "per arm") need a reminder to switch halfway. */
const isOneSided = (prescription: string) => /per (arm|leg|side)/i.test(prescription);

const FLOOR_WORK = 45;
const FLOOR_CHANGE = 15;

/** One minute per move: 45 seconds of work and 15 to change over. `start` continues the rotation. */
function floorBlock(exerciseIds: readonly string[], seconds: number, start: number): CardioStep[] {
  const exercises = exerciseIds.map(getExercise).filter((e) => !!e);
  const steps: CardioStep[] = [];
  const count = Math.floor(seconds / (FLOOR_WORK + FLOOR_CHANGE));
  for (let i = 0; i < count; i++) {
    const exercise = exercises[(start + i) % exercises.length];
    const next = exercises[(start + i + 1) % exercises.length];
    const sides = isOneSided(exercise.prescription) ? ' Switch sides halfway.' : '';
    steps.push({
      label: exercise.name,
      seconds: FLOOR_WORK,
      effort: 'hard',
      cue: `Steady reps with good form. Use a weight you could lift 12 to 15 times.${sides}`,
      exerciseId: exercise.id,
    });
    steps.push({
      label: 'Change over',
      seconds: FLOOR_CHANGE,
      effort: 'rest',
      cue: i < count - 1 ? `Next: ${next.name.toLowerCase()}.` : 'Floor block done. Breathe.',
    });
  }
  return steps;
}

const LEVELS: Record<CircuitMinutes, CardioLevel> = { 30: 'Beginner', 45: 'Intermediate', 60: 'Advanced' };

/** Turns a plan and the floor moves into a timed session for the guided timer. */
export function buildCircuit(name: string, exerciseIds: readonly string[], plan: CircuitPlan): CardioSession {
  const blocks = circuitBlocks(plan);
  const floorIds = exerciseIds.filter((id) => !!getExercise(id));
  const first = plan.stations[0];
  const steps: CardioStep[] = [];
  let floorDone = 0;
  blocks.forEach((block, i) => {
    if (block.kind === 'warmup') {
      steps.push({
        label: 'Warm up',
        seconds: block.seconds,
        effort: 'warmup',
        cue: GUIDES[first].warmUp,
        exerciseId: GUIDES[first].exerciseId,
      });
      return;
    }
    if (block.kind === 'cooldown') {
      steps.push({
        label: 'Cool down',
        seconds: 120,
        effort: 'easy',
        cue: 'Walk around and let your heart rate come down.',
      });
      steps.push({
        label: 'Stretch',
        seconds: block.seconds - 120,
        effort: 'stretch',
        cue: 'Hold each stretch for 20 to 30 seconds: hamstrings, quads, hips, chest and shoulders.',
      });
      return;
    }
    const station = block.station!;
    if (station === 'floor') {
      steps.push(...floorBlock(floorIds, block.seconds, floorDone));
      floorDone += Math.floor(block.seconds / (FLOOR_WORK + FLOOR_CHANGE));
    } else {
      steps.push(...cardioBlock(station, block.seconds));
    }
    const next = blocks[i + 1];
    if (next?.kind === 'station') {
      const nextStation = next.station!;
      const firstMove = getExercise(floorIds[floorDone % floorIds.length]);
      steps.push({
        label: `Move to the ${STATION_NAMES[nextStation].toLowerCase()}`,
        seconds: TRANSITION,
        effort: 'rest',
        cue:
          nextStation === 'floor'
            ? `Sip some water and set up for ${firstMove?.name.toLowerCase() ?? 'the first move'}.`
            : `Sip some water and get on the ${STATION_NAMES[nextStation].toLowerCase()}. Start easy.`,
      });
    }
  });

  const stationList = [...new Set(blocks.flatMap((b) => (b.station ? [STATION_NAMES[b.station].toLowerCase()] : [])))];
  const listed =
    stationList.length > 1 ? `${stationList.slice(0, -1).join(', ')} and ${stationList.at(-1)}` : stationList[0];
  return {
    id: 'circuit',
    name: `${name} bootcamp`,
    summary: `Stations: ${listed}. Base, push and all-out efforts on cardio, strength moves on the floor.`,
    level: LEVELS[plan.minutes],
    category: 'bootcamp',
    needs: plan.stations.map((s) => STATION_GEAR[s]).filter((gear): gear is EquipmentId => gear !== null),
    techniqueExerciseId: GUIDES[first].exerciseId,
    steps,
  };
}

/** Keeps a plan valid, whatever a link or old saved data says. */
export function normalizePlan(input: { stations?: readonly string[]; minutes?: number }): CircuitPlan {
  const stations = (input.stations ?? [])
    .filter((s): s is CardioStation => (CARDIO_STATIONS as readonly string[]).includes(s))
    .filter((s, i, all) => all.indexOf(s) === i)
    .slice(0, 2);
  const minutes = CIRCUIT_MINUTES.includes(input.minutes as CircuitMinutes) ? (input.minutes as CircuitMinutes) : 45;
  return { stations: stations.length ? stations : ['floorCardio'], minutes };
}

/** Route parameters for the timer screen, so a circuit can be opened like any other session. */
export function circuitParams(name: string, exerciseIds: readonly string[], plan: CircuitPlan) {
  return {
    id: 'circuit',
    name,
    ids: exerciseIds.join(','),
    stations: plan.stations.join(','),
    minutes: String(plan.minutes),
  };
}

/** Reads circuit route parameters back. Unknown exercise ids are dropped; returns null if none are left. */
export function parseCircuitParams(params: Record<string, string | string[] | undefined>): {
  name: string;
  exerciseIds: string[];
  plan: CircuitPlan;
} | null {
  const one = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };
  const exerciseIds = (one('ids') ?? '').split(',').filter((id) => !!getExercise(id));
  if (exerciseIds.length === 0) return null;
  return {
    name: (one('name') ?? 'Full body').slice(0, 40),
    exerciseIds,
    plan: normalizePlan({ stations: (one('stations') ?? '').split(','), minutes: Number(one('minutes')) }),
  };
}
