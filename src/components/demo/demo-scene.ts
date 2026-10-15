import * as THREE from 'three';

import type { ThemeColors } from '@/constants/theme';
import { motionBounds, sampleMotion, type HeldProp, type Motion, type SceneItem } from '@/lib/motion/animate';
import type { Joint, Skeleton, Vec3 } from '@/lib/motion/rig';

const BONES: { from: Joint; to: Joint; radius: number }[] = [
  { from: 'pelvis', to: 'neck', radius: 0.115 },
  { from: 'neck', to: 'head', radius: 0.045 },
  { from: 'lShoulder', to: 'rShoulder', radius: 0.06 },
  { from: 'lHip', to: 'rHip', radius: 0.08 },
  { from: 'lShoulder', to: 'lElbow', radius: 0.047 },
  { from: 'lElbow', to: 'lWrist', radius: 0.04 },
  { from: 'rShoulder', to: 'rElbow', radius: 0.047 },
  { from: 'rElbow', to: 'rWrist', radius: 0.04 },
  { from: 'lHip', to: 'lKnee', radius: 0.068 },
  { from: 'lKnee', to: 'lAnkle', radius: 0.052 },
  { from: 'lHeel', to: 'lToe', radius: 0.035 },
  { from: 'rHip', to: 'rKnee', radius: 0.068 },
  { from: 'rKnee', to: 'rAnkle', radius: 0.052 },
  { from: 'rHeel', to: 'rToe', radius: 0.035 },
];

/** Accent-colored balls at the joints give the mannequin its look. */
const JOINT_BALLS: { joint: Joint; radius: number; accent: boolean }[] = [
  { joint: 'lShoulder', radius: 0.062, accent: true },
  { joint: 'rShoulder', radius: 0.062, accent: true },
  { joint: 'lElbow', radius: 0.05, accent: true },
  { joint: 'rElbow', radius: 0.05, accent: true },
  { joint: 'lHand', radius: 0.042, accent: true },
  { joint: 'rHand', radius: 0.042, accent: true },
  { joint: 'lHip', radius: 0.078, accent: true },
  { joint: 'rHip', radius: 0.078, accent: true },
  { joint: 'lKnee', radius: 0.062, accent: true },
  { joint: 'rKnee', radius: 0.062, accent: true },
  { joint: 'lAnkle', radius: 0.05, accent: true },
  { joint: 'rAnkle', radius: 0.05, accent: true },
  { joint: 'pelvis', radius: 0.125, accent: false },
  { joint: 'chest', radius: 0.14, accent: false },
  { joint: 'head', radius: 0.11, accent: false },
];

const UP = new THREE.Vector3(0, 1, 0);
const tmpA = new THREE.Vector3();
const tmpB = new THREE.Vector3();
const tmpDir = new THREE.Vector3();

/** Stretches a unit-height, Y-aligned object between two points. */
function placeBetween(object: THREE.Object3D | undefined, a: Vec3, b: Vec3) {
  if (!object) return;
  tmpA.set(a[0], a[1], a[2]);
  tmpB.set(b[0], b[1], b[2]);
  tmpDir.subVectors(tmpB, tmpA);
  const length = tmpDir.length();
  object.position.addVectors(tmpA, tmpB).multiplyScalar(0.5);
  if (length > 1e-6) object.quaternion.setFromUnitVectors(UP, tmpDir.divideScalar(length));
  object.scale.set(1, Math.max(length, 1e-4), 1);
}

/** Points a Y-aligned object along `axis`, centered at `center`. */
function placeAlong(object: THREE.Object3D | undefined, center: Vec3, axis: Vec3) {
  if (!object) return;
  object.position.set(center[0], center[1], center[2]);
  tmpDir.set(axis[0], axis[1], axis[2]);
  if (tmpDir.lengthSq() > 1e-8) object.quaternion.setFromUnitVectors(UP, tmpDir.normalize());
}

const mid = (a: Vec3, b: Vec3): Vec3 => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];

type Materials = Record<'figure' | 'accent' | 'metal' | 'plate' | 'pad' | 'band' | 'floor' | 'ring', THREE.Material>;

/**
 * Builds a small matcap texture: soft key light, a highlight and a faint accent rim.
 *
 * The demo uses matcap materials instead of lit ones. In testing, any material that reads scene
 * lights froze expo-gl after its first frame. Matcaps bake the lighting into a texture, so they
 * need no lights.
 */
