/** The pausable parts of a session's timer. Times are milliseconds since the epoch. */
export interface Clock {
  startedAt: number;
  pausedAt?: number;
  pausedMs?: number;
}

/** Time actually trained by `now`: wall-clock time since the start, minus every pause. */
export function activeMs(clock: Clock, now: number): number {
  const paused = (clock.pausedMs ?? 0) + (clock.pausedAt !== undefined ? now - clock.pausedAt : 0);
  return Math.max(0, now - clock.startedAt - paused);
}

export function pause<T extends Clock>(clock: T, now: number): T {
  return clock.pausedAt !== undefined ? clock : { ...clock, pausedAt: now };
}

export function resume<T extends Clock>(clock: T, now: number): T {
  if (clock.pausedAt === undefined) return clock;
  const { pausedAt, ...rest } = clock;
  return { ...rest, pausedMs: (clock.pausedMs ?? 0) + (now - pausedAt) } as T;
}

/** Back to zero. Keeps the paused state, so a paused timer stays paused at 0:00. */
export function restart<T extends Clock>(clock: T, now: number): T {
  const { pausedAt, ...rest } = clock;
  return { ...rest, startedAt: now, pausedMs: 0, ...(pausedAt !== undefined ? { pausedAt: now } : {}) } as T;
}
