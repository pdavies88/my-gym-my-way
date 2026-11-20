import { createContext, use, useEffect, type ReactNode } from 'react';
import { Alert } from 'react-native';

import type { Focus } from '@/lib/generator';
import type { CircuitPlan } from '@/lib/circuit';
import { newId } from '@/lib/id';
import { updateNextWorkoutWidget } from '@/lib/next-workout-widget';
import { markProgramDay, nextProgramDay, programDayName } from '@/lib/program';
import { useStoredState } from '@/hooks/use-stored-state';
import { readJson, readList } from '@/lib/storage/kv';
import {
  ActiveSessionSchema,
  KEYS,
  ProgramSchema,
  SavedWorkoutSchema,
  SessionLogSchema,
  type ActiveSession,
  type Program,
  type ProgramDayRef,
  type SavedWorkout,
  type SessionLog,
  type SetEntry,
} from '@/lib/storage/schemas';

type NewWorkout = { name: string; exerciseIds: string[]; focus?: Focus; circuit?: CircuitPlan };

type TrainingContextValue = {
  workouts: SavedWorkout[];
  sessions: SessionLog[];
  active: ActiveSession | null;
  /** Returns null when the list is full and this would be a new workout. */
  saveWorkout: (workout: NewWorkout, id?: string) => SavedWorkout | null;
  deleteWorkout: (id: string) => void;
  startSession: (session: {
    name: string;
    exerciseIds: string[];
    workoutId?: string;
    programDay?: ProgramDayRef;
  }) => void;
  toggleExercise: (exerciseId: string) => void;
  /**
   * Changes the logged sets for one exercise, starting from the newest sets so fast taps all count.
   * Reaching the target number of sets ticks the exercise off.
   */
  updateExerciseSets: (exerciseId: string, change: (sets: SetEntry[]) => SetEntry[], targetSets: number) => void;
  program: Program | null;
  saveProgram: (program: Program | null) => void;
  /** Starts a program day as a workout session. Defaults to the next day not done yet. */
  startProgramDay: (day?: { week: number; day: number }) => boolean;
  finishSession: () => SessionLog | null;
  logCardio: (entry: {
    cardioId: string;
    name: string;
    startedAt: number;
    /** Time actually trained, without pauses. */
    durationMs: number;
    exerciseIds: string[];
    kind?: 'cardio' | 'circuit' | 'stretch' | 'mobility';
    circuit?: CircuitPlan;
  }) => SessionLog;
  discardSession: () => void;
  deleteSession: (id: string) => void;
};

const TrainingContext = createContext<TrainingContextValue | null>(null);

// Caps keep storage small: a saved workout or a history entry is well under 1 KB.
export const MAX_WORKOUTS = 100;
const MAX_SESSIONS = 500;

