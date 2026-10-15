import { describe, expect, it } from '@jest/globals';

import { sampleMotion, type Motion } from '../animate';
import { MOTIONS } from '../motions';
import { BONE_LENGTHS, lowestPoint, type Vec3 } from '../rig';

const distance = (a: Vec3, b: Vec3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

describe('motions', () => {
  const entries = Object.entries(MOTIONS) as [string, Motion][];

  it.each(entries)('%s keeps bone lengths constant through the loop', (_, motion) => {
    for (let i = 0; i < 16; i++) {
      const { skeleton: s } = sampleMotion(motion, (i / 16) * motion.duration);
      expect(distance(s.lShoulder, s.lElbow)).toBeCloseTo(BONE_LENGTHS.upperArm, 5);
      expect(distance(s.rElbow, s.rWrist)).toBeCloseTo(BONE_LENGTHS.forearm, 5);
      expect(distance(s.lHip, s.lKnee)).toBeCloseTo(BONE_LENGTHS.thigh, 5);
      expect(distance(s.rKnee, s.rAnkle)).toBeCloseTo(BONE_LENGTHS.shin, 5);
      for (const point of Object.values(s).filter(Array.isArray) as Vec3[]) {
        expect(Number.isFinite(point[0] + point[1] + point[2])).toBe(true);
      }
    }
  });

  it.each(entries)('%s never sinks far into the floor', (_, motion) => {
    for (let i = 0; i < 16; i++) {
      const { skeleton } = sampleMotion(motion, (i / 16) * motion.duration);
      expect(lowestPoint(skeleton)).toBeGreaterThan(-0.08);
    }
  });

  it('keeps planted feet on the floor', () => {
    const motion = MOTIONS.squat as Motion;
    for (let i = 0; i < 10; i++) {
      const { skeleton } = sampleMotion(motion, (i / 10) * motion.duration);
      expect(lowestPoint(skeleton, ['lHeel', 'lToe', 'rHeel', 'rToe'])).toBeCloseTo(0, 5);
    }
  });

  it('hangs pull-ups from the bar', () => {
    const motion = MOTIONS['pull-up'] as Motion;
    const { skeleton } = sampleMotion(motion, 0.7);
    expect((skeleton.lHand[1] + skeleton.rHand[1]) / 2).toBeCloseTo(2.2, 5);
  });
});
