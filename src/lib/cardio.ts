import type { EquipmentId } from './equipment';

/** How hard to work during a step. */
export type Effort = 'warmup' | 'easy' | 'moderate' | 'hard' | 'max' | 'rest' | 'stretch' | 'mobility';

export const EFFORT_LABELS: Record<Effort, string> = {
  warmup: 'Warm-up',
  easy: 'Easy',
  moderate: 'Moderate',
  hard: 'Hard',
  max: 'All out',
  rest: 'Rest',
  stretch: 'Stretch',
  mobility: 'Mobility',
};

/** What each effort feels like, using the talk test. Shown on the session overview. */
export const EFFORT_GUIDE: Record<Exclude<Effort, 'warmup'>, string> = {
  easy: 'You can hold a full conversation.',
  moderate: 'You can talk in short sentences.',
  hard: 'You can say a few words at a time.',
  max: 'You can’t talk. Hold it only for the short interval.',
  rest: 'Stop, breathe and shake it out.',
  stretch: 'A gentle pull, never pain. Breathe slowly and relax into it.',
  mobility: 'Slow, controlled movement through a range that feels easy.',
};

export interface CardioStep {
  label: string;
  seconds: number;
  effort: Effort;
  /** What to do, shown large during the step. */
  cue: string;
  /** Library exercise for this step, so the player can link to its video. */
  exerciseId?: string;
}

export type CardioCategory =
  | 'rower'
  | 'treadmill'
  | 'bag'
  | 'kettlebell'
  | 'trx'
  | 'bike'
  | 'rope'
  | 'bodyweight'
  | 'quiet'
  | 'stretch'
  | 'mobility'
  | 'bootcamp';

export const CARDIO_CATEGORY_LABELS: Record<CardioCategory, string> = {
  rower: 'Rower',
  treadmill: 'Treadmill',
  bag: 'Boxing bag',
  kettlebell: 'Kettlebell conditioning',
  trx: 'TRX conditioning',
  bike: 'Bike',
  rope: 'Jump rope',
  bodyweight: 'No equipment',
  quiet: 'Quiet: no jumping',
  stretch: 'Stretching',
  mobility: 'Mobility',
  bootcamp: 'Bootcamp',
};

export type CardioLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface CardioSession {
  id: string;
  name: string;
  summary: string;
  level: CardioLevel;
  category: CardioCategory;
  /** Every item is needed. An empty list means no equipment. */
  needs: EquipmentId[];
  /** Library exercise whose video teaches the technique, such as rowing form. */
  techniqueExerciseId?: string;
  steps: CardioStep[];
}

const min = (minutes: number) => Math.round(minutes * 60);

const step = (label: string, seconds: number, effort: Effort, cue: string, exerciseId?: string): CardioStep => ({
  label,
  seconds,
  effort,
  cue,
  ...(exerciseId ? { exerciseId } : {}),
});

/** Repeats a block `count` times. `make` gets the 1-based round number. */
function rounds(count: number, make: (round: number) => CardioStep[]): CardioStep[] {
  return Array.from({ length: count }, (_, i) => make(i + 1)).flat();
}

/** A static stretch held for `seconds`, once or on each side. */
function hold(exerciseId: string, name: string, seconds: number, cue: string, sides = true): CardioStep[] {
  if (!sides) return [step(name, seconds, 'stretch', cue, exerciseId)];
  return [
    step(`${name} · left`, seconds, 'stretch', cue, exerciseId),
    step(`${name} · right`, seconds, 'stretch', `Switch sides. ${cue}`, exerciseId),
  ];
}

/** A controlled mobility move for `seconds`, once or on each side. */
function flow(exerciseId: string, name: string, seconds: number, cue: string, sides = false): CardioStep[] {
  if (!sides) return [step(name, seconds, 'mobility', cue, exerciseId)];
  return [
    step(`${name} · left`, seconds, 'mobility', cue, exerciseId),
    step(`${name} · right`, seconds, 'mobility', `Switch sides. ${cue}`, exerciseId),
  ];
}

/**
 * A Tabata block: eight rounds of 20 seconds all out. The 10 seconds between are active recovery,
 * not a stop, so you keep moving the whole way through.
 */
function tabata(name: string, exerciseId: string | undefined, cue: string, recover: string): CardioStep[] {
  return rounds(8, (r) => [
    step(`${name} · ${r} of 8`, 20, 'max', cue, exerciseId),
    step('Keep moving', 10, 'easy', recover),
  ]);
}

/** A move in a timed circuit: name, library exercise, cue and effort (hard by default). */
type Move = [name: string, exerciseId: string | undefined, cue: string, effort?: Effort];

/**
 * Runs `moves` back to back for `count` rounds, `work` seconds each, with `rest` seconds between
 * moves and `roundRest` after each round. Each rest names the next move. The last move has no rest.
 */
function circuit(count: number, work: number, rest: number, moves: Move[], roundRest = rest): CardioStep[] {
  return rounds(count, (r) =>
    moves.flatMap(([name, exerciseId, cue, effort = 'hard'], i) => {
      const last = i === moves.length - 1;
      const next = (last ? moves[0][0] : moves[i + 1][0]).toLowerCase();
      const move = step(`${name} · round ${r}`, work, effort, cue, exerciseId);
      const gap = last ? roundRest : rest;
      if ((last && r === count) || gap === 0) return [move];
      return [move, step('Rest', gap, 'rest', last ? `Round ${r} done. Next: ${next}.` : `Next: ${next}.`)];
    }),
  );
}

/**
 * Boxing combos use the standard punch numbers. Every bag session explains them on its first step.
 */
const PUNCH_KEY = '1 jab, 2 cross, 3 lead hook, 4 rear hook, 5 lead uppercut, 6 rear uppercut.';
const COMBOS = ['1-2', '1-1-2', '1-2-3', '2-3-2', '1-2-5-2', '3-4-3', 'Freestyle: mix everything'];

/** The library exercise whose video teaches the hardest punch in a combo. */
function comboExercise(combo: string): string {
  if (/[56]/.test(combo)) return 'bag-uppercuts';
  if (/[34]/.test(combo)) return 'bag-hooks';
  return 'bag-jab-cross';
}

const BAG_30_ROUNDS: [string, string, string][] = [
  ['1-2', 'bag-jab-cross', 'Throw 1-2 on repeat. Snap each punch back to your chin.'],
  ['1-1-2', 'bag-jab-cross', 'Double jab, then a hard cross. Step in on the jabs.'],
  ['body shots', 'bag-body-shots', 'Bend your knees and dig hooks to the body. Come back up to the head.'],
  ['1-2-3', 'bag-hooks', 'Jab, cross, lead hook. Turn your hips into the hook.'],
  ['slip and counter', 'bag-slip-drill', 'Slip left and right, then answer with a 1-2 every time.'],
  ['freestyle', 'bag-body-shots', 'Mix every punch, head and body. Keep your feet moving.'],
];

