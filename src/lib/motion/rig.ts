/**
 * A tiny forward-kinematics rig for the exercise demonstrations.
 *
 * The figure faces +Z, its left side is +X and up is +Y. Units are meters. A pose stores segment
 * angles, never positions, so interpolating between two poses keeps every bone the same length.
 *
 * Angle conventions, all in degrees:
 * - `torso`: lean forward from upright. 90 is face down, -90 is face up.
 * - Legs: world-space angle in the side (sagittal) plane, measured forward from straight down.
 *   0 points at the floor, 90 points straight ahead, 180 points up, negative points backward.
 * - Arms: the same idea, but measured from the torso's own "down" direction, inside a plane that
 *   is turned `armPlane` degrees away from the torso's front. 0 is the front plane, 90 is the side.
 * - Feet: toe-down tilt from horizontal. Left undefined, feet stay flat on the floor for standing
 *   motions and follow the shin otherwise.
 */

export type Vec3 = [number, number, number];
export type Pair = [left: number, right: number];

export interface Pose {
  torso: number;
  /** Pelvis lean. Defaults to the torso lean. Lets the chest curl while the hips stay put. */
  pelvis?: number;
  /** Head lean. Defaults to the torso lean. */
  head?: number;
  /** Torso turn around its own long axis. Positive turns toward the figure's left. */
  twist?: number;
  arms: Pair;
  fore: Pair;
  armPlane?: Pair;
  /** Forearm plane. Defaults to `armPlane`. */
  forePlane?: Pair;
  thighs: Pair;
  shins: Pair;
  legOut?: Pair;
  feet?: Pair;
  /** Pelvis position for `ground` (x and z only) and `fixed` anchors. */
  root?: Vec3;
  /** Extra height added after grounding, for jumps. */
  lift?: number;
}

export type Anchor =
  /** Keep the chosen foot (or both) planted at `at`. Default: both feet, centered on the origin. */
  | { type: 'feet'; foot?: 'left' | 'right' | 'both'; at?: Vec3 }
  /** Lower the whole body until its lowest point rests at height `y`. */
  | { type: 'ground'; y?: number }
  /** Hang from the hands: their midpoint sits at `target`. */
  | { type: 'hands'; target: Vec3 }
  /** Use `root` from the pose as is. */
  | { type: 'fixed' };

export const JOINTS = [
  'pelvis',
  'chest',
  'neck',
  'head',
  'lShoulder',
  'lElbow',
  'lWrist',
  'lHand',
  'rShoulder',
  'rElbow',
  'rWrist',
  'rHand',
  'lHip',
  'lKnee',
  'lAnkle',
  'lHeel',
  'lToe',
  'rHip',
  'rKnee',
  'rAnkle',
  'rHeel',
  'rToe',
] as const;

export type Joint = (typeof JOINTS)[number];

export type Skeleton = Record<Joint, Vec3> & {
  /** Torso basis vectors after lean and twist, for orienting held equipment. */
  basis: { up: Vec3; forward: Vec3; left: Vec3 };
};

export const BONE_LENGTHS = {
  spine: 0.5,
  shoulderDrop: 0.05,
  shoulderWidth: 0.19,
  hipWidth: 0.1,
  upperArm: 0.29,
  forearm: 0.27,
  hand: 0.07,
  thigh: 0.44,
  shin: 0.43,
  neckToHead: 0.14,
  footForward: 0.15,
  footBack: 0.05,
  footDepth: 0.065,
} as const;

/** Rough body thickness at each joint, used to find the lowest point when grounding. */
export const JOINT_RADIUS: Record<Joint, number> = {
  pelvis: 0.12,
  chest: 0.14,
  neck: 0.1,
  head: 0.11,
  lShoulder: 0.07,
  rShoulder: 0.07,
  lElbow: 0.05,
  rElbow: 0.05,
  lWrist: 0.04,
  rWrist: 0.04,
  lHand: 0.04,
  rHand: 0.04,
  lHip: 0.09,
  rHip: 0.09,
  lKnee: 0.06,
  rKnee: 0.06,
  lAnkle: 0.045,
  rAnkle: 0.045,
  lHeel: 0.02,
  rHeel: 0.02,
  lToe: 0.02,
  rToe: 0.02,
};

const DEG = Math.PI / 180;

const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];
const combine = (a: Vec3, sa: number, b: Vec3, sb: number): Vec3 => [
  a[0] * sa + b[0] * sb,
  a[1] * sa + b[1] * sb,
  a[2] * sa + b[2] * sb,
];

