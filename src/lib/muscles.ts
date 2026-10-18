import type { Exercise } from './exercises';

/**
 * Body areas for browsing exercises by muscle. Each one gathers the muscle names that exercises use,
 * so "Lats" and "Upper back" both show under Back.
 */
export const MUSCLE_GROUPS = [
  { id: 'chest', label: 'Chest', muscles: ['Chest', 'Upper chest'] },
  { id: 'back', label: 'Back', muscles: ['Upper back', 'Lats', 'Back', 'Lower back', 'Spine'] },
  {
    id: 'shoulders',
    label: 'Shoulders',
    muscles: ['Shoulders', 'Front shoulders', 'Side shoulders', 'Rear shoulders', 'Traps'],
  },
  { id: 'arms', label: 'Arms', muscles: ['Biceps', 'Triceps', 'Forearms', 'Grip', 'Arms'] },
  { id: 'core', label: 'Core', muscles: ['Core', 'Abs', 'Lower abs', 'Obliques', 'Balance'] },
  { id: 'glutes', label: 'Glutes and hips', muscles: ['Glutes', 'Hips', 'Hip flexors', 'Inner thighs'] },
  { id: 'quads', label: 'Quads', muscles: ['Quads', 'Legs'] },
  { id: 'hamstrings', label: 'Hamstrings', muscles: ['Hamstrings'] },
  { id: 'calves', label: 'Calves', muscles: ['Calves'] },
  { id: 'conditioning', label: 'Full body and cardio', muscles: ['Full body', 'Heart and lungs'] },
] as const;

export type MuscleGroupId = (typeof MUSCLE_GROUPS)[number]['id'];

const GROUP_BY_MUSCLE = new Map<string, MuscleGroupId>(
  MUSCLE_GROUPS.flatMap((group) => group.muscles.map((muscle) => [muscle, group.id] as const)),
);

/** The body areas an exercise works, in the order its muscles are listed. */
export function muscleGroupsOf(exercise: Pick<Exercise, 'muscles'>): MuscleGroupId[] {
  const groups = exercise.muscles.map((muscle) => GROUP_BY_MUSCLE.get(muscle)).filter((g) => g !== undefined);
  return [...new Set(groups)];
}