function createMatcap(rim: string): THREE.DataTexture {
  const size = 64;
  const data = new Uint8Array(size * size * 4);
  const rimColor = new THREE.Color(rim);
  const light = new THREE.Vector3(-0.45, 0.6, 0.66).normalize();
  const half = new THREE.Vector3().addVectors(light, new THREE.Vector3(0, 0, 1)).normalize();
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = ((x + 0.5) / size) * 2 - 1;
      const ny = ((y + 0.5) / size) * 2 - 1;
      const r = Math.min(1, Math.hypot(nx, ny));
      const n = new THREE.Vector3(nx, ny, Math.sqrt(Math.max(0, 1 - r * r))).normalize();
      const diffuse = Math.max(0, n.dot(light));
      const specular = Math.pow(Math.max(0, n.dot(half)), 48);
      const rimAmount = Math.pow(1 - n.z, 3) * 0.55;
      const base = 0.28 + 0.62 * diffuse;
      const i = (y * size + x) * 4;
      data[i] = Math.min(255, 255 * (base + specular * 0.5 + rimAmount * rimColor.r));
      data[i + 1] = Math.min(255, 255 * (base + specular * 0.5 + rimAmount * rimColor.g));
      data[i + 2] = Math.min(255, 255 * (base + specular * 0.5 + rimAmount * rimColor.b));
      data[i + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function createMaterials(colors: ThemeColors, matcap: THREE.Texture): Materials {
  const shaded = (color: string) => new THREE.MeshMatcapMaterial({ color, matcap });
  return {
    figure: shaded(colors.figure),
    accent: new THREE.MeshBasicMaterial({ color: colors.figureJoint }),
    metal: shaded(colors.metal),
    plate: shaded(colors.plate),
    pad: shaded(colors.wood),
    band: shaded(colors.accent),
    floor: new THREE.MeshBasicMaterial({ color: colors.floor }),
    ring: new THREE.MeshBasicMaterial({ color: colors.figureJoint }),
  };
}

function mesh(geometry: THREE.BufferGeometry, material: THREE.Material, position?: Vec3) {
  const m = new THREE.Mesh(geometry, material);
  if (position) m.position.set(...position);
  return m;
}

function group(...children: THREE.Object3D[]) {
  const g = new THREE.Group();
  for (const child of children) g.add(child);
  return g;
}

function dumbbell(m: Materials) {
  return group(
    mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.2, 10), m.metal),
    mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.06, 6), m.plate, [0, -0.1, 0]),
    mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.06, 6), m.plate, [0, 0.1, 0]),
  );
}

/** Builds the meshes for one held prop and returns the objects to move each frame, by key. */
function buildProp(prop: HeldProp, m: Materials): Record<string, THREE.Object3D> {
  const band = () => mesh(new THREE.CylinderGeometry(0.008, 0.008, 1, 6), m.band);
  switch (prop) {
    case 'dumbbells':
      return { 'dumbbell-l': dumbbell(m), 'dumbbell-r': dumbbell(m) };
    case 'dumbbell-left':
    case 'dumbbell-both-hands':
      return { 'dumbbell-l': dumbbell(m) };
    case 'barbell':
      return {
        barbell: group(
          mesh(new THREE.CylinderGeometry(0.014, 0.014, 1.9, 10), m.metal),
          mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 24), m.plate, [0, -0.72, 0]),
          mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 24), m.plate, [0, 0.72, 0]),
        ),
      };
    case 'kettlebell':
    case 'kettlebell-left':
      return {
        kettlebell: group(
          mesh(new THREE.SphereGeometry(0.095, 18, 14), m.plate, [0, -0.05, 0]),
          mesh(new THREE.TorusGeometry(0.055, 0.013, 8, 18), m.metal, [0, 0.06, 0]),
        ),
      };
    case 'medicine-ball':
      return { ball: mesh(new THREE.SphereGeometry(0.12, 20, 16), m.plate) };
    case 'ab-wheel':
      return {
        wheel: group(
          mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 24), m.plate),
          mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.32, 8), m.metal),
        ),
      };
    case 'band-feet':
    case 'band-overhead':
    case 'band-front':
      return { 'band-l': band(), 'band-r': band() };
    case 'band-between-hands':
      return { 'band-l': mesh(new THREE.CylinderGeometry(0.01, 0.01, 1, 6), m.band) };
    case 'jump-rope':
      return { rope: mesh(new THREE.TorusGeometry(0.95, 0.006, 6, 48), m.band) };
  }
}