/** Up and forward vectors for a lean in the side plane, then turned by `twist` around up. */
function frame(lean: number, twist = 0): { up: Vec3; forward: Vec3; left: Vec3 } {
  const a = lean * DEG;
  const t = twist * DEG;
  const up: Vec3 = [0, Math.cos(a), Math.sin(a)];
  const forward0: Vec3 = [0, -Math.sin(a), Math.cos(a)];
  const left0: Vec3 = [1, 0, 0];
  // Rodrigues rotation around `up`. up × forward = left and up × left = -forward.
  return {
    up,
    forward: combine(forward0, Math.cos(t), left0, Math.sin(t)),
    left: combine(left0, Math.cos(t), forward0, -Math.sin(t)),
  };
}

function legDirection(angle: number, out: number, side: 1 | -1): Vec3 {
  const a = angle * DEG;
  const o = out * DEG;
  return [side * Math.sin(o), -Math.cos(a) * Math.cos(o), Math.sin(a) * Math.cos(o)];
}

function armDirection(
  basis: { up: Vec3; forward: Vec3; left: Vec3 },
  angle: number,
  plane: number,
  side: 1 | -1,
): Vec3 {
  const a = angle * DEG;
  const p = plane * DEG;
  const planeDir = combine(basis.forward, Math.cos(p), basis.left, side * Math.sin(p));
  return combine(basis.up, -Math.cos(a), planeDir, Math.sin(a));
}

function footPoints(ankle: Vec3, tilt: number): { heel: Vec3; toe: Vec3 } {
  const f = tilt * DEG;
  const along: Vec3 = [0, -Math.sin(f), Math.cos(f)];
  const down: Vec3 = [0, -Math.cos(f), -Math.sin(f)];
  const L = BONE_LENGTHS;
  return {
    heel: add(add(ankle, scale(along, -L.footBack)), scale(down, L.footDepth)),
    toe: add(add(ankle, scale(along, L.footForward)), scale(down, L.footDepth)),
  };
}

/** Forward kinematics with the pelvis at the origin. Anchoring happens afterwards. */
export function solvePose(pose: Pose, flatFeet: boolean): Skeleton {
  const L = BONE_LENGTHS;
  const torso = frame(pose.torso, pose.twist ?? 0);
  const pelvisFrame = frame(pose.pelvis ?? pose.torso);
  const headFrame = frame(pose.head ?? pose.torso, pose.twist ?? 0);
  const armPlane = pose.armPlane ?? [0, 0];
  const forePlane = pose.forePlane ?? armPlane;
  const legOut = pose.legOut ?? [0, 0];

  const pelvis: Vec3 = [0, 0, 0];
  const neck = scale(torso.up, L.spine);
  const chest = scale(torso.up, L.spine * 0.55);
  const head = add(neck, scale(headFrame.up, L.neckToHead));
  const shoulderBase = scale(torso.up, L.spine - L.shoulderDrop);

  const arm = (side: 1 | -1, i: 0 | 1) => {
    const shoulder = add(shoulderBase, scale(torso.left, side * L.shoulderWidth));
    const elbow = add(shoulder, scale(armDirection(torso, pose.arms[i], armPlane[i], side), L.upperArm));
    const foreDir = armDirection(torso, pose.fore[i], forePlane[i], side);
    const wrist = add(elbow, scale(foreDir, L.forearm));
    const hand = add(wrist, scale(foreDir, L.hand));
    return { shoulder, elbow, wrist, hand };
  };

  const leg = (side: 1 | -1, i: 0 | 1) => {
    const hip = add(scale(pelvisFrame.left, side * L.hipWidth), scale(pelvisFrame.up, -0.03));
    const knee = add(hip, scale(legDirection(pose.thighs[i], legOut[i], side), L.thigh));
    const ankle = add(knee, scale(legDirection(pose.shins[i], legOut[i], side), L.shin));
    const tilt = pose.feet?.[i] ?? (flatFeet ? 0 : -pose.shins[i]);
    return { hip, knee, ankle, ...footPoints(ankle, tilt) };
  };

  const la = arm(1, 0);
  const ra = arm(-1, 1);
  const ll = leg(1, 0);
  const rl = leg(-1, 1);

  return {
    pelvis,
    chest,
    neck,
    head,
    lShoulder: la.shoulder,
    lElbow: la.elbow,
    lWrist: la.wrist,
    lHand: la.hand,
    rShoulder: ra.shoulder,
    rElbow: ra.elbow,
    rWrist: ra.wrist,
    rHand: ra.hand,
    lHip: ll.hip,
    lKnee: ll.knee,
    lAnkle: ll.ankle,
    lHeel: ll.heel,
    lToe: ll.toe,
    rHip: rl.hip,
    rKnee: rl.knee,
    rAnkle: rl.ankle,
    rHeel: rl.heel,
    rToe: rl.toe,
    basis: torso,
  };
}

