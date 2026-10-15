import { anchorSkeleton, blendPoses, JOINTS, solvePose, type Anchor, type Pose, type Skeleton, type Vec3 } from './rig';

/** Equipment the figure holds. The renderer places it from the hand positions. */
export type HeldProp =
  | 'dumbbells'
  | 'dumbbell-left'
  | 'dumbbell-both-hands'
  | 'barbell'
  | 'kettlebell'
  | 'kettlebell-left'
  | 'band-feet'
  | 'band-overhead'
  | 'band-front'
  | 'band-between-hands'
  | 'medicine-ball'
  | 'ab-wheel'
  | 'jump-rope';

/** Fixed scenery, in scene coordinates. */
export type SceneItem =
  | { kind: 'bench'; center: Vec3; length?: number; rotated?: boolean }
  | { kind: 'box'; center: Vec3; size: Vec3 }
  | { kind: 'bar'; height: number; z?: number }
  | { kind: 'rack'; z: number }
  | { kind: 'cable-tower'; z: number }
  | { kind: 'rower' }
  | { kind: 'bike' }
  | { kind: 'treadmill' };

export interface Motion {
  keyframes: Pose[];
  /** Seconds for one full loop through every keyframe and back to the first. */
  duration: number;
  /** Relative time spent moving into each keyframe. Defaults to equal shares. */
  timing?: number[];
  /** `smooth` eases in and out of each keyframe. `linear` suits continuous motion like pedaling. */
  easing?: 'smooth' | 'linear';
  anchor: Anchor;
  /** Keep feet flat on the floor when the pose doesn’t say otherwise. Defaults to true for `feet` anchors. */
  flatFeet?: boolean;
  props?: HeldProp[];
  scene?: SceneItem[];
}

export interface MotionFrame {
  skeleton: Skeleton;
  /** 0 to 1 position within the loop. */
  phase: number;
}

const ease = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * t);

export function usesFlatFeet(motion: Motion): boolean {
  return motion.flatFeet ?? motion.anchor.type === 'feet';
}

/** Blended pose at `seconds` into the loop. */
export function poseAt(motion: Motion, seconds: number): Pose {
  const { keyframes } = motion;
  if (keyframes.length === 1) return keyframes[0];

  const weights = motion.timing ?? keyframes.map(() => 1);
  const total = weights.reduce((sum, w) => sum + w, 0);
  const phase = (((seconds % motion.duration) + motion.duration) % motion.duration) / motion.duration;
  let cursor = phase * total;

  // Segment i moves from keyframe i-1 into keyframe i. Segment 0 closes the loop from the last keyframe.
  for (let i = 0; i < keyframes.length; i++) {
    const w = weights[(i + 1) % keyframes.length];
    if (cursor <= w || i === keyframes.length - 1) {
      const from = keyframes[i];
      const to = keyframes[(i + 1) % keyframes.length];
      const t = Math.min(1, Math.max(0, cursor / w));
      return blendPoses(from, to, motion.easing === 'linear' ? t : ease(t), usesFlatFeet(motion));
    }
    cursor -= w;
  }
  return keyframes[0];
}

export function sampleMotion(motion: Motion, seconds: number): MotionFrame {
  const pose = poseAt(motion, seconds);
  const skeleton = anchorSkeleton(solvePose(pose, usesFlatFeet(motion)), pose, motion.anchor);
  return { skeleton, phase: (((seconds % motion.duration) + motion.duration) % motion.duration) / motion.duration };
}

/** Box around every joint over a full loop, for framing the camera. */
export function motionBounds(motion: Motion, samples = 24): { min: Vec3; max: Vec3; center: Vec3; size: number } {
  const min: Vec3 = [Infinity, Infinity, Infinity];
  const max: Vec3 = [-Infinity, -Infinity, -Infinity];
  for (let s = 0; s < samples; s++) {
    const { skeleton } = sampleMotion(motion, (s / samples) * motion.duration);
    for (const joint of JOINTS) {
      for (let axis = 0; axis < 3; axis++) {
        min[axis] = Math.min(min[axis], skeleton[joint][axis]);
        max[axis] = Math.max(max[axis], skeleton[joint][axis]);
      }
    }
  }
  min[1] = Math.min(min[1], 0);
  const center: Vec3 = [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2];
  const size = Math.max(max[0] - min[0], max[1] - min[1], max[2] - min[2]);
  return { min, max, center, size };
}
