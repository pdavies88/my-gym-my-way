import { describe, expect, it } from '@jest/globals';

import { activeMs, pause, restart, resume } from '../session-clock';

describe('session clock', () => {
  const start = { startedAt: 0 };

  it('counts wall-clock time while running', () => {
    expect(activeMs(start, 60_000)).toBe(60_000);
  });

  it('stops counting while paused and carries on after resume', () => {
    const paused = pause(start, 60_000);
    expect(activeMs(paused, 300_000)).toBe(60_000);
    const resumed = resume(paused, 300_000);
    expect(activeMs(resumed, 330_000)).toBe(90_000);
  });

  it('ignores a second pause or a resume while running', () => {
    const paused = pause(start, 10_000);
    expect(pause(paused, 20_000)).toBe(paused);
    expect(resume(start, 20_000)).toBe(start);
  });

  it('restarts from zero and stays paused if it was paused', () => {
    const running = restart(resume(pause(start, 10_000), 20_000), 50_000);
    expect(activeMs(running, 55_000)).toBe(5_000);
    const paused = restart(pause(start, 10_000), 50_000);
    expect(activeMs(paused, 90_000)).toBe(0);
    expect(activeMs(resume(paused, 90_000), 95_000)).toBe(5_000);
  });
});
