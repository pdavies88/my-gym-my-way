import type { Motion } from './animate';
import type { Pair, Pose } from './rig';

const both = (value: number): Pair => [value, value];

/** Standing tall with arms relaxed at the sides. */
const STAND: Pose = { torso: 0, arms: both(6), fore: both(10), armPlane: both(90), thighs: both(0), shins: both(0) };

/** Arms hanging straight down in front of the thighs, as when holding weights. */
const HANG = (lean: number): Pick<Pose, 'arms' | 'fore' | 'armPlane'> => ({
  arms: both(lean + 4),
  fore: both(lean + 4),
  armPlane: both(14),
});

const SQUAT_TOP = { torso: 4, thighs: both(0), shins: both(0), legOut: both(6) } as const;
const SQUAT_BOTTOM = { torso: 40, thighs: both(95), shins: both(-28), legOut: both(14) } as const;

/** A straight body from head to heels at the given lean, as in a plank. */
const straightLegs = (lean: number) => ({ thighs: both(-lean), shins: both(-lean) });

/** Lying face up on a bench with feet planted on the floor. */
const BENCH_BODY = {
  torso: -90,
  head: -90,
  thighs: both(78),
  shins: both(-5),
  legOut: both(18),
  root: [0, 0.58, 0.12],
} as const satisfies Partial<Pose>;

const FLOOR_PRESS_LEGS = { thighs: both(150), shins: both(15), feet: both(0), legOut: both(8) } as const;

