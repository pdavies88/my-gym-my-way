import { describe, expect, it } from '@jest/globals';

import { EQUIPMENT, EQUIPMENT_IDS, type EquipmentId } from '../equipment';
import { availableExercises, canDo, EXERCISES, getExercise } from '../exercises';
import { EXERCISE_VIDEOS } from '../videos';

describe('exercise catalog', () => {
  it('has unique ids', () => {
    expect(new Set(EXERCISES.map((e) => e.id)).size).toBe(EXERCISES.length);
  });

  it('gives every exercise a YouTube video with credit details', () => {
    for (const exercise of EXERCISES) {
      const video = EXERCISE_VIDEOS[exercise.id];
      expect(video).toBeDefined();
      expect(video.videoId).toMatch(/^[\w-]{11}$/);
      expect(video.channel.length).toBeGreaterThan(0);
    }
    expect(Object.keys(EXERCISE_VIDEOS).sort()).toEqual(EXERCISES.map((e) => e.id).sort());
  });

  it('points every exercise at real equipment', () => {
    for (const exercise of EXERCISES) {
      for (const option of exercise.needs) {
        expect(option.length).toBeGreaterThan(0);
        for (const item of option) expect(EQUIPMENT_IDS).toContain(item);
      }
      expect(exercise.cues.length).toBeGreaterThan(0);
    }
  });

  it('describes every piece of equipment', () => {
    expect(EQUIPMENT.map((e) => e.id).sort()).toEqual([...EQUIPMENT_IDS].sort());
  });

  it('gives every piece of equipment at least one exercise', () => {
    for (const id of EQUIPMENT_IDS) {
      expect(EXERCISES.some((e) => e.needs.some((option) => option.includes(id)))).toBe(true);
    }
  });
});

describe('canDo', () => {
  const none = new Set<EquipmentId>();

  it('allows bodyweight exercises with no equipment', () => {
    expect(canDo(getExercise('push-up')!, none)).toBe(true);
  });

  it('needs every item in an option', () => {
    const bench = getExercise('barbell-bench-press')!;
    expect(canDo(bench, new Set<EquipmentId>(['barbell', 'bench']))).toBe(false);
    expect(canDo(bench, new Set<EquipmentId>(['barbell', 'bench', 'rack']))).toBe(true);
  });

  it('accepts any one option', () => {
    const goblet = getExercise('goblet-squat')!;
    expect(canDo(goblet, new Set<EquipmentId>(['kettlebell']))).toBe(true);
    expect(canDo(goblet, new Set<EquipmentId>(['dumbbells']))).toBe(true);
  });

  it('filters the library to bodyweight moves when you own nothing', () => {
    expect(availableExercises(none).every((e) => e.needs.length === 0)).toBe(true);
  });
});
