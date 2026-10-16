import { createContext, use, useState, type ReactNode } from 'react';
import { z } from 'zod';

import type { Focus } from '@/lib/generator';
import { newId } from '@/lib/id';
import { readJson, writeJson } from '@/lib/storage/kv';
import {
  ActiveSessionSchema,
  KEYS,
  SavedWorkoutSchema,
  SessionLogSchema,
  type ActiveSession,
  type SavedWorkout,
  type SessionLog,
} from '@/lib/storage/schemas';

type NewWorkout = { name: string; exerciseIds: string[]; focus?: Focus };

type TrainingContextValue = {
  workouts: SavedWorkout[];
  sessions: SessionLog[];
  active: ActiveSession | null;
  saveWorkout: (workout: NewWorkout, id?: string) => SavedWorkout;
  deleteWorkout: (id: string) => void;
  startSession: (session: { name: string; exerciseIds: string[]; workoutId?: string }) => void;
  toggleExercise: (exerciseId: string) => void;
  finishSession: () => SessionLog | null;
  logCardio: (entry: { cardioId: string; name: string; startedAt: number; exerciseIds: string[] }) => SessionLog;
  discardSession: () => void;
  deleteSession: (id: string) => void;
};

const TrainingContext = createContext<TrainingContextValue | null>(null);

const MAX_SESSIONS = 500;

export function TrainingProvider({ children }: { children: ReactNode }) {
  const [workouts, setWorkouts] = useState(() => readJson(KEYS.workouts, z.array(SavedWorkoutSchema), []));
  const [sessions, setSessions] = useState(() => readJson(KEYS.sessions, z.array(SessionLogSchema), []));
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
    const log: SessionLog = { ...active, id: newId(), finishedAt: Date.now() };
    persistSessions([log, ...sessions].slice(0, MAX_SESSIONS));
    persistActive(null);
    return log;
  };

  const logCardio: TrainingContextValue['logCardio'] = ({ cardioId, name, startedAt, exerciseIds }) => {
    const log: SessionLog = {
      id: newId(),
      kind: 'cardio',
      cardioId,
      name,
      startedAt,
      finishedAt: Date.now(),
      exerciseIds,
      completedIds: exerciseIds,
    };
    persistSessions([log, ...sessions].slice(0, MAX_SESSIONS));
    return log;
  };

  const discardSession = () => persistActive(null);
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