function placeProp(
  prop: HeldProp,
  p: Record<string, THREE.Object3D>,
  s: Skeleton,
  bandAnchor: Vec3,
  phase: number,
) {
  const hands = mid(s.lHand, s.rHand);
  switch (prop) {
    case 'dumbbells':
      placeAlong(p['dumbbell-l'], s.lHand, s.basis.left);
      placeAlong(p['dumbbell-r'], s.rHand, s.basis.left);
      break;
    case 'dumbbell-left':
      placeAlong(p['dumbbell-l'], s.lHand, s.basis.left);
      break;
    case 'dumbbell-both-hands':
      placeAlong(p['dumbbell-l'], hands, sub(s.lHand, s.lElbow));
      break;
    case 'barbell':
      placeAlong(p.barbell, hands, sub(s.lHand, s.rHand));
      break;
    case 'kettlebell':
      p.kettlebell?.position.set(hands[0], hands[1] - 0.09, hands[2]);
      break;
    case 'kettlebell-left':
      p.kettlebell?.position.set(s.lHand[0], s.lHand[1] - 0.09, s.lHand[2]);
      break;
    case 'medicine-ball':
      p.ball?.position.set(hands[0], hands[1] - 0.02, hands[2] + 0.04);
      break;
    case 'ab-wheel':
      placeAlong(p.wheel, [hands[0], hands[1] - 0.06, hands[2]], [1, 0, 0]);
      break;
    case 'band-feet':
      placeBetween(p['band-l'], s.lHand, s.lToe);
      placeBetween(p['band-r'], s.rHand, s.rToe);
      break;
    case 'band-overhead':
      placeBetween(p['band-l'], s.lHand, [0, 2.15, 0.55]);
      placeBetween(p['band-r'], s.rHand, [0, 2.15, 0.55]);
      break;
    case 'band-front':
      placeBetween(p['band-l'], s.lHand, bandAnchor);
      placeBetween(p['band-r'], s.rHand, bandAnchor);
      break;
    case 'band-between-hands':
      placeBetween(p['band-l'], s.lHand, s.rHand);
      break;
    case 'jump-rope':
      p.rope?.position.set(0, hands[1] - 0.05, hands[2] - 0.1);
      p.rope?.rotation.set(phase * Math.PI * 2, 0, 0);
      break;
  }
}

function buildScenery(item: SceneItem, m: Materials): THREE.Object3D | null {
  switch (item.kind) {
    case 'bench': {
      const [x, top, z] = item.center;
      const length = item.length ?? 1.1;
      const legOffset = length / 2 - 0.12;
      const legHeight = top - 0.08;
      const pad = mesh(
        new THREE.BoxGeometry(...((item.rotated ? [length, 0.08, 0.3] : [0.3, 0.08, length]) as Vec3)),
        m.pad,
        [0, top - 0.04, 0],
      );
      const legs = [-legOffset, legOffset].map((o) =>
        mesh(new THREE.BoxGeometry(0.05, legHeight, 0.05), m.metal, item.rotated ? [o, legHeight / 2, 0] : [0, legHeight / 2, o]),
      );
      const bench = group(pad, ...legs);
      bench.position.set(x, 0, z);
      return bench;
    }
    case 'box':
      return mesh(new THREE.BoxGeometry(...item.size), m.pad, item.center);
    case 'bar': {
      const z = item.z ?? 0;
      const bar = mesh(new THREE.CylinderGeometry(0.016, 0.016, 1.4, 10), m.metal, [0, item.height, z]);
      bar.rotation.set(0, 0, Math.PI / 2);
      return group(
        bar,
        mesh(new THREE.BoxGeometry(0.05, item.height, 0.05), m.metal, [-0.7, item.height / 2, z]),
        mesh(new THREE.BoxGeometry(0.05, item.height, 0.05), m.metal, [0.7, item.height / 2, z]),
      );
    }
    case 'rower':
      return group(
        mesh(new THREE.BoxGeometry(0.12, 0.06, 2.0), m.metal, [0, 0.12, 0.2]),
        mesh(new THREE.BoxGeometry(0.45, 0.4, 0.3), m.pad, [0, 0.2, 1.0]),
      );
    case 'bike': {
      const post = mesh(new THREE.BoxGeometry(0.08, 0.9, 0.08), m.metal, [0, 0.45, 0.1]);
      post.rotation.set(0.35, 0, 0);
      const wheel = mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.06, 24), m.pad, [0, 0.3, 0.75]);
      wheel.rotation.set(0, 0, Math.PI / 2);
      return group(post, mesh(new THREE.BoxGeometry(0.2, 0.06, 0.3), m.pad, [0, 0.9, -0.02]), wheel);
    }
    case 'treadmill':
      return mesh(new THREE.BoxGeometry(0.75, 0.18, 1.8), m.pad, [0, 0.09, 0]);
    case 'rack':
    case 'cable-tower':
      return null;
  }
}

