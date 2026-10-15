/**
 * Renders every exercise motion as stick figures (side and front views, four phases) into PNG
 * contact sheets, for checking poses without a phone. Run: npx tsx scripts/preview-motions.ts <outDir> [motionId...]
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { Resvg } from '@resvg/resvg-js';

import { sampleMotion, type Motion } from '../src/lib/motion/animate';
import { MOTIONS } from '../src/lib/motion/motions';
import type { Skeleton, Vec3 } from '../src/lib/motion/rig';

const BONES: [keyof Skeleton, keyof Skeleton][] = [
  ['pelvis', 'neck'], ['neck', 'head'], ['lShoulder', 'rShoulder'], ['lHip', 'rHip'],
  ['lShoulder', 'lElbow'], ['lElbow', 'lHand'], ['rShoulder', 'rElbow'], ['rElbow', 'rHand'],
  ['lHip', 'lKnee'], ['lKnee', 'lAnkle'], ['lHeel', 'lToe'], ['lAnkle', 'lHeel'],
  ['rHip', 'rKnee'], ['rKnee', 'rAnkle'], ['rHeel', 'rToe'], ['rAnkle', 'rHeel'],
];
const COLORS = ['#111', '#d33', '#27c', '#2a2'];
const CELL = 230;
const S = 85; // px per meter

function view(motion: Motion, project: (p: Vec3) => [number, number], ox: number, oy: number) {
  let out = `<line x1="${ox}" y1="${oy + 205}" x2="${ox + CELL}" y2="${oy + 205}" stroke="#999"/>`;
  for (const item of motion.scene ?? []) {
    if (item.kind === 'bench' || item.kind === 'box') {
      const c = item.kind === 'bench' ? item.center : item.center;
      const size: Vec3 = item.kind === 'bench' ? (item.rotated ? [1.1, 0.06, 0.3] : [0.3, 0.06, 1.1]) : item.size;
      const top = item.kind === 'bench' ? c[1] : c[1] + size[1] / 2;
      const corners: Vec3[] = [
        [c[0] - size[0] / 2, top, c[2] - size[2] / 2], [c[0] + size[0] / 2, top - (item.kind === 'box' ? size[1] : size[1]), c[2] + size[2] / 2],
      ];
      const a = project(corners[0]); const b = project(corners[1]);
      out += `<rect x="${ox + Math.min(a[0], b[0])}" y="${oy + Math.min(a[1], b[1])}" width="${Math.abs(a[0] - b[0])}" height="${Math.abs(a[1] - b[1])}" fill="#ddd"/>`;
    }
    if (item.kind === 'bar') {
      const p = project([0, item.height, item.z ?? 0]);
      out += `<circle cx="${ox + p[0]}" cy="${oy + p[1]}" r="3" fill="#888"/>`;
    }
  }
  [0, 0.25, 0.5, 0.75].forEach((phase, i) => {
    const { skeleton } = sampleMotion(motion, phase * motion.duration);
    for (const [a, b] of BONES) {
      const p = project(skeleton[a] as Vec3); const q = project(skeleton[b] as Vec3);
      out += `<line x1="${ox + p[0]}" y1="${oy + p[1]}" x2="${ox + q[0]}" y2="${oy + q[1]}" stroke="${COLORS[i]}" stroke-width="2" opacity="0.8"/>`;
    }
    const h = project(skeleton.head);
    out += `<circle cx="${ox + h[0]}" cy="${oy + h[1]}" r="${0.11 * S}" fill="none" stroke="${COLORS[i]}" stroke-width="2" opacity="0.8"/>`;
  });
  return out;
}

const outDir = process.argv[2];
const only = process.argv.slice(3);
const ids = Object.keys(MOTIONS).filter((id) => only.length === 0 || only.includes(id));
const perRow = 2;
const rows = Math.ceil(ids.length / perRow);
const width = perRow * CELL * 2;
const height = rows * (CELL + 20);
let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="#fff"/>`;
ids.forEach((id, n) => {
  const motion = MOTIONS[id as keyof typeof MOTIONS] as Motion;
  const ox = (n % perRow) * CELL * 2;
  const oy = Math.floor(n / perRow) * (CELL + 20);
  svg += `<text x="${ox + 6}" y="${oy + 16}" font-size="14" font-family="sans-serif">${id}</text>`;
  // Side view: +Z to the right. Front view: figure's left (+X) on the right of the image.
  svg += view(motion, (p) => [CELL / 2 + p[2] * S, 205 - p[1] * S], ox, oy + 10);
  svg += view(motion, (p) => [CELL / 2 + p[0] * S, 205 - p[1] * S], ox + CELL, oy + 10);
  svg += `<line x1="${ox + CELL}" y1="${oy}" x2="${ox + CELL}" y2="${oy + CELL}" stroke="#eee"/>`;
});
svg += '</svg>';
const png = new Resvg(svg, { font: { loadSystemFonts: true } }).render().asPng();
const file = join(outDir, `motions${only.length ? '-' + only.join('_').slice(0, 40) : ''}.png`);
writeFileSync(file, png);
console.log(file);