export const MOTIONS = {
  squat: {
    duration: 3,
    anchor: { type: 'feet' },
    keyframes: [
      { ...SQUAT_TOP, arms: both(12), fore: both(16), armPlane: both(10) },
      { ...SQUAT_BOTTOM, arms: both(122), fore: both(126), armPlane: both(10) },
    ],
  },
  'squat-jump': {
    duration: 2,
    anchor: { type: 'feet' },
    timing: [1, 1.2, 0.8],
    keyframes: [
      { ...SQUAT_TOP, arms: both(10), fore: both(14), armPlane: both(10) },
      { ...SQUAT_BOTTOM, torso: 35, thighs: both(80), shins: both(-25), arms: both(-25), fore: both(-20), armPlane: both(10) },
      { ...SQUAT_TOP, lift: 0.28, feet: both(35), arms: both(150), fore: both(160), armPlane: both(20) },
    ],
  },
  'goblet-squat': {
    duration: 3,
    anchor: { type: 'feet' },
    props: ['kettlebell'],
    keyframes: [
      { ...SQUAT_TOP, arms: both(18), fore: both(150), armPlane: both(-25), forePlane: both(-60) },
      { ...SQUAT_BOTTOM, torso: 32, arms: both(22), fore: both(150), armPlane: both(-25), forePlane: both(-60) },
    ],
  },
  'back-squat': {
    duration: 3.2,
    anchor: { type: 'feet' },
    props: ['barbell'],
    keyframes: [
      { ...SQUAT_TOP, arms: both(50), fore: both(140), armPlane: both(110), forePlane: both(125) },
      { ...SQUAT_BOTTOM, torso: 45, arms: both(50), fore: both(140), armPlane: both(110), forePlane: both(125) },
    ],
  },
  'romanian-deadlift': {
    duration: 3.2,
    anchor: { type: 'feet' },
    props: ['dumbbells'],
    keyframes: [
      { torso: 0, thighs: both(0), shins: both(0), ...HANG(0) },
      { torso: 75, thighs: both(14), shins: both(-5), ...HANG(75) },
    ],
  },
  deadlift: {
    duration: 3.2,
    anchor: { type: 'feet' },
    props: ['barbell'],
    keyframes: [
      { torso: 0, thighs: both(0), shins: both(0), ...HANG(0) },
      { torso: 58, thighs: both(72), shins: both(-16), ...HANG(58) },
    ],
  },
  'kettlebell-deadlift': {
    duration: 3,
    anchor: { type: 'feet' },
    props: ['kettlebell'],
    keyframes: [
      { torso: 0, thighs: both(0), shins: both(0), legOut: both(10), arms: both(4), fore: both(4), armPlane: both(-20) },
      { torso: 55, thighs: both(80), shins: both(-20), legOut: both(18), arms: both(55), fore: both(55), armPlane: both(-20) },
    ],
  },
  'kettlebell-swing': {
    duration: 1.6,
    anchor: { type: 'feet' },
    props: ['kettlebell'],
    keyframes: [
      { torso: 70, thighs: both(28), shins: both(-10), legOut: both(10), arms: both(40), fore: both(40), armPlane: both(-20) },
      { torso: -4, thighs: both(0), shins: both(0), legOut: both(10), arms: both(88), fore: both(88), armPlane: both(-20) },
    ],
  },
  'glute-bridge': {
    duration: 2.6,
    anchor: { type: 'ground' },
    flatFeet: false,
    keyframes: [
      { torso: -90, head: -90, arms: both(0), fore: both(0), armPlane: both(14), ...FLOOR_PRESS_LEGS },
      { torso: -115, head: -90, arms: both(-25), fore: both(-25), armPlane: both(14), thighs: both(115), shins: both(-5), feet: both(0), legOut: both(8) },
    ],
  },
  lunge: {
    duration: 3,
    anchor: { type: 'feet', foot: 'left', at: [0.1, 0, 0.25] },
    keyframes: [
      { ...STAND, arms: both(6), fore: both(10) },
      { torso: 6, arms: both(6), fore: both(10), armPlane: both(90), thighs: [85, -10], shins: [-5, -92], feet: [0, 22] },
    ],
  },
  'dumbbell-lunge': {
    duration: 3,
    anchor: { type: 'feet', foot: 'left', at: [0.1, 0, 0.25] },
    props: ['dumbbells'],
    keyframes: [
      { ...STAND, arms: both(3), fore: both(3), armPlane: both(90) },
      { torso: 6, arms: both(9), fore: both(9), armPlane: both(90), thighs: [85, -10], shins: [-5, -92], feet: [0, 22] },
    ],
  },
  'split-squat': {
    duration: 3,
    anchor: { type: 'feet', foot: 'left', at: [0.1, 0, 0.35] },
    scene: [{ kind: 'bench', center: [0.0, 0.46, -0.45] }],
    keyframes: [
      { torso: 4, arms: both(6), fore: both(10), armPlane: both(90), thighs: [5, -25], shins: [0, -90], feet: [0, 170] },
      { torso: 10, arms: both(6), fore: both(10), armPlane: both(90), thighs: [85, -5], shins: [-15, -155], feet: [0, 150] },
    ],
  },
  'step-up': {
    duration: 3,
    anchor: { type: 'feet', foot: 'left', at: [0.1, 0.4, 0.3] },
    scene: [{ kind: 'box', center: [0, 0.2, 0.32], size: [0.6, 0.4, 0.45] }],
    keyframes: [
      { torso: 10, arms: both(6), fore: both(10), armPlane: both(90), thighs: [95, -10], shins: [-10, 0], legOut: both(4) },
      { torso: 0, arms: both(6), fore: both(10), armPlane: both(90), thighs: [0, 40], shins: [0, -50], legOut: both(4) },
    ],
  },
  'calf-raise': {
    duration: 2,
    anchor: { type: 'feet' },
    keyframes: [
      { ...STAND, feet: both(0) },
      { ...STAND, feet: both(38) },
    ],
  },
  'push-up': {
    duration: 2.4,
    anchor: { type: 'ground' },
    flatFeet: false,
    keyframes: [
      { torso: 66, head: 60, ...straightLegs(66), arms: both(66), fore: both(66), armPlane: both(14) },
      { torso: 84, head: 78, ...straightLegs(84), arms: both(-28), fore: both(84), armPlane: both(55), forePlane: both(14) },
    ],
  },
  'knee-push-up': {
    duration: 2.4,
    anchor: { type: 'ground' },
    flatFeet: false,
    keyframes: [
      { torso: 58, head: 54, thighs: both(-58), shins: both(-150), arms: both(58), fore: both(58), armPlane: both(14) },
      { torso: 80, head: 76, thighs: both(-80), shins: both(-150), arms: both(-25), fore: both(80), armPlane: both(55), forePlane: both(14) },
    ],
  },
  'diamond-push-up': {
    duration: 2.4,
    anchor: { type: 'ground' },
    flatFeet: false,
    keyframes: [
      { torso: 66, head: 60, ...straightLegs(66), arms: both(66), fore: both(66), armPlane: both(-12) },
      { torso: 82, head: 76, ...straightLegs(82), arms: both(-18), fore: both(82), armPlane: both(-10), forePlane: both(-20) },
    ],
  },
  'pike-push-up': {
    duration: 2.6,
    anchor: { type: 'ground' },
    flatFeet: false,
    keyframes: [
      { torso: 135, head: 140, thighs: both(-20), shins: both(-20), arms: both(135), fore: both(135), armPlane: both(10) },
      { torso: 155, head: 170, thighs: both(-15), shins: both(-15), arms: both(70), fore: both(155), armPlane: both(40), forePlane: both(10) },
    ],
  },
  'bench-press': {
    duration: 2.8,
    anchor: { type: 'fixed' },
    props: ['barbell'],
    scene: [{ kind: 'bench', center: [0, 0.46, -0.32] }],
    keyframes: [
      { ...BENCH_BODY, arms: both(90), fore: both(90), armPlane: both(14) },
      { ...BENCH_BODY, arms: both(90), fore: both(90), armPlane: both(80), forePlane: both(18) },
    ],
  },
  'dumbbell-bench-press': {
    duration: 2.8,
    anchor: { type: 'fixed' },
    props: ['dumbbells'],
    scene: [{ kind: 'bench', center: [0, 0.46, -0.32] }],
    keyframes: [
      { ...BENCH_BODY, arms: both(90), fore: both(90), armPlane: both(6) },
      { ...BENCH_BODY, arms: both(90), fore: both(90), armPlane: both(78), forePlane: both(14) },
    ],
  },
  'floor-press': {
    duration: 2.6,
    anchor: { type: 'ground' },
    flatFeet: false,
    props: ['dumbbells'],
    keyframes: [
      { torso: -90, head: -90, ...FLOOR_PRESS_LEGS, arms: both(90), fore: both(90), armPlane: both(6) },
      { torso: -90, head: -90, ...FLOOR_PRESS_LEGS, arms: both(90), fore: both(90), armPlane: both(84), forePlane: both(14) },
    ],
  },
  'bench-dip': {
    duration: 2.4,
    anchor: { type: 'fixed' },
    flatFeet: true,
    scene: [{ kind: 'bench', center: [0, 0.46, -0.3], rotated: true }],
    keyframes: [
      { torso: 2, arms: both(-8), fore: both(-8), armPlane: both(6), thighs: both(72), shins: both(-5), root: [0, 0.62, -0.18] },
      { torso: 8, arms: both(-80), fore: both(0), armPlane: both(6), thighs: both(90), shins: both(-29), root: [0, 0.44, -0.03] },
    ],
  },
  'overhead-press': {
    duration: 2.6,
    anchor: { type: 'feet' },
    props: ['dumbbells'],
    keyframes: [
      { torso: 0, thighs: both(0), shins: both(0), legOut: both(5), arms: both(45), fore: both(175), armPlane: both(80) },
      { torso: 0, thighs: both(0), shins: both(0), legOut: both(5), arms: both(170), fore: both(175), armPlane: both(80) },
    ],
  },
  'barbell-overhead-press': {
    duration: 2.8,
    anchor: { type: 'feet' },
    props: ['barbell'],
    keyframes: [
      { torso: -2, thighs: both(0), shins: both(0), legOut: both(5), arms: both(30), fore: both(175), armPlane: both(35) },
      { torso: 0, thighs: both(0), shins: both(0), legOut: both(5), arms: both(172), fore: both(176), armPlane: both(25) },
    ],
  },
  'kettlebell-press': {
    duration: 2.6,
    anchor: { type: 'feet' },
    props: ['kettlebell-left'],
    keyframes: [
      { torso: 0, thighs: both(0), shins: both(0), legOut: both(5), arms: [25, 6], fore: [170, 10], armPlane: [30, 90] },
      { torso: 0, thighs: both(0), shins: both(0), legOut: both(5), arms: [172, 6], fore: [176, 10], armPlane: [30, 90] },
    ],
  },
  'band-overhead-press': {
    duration: 2.6,
    anchor: { type: 'feet' },
    props: ['band-feet'],
    keyframes: [
      { torso: 0, thighs: both(0), shins: both(0), legOut: both(8), arms: both(45), fore: both(175), armPlane: both(80) },
      { torso: 0, thighs: both(0), shins: both(0), legOut: both(8), arms: both(170), fore: both(175), armPlane: both(80) },
    ],
  },
  'bent-over-row': {
    duration: 2.4,
    anchor: { type: 'feet' },
    props: ['dumbbells'],
    keyframes: [
      { torso: 60, thighs: both(20), shins: both(-8), ...HANG(60) },
      { torso: 60, thighs: both(20), shins: both(-8), arms: both(-10), fore: both(70), armPlane: both(14), forePlane: both(10) },
    ],
  },
  'barbell-row': {
    duration: 2.4,
    anchor: { type: 'feet' },
    props: ['barbell'],
    keyframes: [
      { torso: 60, thighs: both(20), shins: both(-8), ...HANG(60) },
      { torso: 60, thighs: both(20), shins: both(-8), arms: both(0), fore: both(70), armPlane: both(20), forePlane: both(14) },
    ],
  },
  'single-arm-row': {
    duration: 2.4,
    anchor: { type: 'feet' },
    props: ['kettlebell-left'],
    keyframes: [
      { torso: 60, thighs: [20, 30], shins: [-8, -12], legOut: [4, 8], arms: [64, 72], fore: [64, 72], armPlane: [10, 20] },
      { torso: 60, twist: 10, thighs: [20, 30], shins: [-8, -12], legOut: [4, 8], arms: [-10, 72], fore: [70, 72], armPlane: [10, 20] },
    ],
  },
  'seated-row': {
    duration: 2.6,
    anchor: { type: 'ground' },
    flatFeet: false,
    props: ['band-front'],
    keyframes: [
      { torso: 10, head: 5, thighs: both(80), shins: both(85), feet: both(-75), arms: both(90), fore: both(90), armPlane: both(12) },
      { torso: -8, head: -5, thighs: both(80), shins: both(85), feet: both(-75), arms: both(-25), fore: both(85), armPlane: both(18), forePlane: both(10) },
    ],
  },
  'band-pull-apart': {
    duration: 2.2,
    anchor: { type: 'feet' },
    props: ['band-between-hands'],
    keyframes: [
      { torso: 0, thighs: both(0), shins: both(0), legOut: both(5), arms: both(88), fore: both(88), armPlane: both(10) },
      { torso: 0, thighs: both(0), shins: both(0), legOut: both(5), arms: both(88), fore: both(88), armPlane: both(85) },
    ],
  },
  'face-pull': {
    duration: 2.4,
    anchor: { type: 'feet' },
    props: ['band-front'],
    keyframes: [
      { torso: 0, thighs: both(0), shins: both(0), legOut: both(5), arms: both(95), fore: both(95), armPlane: both(10) },
      { torso: 0, thighs: both(0), shins: both(0), legOut: both(5), arms: both(95), fore: both(170), armPlane: both(85), forePlane: both(30) },
    ],
  },
  'pull-up': {
    duration: 3,
    anchor: { type: 'hands', target: [0, 2.2, 0] },
    flatFeet: false,
    scene: [{ kind: 'bar', height: 2.2 }],
    keyframes: [
      { torso: 0, head: -5, arms: both(170), fore: both(172), armPlane: both(80), thighs: both(10), shins: both(-25) },
      { torso: -8, head: -10, arms: both(100), fore: both(176), armPlane: both(95), forePlane: both(75), thighs: both(20), shins: both(-30) },
    ],
  },
  'chin-up': {
    duration: 3,
    anchor: { type: 'hands', target: [0, 2.2, 0] },
    flatFeet: false,
    scene: [{ kind: 'bar', height: 2.2 }],
    keyframes: [
      { torso: 0, head: -5, arms: both(176), fore: both(178), armPlane: both(20), thighs: both(10), shins: both(-25) },
      { torso: -10, head: -12, arms: both(30), fore: both(175), armPlane: both(20), thighs: both(20), shins: both(-30) },
    ],
  },
  'lat-pulldown': {
    duration: 2.6,
    anchor: { type: 'ground' },
    flatFeet: false,
    props: ['band-overhead'],
    keyframes: [
      { torso: -6, head: -10, thighs: both(-6), shins: both(-95), arms: both(170), fore: both(172), armPlane: both(70) },
      { torso: -12, head: -14, thighs: both(-6), shins: both(-95), arms: both(80), fore: both(176), armPlane: both(95), forePlane: both(70) },
    ],
  },
  curl: {
    duration: 2.2,
    anchor: { type: 'feet' },
    props: ['dumbbells'],
    keyframes: [
      { torso: 0, thighs: both(0), shins: both(0), legOut: both(4), arms: both(2), fore: both(4), armPlane: both(20) },
      { torso: 0, thighs: both(0), shins: both(0), legOut: both(4), arms: both(10), fore: both(145), armPlane: both(20), forePlane: both(5) },
    ],
  },
  'barbell-curl': {
    duration: 2.2,
    anchor: { type: 'feet' },
    props: ['barbell'],
    keyframes: [
      { torso: 0, thighs: both(0), shins: both(0), legOut: both(4), arms: both(4), fore: both(6), armPlane: both(16) },
      { torso: 0, thighs: both(0), shins: both(0), legOut: both(4), arms: both(12), fore: both(145), armPlane: both(16), forePlane: both(8) },
    ],
  },
  'band-curl': {
    duration: 2.2,
    anchor: { type: 'feet' },
    props: ['band-feet'],
    keyframes: [
      { torso: 0, thighs: both(0), shins: both(0), legOut: both(8), arms: both(2), fore: both(4), armPlane: both(20) },
      { torso: 0, thighs: both(0), shins: both(0), legOut: both(8), arms: both(10), fore: both(145), armPlane: both(20), forePlane: both(5) },
    ],
  },
  'overhead-extension': {
    duration: 2.4,
    anchor: { type: 'feet' },
    props: ['dumbbell-both-hands'],
    keyframes: [
      { torso: 0, thighs: both(0), shins: both(0), legOut: both(5), arms: both(172), fore: both(176), armPlane: both(-8), forePlane: both(-20) },
      { torso: 0, thighs: both(0), shins: both(0), legOut: both(5), arms: both(165), fore: both(20), armPlane: both(10), forePlane: both(-25) },
    ],
  },
  pushdown: {
    duration: 2.2,
    anchor: { type: 'feet' },
    props: ['band-overhead'],
    keyframes: [
      { torso: 12, thighs: both(6), shins: both(-3), legOut: both(5), arms: both(18), fore: both(150), armPlane: both(10), forePlane: both(-10) },
      { torso: 12, thighs: both(6), shins: both(-3), legOut: both(5), arms: both(14), fore: both(14), armPlane: both(10), forePlane: both(0) },
    ],
  },
  'lateral-raise': {
    duration: 2.4,
    anchor: { type: 'feet' },
    props: ['dumbbells'],
    keyframes: [
      { torso: 0, thighs: both(0), shins: both(0), legOut: both(4), arms: both(10), fore: both(14), armPlane: both(85) },
      { torso: 0, thighs: both(0), shins: both(0), legOut: both(4), arms: both(85), fore: both(92), armPlane: both(85) },
    ],
  },
  'band-lateral-raise': {
    duration: 2.4,
    anchor: { type: 'feet' },
    props: ['band-feet'],
    keyframes: [
      { torso: 0, thighs: both(0), shins: both(0), legOut: both(4), arms: both(10), fore: both(14), armPlane: both(85) },
      { torso: 0, thighs: both(0), shins: both(0), legOut: both(4), arms: both(85), fore: both(92), armPlane: both(85) },
    ],
  },
  plank: {
    duration: 3,
    anchor: { type: 'ground' },
    flatFeet: false,
    keyframes: [
      { torso: 80, head: 75, ...straightLegs(80), arms: both(-5), fore: both(80), armPlane: both(8) },
      { torso: 81, head: 74, ...straightLegs(81), arms: both(-4), fore: both(81), armPlane: both(8) },
    ],
  },
  'mountain-climber': {
    duration: 1,
    anchor: { type: 'ground' },
    flatFeet: false,
    keyframes: [
      { torso: 68, head: 62, thighs: [80, -68], shins: [-30, -68], arms: both(68), fore: both(68), armPlane: both(10) },
      { torso: 68, head: 62, thighs: [-68, 80], shins: [-68, -30], arms: both(68), fore: both(68), armPlane: both(10) },
    ],
  },
  crunch: {
    duration: 2.2,
    anchor: { type: 'ground' },
    flatFeet: false,
    keyframes: [
      { torso: -90, pelvis: -90, head: -88, arms: both(150), fore: both(30), armPlane: both(80), ...FLOOR_PRESS_LEGS },
      { torso: -55, pelvis: -90, head: -40, arms: both(150), fore: both(30), armPlane: both(80), ...FLOOR_PRESS_LEGS },
    ],
  },
  'dead-bug': {
    duration: 2.8,
    anchor: { type: 'ground' },
    flatFeet: false,
    keyframes: [
      { torso: -90, head: -88, arms: [90, 90], fore: [90, 90], armPlane: both(6), thighs: both(180), shins: both(90), legOut: both(4) },
      { torso: -90, head: -88, arms: [175, 90], fore: [175, 90], armPlane: both(6), thighs: [180, 95], shins: [90, 95], legOut: both(4) },
      { torso: -90, head: -88, arms: [90, 90], fore: [90, 90], armPlane: both(6), thighs: both(180), shins: both(90), legOut: both(4) },
      { torso: -90, head: -88, arms: [90, 175], fore: [90, 175], armPlane: both(6), thighs: [95, 180], shins: [95, 90], legOut: both(4) },
    ],
  },
  'leg-raise': {
    duration: 2.6,
    anchor: { type: 'ground' },
    flatFeet: false,
    keyframes: [
      { torso: -90, head: -88, arms: both(0), fore: both(0), armPlane: both(14), thighs: both(95), shins: both(95) },
      { torso: -90, head: -88, arms: both(0), fore: both(0), armPlane: both(14), thighs: both(170), shins: both(170) },
    ],
  },
  'hanging-knee-raise': {
    duration: 2.6,
    anchor: { type: 'hands', target: [0, 2.2, 0] },
    flatFeet: false,
    scene: [{ kind: 'bar', height: 2.2 }],
    keyframes: [
      { torso: 0, head: -4, arms: both(172), fore: both(174), armPlane: both(80), thighs: both(4), shins: both(0) },
      { torso: -10, head: -4, arms: both(172), fore: both(174), armPlane: both(80), thighs: both(100), shins: both(5) },
    ],
  },
  'russian-twist': {
    duration: 2,
    anchor: { type: 'ground' },
    flatFeet: false,
    props: ['medicine-ball'],
    keyframes: [
      { torso: -40, pelvis: -40, head: -30, twist: 35, arms: both(60), fore: both(110), armPlane: both(-20), forePlane: both(-60), thighs: both(120), shins: both(60), legOut: both(6) },
      { torso: -40, pelvis: -40, head: -30, twist: -35, arms: both(60), fore: both(110), armPlane: both(-20), forePlane: both(-60), thighs: both(120), shins: both(60), legOut: both(6) },
    ],
  },
  'ab-rollout': {
    duration: 3,
    anchor: { type: 'ground' },
    flatFeet: false,
    props: ['ab-wheel'],
    keyframes: [
      { torso: 30, head: 40, pelvis: 30, thighs: both(-5), shins: both(-95), arms: both(30), fore: both(30), armPlane: both(6) },
      { torso: 75, head: 75, pelvis: 70, thighs: both(-60), shins: both(-95), arms: both(160), fore: both(160), armPlane: both(6) },
    ],
  },
  'bird-dog': {
    duration: 3.2,
    anchor: { type: 'ground' },
    flatFeet: false,
    keyframes: [
      { torso: 90, head: 85, arms: both(90), fore: both(90), armPlane: both(6), thighs: both(0), shins: both(-90) },
      { torso: 90, head: 85, arms: [180, 90], fore: [180, 90], armPlane: both(6), thighs: [0, -90], shins: [-90, -90] },
      { torso: 90, head: 85, arms: both(90), fore: both(90), armPlane: both(6), thighs: both(0), shins: both(-90) },
      { torso: 90, head: 85, arms: [90, 180], fore: [90, 180], armPlane: both(6), thighs: [-90, 0], shins: [-90, -90] },
    ],
  },
  'medicine-ball-slam': {
    duration: 1.6,
    anchor: { type: 'feet' },
    props: ['medicine-ball'],
    timing: [1, 0.6],
    keyframes: [
      { torso: -6, thighs: both(0), shins: both(0), legOut: both(8), feet: both(0), arms: both(175), fore: both(178), armPlane: both(-12) },
      { torso: 60, thighs: both(60), shins: both(-20), legOut: both(12), arms: both(70), fore: both(70), armPlane: both(-12) },
    ],
  },
  'jumping-jack': {
    duration: 1.1,
    anchor: { type: 'feet' },
    keyframes: [
      { torso: 0, thighs: both(0), shins: both(0), legOut: both(2), arms: both(8), fore: both(10), armPlane: both(90) },
      { torso: 0, thighs: both(0), shins: both(0), legOut: both(16), arms: both(165), fore: both(172), armPlane: both(90), lift: 0.06 },
    ],
  },
  'high-knees': {
    duration: 0.8,
    anchor: { type: 'ground' },
    flatFeet: false,
    keyframes: [
      { torso: 2, thighs: [90, 0], shins: [0, 0], feet: [10, 25], arms: [-30, 60], fore: [40, 110], armPlane: both(10) },
      { torso: 2, thighs: [0, 90], shins: [0, 0], feet: [25, 10], arms: [60, -30], fore: [110, 40], armPlane: both(10) },
    ],
  },
  'jump-rope': {
    duration: 0.6,
    anchor: { type: 'feet' },
    props: ['jump-rope'],
    keyframes: [
      { torso: 0, thighs: both(4), shins: both(-6), arms: both(14), fore: both(60), armPlane: both(60), forePlane: both(70) },
      { torso: 0, thighs: both(0), shins: both(0), feet: both(30), arms: both(14), fore: both(60), armPlane: both(60), forePlane: both(70), lift: 0.08 },
    ],
  },
  burpee: {
    duration: 3,
    anchor: { type: 'ground' },
    flatFeet: false,
    timing: [1, 1, 1, 1],
    keyframes: [
      { torso: 0, thighs: both(0), shins: both(0), feet: both(0), arms: both(170), fore: both(175), armPlane: both(20), root: [0, 0, 0] },
      { torso: 50, thighs: both(110), shins: both(-35), feet: both(0), arms: both(50), fore: both(50), armPlane: both(14), root: [0, 0, 0.05] },
      { torso: 72, head: 66, ...straightLegs(72), arms: both(72), fore: both(72), armPlane: both(14), root: [0, 0, -0.32] },
      { torso: 50, thighs: both(110), shins: both(-35), feet: both(0), arms: both(50), fore: both(50), armPlane: both(14), root: [0, 0, 0.05] },
    ],
  },
  'rowing-machine': {
    duration: 2.2,
    anchor: { type: 'fixed' },
    flatFeet: false,
    scene: [{ kind: 'rower' }],
    timing: [1.4, 0.8],
    keyframes: [
      { torso: 22, head: 18, thighs: both(140), shins: both(25), feet: both(-35), arms: both(80), fore: both(80), armPlane: both(10), root: [0, 0.32, 0.05] },
      { torso: -18, head: -12, thighs: both(90), shins: both(90), feet: both(-70), arms: both(-20), fore: both(85), armPlane: both(14), forePlane: both(8), root: [0, 0.32, -0.45] },
    ],
  },
  'stationary-bike': {
    duration: 1.2,
    anchor: { type: 'fixed' },
    flatFeet: false,
    easing: 'linear',
    scene: [{ kind: 'bike' }],
    keyframes: [
      { torso: 30, head: 20, thighs: [60, 120], shins: [-5, 25], feet: [5, 10], arms: both(75), fore: both(80), armPlane: both(12), root: [0, 0.95, 0] },
      { torso: 30, head: 20, thighs: [95, 85], shins: [20, -20], feet: [15, 0], arms: both(75), fore: both(80), armPlane: both(12), root: [0, 0.95, 0] },
      { torso: 30, head: 20, thighs: [120, 60], shins: [25, -5], feet: [10, 5], arms: both(75), fore: both(80), armPlane: both(12), root: [0, 0.95, 0] },
      { torso: 30, head: 20, thighs: [85, 95], shins: [-20, 20], feet: [0, 15], arms: both(75), fore: both(80), armPlane: both(12), root: [0, 0.95, 0] },
    ],
  },
  run: {
    duration: 0.8,
    anchor: { type: 'ground', y: 0.18 },
    flatFeet: false,
    scene: [{ kind: 'treadmill' }],
    keyframes: [
      { torso: 8, thighs: [55, -25], shins: [-20, -80], feet: [0, 40], arms: [-35, 50], fore: [50, 130], armPlane: both(8) },
      { torso: 8, thighs: [-25, 55], shins: [-80, -20], feet: [40, 0], arms: [50, -35], fore: [130, 50], armPlane: both(8) },
    ],
  },
  'farmer-carry': {
    duration: 1.3,
    anchor: { type: 'ground' },
    flatFeet: false,
    props: ['dumbbells'],
    keyframes: [
      { torso: 0, thighs: [20, -12], shins: [5, -25], feet: [0, 15], arms: both(3), fore: both(3), armPlane: both(90) },
      { torso: 0, thighs: [-12, 20], shins: [-25, 5], feet: [15, 0], arms: both(3), fore: both(3), armPlane: both(90) },
    ],
  },
} satisfies Record<string, Motion>;

export type MotionId = keyof typeof MOTIONS;

export function getMotion(id: MotionId): Motion {
  return MOTIONS[id] as Motion;
}