export function translateSkeleton(skeleton: Skeleton, offset: Vec3): Skeleton {
  const moved = { ...skeleton };
  for (const joint of JOINTS) moved[joint] = add(skeleton[joint], offset);
  return moved;
}

function midpoint(a: Vec3, b: Vec3): Vec3 {
  return scale(add(a, b), 0.5);
}

/** The lowest point of the body, counting each joint's thickness. */
export function lowestPoint(skeleton: Skeleton, joints: readonly Joint[] = JOINTS): number {
  let lowest = Infinity;
  for (const joint of joints) lowest = Math.min(lowest, skeleton[joint][1] - JOINT_RADIUS[joint]);
  return lowest;
}

/** Moves a pelvis-origin skeleton into the scene according to the anchor. */
export function anchorSkeleton(skeleton: Skeleton, pose: Pose, anchor: Anchor): Skeleton {
  const lift = pose.lift ?? 0;
  switch (anchor.type) {
    case 'feet': {
      const foot = anchor.foot ?? 'both';
      const at = anchor.at ?? [0, 0, 0];
      const feetJoints: Joint[] =
        foot === 'left' ? ['lHeel', 'lToe'] : foot === 'right' ? ['rHeel', 'rToe'] : ['lHeel', 'lToe', 'rHeel', 'rToe'];
      const center =
        foot === 'left' ? skeleton.lAnkle : foot === 'right' ? skeleton.rAnkle : midpoint(skeleton.lAnkle, skeleton.rAnkle);
      const ground = lowestPoint(skeleton, feetJoints);
      return translateSkeleton(skeleton, [at[0] - center[0], at[1] - ground + lift, at[2] - center[2]]);
    }
    case 'ground': {
      const root = pose.root ?? [0, 0, 0];
      const ground = lowestPoint(skeleton);
      return translateSkeleton(skeleton, [root[0], (anchor.y ?? 0) - ground + lift, root[2]]);
    }
    case 'hands': {
      const hands = midpoint(skeleton.lHand, skeleton.rHand);
      return translateSkeleton(skeleton, [
        anchor.target[0] - hands[0],
        anchor.target[1] - hands[1],
        anchor.target[2] - hands[2],
      ]);
    }
    case 'fixed':
      return translateSkeleton(skeleton, pose.root ?? [0, 0, 0]);
  }
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpPair = (a: Pair, b: Pair, t: number): Pair => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

function lerpOptionalPair(a: Pair | undefined, b: Pair | undefined, fallbackA: Pair, fallbackB: Pair, t: number) {
  if (!a && !b) return undefined;
  return lerpPair(a ?? fallbackA, b ?? fallbackB, t);
}

/** Blends two poses. Optional fields fall back to the values the rig would use anyway. */
export function blendPoses(a: Pose, b: Pose, t: number, flatFeet: boolean): Pose {
  const autoFeet = (p: Pose): Pair => (flatFeet ? [0, 0] : [-p.shins[0], -p.shins[1]]);
  const zeroPair: Pair = [0, 0];
  const root =
    a.root || b.root
      ? ([0, 1, 2].map((i) => lerp((a.root ?? [0, 0, 0])[i], (b.root ?? [0, 0, 0])[i], t)) as Vec3)
      : undefined;
  return {
    torso: lerp(a.torso, b.torso, t),
    pelvis: a.pelvis !== undefined || b.pelvis !== undefined ? lerp(a.pelvis ?? a.torso, b.pelvis ?? b.torso, t) : undefined,
    head: a.head !== undefined || b.head !== undefined ? lerp(a.head ?? a.torso, b.head ?? b.torso, t) : undefined,
    twist: lerp(a.twist ?? 0, b.twist ?? 0, t),
    arms: lerpPair(a.arms, b.arms, t),
    fore: lerpPair(a.fore, b.fore, t),
    armPlane: lerpOptionalPair(a.armPlane, b.armPlane, zeroPair, zeroPair, t),
    forePlane: lerpOptionalPair(
      a.forePlane ?? a.armPlane,
      b.forePlane ?? b.armPlane,
      a.armPlane ?? zeroPair,
      b.armPlane ?? zeroPair,
      t,
    ),
    thighs: lerpPair(a.thighs, b.thighs, t),
    shins: lerpPair(a.shins, b.shins, t),
    legOut: lerpOptionalPair(a.legOut, b.legOut, zeroPair, zeroPair, t),
    feet: lerpOptionalPair(a.feet, b.feet, autoFeet(a), autoFeet(b), t),
    root,
    lift: lerp(a.lift ?? 0, b.lift ?? 0, t),
  };
}
