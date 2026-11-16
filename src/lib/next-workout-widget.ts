import { Platform } from 'react-native';

import { getCardioSession } from './cardio';
import { getExercise } from './exercises';
import { nextProgramDay } from './program';
import type { Program, SessionLog } from './storage/schemas';
import { weekStreak } from './streak';
import { startOfWeek } from './time';

/** Guided sessions the medium widget offers with one tap. */
const QUICK_SESSIONS = ['quiet-morning', 'stretch-five'];

type Widget = { updateSnapshot(props: unknown): void };
let widget: Widget | null | undefined;

/** Loaded on first use, so Android and Expo Go never touch the widget's native code. */
function load(): Widget | null {
  if (widget !== undefined) return widget;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    widget = Platform.OS === 'ios' ? (require('@/widgets/next-workout-widget').default as Widget) : null;
  } catch {
    widget = null;
  }
  return widget;
}

/** Sends the next program workout, the week streak and the quick sessions to the home screen widget. */
export function updateNextWorkoutWidget(program: Program | null, sessions: readonly SessionLog[], now: number): void {
  const target = load();
  if (!target) return;
  const next = program ? nextProgramDay(program) : null;
  const day = program && next ? program.days[next.day] : undefined;
  const startTimes = sessions.map((s) => s.startedAt);
  try {
    target.updateSnapshot({
      ...(day && next
        ? {
            next: {
              title: day.name,
              detail: `Week ${next.week} · ${day.exerciseIds
                .slice(0, 3)
                .map((id) => getExercise(id)?.name)
                .join(', ')}`,
            },
          }
        : {}),
      weekStreak: weekStreak(startTimes, now),
      thisWeek: startTimes.filter((t) => t >= startOfWeek(now)).length,
      quick: QUICK_SESSIONS.map((id) => ({ id, name: getCardioSession(id)?.name ?? id })),
    });
  } catch {
    // The widget is a convenience. The app works without it.
  }
}