export interface DemoScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  /** Moves the figure to `seconds` into the loop and turns the camera to `yaw` radians. */
  update: (seconds: number, yaw: number) => void;
  dispose: () => void;
}

export function createDemoScene(motion: Motion, colors: ThemeColors, aspect: number): DemoScene {
  const matcap = createMatcap(colors.figureJoint);
  const m = createMaterials(colors, matcap);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(colors.card);
  scene.fog = new THREE.Fog(colors.card, 5, 11);

  const floor = mesh(new THREE.CircleGeometry(2.4, 48), m.floor, [0, -0.001, 0]);
  floor.rotation.x = -Math.PI / 2;
  const ring = mesh(new THREE.RingGeometry(2.36, 2.4, 64), m.ring, [0, 0.001, 0]);
  ring.rotation.x = -Math.PI / 2;
  const grid = new THREE.GridHelper(4.8, 24, colors.grid, colors.grid);
  grid.position.y = 0.002;
  scene.add(floor, ring, grid);

  for (const item of motion.scene ?? []) {
    const object = buildScenery(item, m);
    if (object) scene.add(object);
  }

  const bones = BONES.map((bone) => {
    const b = mesh(new THREE.CylinderGeometry(bone.radius, bone.radius, 1, 14), m.figure);
    scene.add(b);
    return b;
  });
  const balls = JOINT_BALLS.map((ball) => {
    const b = mesh(new THREE.SphereGeometry(ball.radius, 16, 12), ball.accent ? m.accent : m.figure);
    scene.add(b);
    return b;
  });

  const props = motion.props ?? [];
  const propObjects: Record<string, THREE.Object3D> = {};
  for (const prop of props) {
    for (const [key, object] of Object.entries(buildProp(prop, m))) {
      propObjects[key] = object;
      scene.add(object);
    }
  }

  // Bands anchored in front use where the shoulders start, so the anchor doesn't drift.
  const start = sampleMotion(motion, 0).skeleton;
  const shoulders = mid(start.lShoulder, start.rShoulder);
  const bandAnchor: Vec3 = [0, shoulders[1], shoulders[2] + 1.0];

  const bounds = motionBounds(motion);
  const distance = Math.max(2.6, bounds.size * 1.7 + 0.8);
  const target = new THREE.Vector3(bounds.center[0], Math.max(0.5, bounds.center[1]), bounds.center[2]);
  const camera = new THREE.PerspectiveCamera(38, aspect, 0.1, 40);

  const update = (seconds: number, yaw: number) => {
    const { skeleton: s, phase } = sampleMotion(motion, seconds);
    BONES.forEach((bone, i) => placeBetween(bones[i], s[bone.from], s[bone.to]));
    JOINT_BALLS.forEach((ball, i) => balls[i].position.set(...s[ball.joint]));
    for (const prop of props) placeProp(prop, propObjects, s, bandAnchor, phase);

    camera.position.set(
      target.x + Math.sin(yaw) * distance,
      target.y + distance * 0.28,
      target.z + Math.cos(yaw) * distance,
    );
    camera.lookAt(target);
  };

  const dispose = () => {
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) object.geometry.dispose();
    });
    grid.geometry.dispose();
    for (const material of Object.values(m)) material.dispose();
    matcap.dispose();
  };

  return { scene, camera, update, dispose };
}