export const CARDIO_SESSIONS: readonly CardioSession[] = [
  // Rower
  {
    id: 'rower-steady-20',
    name: 'Steady 20',
    summary: 'Twenty minutes at a pace you can hold. The best way to build a base.',
    level: 'Beginner',
    category: 'rower',
    needs: ['rower'],
    techniqueExerciseId: 'rowing-machine',
    steps: [
      step('Warm up', min(5), 'warmup', 'Row light at about 20 strokes a minute. Legs, then body, then arms.'),
      step(
        'Steady row',
        min(12),
        'moderate',
        'Settle at 22–24 strokes a minute. Push hard with the legs and recover slowly.',
      ),
      step('Cool down', min(3), 'easy', 'Ease off to a gentle paddle and let your breathing settle.'),
    ],
  },
  {
    id: 'rower-minute-intervals',
    name: 'Minute on, minute off',
    summary: 'Eight hard minutes with easy recovery between. Short, sweaty and simple.',
    level: 'Intermediate',
    category: 'rower',
    needs: ['rower'],
    techniqueExerciseId: 'rowing-machine',
    steps: [
      step('Warm up', min(5), 'warmup', 'Easy rowing. Add three 10-stroke pushes in the last two minutes.'),
      ...rounds(8, (r) => [
        step(
          `Hard ${r} of 8`,
          min(1),
          'hard',
          '26–28 strokes a minute. Drive with the legs and hold the pace to the end.',
        ),
        step('Easy', min(1), 'easy', 'Paddle at rate 18–20. Keep moving.'),
      ]),
      step('Cool down', min(3), 'easy', 'Light rowing. Long, relaxed strokes.'),
    ],
  },
  {
    id: 'rower-pyramid',
    name: 'Pyramid',
    summary: 'Hard pieces of 1, 2, 3, 2 and 1 minutes. The middle is the toughest.',
    level: 'Advanced',
    category: 'rower',
    needs: ['rower'],
    techniqueExerciseId: 'rowing-machine',
    steps: [
      step('Warm up', min(5), 'warmup', 'Easy rowing, building to a moderate pace.'),
      step('Hard 1 min', min(1), 'hard', 'Rate 28. Strong legs, quick hands away.'),
      step('Easy', min(1), 'easy', 'Paddle and breathe.'),
      step('Hard 2 min', min(2), 'hard', 'Rate 26. Keep every stroke the same length.'),
      step('Easy', min(1), 'easy', 'Paddle and breathe.'),
      step('Hard 3 min', min(3), 'hard', 'Rate 24–26. This is the top of the pyramid. Stay smooth.'),
      step('Easy', min(2), 'easy', 'Paddle. You’re over the top.'),
      step('Hard 2 min', min(2), 'hard', 'Rate 26. Match your first 2-minute piece.'),
      step('Easy', min(1), 'easy', 'Paddle and breathe.'),
      step('All-out 1 min', min(1), 'max', 'Everything you have left.'),
      step('Cool down', min(3), 'easy', 'Light rowing until your breathing settles.'),
    ],
  },
  {
    id: 'rower-power-tens',
    name: 'Power tens 30',
    summary: 'Thirty minutes: steady rowing with ten hard strokes every two minutes.',
    level: 'Intermediate',
    category: 'rower',
    needs: ['rower'],
    techniqueExerciseId: 'rowing-machine',
    steps: [
      step('Warm up', min(5), 'warmup', 'Easy rowing at 18–20 strokes a minute. Legs, then body, then arms.'),
      ...rounds(10, (r) => [
        step(`Steady ${r} of 10`, 100, 'moderate', 'Rate 22–24. Long, strong strokes you could hold all day.'),
        step(`Power ten ${r} of 10`, 20, 'hard', 'Ten big strokes. Drive hard with the legs, then settle back down.'),
      ]),
      step('Cool down', min(5), 'easy', 'Light paddle. Let your heart rate come down.'),
    ],
  },
  {
    id: 'rower-four-by-six',
    name: '4 × 6 minutes',
    summary: 'Four 6-minute pieces with 2 minutes easy between. A 45-minute endurance builder.',
    level: 'Advanced',
    category: 'rower',
    needs: ['rower'],
    techniqueExerciseId: 'rowing-machine',
    steps: [
      step('Warm up', min(8), 'warmup', 'Easy rowing, then three 10-stroke pushes in the last three minutes.'),
      ...rounds(4, (r) => [
        step(
          `Piece ${r} of 4`,
          min(6),
          'hard',
          r === 4
            ? 'Rate 24–26. Last one: lift the pace for the final minute.'
            : 'Rate 24. Hold the same split all the way.',
        ),
        step('Easy', min(2), 'easy', 'Paddle at rate 18. Breathe and sip water.'),
      ]),
      step('Cool down', min(5), 'easy', 'Light rowing, long relaxed strokes.'),
    ],
  },
  {
    id: 'rower-tabata',
    name: 'Rower Tabata',
    summary:
      'Two Tabata blocks: 20 seconds all out, 10 seconds of easy rowing. You never stop moving. About 18 minutes.',
    level: 'Advanced',
    category: 'rower',
    needs: ['rower'],
    techniqueExerciseId: 'rowing-machine',
    steps: [
      step('Warm up', min(5), 'warmup', 'Easy rowing. Add three 10-stroke pushes in the last two minutes.'),
      ...tabata(
        'Sprint',
        'rowing-machine',
        'Rate 30 or more. Fast hands away, big legs.',
        'Light paddle. Keep the handle moving.',
      ),
      step('Keep moving', min(1), 'easy', 'Paddle at rate 18. Breathe.'),
      ...tabata(
        'Sprint',
        'rowing-machine',
        'Everything you have. Match your first block.',
        'Light paddle. Keep the handle moving.',
      ),
      step('Cool down', min(4), 'easy', 'Light rowing, long relaxed strokes.'),
    ],
  },
  // Treadmill
  {
    id: 'treadmill-walk-run',
    name: 'Walk to run',
    summary: 'Short jogs with walking breaks. A gentle start if you’re new to running.',
    level: 'Beginner',
    category: 'treadmill',
    needs: ['treadmill'],
    techniqueExerciseId: 'treadmill-run',
    steps: [
      step('Warm up', min(5), 'warmup', 'Brisk walk, about 5–6 km/h (3–3.7 mph).'),
      ...rounds(6, (r) => [
        step(`Jog ${r} of 6`, min(1), 'moderate', 'Easy jog, about 7–9 km/h (4.5–5.5 mph). Short, light steps.'),
        step('Walk', min(2), 'easy', 'Brisk walk. Let your breathing come back.'),
      ]),
      step('Cool down', min(5), 'easy', 'Slow walk.'),
    ],
  },
  {
    id: 'treadmill-hills',
    name: 'Hill walk',
    summary: 'Incline walking that gets your heart rate up without running.',
    level: 'Beginner',
    category: 'treadmill',
    needs: ['treadmill'],
    techniqueExerciseId: 'treadmill-run',
    steps: [
      step('Warm up', min(5), 'warmup', 'Walk flat at an easy pace.'),
      ...rounds(5, (r) => [
        step(`Hill ${r} of 5`, min(2), 'moderate', 'Raise the incline to 8–10%. Walk briskly. Don’t hold the rails.'),
        step('Flat', min(2), 'easy', 'Drop the incline to 1%. Keep walking.'),
      ]),
      step('Cool down', min(3), 'easy', 'Slow walk on the flat.'),
    ],
  },
  {
    id: 'treadmill-speed',
    name: 'Speed intervals',
    summary: 'Thirty-second fast runs with easy jogging between.',
    level: 'Intermediate',
    category: 'treadmill',
    needs: ['treadmill'],
    techniqueExerciseId: 'treadmill-run',
    steps: [
      step('Warm up', min(5), 'warmup', 'Walk for 2 minutes, then an easy jog.'),
      ...rounds(8, (r) => [
        step(`Fast ${r} of 8`, 30, 'hard', 'Run fast but in control, about 12–15 km/h (7.5–9 mph).'),
        step('Easy jog', 90, 'easy', 'Slow right down to an easy jog or a walk.'),
      ]),
      step('Cool down', min(4), 'easy', 'Easy jog, then walk.'),
    ],
  },
  {
    id: 'treadmill-tempo',
    name: 'Tempo 32',
    summary: 'Three 6-minute tempo runs with easy jogging between. About 32 minutes.',
    level: 'Intermediate',
    category: 'treadmill',
    needs: ['treadmill'],
    techniqueExerciseId: 'treadmill-run',
    steps: [
      step('Warm up', min(5), 'warmup', 'Walk for 2 minutes, then an easy jog.'),
      ...rounds(3, (r) => [
        step(
          `Tempo ${r} of 3`,
          min(6),
          'hard',
          'Comfortably hard: a pace you could hold for about an hour in a race. Short, quick steps.',
        ),
        step('Easy jog', min(2), 'easy', 'Slow to an easy jog or a brisk walk.'),
      ]),
      step('Cool down', min(3), 'easy', 'Easy jog, then walk.'),
    ],
  },
  {
    id: 'treadmill-rolling-hills',
    name: 'Rolling hills 45',
    summary: 'Forty-five minutes of climbs and flats. Walk or jog them. About 45 minutes.',
    level: 'Beginner',
    category: 'treadmill',
    needs: ['treadmill'],
    techniqueExerciseId: 'treadmill-run',
    steps: [
      step('Warm up', min(5), 'warmup', 'Walk on the flat at an easy pace.'),
      ...rounds(6, (r) => [
        step(
          `Climb ${r} of 6`,
          min(3),
          'moderate',
          'Raise the incline to 6–8%. Walk briskly or jog. Don’t hold the rails.',
        ),
        step('Flat', min(2), 'easy', 'Drop the incline to 1%. Keep moving at an easy pace.'),
      ]),
      step('Steady', min(5), 'moderate', 'Flat, at a pace that makes you breathe harder but still talk.'),
      step('Cool down', min(5), 'easy', 'Slow walk.'),
    ],
  },
  {
    id: 'treadmill-hill-pyramid',
    name: 'Hill pyramid',
    summary: 'Walk up a pyramid of inclines, from 4% to 12% and back down. No running needed. About 30 minutes.',
    level: 'Intermediate',
    category: 'treadmill',
    needs: ['treadmill'],
    techniqueExerciseId: 'treadmill-run',
    steps: [
      step('Warm up', min(5), 'warmup', 'Walk flat at an easy pace.'),
      ...[4, 6, 8, 10, 12, 10, 8, 6, 4].flatMap((incline, i) => [
        step(
          `Incline ${incline}%`,
          min(2),
          incline >= 10 ? 'hard' : 'moderate',
          incline === 12
            ? 'The top of the pyramid. Short steps, tall chest, hands off the rails.'
            : `Set the incline to ${incline}%. Brisk walk, hands off the rails.`,
        ),
        ...(i < 8 ? [step('Flat', 30, 'easy' as const, 'Drop to 1% and keep walking.')] : []),
      ]),
      step('Cool down', min(3), 'easy', 'Slow walk on the flat.'),
    ],
  },
  // Boxing bag
  {
    id: 'bag-basics',
    name: 'Bag basics',
    summary: 'Three rounds that teach the main punches one at a time.',
    level: 'Beginner',
    category: 'bag',
    needs: ['heavyBag'],
    techniqueExerciseId: 'bag-jab-cross',
    steps: [
      step(
        'Warm up',
        min(3),
        'warmup',
        `Shadowbox in front of the bag: light punches, bounce on your toes. Punch numbers: ${PUNCH_KEY}`,
      ),
      step('Round 1: jab-cross', min(3), 'moderate', 'Throw 1-2. Snap each punch back to your chin.', 'bag-jab-cross'),
      step('Rest', min(1), 'rest', 'Walk around. Hands down, breathe.'),
      step(
        'Round 2: hooks',
        min(3),
        'moderate',
        'Alternate lead and rear hooks. Turn your hips with every punch.',
        'bag-hooks',
      ),
      step('Rest', min(1), 'rest', 'Walk around. Hands down, breathe.'),
      step(
        'Round 3: uppercuts',
        min(3),
        'hard',
        'Stand close. Drive up from your legs. Finish with 30 seconds of fast 1-2s.',
        'bag-uppercuts',
      ),
      step('Cool down', min(2), 'easy', 'Slow shadowboxing, then stretch your shoulders and chest.'),
    ],
  },
  {
    id: 'bag-power-rounds',
    name: 'Power rounds',
    summary: 'Six 2-minute rounds, each with its own combination.',
    level: 'Intermediate',
    category: 'bag',
    needs: ['heavyBag'],
    techniqueExerciseId: 'bag-jab-cross',
    steps: [
      step('Warm up', min(3), 'warmup', `Shadowbox and learn the punch numbers: ${PUNCH_KEY}`),
      ...rounds(6, (r) => [
        step(
          r === 6 ? 'Round 6: freestyle' : `Round ${r}: ${COMBOS[r - 1]}`,
          min(2),
          'hard',
          r === 6
            ? 'Last round. Mix every punch and keep your hands moving.'
            : `Throw ${COMBOS[r - 1]} on repeat. Reset your stance after each combo.`,
          r === 6 ? 'bag-body-shots' : comboExercise(COMBOS[r - 1]),
        ),
        ...(r < 6 ? [step('Rest', min(1), 'rest' as const, 'Breathe and shake out your arms.')] : []),
      ]),
      step('Cool down', min(2), 'easy', 'Slow shadowboxing, then stretch.'),
    ],
  },
  {
    id: 'bag-tabata',
    name: 'Bag Tabata',
    summary: 'Two blocks of 20 seconds all out, 10 seconds of light punching. You never stop moving. About 14 minutes.',
    level: 'Advanced',
    category: 'bag',
    needs: ['heavyBag'],
    techniqueExerciseId: 'bag-jab-cross',
    steps: [
      step('Warm up', min(3), 'warmup', `Shadowbox, then light 1-2s on the bag. Punch numbers: ${PUNCH_KEY}`),
      ...tabata(
        'Block 1',
        'bag-jab-cross',
        'Fast straight punches. 1-2-1-2 as quick as you can.',
        'Light punches and keep your feet moving.',
      ),
      step('Keep moving', min(1), 'easy', 'Slow shadowboxing. Breathe. Hooks and uppercuts next.'),
      ...tabata(
        'Block 2',
        'bag-hooks',
        'Hooks and uppercuts. Stay close to the bag.',
        'Light punches and keep your feet moving.',
      ),
      step('Cool down', min(2), 'easy', 'Walk, then stretch your shoulders.'),
    ],
  },
  {
    id: 'bag-30',
    name: 'Bag 30',
    summary: 'Six 3-minute rounds, each with its own focus. About 30 minutes.',
    level: 'Intermediate',
    category: 'bag',
    needs: ['heavyBag'],
    techniqueExerciseId: 'bag-jab-cross',
    steps: [
      step('Warm up', min(4), 'warmup', `Shadowbox and bounce on your toes. Punch numbers: ${PUNCH_KEY}`),
      ...BAG_30_ROUNDS.flatMap(([focus, exerciseId, cue], i) => [
        step(`Round ${i + 1}: ${focus}`, min(3), 'hard', cue, exerciseId),
        ...(i < BAG_30_ROUNDS.length - 1
          ? [step('Rest', min(1), 'rest' as const, 'Walk, breathe, shake out your arms.')]
          : []),
      ]),
      step('Cool down', min(3), 'easy', 'Slow shadowboxing, then stretch your shoulders and chest.'),
    ],
  },
  {
    id: 'bag-nine-rounds',
    name: 'Nine rounds',
    summary:
      'A fight-length workout: nine 3-minute rounds with a 30-second burnout every third round. About 43 minutes.',
    level: 'Advanced',
    category: 'bag',
    needs: ['heavyBag'],
    techniqueExerciseId: 'bag-jab-cross',
    steps: [
      step('Warm up', min(5), 'warmup', `Shadowbox, then light 1-2s on the bag. Punch numbers: ${PUNCH_KEY}`),
      ...rounds(9, (r) => {
        const combo = COMBOS[(r - 1) % COMBOS.length];
        const burnout = r % 3 === 0;
        return [
          step(
            `Round ${r}: ${combo.startsWith('Freestyle') ? 'freestyle' : combo}`,
            min(3),
            burnout ? 'max' : 'hard',
            `${combo.startsWith('Freestyle') ? 'Mix everything, head and body.' : `Throw ${combo} on repeat.`}${
              burnout ? ' Last 30 seconds: nonstop fast straight punches.' : ' Reset your stance after each combo.'
            }`,
            combo.startsWith('Freestyle') ? 'bag-body-shots' : comboExercise(combo),
          ),
          ...(r < 9 ? [step('Rest', min(1), 'rest' as const, 'Walk, breathe, sip water.')] : []),
        ];
      }),
      step('Cool down', min(3), 'easy', 'Slow shadowboxing, then stretch.'),
    ],
  },
  {
    id: 'bag-box-plyo-9',
    name: 'Box and plyo 9',
    summary:
      'Nine 3-minute stations that switch between the bag and plyometrics, with 30 seconds of active recovery between. About 37 minutes.',
    level: 'Intermediate',
    category: 'bag',
    needs: ['heavyBag'],
    techniqueExerciseId: 'bag-jab-cross',
    steps: [
      step('Warm up', min(3), 'warmup', `Jumping jacks, then shadowbox. Punch numbers: ${PUNCH_KEY}`, 'jumping-jack'),
      step(
        'Station 1: jab-cross',
        min(3),
        'hard',
        'Throw 1-2 on repeat. Last 30 seconds: as fast as you can.',
        'bag-jab-cross',
      ),
      step('Active recovery', 30, 'easy', 'Bounce on your toes. Next: jump squats and burpees.'),
      step('Station 2: jump squats', 90, 'hard', 'Sit back, explode up and land softly.', 'jump-squat'),
      step('Station 2: burpees', 90, 'max', 'Steady pace. Step back instead of jumping if you need to.', 'burpee'),
      step('Active recovery', 30, 'easy', 'Walk and breathe. Next: hooks on the bag.'),
      step('Station 3: hooks', min(3), 'hard', 'Lead and rear hooks. Turn your hips into every punch.', 'bag-hooks'),
      step('Active recovery', 30, 'easy', 'Shake out your arms. Next: mountain climbers.'),
      step(
        'Station 4: mountain climbers',
        min(3),
        'hard',
        'Hips low, knees in fast. Slow down if your form slips.',
        'mountain-climber',
      ),
      step('Active recovery', 30, 'easy', 'March in place. Next: uppercuts.'),
      step('Station 5: uppercuts', min(3), 'hard', 'Stand close. Drive up from your legs.', 'bag-uppercuts'),
      step('Active recovery', 30, 'easy', 'Bounce on your toes. Next: high knees and jacks.'),
      step('Station 6: high knees', 90, 'hard', 'Knees to hip height. Pump your arms.', 'high-knees'),
      step('Station 6: jumping jacks', 90, 'hard', 'Arms all the way overhead.', 'jumping-jack'),
      step('Active recovery', 30, 'easy', 'Walk and breathe. Next: body shots.'),
      step(
        'Station 7: body shots',
        min(3),
        'hard',
        'Bend your knees and dig hooks to the body. Come back up to the head.',
        'bag-body-shots',
      ),
      step('Active recovery', 30, 'easy', 'Shake out your arms. Next: squat jumps and climbers.'),
      step('Station 8: jump squats', 90, 'max', 'Fast and springy. Land softly.', 'jump-squat'),
      step('Station 8: mountain climbers', 90, 'max', 'Drive your knees in. Nearly done.', 'mountain-climber'),
      step('Active recovery', 30, 'easy', 'Gloves on. Last station: freestyle on the bag.'),
      step(
        'Station 9: freestyle',
        min(3),
        'max',
        'Mix every punch, head and body. Empty the tank in the last 30 seconds.',
        'bag-body-shots',
      ),
      step('Cool down', min(3), 'easy', 'Walk, then stretch your shoulders, chest and hips.'),
    ],
  },
  {
    id: 'bag-box-plyo-express',
    name: 'Box and plyo express',
    summary:
      'Six 2-minute stations, bag and plyometrics in turn, with 30 seconds of active recovery between. About 20 minutes.',
    level: 'Beginner',
    category: 'bag',
    needs: ['heavyBag'],
    techniqueExerciseId: 'bag-jab-cross',
    steps: [
      step('Warm up', min(3), 'warmup', `Jumping jacks, then shadowbox. Punch numbers: ${PUNCH_KEY}`, 'jumping-jack'),
      step('Station 1: jab-cross', min(2), 'hard', 'Throw 1-2 on repeat. Snap each punch back.', 'bag-jab-cross'),
      step('Active recovery', 30, 'easy', 'Bounce on your toes. Next: jump squats.'),
      step(
        'Station 2: jump squats',
        min(2),
        'hard',
        'Sit back and jump. Swap to regular squats if you need to.',
        'jump-squat',
      ),
      step('Active recovery', 30, 'easy', 'Walk and breathe. Next: hooks.'),
      step('Station 3: hooks', min(2), 'hard', 'Lead and rear hooks. Turn your hips.', 'bag-hooks'),
      step('Active recovery', 30, 'easy', 'Shake out your arms. Next: mountain climbers.'),
      step('Station 4: mountain climbers', min(2), 'hard', 'Hips low, knees in. Steady pace.', 'mountain-climber'),
      step('Active recovery', 30, 'easy', 'March in place. Next: freestyle on the bag.'),
      step('Station 5: freestyle', min(2), 'hard', 'Mix every punch, head and body.', 'bag-body-shots'),
      step('Active recovery', 30, 'easy', 'Walk and breathe. Last station: burpees.'),
      step('Station 6: burpees', min(2), 'max', 'Steady reps. Step back instead of jumping if you need to.', 'burpee'),
      step('Cool down', min(2.5), 'easy', 'Walk, then stretch your shoulders and hips.'),
    ],
  },
  // Kettlebell conditioning
  {
    id: 'kettlebell-basics',
    name: 'Kettlebell basics',
    summary: 'Four moves, 30 seconds on and 30 off. Learn the patterns while your heart rate climbs.',
    level: 'Beginner',
    category: 'kettlebell',
    needs: ['kettlebell'],
    techniqueExerciseId: 'kettlebell-swing',
    steps: [
      step('Warm up', min(3), 'warmup', 'Halos, bodyweight squats and a few light hip hinges.', 'kettlebell-halo'),
      ...rounds(4, (r) => [
        step(`Swings · round ${r}`, 30, 'hard', 'Snap your hips. The bell floats to chest height.', 'kettlebell-swing'),
        step('Rest', 30, 'rest', 'Next: goblet squats.'),
        step(
          `Goblet squats · round ${r}`,
          30,
          'moderate',
          'Bell at your chest, sit between your knees.',
          'goblet-squat',
        ),
        step('Rest', 30, 'rest', 'Next: rows.'),
        step(`Rows · round ${r}`, 30, 'moderate', 'Switch arms halfway through.', 'kettlebell-row'),
        step('Rest', 30, 'rest', 'Next: presses.'),
        step(
          `Presses · round ${r}`,
          30,
          'moderate',
          'Switch arms halfway through. Brace your core.',
          'kettlebell-press',
        ),
        step('Rest', 30, 'rest', r < 4 ? 'Round done. Next: swings.' : 'Last rest.'),
      ]),
      step('Cool down', min(2), 'easy', 'Walk around, then stretch your hips and shoulders.'),
    ],
  },
  {
    id: 'kettlebell-burner',
    name: 'Kettlebell burner',
    summary:
      'Five rounds of 40 seconds on, 20 off. Swings, cleans, squats and single-leg deadlifts, then a get-up finisher.',
    level: 'Advanced',
    category: 'kettlebell',
    needs: ['kettlebell'],
    techniqueExerciseId: 'kettlebell-swing',
    steps: [
      step('Warm up', min(4), 'warmup', 'Halos, light swings and a slow get-up each side.', 'kettlebell-halo'),
      ...rounds(5, (r) => [
        step(`Swings · round ${r}`, 40, 'hard', 'Hard, fast hips. Keep your back flat.', 'kettlebell-swing'),
        step('Rest', 20, 'rest', 'Next: cleans.'),
        step(`Cleans · round ${r}`, 40, 'hard', 'Left arm for 20 seconds, then right.', 'kettlebell-clean'),
        step('Rest', 20, 'rest', 'Next: goblet squats.'),
        step(`Goblet squats · round ${r}`, 40, 'hard', 'Steady reps, full depth.', 'goblet-squat'),
        step('Rest', 20, 'rest', 'Next: single-leg deadlifts.'),
        step(
          `Single-leg deadlifts · round ${r}`,
          40,
          'moderate',
          'Switch legs halfway. Slow and balanced.',
          'single-leg-rdl',
        ),
        step('Rest', 20, 'rest', r < 5 ? 'Round done. Back to swings.' : 'Last rest. One get-up each side next.'),
      ]),
      step(
        'Get-up finisher',
        min(2),
        'moderate',
        'One slow Turkish get-up on each side, with a lighter bell than your swing bell. Quality over speed.',
        'turkish-get-up',
      ),
      step('Cool down', min(2), 'easy', 'Walk, then stretch your hamstrings and shoulders.'),
    ],
  },
  {
    id: 'kettlebell-swing-intervals',
    name: 'Swing intervals',
    summary: 'Ten rounds of 30 seconds of swings and 30 seconds of easy marching. About 15 minutes.',
    level: 'Beginner',
    category: 'kettlebell',
    needs: ['kettlebell'],
    techniqueExerciseId: 'kettlebell-swing',
    steps: [
      step('Warm up', min(3), 'warmup', 'Halos, bodyweight squats and a few light hip hinges.', 'kettlebell-halo'),
      ...rounds(10, (r) => [
        step(
          `Swings ${r} of 10`,
          30,
          'hard',
          'Snap your hips. The bell floats to chest height. Arms stay loose.',
          'kettlebell-swing',
        ),
        step('March', 30, 'easy', r < 10 ? 'Set the bell down and march in place.' : 'Last one done. Keep walking.'),
      ]),
      step('Cool down', min(2), 'easy', 'Walk, then stretch your hamstrings and hips.'),
    ],
  },
  {
    id: 'kettlebell-tabata',
    name: 'Kettlebell Tabata',
    summary:
      'Two Tabata blocks, swings then goblet squats: 20 seconds all out, 10 seconds easy. You never stop moving. About 14 minutes.',
    level: 'Advanced',
    category: 'kettlebell',
    needs: ['kettlebell'],
    techniqueExerciseId: 'kettlebell-swing',
    steps: [
      step('Warm up', min(3), 'warmup', 'Halos, light swings and bodyweight squats.', 'kettlebell-halo'),
      ...tabata('Swings', 'kettlebell-swing', 'Fast, powerful hips.', 'Set the bell down and march in place.'),
      step('Keep moving', min(1), 'easy', 'Walk and shake out your grip. Goblet squats next.'),
      ...tabata('Goblet squats', 'goblet-squat', 'Steady reps, full depth.', 'Hold the bell at your chest and march.'),
      step('Cool down', min(2), 'easy', 'Walk, then stretch your hips and quads.'),
    ],
  },
  {
    id: 'kettlebell-complex',
    name: 'Kettlebell complex',
    summary: 'Five rounds of deadlift, clean, press, squat and row with one bell, then rest. About 29 minutes.',
    level: 'Intermediate',
    category: 'kettlebell',
    needs: ['kettlebell'],
    techniqueExerciseId: 'kettlebell-clean',
    steps: [
      step('Warm up', min(3), 'warmup', 'Halos, light deadlifts and a few presses each arm.', 'kettlebell-halo'),
      ...circuit(
        5,
        40,
        10,
        [
          ['Deadlifts', 'kettlebell-deadlift', 'Hips back, flat back, stand tall.'],
          ['Cleans', 'kettlebell-clean', 'Left arm for 20 seconds, then right.'],
          ['Presses', 'kettlebell-press', 'Left arm for 20 seconds, then right. Brace your core.', 'moderate'],
          ['Goblet squats', 'goblet-squat', 'Bell at your chest, sit between your knees.'],
          ['Rows', 'kettlebell-row', 'Left arm for 20 seconds, then right.', 'moderate'],
        ],
        60,
      ),
      step('Cool down', min(2), 'easy', 'Walk, then stretch your hamstrings and shoulders.'),
    ],
  },
  {
    id: 'kettlebell-carry-core',
    name: 'Carries and core',
    summary: 'Four rounds of carries, twists, halos and swings, 45 seconds on and 15 off. About 21 minutes.',
    level: 'Intermediate',
    category: 'kettlebell',
    needs: ['kettlebell'],
    techniqueExerciseId: 'farmer-carry',
    steps: [
      step('Warm up', min(3), 'warmup', 'Halos, then a slow walk holding the bell at your side.', 'kettlebell-halo'),
      ...circuit(4, 45, 15, [
        ['Suitcase carry', 'farmer-carry', 'Bell in one hand, walk tall. Switch hands halfway.', 'moderate'],
        ['Russian twists', 'russian-twist', 'Lean back a little and turn from your ribs.'],
        ['Halos', 'kettlebell-halo', 'Slow circles around your head. Switch direction halfway.', 'moderate'],
        ['Swings', 'kettlebell-swing', 'Snap your hips, brace your core at the top.'],
      ]),
      step('Cool down', min(2), 'easy', 'Walk, then stretch your back and hips.'),
    ],
  },
  // TRX conditioning
  {
    id: 'trx-circuit',
    name: 'TRX total body',
    summary: 'Four rounds of five suspension moves, 40 seconds on and 20 off.',
    level: 'Intermediate',
    category: 'trx',
    needs: ['suspension'],
    techniqueExerciseId: 'trx-row',
    steps: [
      step('Warm up', min(3), 'warmup', 'Easy TRX squats and rows. Find your foot position for each.', 'trx-squat'),
      ...rounds(4, (r) => [
        step(`Rows · round ${r}`, 40, 'hard', 'Walk your feet forward to make it harder.', 'trx-row'),
        step('Rest', 20, 'rest', 'Next: chest press. Turn around.'),
        step(`Chest press · round ${r}`, 40, 'hard', 'Body straight like a plank.', 'trx-chest-press'),
        step('Rest', 20, 'rest', 'Next: squats.'),
        step(
          `Squats · round ${r}`,
          40,
          'moderate',
          'Deep and steady. Add a jump at the top to push harder.',
          'trx-squat',
        ),
        step('Rest', 20, 'rest', 'Next: knee tucks. Lengthen the straps to mid-calf, feet in the cradles.'),
        step(`Knee tucks · round ${r}`, 40, 'hard', 'Hips level, knees to chest.', 'trx-knee-tuck'),
        step('Rest', 20, 'rest', 'Next: suspended lunges.'),
        step(`Lunges · round ${r}`, 40, 'moderate', 'Switch legs halfway.', 'trx-lunge'),
        step('Rest', 20, 'rest', r < 4 ? 'Round done. Next: rows.' : 'Last rest.'),
      ]),
      step('Cool down', min(2), 'easy', 'Stretch your chest and shoulders using the straps.'),
    ],
  },
  {
    id: 'trx-tabata',
    name: 'TRX Tabata',
    summary: 'Three Tabata blocks: 20 seconds all out, 10 seconds easy. You never stop moving. About 19 minutes.',
    level: 'Advanced',
    category: 'trx',
    needs: ['suspension'],
    techniqueExerciseId: 'trx-row',
    steps: [
      step('Warm up', min(3), 'warmup', 'Easy squats, rows and arm circles.', 'trx-squat'),
      ...tabata('Squat jumps', 'trx-squat', 'Hold the straps, sit back, jump.', 'Easy squats. Keep moving.'),
      step('Keep moving', min(1), 'easy', 'Easy squats and arm circles. Rows next.'),
      ...tabata('Fast rows', 'trx-row', 'Quick, controlled pulls.', 'Slow rows. Keep moving.'),
      step('Keep moving', min(1), 'easy', 'Walk and shake out your arms. Knee tucks next.'),
      ...tabata(
        'Knee tucks',
        'trx-knee-tuck',
        'Hips level. Stop early if your back sags.',
        'Hold a plank in the straps, or march in place.',
      ),
      step('Cool down', min(2), 'easy', 'Walk, then stretch.'),
    ],
  },
  {
    id: 'trx-starter',
    name: 'TRX starter',
    summary: 'Three rounds of four basic suspension moves, 30 seconds on and 30 off. About 18 minutes.',
    level: 'Beginner',
    category: 'trx',
    needs: ['suspension'],
    techniqueExerciseId: 'trx-row',
    steps: [
      step(
        'Warm up',
        min(3),
        'warmup',
        'Easy squats and rows holding the straps. Find your foot position.',
        'trx-squat',
      ),
      ...circuit(3, 30, 30, [
        ['Rows', 'trx-row', 'Stand more upright to make it easier.', 'moderate'],
        ['Squats', 'trx-squat', 'Sit back, use the straps for balance.', 'moderate'],
        ['Chest press', 'trx-chest-press', 'Body straight like a plank. Step back to make it easier.', 'moderate'],
        ['Hamstring curls', 'trx-hamstring-curl', 'Heels in the cradles, hips up, pull your heels in.', 'moderate'],
      ]),
      step('Cool down', min(3), 'easy', 'Stretch your chest and hamstrings using the straps.'),
    ],
  },
  {
    id: 'trx-upper',
    name: 'TRX upper body',
    summary: 'Three rounds of five upper-body moves, 40 seconds on and 20 off. About 20 minutes.',
    level: 'Intermediate',
    category: 'trx',
    needs: ['suspension'],
    techniqueExerciseId: 'trx-row',
    steps: [
      step('Warm up', min(3), 'warmup', 'Arm circles, then easy rows.', 'trx-row'),
      ...circuit(3, 40, 20, [
        ['Rows', 'trx-row', 'Squeeze your shoulder blades at the top.'],
        ['Chest press', 'trx-chest-press', 'Body straight like a plank.'],
        ['Y-raises', 'trx-y-raise', 'Arms long, thumbs up, lift into a Y.', 'moderate'],
        ['Biceps curls', 'trx-biceps-curl', 'Elbows high and still.', 'moderate'],
        [
          'Triceps extensions',
          'trx-triceps-extension',
          'Elbows point forward, press out to straight arms.',
          'moderate',
        ],
      ]),
      step('Cool down', min(2), 'easy', 'Stretch your chest, shoulders and arms.'),
    ],
  },
  {
    id: 'trx-lower-core',
    name: 'TRX legs and core',
    summary:
      'Four rounds of squats, lunges, hamstring curls and knee tucks, 40 seconds on and 20 off. About 21 minutes.',
    level: 'Intermediate',
    category: 'trx',
    needs: ['suspension'],
    techniqueExerciseId: 'trx-squat',
    steps: [
      step('Warm up', min(3), 'warmup', 'Easy squats and leg swings holding the straps.', 'trx-squat'),
      ...circuit(4, 40, 20, [
        ['Squats', 'trx-squat', 'Deep and steady. Add a jump at the top to push harder.'],
        ['Lunges', 'trx-lunge', 'Back foot in the cradle. Switch legs halfway.'],
        ['Hamstring curls', 'trx-hamstring-curl', 'Hips up the whole time.'],
        ['Knee tucks', 'trx-knee-tuck', 'Hips level, knees to chest.'],
      ]),
      step('Cool down', min(2), 'easy', 'Stretch your quads, hamstrings and hips.'),
    ],
  },
  {
    id: 'trx-30',
    name: 'TRX 30',
    summary: 'Five rounds of six moves for the whole body, 40 seconds on and 20 off. About 36 minutes.',
    level: 'Advanced',
    category: 'trx',
    needs: ['suspension'],
    techniqueExerciseId: 'trx-row',
    steps: [
      step('Warm up', min(3), 'warmup', 'Easy squats, rows and arm circles.', 'trx-squat'),
      ...circuit(5, 40, 20, [
        ['Rows', 'trx-row', 'Walk your feet forward to make it harder.'],
        ['Squats', 'trx-squat', 'Deep and steady.'],
        ['Chest press', 'trx-chest-press', 'Body straight like a plank.'],
        ['Lunges', 'trx-lunge', 'Switch legs halfway.'],
        ['Y-raises', 'trx-y-raise', 'Arms long, lift into a Y.', 'moderate'],
        ['Knee tucks', 'trx-knee-tuck', 'Hips level, knees to chest.'],
      ]),
      step('Cool down', min(3), 'easy', 'Stretch your chest, shoulders and hips using the straps.'),
    ],
  },
  // Bike
  {
    id: 'bike-intervals',
    name: 'Bike intervals',
    summary: 'Six hard minutes with easy spinning between.',
    level: 'Intermediate',
    category: 'bike',
    needs: ['bike'],
    techniqueExerciseId: 'exercise-bike',
    steps: [
      step('Warm up', min(5), 'warmup', 'Easy spin at low resistance.'),
      ...rounds(6, (r) => [
        step(`Hard ${r} of 6`, min(1), 'hard', 'Turn the resistance up and push. Stay seated.'),
        step('Easy', min(2), 'easy', 'Low resistance. Spin your legs out.'),
      ]),
      step('Cool down', min(4), 'easy', 'Easy spin.'),
    ],
  },
  {
    id: 'bike-steady-20',
    name: 'Steady 20',
    summary: 'Twenty minutes at a pace you can hold. An easy way to build a base.',
    level: 'Beginner',
    category: 'bike',
    needs: ['bike'],
    techniqueExerciseId: 'exercise-bike',
    steps: [
      step('Warm up', min(5), 'warmup', 'Easy spin at low resistance.'),
      step(
        'Steady ride',
        min(12),
        'moderate',
        'Moderate resistance at a cadence you could hold all day. You can still talk in short sentences.',
      ),
      step('Cool down', min(3), 'easy', 'Drop the resistance and spin easy.'),
    ],
  },
  {
    id: 'bike-tabata',
    name: 'Bike Tabata',
    summary:
      'Two Tabata blocks: 20 seconds of sprinting, 10 seconds of easy spinning. You never stop pedaling. About 18 minutes.',
    level: 'Advanced',
    category: 'bike',
    needs: ['bike'],
    techniqueExerciseId: 'exercise-bike',
    steps: [
      step('Warm up', min(5), 'warmup', 'Easy spin, then three 10-second fast spins in the last two minutes.'),
      ...tabata(
        'Sprint',
        'exercise-bike',
        'Add resistance and sprint. Stay seated.',
        'Drop the resistance and spin easy.',
      ),
      step('Keep moving', min(1), 'easy', 'Easy spin. Breathe.'),
      ...tabata(
        'Sprint',
        'exercise-bike',
        'Everything you have. Match your first block.',
        'Drop the resistance and spin easy.',
      ),
      step('Cool down', min(4), 'easy', 'Easy spin.'),
    ],
  },
  {
    id: 'bike-hills',
    name: 'Hill climbs',
    summary: 'Five 3-minute climbs at high resistance with easy spinning between. About 32 minutes.',
    level: 'Intermediate',
    category: 'bike',
    needs: ['bike'],
    techniqueExerciseId: 'exercise-bike',
    steps: [
      step('Warm up', min(5), 'warmup', 'Easy spin at low resistance.'),
      ...rounds(5, (r) => [
        step(
          `Climb ${r} of 5`,
          min(3),
          'hard',
          'Turn the resistance up until your cadence slows. Push steady, like climbing a hill.',
        ),
        step('Easy', min(2), 'easy', 'Drop the resistance and spin your legs out.'),
      ]),
      step('Cool down', min(2), 'easy', 'Easy spin.'),
    ],
  },
  {
    id: 'bike-pyramid',
    name: 'Bike pyramid',
    summary: 'Hard pieces of 1, 2, 3, 2 and 1 minutes. The middle is the toughest. About 24 minutes.',
    level: 'Intermediate',
    category: 'bike',
    needs: ['bike'],
    techniqueExerciseId: 'exercise-bike',
    steps: [
      step('Warm up', min(5), 'warmup', 'Easy spin, building to a moderate pace.'),
      step('Hard 1 min', min(1), 'hard', 'Add resistance and push.'),
      step('Easy', min(1), 'easy', 'Spin easy and breathe.'),
      step('Hard 2 min', min(2), 'hard', 'Hold the same effort the whole way.'),
      step('Easy', min(1), 'easy', 'Spin easy and breathe.'),
      step('Hard 3 min', min(3), 'hard', 'The top of the pyramid. Stay steady.'),
      step('Easy', min(2), 'easy', 'Spin easy. You’re over the top.'),
      step('Hard 2 min', min(2), 'hard', 'Match your first 2-minute piece.'),
      step('Easy', min(1), 'easy', 'Spin easy and breathe.'),
      step('All-out 1 min', min(1), 'max', 'Everything you have left.'),
      step('Cool down', min(5), 'easy', 'Easy spin until your breathing settles.'),
    ],
  },
  {
    id: 'bike-endurance-40',
    name: 'Endurance 40',
    summary: 'Forty minutes of steady riding with a 2-minute push every 8 minutes. About 40 minutes.',
    level: 'Advanced',
    category: 'bike',
    needs: ['bike'],
    techniqueExerciseId: 'exercise-bike',
    steps: [
      step('Warm up', min(5), 'warmup', 'Easy spin at low resistance.'),
      ...rounds(4, (r) => [
        step(`Steady ${r} of 4`, min(6), 'moderate', 'Moderate resistance you could hold all day.'),
        step(`Push ${r} of 4`, min(2), 'hard', 'Add resistance. Breathing hard, still in control.'),
      ]),
      step('Cool down', min(3), 'easy', 'Drop the resistance and spin easy.'),
    ],
  },
  // Jump rope
  {
    id: 'rope-builder',
    name: 'Rope builder',
    summary: 'Thirty-second rounds of skipping to build rhythm and fitness.',
    level: 'Beginner',
    category: 'rope',
    needs: ['jumpRope'],
    techniqueExerciseId: 'jump-rope',
    steps: [
      step('Warm up', min(2), 'warmup', 'Bounce on your toes and swing the rope at your side without jumping it.'),
      ...rounds(10, (r) => [
        step(`Skip ${r} of 10`, 30, 'hard', 'Small hops, wrists turning the rope. Don’t worry about trips.'),
        step('Rest', 30, 'rest', 'Shake out your calves.'),
      ]),
      step('Cool down', min(2), 'easy', 'Walk, then stretch your calves.'),
    ],
  },
  {
    id: 'rope-tabata',
    name: 'Rope Tabata',
    summary:
      'Two Tabata blocks: 20 seconds of fast skipping, 10 seconds of easy bouncing. You never stop moving. About 13 minutes.',
    level: 'Advanced',
    category: 'rope',
    needs: ['jumpRope'],
    techniqueExerciseId: 'jump-rope',
    steps: [
      step('Warm up', min(3), 'warmup', 'Easy bounces, then a few minutes of light skipping.', 'jump-rope'),
      ...tabata(
        'Fast skips',
        'jump-rope',
        'As fast as you can turn the rope.',
        'Bounce on your toes with the rope at your side.',
      ),
      step('Keep moving', min(1), 'easy', 'Walk and breathe. Try alternate feet next.'),
      ...tabata(
        'Fast feet',
        'jump-rope',
        'Alternate feet like a fast jog.',
        'Bounce on your toes with the rope at your side.',
      ),
      step('Cool down', min(1), 'easy', 'Walk, then stretch your calves.'),
    ],
  },
  {
    id: 'rope-styles',
    name: 'Rope styles',
    summary: 'Three rounds of five skipping styles, 40 seconds on and 20 off. About 20 minutes.',
    level: 'Intermediate',
    category: 'rope',
    needs: ['jumpRope'],
    techniqueExerciseId: 'jump-rope',
    steps: [
      step('Warm up', min(3), 'warmup', 'Easy bounces, then light skipping.', 'jump-rope'),
      ...circuit(3, 40, 20, [
        ['Two-foot bounce', 'jump-rope', 'Small hops, wrists turn the rope.', 'moderate'],
        ['Alternate feet', 'jump-rope', 'Like a light jog on the spot.'],
        ['Side to side', 'jump-rope', 'Hop a few inches left and right.'],
        ['Boxer skip', 'jump-rope', 'Shift your weight from foot to foot.', 'moderate'],
        ['High knees', 'jump-rope', 'Knees up, quick feet. Slow down if you trip a lot.'],
      ]),
      step('Cool down', min(2), 'easy', 'Walk, then stretch your calves and shins.'),
    ],
  },
  {
    id: 'rope-and-floor',
    name: 'Rope and floor',
    summary: 'Five rounds of skipping, squats and push-ups. Only needs a rope. About 22 minutes.',
    level: 'Intermediate',
    category: 'rope',
    needs: ['jumpRope'],
    techniqueExerciseId: 'jump-rope',
    steps: [
      step('Warm up', min(3), 'warmup', 'Easy bounces, then light skipping.', 'jump-rope'),
      ...circuit(
        5,
        60,
        0,
        [
          ['Skip', 'jump-rope', 'Steady skipping. Any style.'],
          ['Squats', 'bodyweight-squat', 'Sit deep, stand tall.', 'moderate'],
          ['Push-ups', 'push-up', 'Drop to your knees when your form slips.', 'moderate'],
        ],
        30,
      ),
      step('Cool down', min(2), 'easy', 'Walk, then stretch your calves, chest and quads.'),
    ],
  },
  {
    id: 'rope-endurance',
    name: 'Rope endurance',
    summary: 'Six 2-minute skips with a minute of rest between. Build your rhythm. About 22 minutes.',
    level: 'Intermediate',
    category: 'rope',
    needs: ['jumpRope'],
    techniqueExerciseId: 'jump-rope',
    steps: [
      step('Warm up', min(3), 'warmup', 'Easy bounces, then light skipping.', 'jump-rope'),
      ...rounds(6, (r) => [
        step(`Skip ${r} of 6`, min(2), 'hard', 'Steady rhythm. Switch styles whenever your calves tire.', 'jump-rope'),
        ...(r < 6 ? [step('Rest', min(1), 'rest' as const, 'Walk and shake out your calves.')] : []),
      ]),
      step('Cool down', min(2), 'easy', 'Walk, then stretch your calves.'),
    ],
  },
  {
    id: 'rope-pyramid',
    name: 'Rope pyramid',
    summary: 'Skips of 30, 45, 60, 90, 60, 45 and 30 seconds, each followed by the same rest. About 15 minutes.',
    level: 'Beginner',
    category: 'rope',
    needs: ['jumpRope'],
    techniqueExerciseId: 'jump-rope',
    steps: [
      step('Warm up', min(2), 'warmup', 'Bounce on your toes and swing the rope at your side.', 'jump-rope'),
      ...[30, 45, 60, 90, 60, 45, 30].flatMap((seconds, i) => [
        step(
          `Skip ${seconds} seconds`,
          seconds,
          seconds >= 60 ? 'hard' : 'moderate',
          'Small hops, wrists turn the rope. Trips are fine.',
          'jump-rope',
        ),
        ...(i < 6 ? [step('Rest', seconds, 'rest' as const, 'Walk and breathe.')] : []),
      ]),
      step('Cool down', min(1.5), 'easy', 'Walk, then stretch your calves.'),
    ],
  },
  // No equipment
  {
    id: 'bodyweight-hiit',
    name: 'No-equipment HIIT',
    summary: 'Four rounds of four moves, 40 seconds on and 20 off.',
    level: 'Intermediate',
    category: 'bodyweight',
    needs: [],
    steps: [
      step('Warm up', min(3), 'warmup', 'March in place, then easy jumping jacks.', 'jumping-jack'),
      ...rounds(4, (r) => [
        step(`Jumping jacks · round ${r}`, 40, 'hard', 'Arms all the way overhead.', 'jumping-jack'),
        step('Rest', 20, 'rest', 'Next: high knees.'),
        step(`High knees · round ${r}`, 40, 'hard', 'Knees to hip height. Pump your arms.', 'high-knees'),
        step('Rest', 20, 'rest', 'Next: mountain climbers.'),
        step(`Mountain climbers · round ${r}`, 40, 'hard', 'Hips low. Drive your knees in fast.', 'mountain-climber'),
        step('Rest', 20, 'rest', 'Next: burpees.'),
        step(`Burpees · round ${r}`, 40, 'hard', 'Steady pace. Step back instead of jumping if you need to.', 'burpee'),
        step('Rest', 20, 'rest', r < 4 ? 'Round done. Next: jumping jacks.' : 'Last rest. Nearly there.'),
      ]),
      step('Cool down', min(3), 'easy', 'Walk around, then stretch your legs and chest.'),
    ],
  },
  {
    id: 'shadowbox-plyo',
    name: 'Shadowbox and plyo',
    summary:
      'Nine 2-minute stations of shadowboxing and plyometrics, with 30 seconds of active recovery between. No bag needed. About 27 minutes.',
    level: 'Intermediate',
    category: 'bodyweight',
    needs: [],
    techniqueExerciseId: 'bag-jab-cross',
    steps: [
      step('Warm up', min(3), 'warmup', `March, then easy shadowboxing. Punch numbers: ${PUNCH_KEY}`, 'jumping-jack'),
      ...(
        [
          ['Station 1: jab-cross', 'bag-jab-cross', 'Shadowbox 1-2s. Snap each punch back to your chin.'],
          ['Station 2: jump squats', 'jump-squat', 'Sit back, explode up, land softly.'],
          ['Station 3: hooks', 'bag-hooks', 'Shadowbox hooks. Turn your hips with every punch.'],
          ['Station 4: mountain climbers', 'mountain-climber', 'Hips low, knees in fast.'],
          ['Station 5: uppercuts', 'bag-uppercuts', 'Bend your knees and drive up from your legs.'],
          ['Station 6: burpees', 'burpee', 'Steady pace. Step back instead of jumping if you need to.'],
          ['Station 7: slip and counter', 'bag-slip-drill', 'Slip left and right, then answer with a 1-2.'],
          ['Station 8: high knees', 'high-knees', 'Knees to hip height. Pump your arms.'],
          ['Station 9: freestyle', 'bag-body-shots', 'Mix every punch and keep your feet moving. Empty the tank.'],
        ] as const
      ).flatMap(([name, exerciseId, cue], i) => [
        step(name, min(2), i === 8 ? 'max' : 'hard', cue, exerciseId),
        ...(i < 8 ? [step('Active recovery', 30, 'easy' as const, 'Bounce on your toes and breathe.')] : []),
      ]),
      step('Cool down', min(2), 'easy', 'Walk, then stretch your shoulders, chest and hips.'),
    ],
  },
  {
    id: 'bodyweight-tabata',
    name: 'Bodyweight Tabata',
    summary: 'Three Tabata blocks: 20 seconds all out, 10 seconds easy. You never stop moving. About 20 minutes.',
    level: 'Advanced',
    category: 'bodyweight',
    needs: [],
    steps: [
      step('Warm up', min(3), 'warmup', 'March in place, then easy jumping jacks.', 'jumping-jack'),
      ...tabata('Jump squats', 'jump-squat', 'Fast and springy. Land softly.', 'March in place.'),
      step('Keep moving', min(1), 'easy', 'Walk and breathe. Mountain climbers next.'),
      ...tabata(
        'Mountain climbers',
        'mountain-climber',
        'Drive your knees in fast.',
        'Hold a high plank, or march in place.',
      ),
      step('Keep moving', min(1), 'easy', 'Walk and breathe. High knees next.'),
      ...tabata('High knees', 'high-knees', 'Knees up, arms pumping.', 'March in place.'),
      step('Cool down', min(3), 'easy', 'Walk, then stretch your legs and hips.'),
    ],
  },
  {
    id: 'bodyweight-low-impact',
    name: 'Low-impact cardio',
    summary:
      'Gets your heart rate up with no jumping: three rounds of five moves, 40 seconds on and 20 off. About 20 minutes.',
    level: 'Beginner',
    category: 'bodyweight',
    needs: [],
    steps: [
      step('Warm up', min(3), 'warmup', 'March in place and swing your arms.', 'mobility-arm-circles'),
      ...circuit(3, 40, 20, [
        ['Squats', 'bodyweight-squat', 'Steady pace, full range.', 'moderate'],
        ['Fast march', 'high-knees', 'March with your knees up and arms pumping. No jumping.', 'moderate'],
        ['Reverse lunges', 'reverse-lunge', 'Step back and alternate legs.', 'moderate'],
        ['Knee push-ups', 'knee-push-up', 'Body straight from knees to head.', 'moderate'],
        ['Glute bridges', 'glute-bridge', 'Squeeze at the top.', 'moderate'],
      ]),
      step('Cool down', min(2), 'easy', 'Walk, then stretch your legs and chest.'),
    ],
  },
  {
    id: 'bodyweight-burpee-ladder',
    name: 'Burpee ladder',
    summary:
      'Burpee intervals that grow from 20 to 60 seconds and back, with squats and planks between. About 21 minutes.',
    level: 'Advanced',
    category: 'bodyweight',
    needs: [],
    steps: [
      step('Warm up', min(3), 'warmup', 'March, easy jacks, then a few slow burpees.', 'jumping-jack'),
      ...[20, 30, 40, 50, 60, 50, 40, 30, 20].flatMap((seconds, i) => [
        step(
          `Burpees ${seconds} seconds`,
          seconds,
          seconds >= 50 ? 'max' : 'hard',
          'Steady pace. Step back instead of jumping if you need to.',
          'burpee',
        ),
        step(
          i % 2 === 0 ? 'Squats' : 'Plank',
          60,
          'moderate',
          i % 2 === 0 ? 'Slow squats. Let your breathing settle.' : 'Hold a plank. Body straight, breathe.',
          i % 2 === 0 ? 'bodyweight-squat' : 'plank',
        ),
      ]),
      step('Cool down', min(3), 'easy', 'Walk, then stretch your legs, hips and chest.'),
    ],
  },
  {
    id: 'bodyweight-30',
    name: 'Bodyweight 30',
    summary: 'Five rounds of six moves, 40 seconds on and 20 off. A long sweat with no equipment. About 36 minutes.',
    level: 'Intermediate',
    category: 'bodyweight',
    needs: [],
    steps: [
      step('Warm up', min(3), 'warmup', 'March in place, then easy jumping jacks.', 'jumping-jack'),
      ...circuit(5, 40, 20, [
        ['Jumping jacks', 'jumping-jack', 'Arms all the way overhead.'],
        ['Squats', 'bodyweight-squat', 'Sit deep, stand tall.', 'moderate'],
        ['Push-ups', 'push-up', 'Drop to your knees when your form slips.', 'moderate'],
        ['Mountain climbers', 'mountain-climber', 'Hips low, knees in fast.'],
        ['Reverse lunges', 'reverse-lunge', 'Alternate legs.', 'moderate'],
        ['High knees', 'high-knees', 'Knees up, arms pumping.'],
      ]),
      step('Cool down', min(3), 'easy', 'Walk, then stretch your legs, chest and hips.'),
    ],
  },
  // Quiet: full body with no jumping, for early mornings and late evenings
  {
    id: 'quiet-morning',
    name: 'Quiet morning',
    summary: 'Wake up, two easy rounds of five moves, then stretch. No jumping, so nobody wakes up. About 15 minutes.',
    level: 'Beginner',
    category: 'quiet',
    needs: [],
    techniqueExerciseId: 'bodyweight-squat',
    steps: [
      ...flow(
        'stretch-cat-cow',
        'Cat-cow',
        60,
        'Slow rounds on hands and knees. Breathe out as you round, in as you arch.',
      ),
      ...flow('mobility-arm-circles', 'Arm circles', 30, 'Small to big. Reverse halfway.'),
      ...flow(
        'mobility-worlds-greatest-stretch',
        'World’s greatest stretch',
        30,
        'Lunge, elbow down, then rotate and reach up.',
        true,
      ),
      ...rounds(2, (r) => [
        step(
          `Squats · round ${r}`,
          45,
          'moderate',
          'Slow and controlled. Feet stay flat on the floor.',
          'bodyweight-squat',
        ),
        step(
          `Knee push-ups · round ${r}`,
          45,
          'moderate',
          'Lower your chest slowly. Body straight from knees to head.',
          'knee-push-up',
        ),
        step(
          `Reverse lunges · round ${r}`,
          45,
          'moderate',
          'Step back softly and lower the back knee gently. Alternate legs.',
          'reverse-lunge',
        ),
        step(
          `Glute bridges · round ${r}`,
          45,
          'moderate',
          'Squeeze your glutes at the top and hold for a second.',
          'glute-bridge',
        ),
        step(
          `Bird dog · round ${r}`,
          45,
          'moderate',
          'Reach opposite arm and leg long. Keep your hips level.',
          'bird-dog',
        ),
        step('Rest', 15, 'rest', r < 2 ? 'Breathe. Next: squats.' : 'Breathe. Stretching next.'),
      ]),
      ...hold('stretch-hamstring', 'Hamstring stretch', 30, 'Lift the leg until you feel a gentle pull.'),
      ...hold('stretch-hip-flexor', 'Hip flexor stretch', 30, 'Squeeze the back glute and shift forward a little.'),
      step('Chest stretch', 45, 'stretch', 'Forearms on a doorway or wall. Lean in gently.', 'stretch-chest'),
      step('Child’s pose', 60, 'stretch', 'Sink your hips back and breathe into your back.', 'stretch-childs-pose'),
      step('Breathe', 45, 'stretch', 'Sit or lie still. Slow breaths in through your nose and out through your mouth.'),
    ],
  },
  {
    id: 'quiet-morning-strength',
    name: 'Quiet morning strength',
    summary: 'Three rounds of slow full-body strength, then stretch. No jumping. About 15 minutes.',
    level: 'Intermediate',
    category: 'quiet',
    needs: [],
    techniqueExerciseId: 'push-up',
    steps: [
      ...flow('stretch-cat-cow', 'Cat-cow', 45, 'Slow rounds. Breathe out as you round, in as you arch.'),
      ...flow('mobility-inchworm', 'Inchworm', 45, 'Walk your hands out to a plank and back. Slow and quiet.'),
      ...flow(
        'mobility-worlds-greatest-stretch',
        'World’s greatest stretch',
        30,
        'Lunge, elbow down, then rotate and reach up.',
        true,
      ),
      ...rounds(3, (r) => [
        step(
          `Slow squats · round ${r}`,
          40,
          'moderate',
          'Take three seconds to lower. Stand up with control.',
          'bodyweight-squat',
        ),
        step(
          `Push-ups · round ${r}`,
          40,
          'moderate',
          'Three seconds down. Drop to your knees when your form slips.',
          'push-up',
        ),
        step(`Reverse lunges · round ${r}`, 40, 'moderate', 'Step back softly. Alternate legs.', 'reverse-lunge'),
        step(`Dead bug · round ${r}`, 40, 'moderate', 'Lower back pressed into the floor. Move slowly.', 'dead-bug'),
        step('Rest', 20, 'rest', r < 3 ? 'Breathe. Next: slow squats.' : 'Breathe. Stretching next.'),
      ]),
      ...hold('stretch-quad', 'Quad stretch', 30, 'Knees together, hips tucked under.'),
      ...hold('stretch-hamstring', 'Hamstring stretch', 30, 'Lift the leg until you feel a gentle pull.'),
      step('Chest stretch', 45, 'stretch', 'Forearms on a doorway or wall. Lean in gently.', 'stretch-chest'),
      step('Child’s pose', 45, 'stretch', 'Reach your arms long and breathe slowly.', 'stretch-childs-pose'),
    ],
  },
  {
    id: 'quiet-evening',
    name: 'Quiet evening',
    summary: 'Gentle floor-based strength, then a long stretch to wind down. No jumping. About 15 minutes.',
    level: 'Beginner',
    category: 'quiet',
    needs: [],
    techniqueExerciseId: 'glute-bridge',
    steps: [
      ...flow('stretch-cat-cow', 'Cat-cow', 60, 'Slow rounds. Breathe out as you round, in as you arch.'),
      ...flow('mobility-thread-the-needle', 'Thread the needle', 30, 'Reach under, then up to the ceiling.', true),
      ...rounds(2, (r) => [
        step(
          `Glute bridges · round ${r}`,
          45,
          'moderate',
          'Squeeze your glutes at the top and lower slowly.',
          'glute-bridge',
        ),
        step(`Dead bug · round ${r}`, 45, 'moderate', 'Lower back pressed into the floor. Move slowly.', 'dead-bug'),
        step(
          `Knee push-ups · round ${r}`,
          45,
          'moderate',
          'Lower your chest slowly. Body straight from knees to head.',
          'knee-push-up',
        ),
        step(
          `Bird dog · round ${r}`,
          45,
          'moderate',
          'Reach opposite arm and leg long. Keep your hips level.',
          'bird-dog',
        ),
        step(
          `Slow squats · round ${r}`,
          45,
          'moderate',
          'Take three seconds to lower. Feet stay flat.',
          'bodyweight-squat',
        ),
        step('Rest', 15, 'rest', r < 2 ? 'Breathe. Next: glute bridges.' : 'Breathe. Time to wind down.'),
      ]),
      ...hold('stretch-figure-four', 'Figure-four stretch', 30, 'Pull the bottom thigh toward your chest.'),
      ...hold('stretch-seated-twist', 'Spinal twist', 30, 'Both shoulders stay on the floor.'),
      ...hold('stretch-hamstring', 'Hamstring stretch', 30, 'Lift the leg until you feel a gentle pull.'),
      step('Butterfly stretch', 45, 'stretch', 'Sit tall, soles together, let your knees relax.', 'stretch-butterfly'),
      step('Child’s pose', 45, 'stretch', 'Sink your hips back and breathe slowly.', 'stretch-childs-pose'),
      step('Breathe', 30, 'stretch', 'Lie on your back. Slow breaths in through your nose and out through your mouth.'),
    ],
  },
  {
    id: 'quiet-evening-strength',
    name: 'Quiet evening strength',
    summary:
      'Three rounds of slow full-body strength, then hip and back stretches before bed. No jumping. About 15 minutes.',
    level: 'Intermediate',
    category: 'quiet',
    needs: [],
    techniqueExerciseId: 'reverse-lunge',
    steps: [
      ...flow('stretch-cat-cow', 'Cat-cow', 45, 'Slow rounds. Breathe out as you round, in as you arch.'),
      ...flow(
        'mobility-open-book',
        'Open book',
        30,
        'Knees stay together. Open your top arm and follow it with your eyes.',
        true,
      ),
      ...flow('mobility-90-90', '90/90 hip switch', 45, 'Rotate both knees side to side. Chest tall.'),
      ...rounds(3, (r) => [
        step(`Reverse lunges · round ${r}`, 40, 'moderate', 'Step back softly. Alternate legs.', 'reverse-lunge'),
        step(
          `Pike push-ups · round ${r}`,
          40,
          'moderate',
          'Hips high. Lower your head slowly toward the floor.',
          'pike-push-up',
        ),
        step(`Glute bridges · round ${r}`, 40, 'moderate', 'Hold for two seconds at the top.', 'glute-bridge'),
        step(`Leg raises · round ${r}`, 40, 'moderate', 'Lower back stays down. Lower your legs slowly.', 'leg-raise'),
        step('Rest', 20, 'rest', r < 3 ? 'Breathe. Next: reverse lunges.' : 'Breathe. Time to wind down.'),
      ]),
      ...hold('stretch-hip-flexor', 'Hip flexor stretch', 30, 'Squeeze the back glute and shift forward a little.'),
      ...hold('stretch-figure-four', 'Figure-four stretch', 30, 'Pull the bottom thigh toward your chest.'),
      ...hold('stretch-seated-twist', 'Spinal twist', 30, 'Both shoulders stay on the floor.'),
      step('Breathe', 30, 'stretch', 'Lie on your back. Slow breaths in through your nose and out through your mouth.'),
    ],
  },
  {
    id: 'quiet-wake-up-flow',
    name: 'Quiet wake-up flow',
    summary: 'More mobility, gentler strength. Loosen up, two easy rounds, then stretch. No jumping. About 15 minutes.',
    level: 'Beginner',
    category: 'quiet',
    needs: [],
    techniqueExerciseId: 'mobility-worlds-greatest-stretch',
    steps: [
      ...flow('stretch-cat-cow', 'Cat-cow', 60, 'Slow rounds. Breathe out as you round, in as you arch.'),
      ...flow(
        'mobility-worlds-greatest-stretch',
        'World’s greatest stretch',
        30,
        'Lunge, elbow down, then rotate and reach up.',
        true,
      ),
      ...flow('mobility-inchworm', 'Inchworm', 45, 'Walk your hands out to a plank and back. Slow and quiet.'),
      ...rounds(2, (r) => [
        step(`Squats · round ${r}`, 40, 'moderate', 'Slow and controlled. Feet stay flat.', 'bodyweight-squat'),
        step(`Knee push-ups · round ${r}`, 40, 'moderate', 'Lower your chest slowly.', 'knee-push-up'),
        step(`Glute bridges · round ${r}`, 40, 'moderate', 'Squeeze at the top.', 'glute-bridge'),
        step(`Dead bug · round ${r}`, 40, 'moderate', 'Lower back pressed into the floor.', 'dead-bug'),
        step(`Reverse lunges · round ${r}`, 40, 'moderate', 'Step back softly. Alternate legs.', 'reverse-lunge'),
        step('Rest', 20, 'rest', r < 2 ? 'Breathe. Next: squats.' : 'Breathe. Stretching next.'),
      ]),
      ...hold('stretch-hamstring', 'Hamstring stretch', 30, 'Lift the leg until you feel a gentle pull.'),
      ...hold('stretch-quad', 'Quad stretch', 30, 'Knees together, hips tucked under.'),
      step('Chest stretch', 45, 'stretch', 'Forearms on a doorway or wall. Lean in gently.', 'stretch-chest'),
      step('Child’s pose', 60, 'stretch', 'Sink your hips back and breathe into your back.', 'stretch-childs-pose'),
      step('Breathe', 70, 'stretch', 'Sit tall. Slow breaths in through your nose and out through your mouth.'),
    ],
  },
  {
    id: 'quiet-wind-down',
    name: 'Quiet wind-down',
    summary:
      'The gentlest evening option: slow floor strength, then a long stretch before bed. No jumping. About 15 minutes.',
    level: 'Beginner',
    category: 'quiet',
    needs: [],
    techniqueExerciseId: 'glute-bridge',
    steps: [
      ...flow('stretch-cat-cow', 'Cat-cow', 60, 'Slow rounds. Breathe out as you round, in as you arch.'),
      ...flow(
        'mobility-open-book',
        'Open book',
        30,
        'Knees stay together. Open your top arm and follow it with your eyes.',
        true,
      ),
      ...flow('mobility-90-90', '90/90 hip switch', 60, 'Rotate both knees side to side. Chest tall.'),
      ...rounds(2, (r) => [
        step(`Glute bridges · round ${r}`, 45, 'moderate', 'Lift slowly, squeeze, lower slowly.', 'glute-bridge'),
        step(`Bird dog · round ${r}`, 45, 'moderate', 'Reach opposite arm and leg long.', 'bird-dog'),
        step(`Knee push-ups · round ${r}`, 45, 'moderate', 'Lower your chest slowly.', 'knee-push-up'),
        step(`Slow squats · round ${r}`, 45, 'moderate', 'Take three seconds to lower.', 'bodyweight-squat'),
        step('Rest', 15, 'rest', r < 2 ? 'Breathe. Next: glute bridges.' : 'Breathe. Time to wind down.'),
      ]),
      ...hold('stretch-figure-four', 'Figure-four stretch', 30, 'Pull the bottom thigh toward your chest.'),
      ...hold('stretch-hip-flexor', 'Hip flexor stretch', 30, 'Squeeze the back glute and shift forward a little.'),
      ...hold('stretch-seated-twist', 'Spinal twist', 30, 'Both shoulders stay on the floor.'),
      step('Butterfly stretch', 45, 'stretch', 'Sit tall, soles together, let your knees relax.', 'stretch-butterfly'),
      step('Child’s pose', 60, 'stretch', 'Sink your hips back and breathe slowly.', 'stretch-childs-pose'),
      step('Breathe', 45, 'stretch', 'Lie on your back. Slow breaths in through your nose and out through your mouth.'),
    ],
  },
  // Mobility
  {
    id: 'mobility-five',
    name: '5-minute mobility',
    summary: 'A quick full-body loosen-up for any time of day. Five minutes.',
    level: 'Beginner',
    category: 'mobility',
    needs: [],
    techniqueExerciseId: 'mobility-worlds-greatest-stretch',
    steps: [
      ...flow('stretch-cat-cow', 'Cat-cow', 40, 'Slow rounds. Breathe out as you round, in as you arch.'),
      ...flow(
        'mobility-worlds-greatest-stretch',
        'World’s greatest stretch',
        25,
        'Lunge, elbow down, rotate and reach.',
        true,
      ),
      ...flow('mobility-thread-the-needle', 'Thread the needle', 20, 'Reach under, then up to the ceiling.', true),
      ...flow('mobility-90-90', '90/90 hip switch', 40, 'Rotate both knees side to side.'),
      ...flow('mobility-hip-circles', 'Hip circles', 20, 'Big slow circles with the knee.', true),
      ...flow('mobility-arm-circles', 'Arm circles', 30, 'Small to big, then reverse.'),
      ...flow('mobility-inchworm', 'Inchworm', 30, 'Walk out to a plank and back.'),
      ...flow('mobility-deep-squat-hold', 'Deep squat hold', 30, 'Heels down, chest up. Breathe.'),
    ],
  },
  {
    id: 'mobility-morning',
    name: 'Morning mobility',
    summary: 'Wake up your spine, hips and shoulders. Good any day, training or not. About 10 minutes.',
    level: 'Beginner',
    category: 'mobility',
    needs: [],
    techniqueExerciseId: 'mobility-worlds-greatest-stretch',
    steps: [
      ...flow('stretch-cat-cow', 'Cat-cow', 60, 'Slow rounds. Breathe out as you round, in as you arch.'),
      ...flow(
        'mobility-worlds-greatest-stretch',
        'World’s greatest stretch',
        45,
        'Lunge, elbow down, then rotate and reach up.',
        true,
      ),
      ...flow('mobility-90-90', '90/90 hip switch', 60, 'Rotate both knees side to side. Chest tall.'),
      ...flow(
        'mobility-open-book',
        'Open book',
        40,
        'Knees stay together. Open your top arm and follow it with your eyes.',
        true,
      ),
      ...flow('mobility-thread-the-needle', 'Thread the needle', 40, 'Reach under, then up to the ceiling.', true),
      ...flow(
        'mobility-hip-circles',
        'Hip circles',
        30,
        'Big slow circles with the knee. Switch direction halfway.',
        true,
      ),
      ...flow('mobility-arm-circles', 'Arm circles', 45, 'Small to big. Reverse halfway.'),
      ...flow('mobility-inchworm', 'Inchworm', 60, 'Walk out to a plank and back. Slow and controlled.'),
      ...flow('mobility-deep-squat-hold', 'Deep squat hold', 45, 'Heels down, elbows press your knees out. Breathe.'),
    ],
  },
  {
    id: 'mobility-hips',
    name: 'Hips and lower back',
    summary: 'Loosen tight hips, ankles and lower back, before leg day or after a day of sitting. About 10 minutes.',
    level: 'Beginner',
    category: 'mobility',
    needs: [],
    techniqueExerciseId: 'mobility-90-90',
    steps: [
      ...flow(
        'mobility-hip-circles',
        'Hip circles',
        40,
        'Big slow circles with the knee. Switch direction halfway.',
        true,
      ),
      ...flow(
        'mobility-leg-swings',
        'Leg swings',
        45,
        'Forward and back, then side to side. Let the range grow.',
        true,
      ),
      ...flow('mobility-90-90', '90/90 hip switch', 60, 'Rotate both knees side to side. Chest tall.'),
      ...flow(
        'mobility-cossack-squat',
        'Cossack squat',
        60,
        'Shift side to side. Only as deep as your heel stays down.',
      ),
      ...flow('mobility-ankle-rocks', 'Ankle rocks', 40, 'Knee forward over your toes, heel down.', true),
      ...flow('mobility-deep-squat-hold', 'Deep squat hold', 60, 'Heels down, elbows press your knees out. Breathe.'),
      ...flow(
        'mobility-worlds-greatest-stretch',
        'World’s greatest stretch',
        45,
        'Lunge, elbow down, then rotate and reach up.',
        true,
      ),
      ...flow('stretch-cat-cow', 'Cat-cow', 45, 'Slow rounds. Move one segment of your back at a time.'),
      step(
        'Child’s pose',
        45,
        'stretch',
        'Sink your hips back and breathe into your lower back.',
        'stretch-childs-pose',
      ),
    ],
  },
  {
    id: 'mobility-shoulders',
    name: 'Shoulders and upper back',
    summary: 'Free up your shoulders and upper back, before pressing or after a day at a desk. About 8 minutes.',
    level: 'Beginner',
    category: 'mobility',
    needs: [],
    techniqueExerciseId: 'mobility-wall-slides',
    steps: [
      ...flow('mobility-arm-circles', 'Arm circles', 60, 'Small to big. Reverse halfway.'),
      ...flow(
        'mobility-wall-slides',
        'Wall slides',
        60,
        'Back flat on the wall. Slide up only as far as you can keep contact.',
      ),
      ...flow('mobility-thread-the-needle', 'Thread the needle', 45, 'Reach under, then up to the ceiling.', true),
      ...flow(
        'mobility-open-book',
        'Open book',
        45,
        'Knees stay together. Open your top arm and follow it with your eyes.',
        true,
      ),
      ...flow('stretch-cat-cow', 'Cat-cow', 45, 'Slow rounds. Push the floor away as you round.'),
      ...flow('mobility-inchworm', 'Inchworm', 60, 'Walk out to a plank and back. Slow and controlled.'),
      step('Child’s pose', 45, 'stretch', 'Reach your arms long to stretch your lats.', 'stretch-childs-pose'),
    ],
  },
  {
    id: 'mobility-warm-up',
    name: 'Pre-workout warm-up',
    summary: 'A quick full-body warm-up to do before lifting or cardio. About 5 minutes.',
    level: 'Beginner',
    category: 'mobility',
    needs: [],
    techniqueExerciseId: 'mobility-inchworm',
    steps: [
      ...flow('mobility-inchworm', 'Inchworm', 45, 'Walk out to a plank and back.'),
      ...flow(
        'mobility-worlds-greatest-stretch',
        'World’s greatest stretch',
        30,
        'Lunge, elbow down, rotate and reach.',
        true,
      ),
      ...flow('mobility-leg-swings', 'Leg swings', 30, 'Forward and back, then side to side.', true),
      ...flow('mobility-hip-circles', 'Hip circles', 30, 'Big circles, both directions.', true),
      ...flow('mobility-arm-circles', 'Arm circles', 30, 'Small to big, then reverse.'),
      ...flow('mobility-ankle-rocks', 'Ankle rocks', 20, 'Knee forward over your toes, heel down.', true),
      ...flow('mobility-deep-squat-hold', 'Deep squat hold', 30, 'Sit deep, heels down, chest up.'),
    ],
  },
  // Stretching
  {
    id: 'stretch-five',
    name: '5-minute stretch',
    summary: 'A short full-body stretch for after a workout or before bed. Five minutes.',
    level: 'Beginner',
    category: 'stretch',
    needs: [],
    techniqueExerciseId: 'stretch-hamstring',
    steps: [
      step('Cat-cow', 45, 'stretch', 'Slow rounds. Breathe out as you round, in as you arch.', 'stretch-cat-cow'),
      step('Child’s pose', 45, 'stretch', 'Sink your hips back and breathe into your back.', 'stretch-childs-pose'),
      ...hold('stretch-hamstring', 'Hamstring stretch', 20, 'Lift the leg until you feel a gentle pull.'),
      ...hold('stretch-quad', 'Quad stretch', 20, 'Knees together, hips tucked under.'),
      step('Chest stretch', 30, 'stretch', 'Forearms on a doorway or wall. Lean in gently.', 'stretch-chest'),
      ...hold('stretch-cross-body-shoulder', 'Shoulder stretch', 20, 'Arm across your chest, shoulder down.'),
      ...hold('stretch-seated-twist', 'Spinal twist', 20, 'Both shoulders stay on the floor.'),
      step('Breathe', 20, 'stretch', 'Lie still. Slow breaths in and out.'),
    ],
  },
  {
    id: 'stretch-full-body',
    name: 'Full-body stretch',
    summary: 'A slow cool-down for after any workout. About 11 minutes.',
    level: 'Beginner',
    category: 'stretch',
    needs: [],
    techniqueExerciseId: 'stretch-hamstring',
    steps: [
      step('Cat-cow', 60, 'stretch', 'Slow rounds. Breathe out as you round, in as you arch.', 'stretch-cat-cow'),
      step('Child’s pose', 60, 'stretch', 'Sink your hips back and breathe into your back.', 'stretch-childs-pose'),
      ...hold('stretch-hamstring', 'Hamstring stretch', 30, 'Lift the leg until you feel a gentle pull.'),
      ...hold('stretch-quad', 'Quad stretch', 30, 'Knees together, hips tucked under.'),
      ...hold('stretch-hip-flexor', 'Hip flexor stretch', 30, 'Squeeze the back glute and shift forward a little.'),
      ...hold('stretch-figure-four', 'Figure-four stretch', 30, 'Pull the bottom thigh toward your chest.'),
      step('Chest stretch', 45, 'stretch', 'Forearms on a doorway or wall. Lean in gently.', 'stretch-chest'),
      ...hold('stretch-cross-body-shoulder', 'Shoulder stretch', 30, 'Arm across your chest, shoulder down.'),
      ...hold('stretch-triceps', 'Triceps stretch', 30, 'Ease the elbow back behind your head.'),
      ...hold('stretch-seated-twist', 'Spinal twist', 30, 'Both shoulders stay on the floor.'),
      step('Breathe', 45, 'stretch', 'Lie on your back. Slow breaths in through your nose and out through your mouth.'),
    ],
  },
  {
    id: 'stretch-lower-body',
    name: 'Lower-body stretch',
    summary: 'Calves, hamstrings, quads and hips, for after leg days, runs and rides. About 8 minutes.',
    level: 'Beginner',
    category: 'stretch',
    needs: [],
    techniqueExerciseId: 'stretch-hip-flexor',
    steps: [
      ...hold('stretch-calf', 'Calf stretch', 30, 'Back leg straight, heel pressed down.'),
      ...hold('stretch-hamstring', 'Hamstring stretch', 30, 'Lift the leg until you feel a gentle pull.'),
      ...hold('stretch-quad', 'Quad stretch', 30, 'Knees together, hips tucked under.'),
      ...hold('stretch-hip-flexor', 'Hip flexor stretch', 30, 'Squeeze the back glute and shift forward a little.'),
      ...hold('stretch-figure-four', 'Figure-four stretch', 30, 'Pull the bottom thigh toward your chest.'),
      step('Butterfly stretch', 45, 'stretch', 'Sit tall, soles together, let your knees relax.', 'stretch-butterfly'),
      ...hold('stretch-seated-twist', 'Spinal twist', 30, 'Both shoulders stay on the floor.'),
      step('Child’s pose', 60, 'stretch', 'Sink your hips back and breathe slowly.', 'stretch-childs-pose'),
    ],
  },
  {
    id: 'stretch-upper-body',
    name: 'Upper-body stretch',
    summary: 'Chest, shoulders, arms and back, for after push, pull and bag work. About 6 minutes.',
    level: 'Beginner',
    category: 'stretch',
    needs: [],
    techniqueExerciseId: 'stretch-chest',
    steps: [
      step('Cat-cow', 60, 'stretch', 'Slow rounds. Breathe out as you round, in as you arch.', 'stretch-cat-cow'),
      step('Chest stretch', 45, 'stretch', 'Forearms on a doorway or wall. Lean in gently.', 'stretch-chest'),
      ...hold('stretch-cross-body-shoulder', 'Shoulder stretch', 30, 'Arm across your chest, shoulder down.'),
      ...hold('stretch-triceps', 'Triceps stretch', 30, 'Ease the elbow back behind your head.'),
      step('Child’s pose', 60, 'stretch', 'Reach your arms long to stretch your lats.', 'stretch-childs-pose'),
      ...hold('stretch-seated-twist', 'Spinal twist', 30, 'Both shoulders stay on the floor.'),
    ],
  },
];

