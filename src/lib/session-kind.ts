import type { SessionLog } from '@/lib/storage/schemas';

/** How History labels each kind of session. Logs from before kinds existed are strength workouts. */
export const SESSION_KIND_LABELS = {
  strength: 'Workout',
  cardio: 'Cardio',
  circuit: 'Circuit',
  stretch: 'Stretch',
} as const;

/** Color of the bar beside each session in History. */
export const SESSION_KIND_COLORS = {
  cardio: '#5CC8FF',
  circuit: '#FFC233',
  stretch: '#B48CFF',
} as const;

export function sessionKind(log: Pick<SessionLog, 'kind'>): keyof typeof SESSION_KIND_LABELS {
  return log.kind ?? 'strength';
}
