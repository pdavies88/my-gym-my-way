import type { EquipmentId } from './equipment';
import type { MotionId } from './motion/motions';

/** The role an exercise can fill in a generated workout. */
export type Slot =
  | 'squat'
  | 'hinge'
  | 'lunge'
  | 'calves'
  | 'hpush'
  | 'vpush'
  | 'hpull'
  | 'vpull'
  | 'biceps'
  | 'triceps'
  | 'shoulders'
  | 'core'
  | 'cardio';

export interface Exercise {
  id: string;
  name: string;
  slots: Slot[];
  muscles: string[];
  /**
   * Equipment options. The exercise is possible when you own every item in at least one option.
   * An empty list means bodyweight only.
   */
  needs: EquipmentId[][];
  motion: MotionId;
  cues: string[];
  /** A suggested starting point. The app doesn’t track sets or reps. */
  prescription: string;
}

const BODYWEIGHT: EquipmentId[][] = [];

export const EXERCISES: readonly Exercise[] = [
  // Squat
  {
    id: 'bodyweight-squat',
    name: 'Bodyweight squat',
    slots: ['squat'],
    muscles: ['Quads', 'Glutes'],
    needs: BODYWEIGHT,
    motion: 'squat',
    cues: [
      'Stand with feet shoulder-width apart, toes turned out a little.',
      'Sit your hips back and down. Push your knees out over your toes.',
      'Lower until your thighs are about level with the floor.',
      'Drive through your whole foot to stand tall.',
    ],
    prescription: '3 sets × 12–20 reps',
  },
  {
    id: 'jump-squat',
    name: 'Jump squat',
    slots: ['squat', 'cardio'],
    muscles: ['Quads', 'Glutes', 'Calves'],
    needs: BODYWEIGHT,
    motion: 'squat-jump',
    cues: [
      'Drop into a quarter squat and swing your arms back.',
      'Explode up and swing your arms overhead.',
      'Land softly on the balls of your feet and sink straight into the next rep.',
    ],
    prescription: '3 sets × 8–12 reps',
  },
  {
    id: 'goblet-squat',
    name: 'Goblet squat',
    slots: ['squat'],
    muscles: ['Quads', 'Glutes', 'Core'],
    needs: [['dumbbells'], ['kettlebell']],
    motion: 'goblet-squat',
    cues: [
      'Hold one weight against your chest with both hands, elbows pointing down.',
      'Keep your chest up as you sit down between your knees.',
      'Let your elbows brush the inside of your knees at the bottom.',
      'Stand up by pushing the floor away.',
    ],
    prescription: '3 sets × 8–12 reps',
  },
  {
    id: 'back-squat',
    name: 'Barbell back squat',
    slots: ['squat'],
    muscles: ['Quads', 'Glutes', 'Lower back'],
    needs: [['barbell', 'rack']],
    motion: 'back-squat',
    cues: [
      'Set the bar on your upper back, not your neck. Squeeze your shoulder blades together.',
      'Brace your core with a big breath before each rep.',
      'Sit down and back, keeping the bar over the middle of your foot.',
      'Drive up with your chest and hips rising together.',
    ],
    prescription: '4 sets × 5–8 reps',
  },
  // Hinge
  {
    id: 'glute-bridge',
    name: 'Glute bridge',
    slots: ['hinge'],
    muscles: ['Glutes', 'Hamstrings'],
    needs: BODYWEIGHT,
    motion: 'glute-bridge',
    cues: [
      'Lie on your back with knees bent and feet flat, close to your hips.',
      'Push through your heels and lift your hips until your body is straight from shoulders to knees.',
      'Squeeze your glutes hard at the top for one second.',
      'Lower slowly.',
    ],
    prescription: '3 sets × 12–20 reps',
  },
  {
    id: 'dumbbell-rdl',
    name: 'Dumbbell Romanian deadlift',
    slots: ['hinge'],
    muscles: ['Hamstrings', 'Glutes', 'Lower back'],
    needs: [['dumbbells']],
    motion: 'romanian-deadlift',
    cues: [
      'Hold the dumbbells in front of your thighs with soft knees.',
      'Push your hips back and slide the weights down your legs.',
      'Keep your back flat. Stop when you feel a strong stretch in your hamstrings.',
      'Drive your hips forward to stand.',
    ],
    prescription: '3 sets × 8–12 reps',
  },
  {
    id: 'barbell-deadlift',
    name: 'Barbell deadlift',
    slots: ['hinge'],
    muscles: ['Hamstrings', 'Glutes', 'Back'],
    needs: [['barbell']],
    motion: 'deadlift',
    cues: [
      'Stand with the bar over the middle of your feet.',
      'Grip just outside your knees. Pull the slack out of the bar and flatten your back.',
      'Push the floor away and keep the bar close to your legs.',
      'Finish standing tall. Lower it the same way.',
    ],
    prescription: '4 sets × 4–6 reps',
  },
  {
    id: 'kettlebell-deadlift',
    name: 'Kettlebell deadlift',
    slots: ['hinge'],
    muscles: ['Hamstrings', 'Glutes'],
    needs: [['kettlebell']],
    motion: 'kettlebell-deadlift',
    cues: [
      'Stand with the kettlebell between your feet.',
      'Hinge and bend your knees to grip the handle with a flat back.',
      'Stand up by driving your hips forward.',
    ],
    prescription: '3 sets × 10–15 reps',
  },
  {
    id: 'kettlebell-swing',
    name: 'Kettlebell swing',
    slots: ['hinge', 'cardio'],
    muscles: ['Glutes', 'Hamstrings', 'Core'],
    needs: [['kettlebell']],
    motion: 'kettlebell-swing',
    cues: [
      'Hike the bell back between your legs like a football snap.',
      'Snap your hips forward hard. The bell floats up to chest height.',
      'Your arms guide the bell. Your hips do the work.',
      'Let it fall back and hinge again.',
    ],
    prescription: '4 sets × 15–20 reps',
  },
  // Lunge
  {
    id: 'reverse-lunge',
    name: 'Reverse lunge',
    slots: ['lunge'],
    muscles: ['Quads', 'Glutes'],
    needs: BODYWEIGHT,
    motion: 'lunge',
    cues: [
      'Step one foot back and lower your back knee toward the floor.',
      'Keep your front shin close to vertical.',
      'Push through your front heel to return. Alternate legs.',
    ],
    prescription: '3 sets × 8–12 per leg',
  },
  {
    id: 'dumbbell-lunge',
    name: 'Dumbbell reverse lunge',
    slots: ['lunge'],
    muscles: ['Quads', 'Glutes'],
    needs: [['dumbbells']],
    motion: 'dumbbell-lunge',
    cues: [
      'Hold a dumbbell in each hand at your sides.',
      'Step back and drop your back knee toward the floor.',
      'Drive through your front foot to stand. Alternate legs.',
    ],
    prescription: '3 sets × 8–10 per leg',
  },
  {
    id: 'bulgarian-split-squat',
    name: 'Bulgarian split squat',
    slots: ['lunge', 'squat'],
    muscles: ['Quads', 'Glutes'],
    needs: [['bench']],
    motion: 'split-squat',
    cues: [
      'Rest the top of your back foot on a bench behind you.',
      'Lower straight down until your front thigh is about level with the floor.',
      'Keep most of your weight on the front foot.',
      'Finish all reps, then switch legs.',
    ],
    prescription: '3 sets × 8–12 per leg',
  },
  {
    id: 'step-up',
    name: 'Step-up',
    slots: ['lunge'],
    muscles: ['Quads', 'Glutes'],
    needs: [['box'], ['bench']],
    motion: 'step-up',
    cues: [
      'Place your whole foot on the box.',
      'Drive through that heel to stand on top. Don’t push off the back foot.',
      'Step down slowly. Alternate legs or finish one side first.',
    ],
    prescription: '3 sets × 10 per leg',
  },
  // Calves
  {
    id: 'calf-raise',
    name: 'Calf raise',
    slots: ['calves'],
    muscles: ['Calves'],
    needs: BODYWEIGHT,
    motion: 'calf-raise',
    cues: [
      'Stand tall with feet hip-width apart. Hold a wall for balance if you need to.',
      'Rise onto the balls of your feet as high as you can.',
      'Pause at the top, then lower slowly.',
    ],
    prescription: '3 sets × 15–25 reps',
  },
  // Horizontal push
  {
    id: 'push-up',
    name: 'Push-up',
    slots: ['hpush'],
    muscles: ['Chest', 'Triceps', 'Shoulders'],
    needs: BODYWEIGHT,
    motion: 'push-up',
    cues: [
      'Hands a little wider than your shoulders. Body straight from head to heels.',
      'Lower your chest to just above the floor. Elbows at about 45 degrees.',
      'Push the floor away until your arms are straight.',
    ],
    prescription: '3 sets × as many as you can with good form',
  },
  {
    id: 'knee-push-up',
    name: 'Knee push-up',
    slots: ['hpush'],
    muscles: ['Chest', 'Triceps'],
    needs: BODYWEIGHT,
    motion: 'knee-push-up',
    cues: [
      'Kneel and place your hands a little wider than your shoulders.',
      'Keep a straight line from your head to your knees.',
      'Lower your chest, then press back up.',
    ],
    prescription: '3 sets × 10–15 reps',
  },
  {
    id: 'diamond-push-up',
    name: 'Diamond push-up',
    slots: ['hpush', 'triceps'],
    muscles: ['Triceps', 'Chest'],
    needs: BODYWEIGHT,
    motion: 'diamond-push-up',
    cues: [
      'Bring your hands together under your chest, thumbs and fingers touching.',
      'Keep your elbows tucked close to your sides as you lower.',
      'Press back up to straight arms.',
    ],
    prescription: '3 sets × 6–12 reps',
  },
  {
    id: 'dumbbell-bench-press',
    name: 'Dumbbell bench press',
    slots: ['hpush'],
    muscles: ['Chest', 'Triceps', 'Shoulders'],
    needs: [['dumbbells', 'bench']],
    motion: 'dumbbell-bench-press',
    cues: [
      'Lie on the bench with feet flat on the floor.',
      'Start with the dumbbells over your chest, arms straight.',
      'Lower them to the sides of your chest, elbows at about 45 degrees.',
      'Press back up and bring them slightly together at the top.',
    ],
    prescription: '3 sets × 8–12 reps',
  },
  {
    id: 'barbell-bench-press',
    name: 'Barbell bench press',
    slots: ['hpush'],
    muscles: ['Chest', 'Triceps', 'Shoulders'],
    needs: [['barbell', 'bench', 'rack']],
    motion: 'bench-press',
    cues: [
      'Eyes under the bar. Squeeze your shoulder blades together and plant your feet.',
      'Unrack and lower the bar to your lower chest.',
      'Press up and slightly back over your shoulders.',
      'Use safeties or a spotter when you train heavy.',
    ],
    prescription: '4 sets × 5–8 reps',
  },
  {
    id: 'floor-press',
    name: 'Dumbbell floor press',
    slots: ['hpush'],
    muscles: ['Chest', 'Triceps'],
    needs: [['dumbbells']],
    motion: 'floor-press',
    cues: [
      'Lie on the floor with knees bent and a dumbbell in each hand.',
      'Lower until your upper arms touch the floor.',
      'Press straight up to lockout.',
    ],
    prescription: '3 sets × 8–12 reps',
  },
  {
    id: 'bench-dip',
    name: 'Bench dip',
    slots: ['triceps', 'hpush'],
    muscles: ['Triceps', 'Chest'],
    needs: [['bench'], ['box']],
    motion: 'bench-dip',
    cues: [
      'Sit on the edge of the bench, hands beside your hips, fingers forward.',
      'Slide forward off the bench with knees bent and feet flat.',
      'Bend your elbows straight back and lower until your upper arms are level with the floor.',
      'Press back up.',
    ],
    prescription: '3 sets × 10–15 reps',
  },
  // Vertical push
  {
    id: 'dumbbell-shoulder-press',
    name: 'Dumbbell shoulder press',
    slots: ['vpush'],
    muscles: ['Shoulders', 'Triceps'],
    needs: [['dumbbells']],
    motion: 'overhead-press',
    cues: [
      'Hold the dumbbells at shoulder height, palms forward.',
      'Brace your core and squeeze your glutes so your back doesn’t arch.',
      'Press straight up until your arms are straight.',
      'Lower with control.',
    ],
    prescription: '3 sets × 8–12 reps',
  },
  {
    id: 'barbell-overhead-press',
    name: 'Barbell overhead press',
    slots: ['vpush'],
    muscles: ['Shoulders', 'Triceps', 'Core'],
    needs: [['barbell']],
    motion: 'barbell-overhead-press',
    cues: [
      'Hold the bar on the front of your shoulders, hands just outside them.',
      'Move your head back slightly and press the bar straight up.',
      'Push your head through once the bar passes your forehead.',
    ],
    prescription: '4 sets × 5–8 reps',
  },
  {
    id: 'kettlebell-press',
    name: 'Single-arm kettlebell press',
    slots: ['vpush'],
    muscles: ['Shoulders', 'Triceps', 'Core'],
    needs: [['kettlebell']],
    motion: 'kettlebell-press',
    cues: [
      'Rack the kettlebell at your shoulder, wrist straight.',
      'Brace and press straight up until your arm is locked.',
      'Lower back to the rack position. Switch arms after each set.',
    ],
    prescription: '3 sets × 6–10 per arm',
  },
  {
    id: 'pike-push-up',
    name: 'Pike push-up',
    slots: ['vpush'],
    muscles: ['Shoulders', 'Triceps'],
    needs: BODYWEIGHT,
    motion: 'pike-push-up',
    cues: [
      'Start in a push-up, then walk your feet in and lift your hips high.',
      'Bend your elbows and lower the top of your head toward the floor.',
      'Press back up.',
    ],
    prescription: '3 sets × 6–12 reps',
  },
  {
    id: 'band-overhead-press',
    name: 'Band overhead press',
    slots: ['vpush'],
    muscles: ['Shoulders', 'Triceps'],
    needs: [['bands']],
    motion: 'band-overhead-press',
    cues: [
      'Stand on the band with feet hip-width apart. Hold the ends at shoulder height.',
      'Press straight up until your arms are straight.',
      'Lower slowly against the band.',
    ],
    prescription: '3 sets × 12–15 reps',
  },
  // Horizontal pull
  {
    id: 'dumbbell-row',
    name: 'Bent-over dumbbell row',
    slots: ['hpull'],
    muscles: ['Upper back', 'Lats', 'Biceps'],
    needs: [['dumbbells']],
    motion: 'bent-over-row',
    cues: [
      'Hinge forward with a flat back, dumbbells hanging under your shoulders.',
      'Pull your elbows back toward your hips.',
      'Squeeze your shoulder blades together, then lower slowly.',
    ],
    prescription: '3 sets × 8–12 reps',
  },
  {
    id: 'barbell-row',
    name: 'Barbell row',
    slots: ['hpull'],
    muscles: ['Upper back', 'Lats', 'Biceps'],
    needs: [['barbell']],
    motion: 'barbell-row',
    cues: [
      'Hinge forward with a flat back and an overhand grip.',
      'Pull the bar to your lower ribs.',
      'Lower it under control without letting your back round.',
    ],
    prescription: '4 sets × 6–10 reps',
  },
  {
    id: 'kettlebell-row',
    name: 'Single-arm kettlebell row',
    slots: ['hpull'],
    muscles: ['Lats', 'Upper back', 'Biceps'],
    needs: [['kettlebell']],
    motion: 'single-arm-row',
    cues: [
      'Stagger your stance and rest your free hand on your thigh.',
      'Pull the bell up beside your ribs, elbow close to your body.',
      'Lower until your arm is straight. Switch arms after each set.',
    ],
    prescription: '3 sets × 8–12 per arm',
  },
  {
    id: 'band-seated-row',
    name: 'Seated band row',
    slots: ['hpull'],
    muscles: ['Upper back', 'Lats', 'Biceps'],
    needs: [['bands']],
    motion: 'seated-row',
    cues: [
      'Sit with legs straight and loop the band around your feet.',
      'Sit tall and pull your hands to your stomach.',
      'Squeeze your shoulder blades together, then reach forward slowly.',
    ],
    prescription: '3 sets × 12–15 reps',
  },
  {
    id: 'cable-row',
    name: 'Seated cable row',
    slots: ['hpull'],
    muscles: ['Upper back', 'Lats', 'Biceps'],
    needs: [['cable']],
    motion: 'seated-row',
    cues: [
      'Sit tall with your feet braced and knees soft.',
      'Pull the handle to your stomach, leading with your elbows.',
      'Let your shoulders reach forward at the end of each rep.',
    ],
    prescription: '3 sets × 10–12 reps',
  },
  {
    id: 'band-pull-apart',
    name: 'Band pull-apart',
    slots: ['shoulders', 'hpull'],
    muscles: ['Rear shoulders', 'Upper back'],
    needs: [['bands']],
    motion: 'band-pull-apart',
    cues: [
      'Hold the band in front of you at shoulder height, arms straight.',
      'Pull your hands apart until the band touches your chest.',
      'Return slowly.',
    ],
    prescription: '3 sets × 15–20 reps',
  },
  {
    id: 'face-pull',
    name: 'Face pull',
    slots: ['shoulders', 'hpull'],
    muscles: ['Rear shoulders', 'Upper back'],
    needs: [['cable'], ['bands']],
    motion: 'face-pull',
    cues: [
      'Anchor the rope or band at face height.',
      'Pull toward your forehead and spread your hands apart.',
      'Finish with your hands beside your ears, elbows high.',
    ],
    prescription: '3 sets × 12–15 reps',
  },
  // Vertical pull
  {
    id: 'pull-up',
    name: 'Pull-up',
    slots: ['vpull'],
    muscles: ['Lats', 'Upper back', 'Biceps'],
    needs: [['pullupBar']],
    motion: 'pull-up',
    cues: [
      'Hang with an overhand grip a little wider than your shoulders.',
      'Pull your elbows down toward your ribs until your chin passes the bar.',
      'Lower all the way down with control.',
      'Too hard for now? Loop a band under your feet for help.',
    ],
    prescription: '3 sets × as many as you can',
  },
  {
    id: 'chin-up',
    name: 'Chin-up',
    slots: ['vpull', 'biceps'],
    muscles: ['Lats', 'Biceps'],
    needs: [['pullupBar']],
    motion: 'chin-up',
    cues: [
      'Hang with palms facing you, hands shoulder-width apart.',
      'Pull your chest toward the bar.',
      'Lower slowly to a full hang.',
    ],
    prescription: '3 sets × as many as you can',
  },
  {
    id: 'lat-pulldown',
    name: 'Lat pulldown',
    slots: ['vpull'],
    muscles: ['Lats', 'Biceps'],
    needs: [['cable'], ['bands']],
    motion: 'lat-pulldown',
    cues: [
      'Kneel or sit facing the anchor with arms reaching up.',
      'Pull the handle down to your upper chest, elbows driving toward your hips.',
      'Let your arms rise back up slowly.',
    ],
    prescription: '3 sets × 10–12 reps',
  },
  // Arms
  {
    id: 'dumbbell-curl',
    name: 'Dumbbell curl',
    slots: ['biceps'],
    muscles: ['Biceps'],
    needs: [['dumbbells']],
    motion: 'curl',
    cues: [
      'Stand tall with the dumbbells at your sides, palms forward.',
      'Curl the weights up without swinging. Keep your elbows by your ribs.',
      'Lower slowly.',
    ],
    prescription: '3 sets × 10–12 reps',
  },
  {
    id: 'hammer-curl',
    name: 'Hammer curl',
    slots: ['biceps'],
    muscles: ['Biceps', 'Forearms'],
    needs: [['dumbbells']],
    motion: 'curl',
    cues: [
      'Hold the dumbbells with palms facing each other.',
      'Curl them up, keeping your thumbs on top.',
      'Lower with control.',
    ],
    prescription: '3 sets × 10–12 reps',
  },
  {
    id: 'barbell-curl',
    name: 'Barbell curl',
    slots: ['biceps'],
    muscles: ['Biceps'],
    needs: [['barbell']],
    motion: 'barbell-curl',
    cues: [
      'Hold the bar shoulder-width apart, palms forward.',
      'Curl it to your shoulders while your elbows stay still.',
      'Lower it all the way down.',
    ],
    prescription: '3 sets × 8–12 reps',
  },
  {
    id: 'band-curl',
    name: 'Band curl',
    slots: ['biceps'],
    muscles: ['Biceps'],
    needs: [['bands'], ['cable']],
    motion: 'band-curl',
    cues: [
      'Stand on the band and hold the ends, palms forward.',
      'Curl your hands up to your shoulders.',
      'Lower slowly against the band.',
    ],
    prescription: '3 sets × 12–15 reps',
  },
  {
    id: 'overhead-triceps-extension',
    name: 'Overhead triceps extension',
    slots: ['triceps'],
    muscles: ['Triceps'],
    needs: [['dumbbells']],
    motion: 'overhead-extension',
    cues: [
      'Hold one dumbbell overhead with both hands.',
      'Lower it behind your head by bending your elbows. Keep them pointing up.',
      'Straighten your arms to lift it back up.',
    ],
    prescription: '3 sets × 10–12 reps',
  },
  {
    id: 'triceps-pushdown',
    name: 'Triceps pushdown',
    slots: ['triceps'],
    muscles: ['Triceps'],
    needs: [['cable'], ['bands']],
    motion: 'pushdown',
    cues: [
      'Anchor the band or cable above head height.',
      'Pin your elbows to your sides.',
      'Push your hands down until your arms are straight, then let them rise slowly.',
    ],
    prescription: '3 sets × 12–15 reps',
  },
  // Shoulders
  {
    id: 'lateral-raise',
    name: 'Lateral raise',
    slots: ['shoulders'],
    muscles: ['Side shoulders'],
    needs: [['dumbbells']],
    motion: 'lateral-raise',
    cues: [
      'Hold light dumbbells at your sides with a slight bend in your elbows.',
      'Raise your arms out to the sides until they reach shoulder height.',
      'Lower slowly. Don’t shrug.',
    ],
    prescription: '3 sets × 12–15 reps',
  },
  {
    id: 'band-lateral-raise',
    name: 'Band lateral raise',
    slots: ['shoulders'],
    muscles: ['Side shoulders'],
    needs: [['bands']],
    motion: 'band-lateral-raise',
    cues: [
      'Stand on the band and hold an end in each hand.',
      'Raise your arms out to the sides to shoulder height.',
      'Lower with control.',
    ],
    prescription: '3 sets × 15 reps',
  },
  // Core
  {
    id: 'plank',
    name: 'Plank',
    slots: ['core'],
    muscles: ['Abs', 'Core'],
    needs: BODYWEIGHT,
    motion: 'plank',
    cues: [
      'Rest on your forearms with elbows under your shoulders.',
      'Make a straight line from head to heels. Squeeze your glutes.',
      'Breathe steadily and hold.',
    ],
    prescription: '3 × 30–60 seconds',
  },
  {
    id: 'dead-bug',
    name: 'Dead bug',
    slots: ['core'],
    muscles: ['Abs', 'Core'],
    needs: BODYWEIGHT,
    motion: 'dead-bug',
    cues: [
      'Lie on your back with arms pointing up and knees over your hips.',
      'Press your lower back into the floor.',
      'Reach one arm back and the opposite leg out, then return. Alternate sides.',
    ],
    prescription: '3 sets × 8–10 per side',
  },
  {
    id: 'crunch',
    name: 'Crunch',
    slots: ['core'],
    muscles: ['Abs'],
    needs: BODYWEIGHT,
    motion: 'crunch',
    cues: [
      'Lie on your back with knees bent and fingertips behind your ears.',
      'Curl your shoulders off the floor by squeezing your abs.',
      'Lower slowly. Don’t pull on your neck.',
    ],
    prescription: '3 sets × 15–20 reps',
  },
  {
    id: 'leg-raise',
    name: 'Lying leg raise',
    slots: ['core'],
    muscles: ['Lower abs', 'Hip flexors'],
    needs: BODYWEIGHT,
    motion: 'leg-raise',
    cues: [
      'Lie on your back with your legs straight and hands at your sides.',
      'Keep your lower back pressed down and lift your legs to vertical.',
      'Lower them slowly without letting your back arch.',
    ],
    prescription: '3 sets × 10–15 reps',
  },
  {
    id: 'bird-dog',
    name: 'Bird dog',
    slots: ['core'],
    muscles: ['Core', 'Lower back', 'Glutes'],
    needs: BODYWEIGHT,
    motion: 'bird-dog',
    cues: [
      'Start on hands and knees with a flat back.',
      'Reach one arm forward and the opposite leg back.',
      'Hold for a breath, return, then switch sides.',
    ],
    prescription: '3 sets × 8 per side',
  },
  {
    id: 'mountain-climber',
    name: 'Mountain climber',
    slots: ['core', 'cardio'],
    muscles: ['Core', 'Shoulders', 'Hip flexors'],
    needs: BODYWEIGHT,
    motion: 'mountain-climber',
    cues: [
      'Start in a high plank with hands under your shoulders.',
      'Drive one knee toward your chest, then switch legs quickly.',
      'Keep your hips low and level.',
    ],
    prescription: '3 × 30 seconds',
  },
  {
    id: 'russian-twist',
    name: 'Russian twist',
    slots: ['core'],
    muscles: ['Obliques', 'Abs'],
    needs: [['medicineBall'], ['dumbbells'], ['kettlebell']],
    motion: 'russian-twist',
    cues: [
      'Sit leaning back slightly, knees bent, holding the weight at your chest.',
      'Turn your shoulders to one side, then the other.',
      'Lift your feet off the floor to make it harder.',
    ],
    prescription: '3 sets × 10–16 per side',
  },
  {
    id: 'hanging-knee-raise',
    name: 'Hanging knee raise',
    slots: ['core'],
    muscles: ['Lower abs', 'Hip flexors', 'Grip'],
    needs: [['pullupBar']],
    motion: 'hanging-knee-raise',
    cues: [
      'Hang from the bar with straight arms.',
      'Pull your knees up toward your chest without swinging.',
      'Lower them slowly.',
    ],
    prescription: '3 sets × 8–15 reps',
  },
  {
    id: 'ab-wheel-rollout',
    name: 'Ab wheel rollout',
    slots: ['core'],
    muscles: ['Abs', 'Lats', 'Core'],
    needs: [['abWheel']],
    motion: 'ab-rollout',
    cues: [
      'Kneel and hold the wheel under your shoulders.',
      'Roll forward slowly while you keep your back from sagging.',
      'Go only as far as you can control, then pull back with your abs.',
    ],
    prescription: '3 sets × 6–12 reps',
  },
  {
    id: 'medicine-ball-slam',
    name: 'Medicine ball slam',
    slots: ['core', 'cardio'],
    muscles: ['Core', 'Shoulders', 'Lats'],
    needs: [['medicineBall']],
    motion: 'medicine-ball-slam',
    cues: [
      'Lift the ball overhead and rise onto your toes.',
      'Slam it into the floor in front of you as hard as you can.',
      'Squat to pick it up and repeat.',
    ],
    prescription: '3 sets × 10–15 reps',
  },
  // Cardio and conditioning
  {
    id: 'jumping-jack',
    name: 'Jumping jacks',
    slots: ['cardio'],
    muscles: ['Full body'],
    needs: BODYWEIGHT,
    motion: 'jumping-jack',
    cues: [
      'Jump your feet out wide while you swing your arms overhead.',
      'Jump back to feet together, arms at your sides.',
      'Stay light on the balls of your feet.',
    ],
    prescription: '3 × 45 seconds',
  },
  {
    id: 'high-knees',
    name: 'High knees',
    slots: ['cardio'],
    muscles: ['Hip flexors', 'Quads', 'Calves'],
    needs: BODYWEIGHT,
    motion: 'high-knees',
    cues: [
      'Run in place and drive each knee up to hip height.',
      'Pump your arms in rhythm with your legs.',
      'Land softly on the balls of your feet.',
    ],
    prescription: '3 × 30 seconds',
  },
  {
    id: 'burpee',
    name: 'Burpee',
    slots: ['cardio'],
    muscles: ['Full body'],
    needs: BODYWEIGHT,
    motion: 'burpee',
    cues: [
      'Squat down and place your hands on the floor.',
      'Jump your feet back into a plank.',
      'Jump your feet back in, then stand and reach overhead.',
    ],
    prescription: '3 sets × 8–12 reps',
  },
  {
    id: 'jump-rope',
    name: 'Jump rope',
    slots: ['cardio'],
    muscles: ['Calves', 'Shoulders'],
    needs: [['jumpRope']],
    motion: 'jump-rope',
    cues: [
      'Keep your elbows close and turn the rope with your wrists.',
      'Make small, quick hops just high enough to clear the rope.',
      'Stay on the balls of your feet.',
    ],
    prescription: '5 × 1 minute',
  },
  {
    id: 'rowing-machine',
    name: 'Rowing machine',
    slots: ['cardio'],
    muscles: ['Legs', 'Back', 'Arms'],
    needs: [['rower']],
    motion: 'rowing-machine',
    cues: [
      'Push with your legs first, then lean back, then pull with your arms.',
      'Return in reverse order: arms, body, then legs.',
      'Keep a steady rhythm.',
    ],
    prescription: '10–20 minutes, easy to moderate pace',
  },
  {
    id: 'exercise-bike',
    name: 'Exercise bike',
    slots: ['cardio'],
    muscles: ['Quads', 'Glutes', 'Calves'],
    needs: [['bike']],
    motion: 'stationary-bike',
    cues: [
      'Set the seat so your knee is slightly bent at the bottom of each pedal stroke.',
      'Keep your upper body relaxed.',
      'Try intervals: 30 seconds hard, 90 seconds easy.',
    ],
    prescription: '10–20 minutes',
  },
  {
    id: 'treadmill-run',
    name: 'Treadmill run',
    slots: ['cardio'],
    muscles: ['Legs', 'Heart and lungs'],
    needs: [['treadmill']],
    motion: 'run',
    cues: [
      'Start with a few minutes of walking to warm up.',
      'Run tall with short, quick steps.',
      'Pick a pace where you can still speak a few words.',
    ],
    prescription: '10–20 minutes',
  },
  {
    id: 'farmer-carry',
    name: 'Farmer carry',
    slots: ['core'],
    muscles: ['Grip', 'Core', 'Traps'],
    needs: [['dumbbells'], ['kettlebell']],
    motion: 'farmer-carry',
    cues: [
      'Hold a heavy weight in each hand at your sides.',
      'Stand tall with shoulders down and back.',
      'Walk with short, steady steps.',
    ],
    prescription: '3 × 30–40 meters',
  },
];

const BY_ID = new Map(EXERCISES.map((exercise) => [exercise.id, exercise]));

export function getExercise(id: string): Exercise | undefined {
  return BY_ID.get(id);
}

/** True when the owned equipment covers at least one of the exercise's options. */
export function canDo(exercise: Exercise, owned: ReadonlySet<EquipmentId>): boolean {
  return exercise.needs.length === 0 || exercise.needs.some((option) => option.every((item) => owned.has(item)));
}

export function availableExercises(owned: ReadonlySet<EquipmentId>): Exercise[] {
  return EXERCISES.filter((exercise) => canDo(exercise, owned));
}

export const SLOT_LABELS: Record<Slot, string> = {
  squat: 'Squat',
  hinge: 'Hinge',
  lunge: 'Lunge',
  calves: 'Calves',
  hpush: 'Push',
  vpush: 'Overhead',
  hpull: 'Row',
  vpull: 'Pull-down',
  biceps: 'Biceps',
  triceps: 'Triceps',
  shoulders: 'Shoulders',
  core: 'Core',
  cardio: 'Cardio',
};
