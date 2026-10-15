/** A YouTube demonstration for one exercise. Embedded on the exercise screen and credited to its channel. */
export interface ExerciseVideo {
  /** The 11-character YouTube video id. */
  videoId: string;
  /** Title and channel as YouTube reports them (oEmbed), for attribution. */
  title: string;
  channel: string;
  /** Second where the demonstration starts, for longer videos. */
  start?: number;
}

/**
 * One curated video per exercise, keyed by exercise id. Each id was checked against YouTube's oEmbed
 * endpoint, which confirms the video exists and allows embedding. Run `npm run check-videos` to recheck.
 */
export const EXERCISE_VIDEOS: Record<string, ExerciseVideo> = {
  'bodyweight-squat': {
    videoId: 'l83R5PblSMA',
    title: 'Leg exercise - How to bodyweight squat',
    channel: 'PureGym',
  },
  'jump-squat': {
    videoId: 'BRfxI2Es2lE',
    title: 'How To Jump Squat',
    channel: 'PureGym',
  },
  'goblet-squat': {
    videoId: 'zBV3ceGyAxw',
    title: 'How To Do A Goblet squat',
    channel: 'PureGym',
  },
  'back-squat': {
    videoId: 'rrJIyZGlK8c',
    title: 'How To Do A Barbell Back Squat',
    channel: 'PureGym',
  },
  'glute-bridge': {
    videoId: 'tqp5XQPpTxY',
    title: 'How To Do A Glute Bridge',
    channel: 'PureGym',
  },
  'dumbbell-rdl': {
    videoId: 'hQgFixeXdZo',
    title: 'Dumbbell Romanian (RDL) Deadlift |TECHNIQUE for Beginners',
    channel: 'Mike | J2FIT Strength & Conditioning',
  },
  'barbell-deadlift': {
    videoId: 'GxsLrTzyGUU',
    title: 'How to Do A Conventional Deadlift Correctly',
    channel: 'PureGym',
  },
  'kettlebell-deadlift': {
    videoId: 'LnIMaf-XOpM',
    title: 'How to do a Kettlebell Deadlift  | Proper Form & Technique | NASM',
    channel: 'National Academy of Sports Medicine (NASM)',
  },
  'kettlebell-swing': {
    videoId: '1FjAoO5McVI',
    title: 'How To Do A Kettlebell Swing (Two Handed)',
    channel: 'PureGym',
  },
  'reverse-lunge': {
    videoId: 'xrPteyQLGAo',
    title: 'How To Reverse Lunge',
    channel: 'PureGym',
  },
  'dumbbell-lunge': {
    videoId: 'Q2k3kYbtOcI',
    title: 'Dumbbell Reverse Lunge',
    channel: 'OPEX Fitness',
  },
  'bulgarian-split-squat': {
    videoId: 'TEXl2b3__S4',
    title: 'How To Do Bulgarian Split Squats',
    channel: 'PureGym',
  },
  'step-up': {
    videoId: 'DxUNi119Qzs',
    title: 'How To Do A Dumbbell Step Up',
    channel: 'PureGym',
  },
  'calf-raise': {
    videoId: 'k8ipHzKeAkQ',
    title: 'Exercises with an Athletic Trainer: Standing Calf Raises',
    channel: 'Children\'s Hospital Colorado',
  },
  'push-up': {
    videoId: 'Env8gAr_QnE',
    title: 'How To Do Press Ups',
    channel: 'PureGym',
  },
  'knee-push-up': {
    videoId: 'X9sGmsGYYE0',
    title: 'How To Press Up From Knees (Modified Press Up)',
    channel: 'PureGym',
  },
  'diamond-push-up': {
    videoId: 'K8bKxVcwjrk',
    title: 'How To Do A Diamond Push up',
    channel: 'PureGym',
  },
  'dumbbell-bench-press': {
    videoId: 'AduT4Eq-iP0',
    title: 'How To Do A Dumbbell Bench Press',
    channel: 'PureGym',
  },
  'barbell-bench-press': {
    videoId: 'CjHIKDQ4RQo',
    title: 'How To Do A Barbell Bench Press Correctly',
    channel: 'PureGym',
  },
  'floor-press': {
    videoId: 'T0Y3OBF1bNI',
    title: 'How To Do A Dumbbell Floor Press',
    channel: 'PureGym',
  },
  'bench-dip': {
    videoId: 'qrS6aa0aQ9I',
    title: 'How To Do A Bodyweight Tricep Dip',
    channel: 'PureGym',
  },
  'dumbbell-shoulder-press': {
    videoId: 'MMjBnEBnZKM',
    title: 'How to do a Dumbbell Overhead Press',
    channel: 'National Academy of Sports Medicine (NASM)',
  },
  'barbell-overhead-press': {
    videoId: 'cGnhixvC8uA',
    title: 'How to do a Barbell Overhead Press',
    channel: 'National Academy of Sports Medicine (NASM)',
  },
  'kettlebell-press': {
    videoId: 'gjr-QAdsq4o',
    title: 'Single Arm Kettlebell Press Exercise | Onnit Tutorial',
    channel: 'Onnit',
  },
  'pike-push-up': {
    videoId: 'XckEEwa1BPI',
    title: 'How to do a Pike Push-Up',
    channel: 'National Academy of Sports Medicine (NASM)',
  },
  'band-overhead-press': {
    videoId: 'Zli1UXH9ZeE',
    title: 'Band Overhead Press',
    channel: 'FitnessBlender',
  },
  'dumbbell-row': {
    videoId: 'DJfQN6xJL28',
    title: 'How to do a Dumbbell Bent Over Row',
    channel: 'National Academy of Sports Medicine (NASM)',
  },
  'barbell-row': {
    videoId: 'bm0_q9bR_HA',
    title: 'How to do a Barbell Bent Over Row Pronated',
    channel: 'National Academy of Sports Medicine (NASM)',
  },
  'kettlebell-row': {
    videoId: 'l5qelXL5nfs',
    title: 'Single Arm Kettlebell Row',
    channel: 'OPEX Fitness',
  },
  'band-seated-row': {
    videoId: 'mnP10HI18uI',
    title: 'SEATED RESISTANCE BAND ROW | Exercise Demonstration Video and Guide',
    channel: 'Live Lean TV Daily Exercises',
  },
  'cable-row': {
    videoId: 'GZbfZ033f74',
    title: 'How To: Seated Low Row (LF Cable)',
    channel: 'ScottHermanFitness',
  },
  'band-pull-apart': {
    videoId: 'bYsgk9SrJ48',
    title: 'How to Do Band Pull Aparts: A Guide from Physical Therapists',
    channel: 'Hinge Health',
  },
  'face-pull': {
    videoId: 'eTCBSFlCJ_s',
    title: 'How to do a Face Pull | Proper Form & Technique | NASM',
    channel: 'National Academy of Sports Medicine (NASM)',
  },
  'pull-up': {
    videoId: '9yVGh3XbJ34',
    title: 'How to do a Pull-Up | Proper Form & Technique | NASM',
    channel: 'National Academy of Sports Medicine (NASM)',
  },
  'chin-up': {
    videoId: 'mRy9m2Q9_1I',
    title: 'Proper Chin-Up Form',
    channel: 'KILO Personal Trainer & Strength Coach Education',
  },
  'lat-pulldown': {
    videoId: 'AOpi-p0cJkc',
    title: 'Beginner\'s Guide: Lat Pulldown',
    channel: 'SilverSneakers',
  },
  'dumbbell-curl': {
    videoId: 'cBSD6mQIPQk',
    title: 'Dumbbell Bicep Curl | Nuffield Health',
    channel: 'Nuffield Health',
  },
  'hammer-curl': {
    videoId: 'CFBZ4jN1CMI',
    title: 'How to do a Dumbbell Hammer Curl',
    channel: 'National Academy of Sports Medicine (NASM)',
  },
  'barbell-curl': {
    videoId: 'QciWGMjD-nM',
    title: 'How to do a Barbell Biceps Curl',
    channel: 'National Academy of Sports Medicine (NASM)',
  },
  'band-curl': {
    videoId: '3g-1J2KkX_8',
    title: 'Band Bicep Curl',
    channel: 'FitnessBlender',
  },
  'overhead-triceps-extension': {
    videoId: '-Vyt2QdsR7E',
    title: 'How To: Standing Overhead Dumbbell Tricep Extension',
    channel: 'ScottHermanFitness',
  },
  'triceps-pushdown': {
    videoId: '2-LAMcpzODU',
    title: 'How To: Tricep Pushdown (Life Fitness Cable)',
    channel: 'ScottHermanFitness',
  },
  'lateral-raise': {
    videoId: 'XPPfnSEATJA',
    title: 'How to do a Dumbbell Lateral Raise',
    channel: 'National Academy of Sports Medicine (NASM)',
  },
  'band-lateral-raise': {
    videoId: 'yfNg5sFndbw',
    title: 'Band Lateral Raise',
    channel: 'Men\'s Health',
  },
  'plank': {
    videoId: 'mH5Sfb_KTGg',
    title: 'How to do a Forearm Plank | The Right Way | Well+Good',
    channel: 'Well+Good',
  },
  'dead-bug': {
    videoId: 'GbSC02oU3To',
    title: 'How to Do a Dead Bug: A Guide from Physical Therapists',
    channel: 'Hinge Health',
  },
  'crunch': {
    videoId: '0t4t3IpiEao',
    title: 'How To Do Crunches | The Right Way | Well+Good',
    channel: 'Well+Good',
  },
  'leg-raise': {
    videoId: 'JB2oyawG9KI',
    title: 'How to Do Leg Raises',
    channel: 'LIVESTRONG',
  },
  'bird-dog': {
    videoId: 'xEDnlOxeJH4',
    title: 'How to Do the Bird Dog Exercise: A Guide from Physical Therapists',
    channel: 'Hinge Health',
  },
  'mountain-climber': {
    videoId: 'cnyTQDSE884',
    title: 'How to Do Mountain Climbers | The Right Way | Well+Good',
    channel: 'Well+Good',
  },
  'russian-twist': {
    videoId: 'LlccOWys8IU',
    title: 'How To Russian Twist | Nuffield Health',
    channel: 'Nuffield Health',
  },
  'hanging-knee-raise': {
    videoId: 'l7OroezzX9k',
    title: 'Hanging Knee Raise Tutorial - Proper Form and Technique',
    channel: 'Runna',
  },
  'ab-wheel-rollout': {
    videoId: 'SBO5aFR09D4',
    title: 'How To Do Ab Wheel Roll Outs',
    channel: 'PureGym',
  },
  'medicine-ball-slam': {
    videoId: '6vXHh-Lhb2o',
    title: 'How to Do Medicine Ball Slams | Sleek/Strong With Rachel Cosgrove',
    channel: 'LivestrongWoman',
  },
  'jumping-jack': {
    videoId: 'uLVt6u15L98',
    title: 'How to do a Jumping Jack  | Proper Form & Technique | NASM',
    channel: 'National Academy of Sports Medicine (NASM)',
  },
  'high-knees': {
    videoId: 'QIwxSeKpHtI',
    title: 'How to perform HIGH Knees',
    channel: 'Get Healthy U - with Chris Freytag',
  },
  'burpee': {
    videoId: 'NCqbpkoiyXE',
    title: 'How To Burpee | Nuffield Health',
    channel: 'Nuffield Health',
  },
  'jump-rope': {
    videoId: 'u3zgHI8QnqE',
    title: 'How To Jump Rope | The Right Way | Well+Good',
    channel: 'Well+Good',
  },
  'rowing-machine': {
    videoId: '4zWu1yuJ0_g',
    title: 'Correct Rowing Machine Technique, Improve Your Rowing  | Concept2',
    channel: 'concept2usa',
  },
  'exercise-bike': {
    videoId: 'NwwDBARCGgo',
    title: 'How To Use The Stationary Bike',
    channel: 'PureGym',
  },
  'treadmill-run': {
    videoId: 'HxsFneJFM2c',
    title: 'How To Use The Treadmill',
    channel: 'PureGym',
  },
  'farmer-carry': {
    videoId: 'lLAw6fUccKA',
    title: 'Farmer\'s Carry Tutorial - Proper Form and Technique',
    channel: 'Runna',
  },
};

export function getVideo(exerciseId: string): ExerciseVideo | undefined {
  return EXERCISE_VIDEOS[exerciseId];
}
