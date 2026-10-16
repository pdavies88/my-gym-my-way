import type { EquipmentId } from './equipment';

/** How hard to work during a step. */
export type Effort = 'warmup' | 'easy' | 'moderate' | 'hard' | 'max' | 'rest';

export const EFFORT_LABELS: Record<Effort, string> = {
  warmup: 'Warm-up',
  easy: 'Easy',
  moderate: 'Moderate',
  hard: 'Hard',
  max: 'All out',
  rest: 'Rest',
};

/** What each effort feels like, using the talk test. Shown on the session overview. */
export const EFFORT_GUIDE: Record<Exclude<Effort, 'warmup'>, string> = {
  easy: 'You can hold a full conversation.',
  moderate: 'You can talk in short sentences.',
  hard: 'You can say a few words at a time.',
  max: 'You can’t talk. Hold it only for the short interval.',
  rest: 'Stop, breathe and shake it out.',
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
  'rower' | 'treadmill' | 'bag' | 'kettlebell' | 'trx' | 'bike' | 'rope' | 'bodyweight' | 'circuit';

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

/**
 * Boxing combos use the standard punch numbers. Every bag session explains them on its first step.
 */
const PUNCH_KEY = '1 jab, 2 cross, 3 lead hook, 4 rear hook, 5 lead uppercut, 6 rear uppercut.';
const COMBOS = ['1-2', '1-1-2', '1-2-3', '2-3-2', '1-2-5-2', '3-4-3', 'Freestyle: mix everything'];

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
        step(`Hard ${r} of 8`, min(1), 'hard', 'Rate 26–28. Drive with the legs and hold the pace to the end.'),
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
      step('Easy', min(2), 'easy', 'Paddle. Halfway done.'),
      step('Hard 2 min', min(2), 'hard', 'Rate 26. Match your first 2-minute piece.'),
      step('Easy', min(1), 'easy', 'Paddle and breathe.'),
      step('Hard 1 min', min(1), 'max', 'Everything you have left.'),
      step('Cool down', min(3), 'easy', 'Light rowing until your breathing settles.'),
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
      step('Warm up', min(5), 'warmup', 'Brisk walk, about 5–6 km/h (3–3.5 mph).'),
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
        step(`Hill ${r} of 5`, min(2), 'hard', 'Raise the incline to 8–10%. Walk briskly. Don’t hold the rails.'),
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
        step(`Fast ${r} of 8`, 30, 'max', 'Run fast but in control, about 12–15 km/h (7.5–9 mph).'),
        step('Easy jog', 90, 'easy', 'Slow right down to an easy jog or a walk.'),
      ]),
      step('Cool down', min(4), 'easy', 'Easy jog, then walk.'),
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
        'Shadowbox in front of the bag: light punches, bounce on your toes, roll your shoulders.',
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
          `Round ${r}: ${COMBOS[r - 1]}`,
          min(2),
          r === 6 ? 'max' : 'hard',
          r === 6
            ? 'Last round. Mix every punch and keep your hands moving.'
            : `Throw ${COMBOS[r - 1]} on repeat. Reset your stance after each combo.`,
          'bag-jab-cross',
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
      step('Warm up', min(3), 'warmup', 'Shadowbox, then a few light rounds of 1-2 on the bag.'),
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
    summary: 'Five rounds of 40 seconds on, 20 off. Swings, cleans, squats and get-ups.',
    level: 'Advanced',
    category: 'kettlebell',
    needs: ['kettlebell'],
    techniqueExerciseId: 'kettlebell-swing',
    steps: [
      step('Warm up', min(4), 'warmup', 'Halos, light swings and a slow get-up each side.', 'kettlebell-halo'),
      ...rounds(5, (r) => [
        step(`Swings · round ${r}`, 40, 'max', 'Hard, fast hips. Keep your back flat.', 'kettlebell-swing'),
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
        'One slow Turkish get-up on each side. Quality over speed.',
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
        step('Rest', 20, 'rest', 'Next: knee tucks. Feet in the cradles.'),
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
      step('Warm up', min(3), 'warmup', 'March on the spot, then easy jumping jacks.', 'jumping-jack'),
      ...rounds(4, (r) => [
        step(`Jumping jacks · round ${r}`, 40, 'hard', 'Arms all the way overhead.', 'jumping-jack'),
        step('Rest', 20, 'rest', 'Next: high knees.'),
        step(`High knees · round ${r}`, 40, 'hard', 'Knees to hip height. Pump your arms.', 'high-knees'),
        step('Rest', 20, 'rest', 'Next: mountain climbers.'),
        step(`Mountain climbers · round ${r}`, 40, 'hard', 'Hips low. Drive your knees in fast.', 'mountain-climber'),
        step('Rest', 20, 'rest', 'Next: burpees.'),
        step(`Burpees · round ${r}`, 40, 'max', 'Steady pace. Step back instead of jumping if you need to.', 'burpee'),
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
        step('Rest', min(1), 'rest', r < 4 ? 'Gloves off or on, then back to the rower.' : 'Last rest.'),
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
      step('Warm up', min(5), 'warmup', 'Walk, then an easy jog.'),
      ...rounds(4, (r) => [
        step(`Run · round ${r}`, min(3), 'hard', 'Comfortably hard pace. Then slow the belt and step off.'),
        step(`Bag · round ${r}`, min(2), 'hard', `Throw ${COMBOS[r]} on repeat.`, 'bag-jab-cross'),
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
        step('Move', 45, 'rest', 'Slow the belt, step off and get your gloves on.'),
        step(`Bag · round ${r}`, min(2), 'max', 'Freestyle. Empty the tank.', 'bag-jab-cross'),
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
        step(`Swings · round ${r}`, 45, 'max', 'Gloves off, straight to the bell.', 'kettlebell-swing'),
        step(`TRX rows · round ${r}`, 45, 'hard', 'Squeeze your shoulder blades at the top.', 'trx-row'),
        step(`Knee tucks · round ${r}`, 30, 'hard', 'Feet in the cradles, hips level.', 'trx-knee-tuck'),
        step('Rest', 90, 'rest', r < 4 ? 'Gloves back on. Bag next.' : 'Last rest.'),
      ]),
      step('Cool down', min(3), 'easy', 'Walk, then stretch your hips, back and shoulders.'),
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

/** Seconds spent at each effort level, for the overview bar. */
export function effortBreakdown(session: Pick<CardioSession, 'steps'>): Partial<Record<Effort, number>> {
  const breakdown: Partial<Record<Effort, number>> = {};
  for (const s of session.steps) breakdown[s.effort] = (breakdown[s.effort] ?? 0) + s.seconds;
  return breakdown;
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
 * heart-rate zone for people who wear a watch. Shown live during a session.
 */
export const INTENSITY: Record<Effort, { rpe: [number, number]; heartRate: string; feel: string }> = {
  warmup: { rpe: [3, 4], heartRate: 'about 50–60% of max', feel: 'Light. Loosen up and let your breathing pick up.' },
  easy: { rpe: [3, 4], heartRate: 'about 60–70% of max', feel: 'Comfortable. You could chat the whole time.' },
  moderate: { rpe: [5, 6], heartRate: 'about 70–80% of max', feel: 'Working. Breathing deeper, short sentences only.' },
  hard: { rpe: [7, 8], heartRate: 'about 80–90% of max', feel: 'Tough. A few words at a time. Hold your form.' },
  max: { rpe: [9, 10], heartRate: 'above 90% of max', feel: 'Everything you have. No talking. It’s short.' },
  rest: { rpe: [1, 2], heartRate: 'coming down', feel: 'Recover. Slow, deep breaths through your nose.' },
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
  const label = step.label.replace(/(\d)-(?=\d)/g, '$1, ');
  // Skip the effort word when the label already says it, so a rest step isn't "Rest. Rest."
  const letters = (text: string) => text.toLowerCase().replace(/[^a-z]/g, '');
  const effort = EFFORT_LABELS[step.effort];
  const prefix = letters(label).startsWith(letters(effort)) ? '' : `${effort}. `;
  return `${prefix}${label}. ${spokenDuration(step.seconds)}.`;
}
