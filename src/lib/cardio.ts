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
  | 'circuit'
  | 'stretch'
  | 'mobility'
  | 'weights';

export const CARDIO_CATEGORY_LABELS: Record<CardioCategory, string> = {
  rower: 'Rower',
  treadmill: 'Treadmill',
  bag: 'Boxing bag',
  kettlebell: 'Kettlebell conditioning',
  trx: 'TRX conditioning',
  bike: 'Bike',
  rope: 'Jump rope',
  bodyweight: 'No equipment',
  circuit: 'Mixed circuits',
  stretch: 'Stretching',
  mobility: 'Mobility',
  weights: 'Weight circuits',
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
    summary: 'Two blocks of 20 seconds all out, 10 seconds rest. About 14 minutes.',
    level: 'Advanced',
    category: 'bag',
    needs: ['heavyBag'],
    techniqueExerciseId: 'bag-jab-cross',
    steps: [
      step('Warm up', min(3), 'warmup', `Shadowbox, then light 1-2s on the bag. Punch numbers: ${PUNCH_KEY}`),
      ...rounds(8, (r) => [
        step(`Block 1 · ${r} of 8`, 20, 'max', 'Fast straight punches. 1-2-1-2 as quick as you can.', 'bag-jab-cross'),
        step('Rest', 10, 'rest', 'Hands up. Get ready.'),
      ]),
      step('Rest', min(1), 'rest', 'One minute. Walk and breathe.'),
      ...rounds(8, (r) => [
        step(`Block 2 · ${r} of 8`, 20, 'max', 'Hooks and uppercuts. Stay close to the bag.', 'bag-hooks'),
        step('Rest', 10, 'rest', 'Hands up. Get ready.'),
      ]),
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
    summary: 'Three Tabata blocks: 20 seconds all out, 10 seconds rest. About 19 minutes.',
    level: 'Advanced',
    category: 'trx',
    needs: ['suspension'],
    techniqueExerciseId: 'trx-row',
    steps: [
      step('Warm up', min(3), 'warmup', 'Easy squats, rows and arm circles.', 'trx-squat'),
      ...rounds(8, (r) => [
        step(`Squat jumps · ${r} of 8`, 20, 'max', 'Hold the straps, sit back, jump.', 'trx-squat'),
        step('Rest', 10, 'rest', 'Breathe.'),
      ]),
      step('Rest', min(1), 'rest', 'Next block: rows.'),
      ...rounds(8, (r) => [
        step(`Fast rows · ${r} of 8`, 20, 'max', 'Quick, controlled pulls.', 'trx-row'),
        step('Rest', 10, 'rest', 'Breathe.'),
      ]),
      step('Rest', min(1), 'rest', 'Last block: knee tucks.'),
      ...rounds(8, (r) => [
        step(`Knee tucks · ${r} of 8`, 20, 'max', 'Hips level. Stop early if your back sags.', 'trx-knee-tuck'),
        step('Rest', 10, 'rest', 'Breathe.'),
      ]),
      step('Cool down', min(2), 'easy', 'Walk, then stretch.'),
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
  // Mixed circuits
  {
    id: 'circuit-row-bag',
    name: 'Row and box',
    summary: 'Four rounds of hard rowing straight into the bag.',
    level: 'Intermediate',
    category: 'circuit',
    needs: ['rower', 'heavyBag'],
    techniqueExerciseId: 'rowing-machine',
    steps: [
      step('Warm up', min(4), 'warmup', 'Easy rowing. Put your gloves within reach.'),
      ...rounds(4, (r) => [
        step(`Row · round ${r}`, min(2), 'hard', 'Rate 26–28. Then get straight to the bag.'),
        step(`Bag · round ${r}`, min(1), 'max', 'Freestyle on the bag. Keep your hands moving.', 'bag-jab-cross'),
        step('Rest', min(1), 'rest', r < 4 ? 'Take your gloves off, then back to the rower.' : 'Last rest.'),
      ]),
      step('Cool down', min(3), 'easy', 'Easy rowing, then stretch.'),
    ],
  },
  {
    id: 'circuit-run-bag',
    name: 'Run and punch',
    summary: 'Treadmill runs into bag work. Four rounds.',
    level: 'Intermediate',
    category: 'circuit',
    needs: ['treadmill', 'heavyBag'],
    techniqueExerciseId: 'treadmill-run',
    steps: [
      step('Warm up', min(5), 'warmup', `Walk, then an easy jog. On the bag, punch numbers are: ${PUNCH_KEY}`),
      ...rounds(4, (r) => [
        step(`Run · round ${r}`, min(3), 'hard', 'Comfortably hard pace. Then stop the belt before you step off.'),
        step(`Bag · round ${r}`, min(2), 'hard', `Throw ${COMBOS[r - 1]} on repeat.`, comboExercise(COMBOS[r - 1])),
        step('Rest', min(1), 'rest', 'Breathe. Back on the treadmill next.'),
      ]),
      step('Cool down', min(3), 'easy', 'Walk on the treadmill.'),
    ],
  },
  {
    id: 'circuit-triple',
    name: 'Triple threat',
    summary: 'Rower, treadmill and bag back to back. Three big rounds.',
    level: 'Advanced',
    category: 'circuit',
    needs: ['rower', 'treadmill', 'heavyBag'],
    techniqueExerciseId: 'rowing-machine',
    steps: [
      step('Warm up', min(5), 'warmup', 'Easy rowing, building pace.'),
      ...rounds(3, (r) => [
        step(`Row · round ${r}`, min(3), 'hard', 'Rate 26. Strong and steady.'),
        step('Move', 45, 'rest', 'Walk to the treadmill and start the belt slowly.'),
        step(`Run · round ${r}`, min(3), 'hard', 'Comfortably hard pace.'),
        step('Move', 45, 'rest', 'Stop the belt, step off and get your gloves on.'),
        step(`Bag · round ${r}`, min(2), 'hard', 'Freestyle. Keep your hands moving.', 'bag-body-shots'),
        step('Rest', min(1), 'rest', r < 3 ? 'Back to the rower next.' : 'Done with the hard part.'),
      ]),
      step('Cool down', min(3), 'easy', 'Easy rowing or walking, then stretch.'),
    ],
  },
  {
    id: 'circuit-row-floor',
    name: 'Row and floor',
    summary: 'Rowing with push-ups and squats. Only needs the rower.',
    level: 'Intermediate',
    category: 'circuit',
    needs: ['rower'],
    techniqueExerciseId: 'rowing-machine',
    steps: [
      step('Warm up', min(4), 'warmup', 'Easy rowing.'),
      ...rounds(5, (r) => [
        step(`Row · round ${r}`, min(2), 'hard', 'Rate 24–26.'),
        step(`Push-ups · round ${r}`, 40, 'hard', 'Steady reps. Drop to your knees when your form slips.', 'push-up'),
        step(`Squats · round ${r}`, 40, 'hard', 'Sit deep, stand tall.', 'bodyweight-squat'),
        step('Rest', 40, 'rest', r < 5 ? 'Back to the rower next.' : 'Last rest.'),
      ]),
      step('Cool down', min(3), 'easy', 'Easy rowing, then stretch.'),
    ],
  },
  {
    id: 'circuit-home-gym',
    name: 'Home gym finisher',
    summary: 'Bag, kettlebell and TRX back to back. Four rounds, about 25 minutes.',
    level: 'Advanced',
    category: 'circuit',
    needs: ['heavyBag', 'kettlebell', 'suspension'],
    techniqueExerciseId: 'kettlebell-swing',
    steps: [
      step('Warm up', min(3), 'warmup', 'Shadowbox, then a few light swings.'),
      ...rounds(4, (r) => [
        step(`Bag · round ${r}`, min(1), 'hard', 'Freestyle. Mix head and body shots.', 'bag-body-shots'),
        step(`Swings · round ${r}`, 45, 'hard', 'Gloves off, straight to the bell.', 'kettlebell-swing'),
        step(`TRX rows · round ${r}`, 45, 'hard', 'Squeeze your shoulder blades at the top.', 'trx-row'),
        step(
          `Knee tucks · round ${r}`,
          30,
          'hard',
          'Lengthen the straps, feet in the cradles, hips level.',
          'trx-knee-tuck',
        ),
        step('Rest', 90, 'rest', r < 4 ? 'Gloves back on. Bag next.' : 'Last rest.'),
      ]),
      step('Cool down', min(3), 'easy', 'Walk, then stretch your hips, back and shoulders.'),
    ],
  },
  // Mobility
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
  return `${prefix}${label}. ${spokenDuration(step.seconds)}.`;
}
