import { createContext, use, useEffect, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import type { Focus } from '@/lib/generator';
import type { CircuitPresetId, CircuitSettings } from '@/lib/circuit';
import { newId } from '@/lib/id';
import { activeMs, pause, restart, resume } from '@/lib/session-clock';
import { readJson, readList, writeJson } from '@/lib/storage/kv';
import {
  ActiveSessionSchema,
  KEYS,
  SavedWorkoutSchema,
  SessionLogSchema,
  type ActiveSession,
  type SavedWorkout,
  type SessionLog,
} from '@/lib/storage/schemas';

type NewWorkout = { name: string; exerciseIds: string[]; focus?: Focus; circuit?: CircuitPresetId };

type TrainingContextValue = {
  workouts: SavedWorkout[];
  sessions: SessionLog[];
  active: ActiveSession | null;
  saveWorkout: (workout: NewWorkout, id?: string) => SavedWorkout;
  deleteWorkout: (id: string) => void;
  startSession: (session: { name: string; exerciseIds: string[]; workoutId?: string }) => void;
  toggleExercise: (exerciseId: string) => void;
  finishSession: () => SessionLog | null;
  logCardio: (entry: {
    cardioId: string;
    name: string;
    startedAt: number;
    /** Time actually trained, without pauses. */
    durationMs: number;
    exerciseIds: string[];
    kind?: 'cardio' | 'circuit' | 'stretch';
    circuit?: CircuitSettings;
  }) => SessionLog;
  discardSession: () => void;
  /** Stop the session timer. Safe to call when it is already paused. */
  pauseSession: () => void;
  resumeSession: () => void;
  /** Set the session timer back to 0:00. Ticked exercises stay ticked. */
  restartSessionTimer: () => void;
  deleteSession: (id: string) => void;
};

const TrainingContext = createContext<TrainingContextValue | null>(null);

const MAX_SESSIONS = 500;

export function TrainingProvider({ children }: { children: ReactNode }) {
  const [workouts, setWorkouts] = useState(() => readList(KEYS.workouts, SavedWorkoutSchema));
  const [sessions, setSessions] = useState(() => readList(KEYS.sessions, SessionLogSchema));
  const [active, setActive] = useState(() => readJson(KEYS.activeSession, ActiveSessionSchema.nullable(), null));

  const persistWorkouts = (next: SavedWorkout[]) => {
    setWorkouts(next);
    void writeJson(KEYS.workouts, next);
  };

  const persistSessions = (next: SessionLog[]) => {
    setSessions(next);
    void writeJson(KEYS.sessions, next);
  };

  const persistActive = (next: ActiveSession | null) => {
    setActive(next);
    void writeJson(KEYS.activeSession, next);
  };

  const saveWorkout = (input: NewWorkout, id?: string): SavedWorkout => {
    const now = Date.now();
    const existing = id ? workouts.find((w) => w.id === id) : undefined;
    const workout: SavedWorkout = {
      id: existing?.id ?? newId(),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      name: input.name.trim() || 'Untitled workout',
      exerciseIds: input.exerciseIds,
      focus: input.focus ?? existing?.focus,
      circuit: input.circuit ?? existing?.circuit,
    };
    persistWorkouts(existing ? workouts.map((w) => (w.id === workout.id ? workout : w)) : [workout, ...workouts]);
    return workout;
  };

  const deleteWorkout = (id: string) => persistWorkouts(workouts.filter((w) => w.id !== id));

  const startSession: TrainingContextValue['startSession'] = ({ name, exerciseIds, workoutId }) => {
    persistActive({ name, exerciseIds, workoutId, completedIds: [], startedAt: Date.now() });
  };

  const toggleExercise = (exerciseId: string) => {
    if (!active) return;
    const done = active.completedIds.includes(exerciseId);
    persistActive({
      ...active,
      completedIds: done ? active.completedIds.filter((id) => id !== exerciseId) : [...active.completedIds, exerciseId],
    });
  };

  const finishSession = (): SessionLog | null => {
    if (!active) return null;
    // History shows finishedAt - startedAt, so store the time actually trained, without pauses.
    const { pausedAt: _pausedAt, pausedMs: _pausedMs, ...rest } = active;
    const log: SessionLog = { ...rest, id: newId(), finishedAt: active.startedAt + activeMs(active, Date.now()) };
    persistSessions([log, ...sessions].slice(0, MAX_SESSIONS));
    persistActive(null);
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
    persistSessions([log, ...sessions].slice(0, MAX_SESSIONS));
    return log;
  };

  const discardSession = () => persistActive(null);
  // Functional updates, so a pause from a screen closing never acts on a stale copy of the session.
  const updateActive = (change: (session: ActiveSession) => ActiveSession) =>
    setActive((current) => {
      if (!current) return current;
      const next = change(current);
      if (next !== current) void writeJson(KEYS.activeSession, next);
      return next;
    });
  const pauseSession = () => updateActive((session) => pause(session, Date.now()));

  // Leaving the app (switching away, locking the phone or closing it) pauses a workout in progress.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') updateActive((session) => pause(session, Date.now()));
    });
    return () => subscription.remove();
  }, []);
  const resumeSession = () => updateActive((session) => resume(session, Date.now()));
  const restartSessionTimer = () => updateActive((session) => restart(session, Date.now()));
  const deleteSession = (id: string) => persistSessions(sessions.filter((s) => s.id !== id));

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
        finishSession,
        logCardio,
        discardSession,
        pauseSession,
        resumeSession,
        restartSessionTimer,
        deleteSession,
      }}>
      {children}
    </TrainingContext>
  );
}

export function useTraining(): TrainingContextValue {
  const context = use(TrainingContext);
  if (!context) throw new Error('useTraining must be used within a TrainingProvider');
  return context;
}