export function getCardioSession(id: string): CardioSession | undefined {
  return CARDIO_SESSIONS.find((session) => session.id === id);
}

/**
 * Every exercise a session uses, in the order they first come up. The technique exercise leads when
 * no step uses it, such as the rowing video for a rower session.
 */
export function sessionExerciseIds(session: Pick<CardioSession, 'steps' | 'techniqueExerciseId'>): string[] {
  const fromSteps = [...new Set(session.steps.map((s) => s.exerciseId).filter((id): id is string => !!id))];
  const technique = session.techniqueExerciseId;
  return technique && !fromSteps.includes(technique) ? [technique, ...fromSteps] : fromSteps;
}

export function canDoCardio(session: CardioSession, owned: ReadonlySet<EquipmentId>): boolean {
  return session.needs.every((item) => owned.has(item));
}

export function totalSeconds(session: Pick<CardioSession, 'steps'>): number {
  return session.steps.reduce((sum, s) => sum + s.seconds, 0);
}

export interface Position {
  /** Index of the current step. Equals steps.length when the session is over. */
  index: number;
  /** Seconds into the current step. */
  stepElapsed: number;
  /** Seconds left in the current step. */
  stepRemaining: number;
  /** Seconds left in the whole session. */
  totalRemaining: number;
  done: boolean;
}