export function TrainingProvider({ children }: { children: ReactNode }) {
  // Every change goes through `update`, which works on the newest value and saves in order, so quick
  // taps and overlapping actions never undo each other. See useStoredState.
  const [workouts, updateWorkouts, workoutsRef] = useStoredState(KEYS.workouts, () =>
    readList(KEYS.workouts, SavedWorkoutSchema),
  );
  const [sessions, updateSessions] = useStoredState(KEYS.sessions, () => readList(KEYS.sessions, SessionLogSchema));
  const [active, updateActive, activeRef] = useStoredState(KEYS.activeSession, () =>
    readJson(KEYS.activeSession, ActiveSessionSchema.nullable(), null),
  );
  const [program, updateProgram, programRef] = useStoredState(KEYS.program, () =>
    readJson(KEYS.program, ProgramSchema.nullable(), null),
  );

  // Keep the home screen widget in step with the program and history.
  useEffect(() => {
    updateNextWorkoutWidget(program, sessions, Date.now());
  }, [program, sessions]);

  const saveProgram = (next: Program | null) => {
    updateProgram(() => next);
  };

  const saveWorkout = (input: NewWorkout, id?: string): SavedWorkout | null => {
    const now = Date.now();
    const current = workoutsRef.current;
    const existing = id ? current.find((w) => w.id === id) : undefined;
    if (!existing && current.length >= MAX_WORKOUTS) return null;
    const workout: SavedWorkout = {
      id: existing?.id ?? newId(),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      name: input.name.trim() || 'Untitled workout',
      exerciseIds: input.exerciseIds,
      focus: input.focus ?? existing?.focus,
      circuit: input.circuit ?? existing?.circuit,
    };
    updateWorkouts((list) => (existing ? list.map((w) => (w.id === workout.id ? workout : w)) : [workout, ...list]));
    return workout;
  };

  const deleteWorkout = (id: string) => updateWorkouts((list) => list.filter((w) => w.id !== id));

  const startSession: TrainingContextValue['startSession'] = ({ name, exerciseIds, workoutId, programDay }) => {
    updateActive(() => ({
      name,
      exerciseIds,
      ...(workoutId ? { workoutId } : {}),
      ...(programDay ? { programDay } : {}),
      completedIds: [],
      startedAt: Date.now(),
    }));
  };

  const startProgramDay: TrainingContextValue['startProgramDay'] = (target) => {
    const current = programRef.current;
    if (!current) return false;
    const pick = target ?? nextProgramDay(current);
    const day = pick ? current.days[pick.day] : undefined;
    if (!pick || !day) return false;
    startSession({
      name: programDayName(current, pick.week, pick.day),
      exerciseIds: day.exerciseIds,
      programDay: { programId: current.id, week: pick.week, day: pick.day },
    });
    return true;
  };

  const updateExerciseSets: TrainingContextValue['updateExerciseSets'] = (exerciseId, change, targetSets) => {
    updateActive((session) => {
      if (!session) return session;
      const before = session.sets?.[exerciseId] ?? [];
      const sets = change(before);
      if (sets === before) return session;
      const { [exerciseId]: _previous, ...others } = session.sets ?? {};
      // Reaching the target ticks the exercise off once. Removing sets later never unticks it.
      const reached = sets.length >= targetSets && !session.completedIds.includes(exerciseId);
      return {
        ...session,
        sets: sets.length ? { ...others, [exerciseId]: sets } : others,
        completedIds: reached ? [...session.completedIds, exerciseId] : session.completedIds,
      };
    });
  };

  const toggleExercise = (exerciseId: string) => {
    updateActive((session) => {
      if (!session) return session;
      const done = session.completedIds.includes(exerciseId);
      return {
        ...session,
        completedIds: done
          ? session.completedIds.filter((id) => id !== exerciseId)
          : [...session.completedIds, exerciseId],
      };
    });
  };

  const finishSession = (): SessionLog | null => {
    const session = activeRef.current;
    if (!session) return null;
    // A workout runs from when it started to when you tap Finish. Fields from the old pausable timer
    // are dropped.
    const { pausedAt: _pausedAt, pausedMs: _pausedMs, ...rest } = session;
    const log: SessionLog = { ...rest, id: newId(), finishedAt: Math.max(session.startedAt, Date.now()) };
    updateSessions((list) => [log, ...list].slice(0, MAX_SESSIONS));
    updateActive(() => null);
    updateProgram((current) => (current ? markProgramDay(current, session.programDay, log.id) : current));
    return log;
  };

  const logCardio: TrainingContextValue['logCardio'] = ({
    cardioId,
    name,
    startedAt,
    durationMs,
    exerciseIds,
    kind = 'cardio',
    circuit,
  }) => {
    const log: SessionLog = {
      id: newId(),
      kind,
      ...(circuit ? { circuit } : {}),
      cardioId,
      name,
      startedAt,
      // History shows finishedAt - startedAt, so store the time actually trained, not wall-clock time.
      finishedAt: startedAt + Math.max(0, durationMs),
      exerciseIds,
      completedIds: exerciseIds,
    };
    updateSessions((list) => [log, ...list].slice(0, MAX_SESSIONS));
    return log;
  };

  const discardSession = () => {
    updateActive(() => null);
  };
  const deleteSession = (id: string) => updateSessions((list) => list.filter((s) => s.id !== id));

  return (
    <TrainingContext
      value={{
        workouts,
        sessions,
        active,
        saveWorkout,
        deleteWorkout,
        startSession,
        toggleExercise,
        updateExerciseSets,
        program,
        saveProgram,
        startProgramDay,
        finishSession,
        logCardio,
        discardSession,
        deleteSession,
      }}>
      {children}
    </TrainingContext>
  );
}

export function alertWorkoutsFull() {
  Alert.alert(
    'Your saved workouts are full',
    `You can keep up to ${MAX_WORKOUTS} saved workouts. Delete one you no longer use, then save this one.`,
  );
}

export function useTraining(): TrainingContextValue {
  const context = use(TrainingContext);
  if (!context) throw new Error('useTraining must be used within a TrainingProvider');
  return context;
}