/** Where a session is after `elapsed` seconds. */
export function positionAt(steps: readonly CardioStep[], elapsed: number): Position {
  const total = steps.reduce((sum, s) => sum + s.seconds, 0);
  const clamped = Math.max(0, elapsed);
  let start = 0;
  for (let index = 0; index < steps.length; index++) {
    const end = start + steps[index].seconds;
    if (clamped < end) {
      return {
        index,
        stepElapsed: clamped - start,
        stepRemaining: end - clamped,
        totalRemaining: total - clamped,
        done: false,
      };
    }
    start = end;
  }
  return {
    index: steps.length,
    stepElapsed: 0,
    stepRemaining: 0,
    totalRemaining: 0,
    done: true,
  };
}

/** Elapsed seconds at the start of step `index`. Used to skip ahead. */
export function stepStart(steps: readonly CardioStep[], index: number): number {
  return steps.slice(0, index).reduce((sum, s) => sum + s.seconds, 0);
}

/** "4:05" style countdown for a number of seconds, rounded up so it never shows 0:00 mid-step. */
export function formatCountdown(seconds: number): string {
  const whole = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

/**
 * How hard each effort level is, on the 1–10 rate of perceived exertion (RPE) scale, with a rough
 * heart-rate zone for people who wear a watch. Shown live during a session. Max heart rate is roughly
 * 220 minus your age; the app says so on the session overview.
 */
export const INTENSITY: Record<Effort, { rpe: [number, number]; heartRate: string; feel: string }> = {
  warmup: { rpe: [3, 4], heartRate: 'about 50–60% of max', feel: 'Light. Loosen up and let your breathing pick up.' },
  easy: { rpe: [3, 4], heartRate: 'about 60–70% of max', feel: 'Comfortable. You could chat the whole time.' },
  moderate: { rpe: [5, 6], heartRate: 'about 70–80% of max', feel: 'Working. Breathing deeper, short sentences only.' },
  hard: { rpe: [7, 8], heartRate: 'about 80–90% of max', feel: 'Tough. A few words at a time. Hold your form.' },
  mobility: {
    rpe: [2, 3],
    heartRate: 'a little above resting',
    feel: 'Easy, smooth movement. Go a little further each rep, never into pain.',
  },
  stretch: {
    rpe: [1, 2],
    heartRate: 'settling back to normal',
    feel: 'Ease in to a gentle pull. Never bounce, never push into pain.',
  },
  max: {
    rpe: [9, 10],
    heartRate: 'heading above 90% of max. It lags in short intervals',
    feel: 'Everything you have. No talking. It’s short.',
  },
  rest: { rpe: [1, 2], heartRate: 'coming down', feel: 'Recover. Slow, deep breaths.' },
};

export type Cue =
  /** A short beep at 3, 2 and 1 seconds before a step ends. */
  | { kind: 'tick'; secondsLeft: number }
  /** Spoken heads-up 10 seconds before a step ends. */
  | { kind: 'heads-up'; next: CardioStep }
  /** A new step has started. */
  | { kind: 'step'; index: number; step: CardioStep }
  /** The session is over. */
  | { kind: 'done' };

const HEADS_UP_SECONDS = 10;
/** A jump bigger than this between two clock readings is a skip or a seek, not normal time passing. */
const MAX_TICK_GAP = 1.5;

/**
 * The cues to play when the clock moves from `from` to `to` seconds. The timer calls this a few
 * times a second. Skips and seeks only announce the new step, so they never trigger a burst of beeps.
 */
export function cuesBetween(steps: readonly CardioStep[], from: number, to: number): Cue[] {
  if (to <= from) return [];
  const before = positionAt(steps, from);
  const after = positionAt(steps, to);
  const changed = after.index !== before.index;
  const end = (): Cue[] =>
    after.done ? [{ kind: 'done' }] : [{ kind: 'step', index: after.index, step: steps[after.index] }];

  if (to - from > MAX_TICK_GAP) return changed ? end() : [];

  const cues: Cue[] = [];
  const left = before.stepRemaining;
  const leftAfter = left - (to - from);
  const current = steps[before.index];
  const next = steps[before.index + 1];
  if (current && next && current.seconds > 20 && left > HEADS_UP_SECONDS && leftAfter <= HEADS_UP_SECONDS) {
    cues.push({ kind: 'heads-up', next });
  }
  for (const mark of [3, 2, 1]) {
    if (left > mark && leftAfter <= mark && current.seconds > mark + 1) cues.push({ kind: 'tick', secondsLeft: mark });
  }
  if (changed) cues.push(...end());
  return cues;
}

/** Plain-language duration for the voice: "2 minutes", "45 seconds", "1 minute 30". */
export function spokenDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s} seconds`;
  const minutes = `${m} minute${m === 1 ? '' : 's'}`;
  return s ? `${minutes} ${s}` : minutes;
}

/** What the voice says when a step starts, for example "Hard. Round 1: 1-2. 2 minutes." */
export function stepAnnouncement(step: CardioStep): string {
  // Spell out combos so the voice says "one, two" instead of "one minus two".
  // Drop a duration already in the label ("Hard 1 min"), since the time is spoken at the end anyway.
  const label = step.label
    .replace(/\s*\b\d+\s*(min|mins|minutes?|sec|secs|seconds?)\b/gi, '')
    .replace(/(\d)-(?=\d)/g, '$1, ')
    .trim();
  // Skip the effort word when the label already says it, so a rest step isn't "Rest. Rest."
  const letters = (text: string) => text.toLowerCase().replace(/[^a-z]/g, '');
  const effort = EFFORT_LABELS[step.effort];
  const prefix = letters(label).startsWith(letters(effort)) ? '' : `${effort}. `;
  // Short steps, like Tabata's 20 seconds on and 10 easy, come too fast for a full announcement.
  if (step.seconds <= 20) return `${label}.`;
  return `${prefix}${label}. ${spokenDuration(step.seconds)}.`;
}
