// Renders the Google Play listing images into store/android/.
// Run after changing the logo or retaking screenshots:  node scripts/generate-play-assets.mjs
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Resvg } from '@resvg/resvg-js';

import { encodeRgbPng } from './encode-png.mjs';

// Node 24 strips TypeScript types on import, so the app's logo source can be used as-is.
import { buildLogoSvg } from '../src/components/brand/logo-svg.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const archivo = (weight) => join(root, `node_modules/@expo-google-fonts/archivo/${weight}/Archivo_${weight}.ttf`);
const outDir = join(root, 'store/android');
mkdirSync(outDir, { recursive: true });

// Feature graphic: 1024 × 500, shown at the top of the Play listing. Same look as the app.
const LOGO_SIZE = 260;
const logo = buildLogoSvg().replace(
  'viewBox="0 0 64 64"',
  `x="${70}" y="${250 - LOGO_SIZE / 2}" width="${LOGO_SIZE}" height="${LOGO_SIZE}" viewBox="0 0 64 64"`,
);
const featureGraphic = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
  <rect width="1024" height="500" fill="#0A0B0A"/>
  <polygon points="860,0 1024,0 1024,500 700,500" fill="#121412"/>
  <polygon points="990,0 1024,0 1024,60 870,500 830,500" fill="#C8FF2E" opacity="0.9"/>
  ${logo}
  <text x="380" y="215" font-family="Archivo" font-weight="800" font-size="64" fill="#F4F5F2">MY GYM</text>
  <text x="380" y="285" font-family="Archivo" font-weight="800" font-size="64" fill="#F4F5F2">MY WAY</text>
  <text x="382" y="340" font-family="Archivo" font-weight="600" font-size="28" fill="#C8FF2E">Workouts built from the gear you own</text>
  <text x="382" y="380" font-family="Archivo" font-weight="600" font-size="22" fill="#A7AEAA">Free · No paywall · No account</text>
</svg>`;
const feature = new Resvg(featureGraphic, {
  font: {
    fontFiles: [archivo('800ExtraBold'), archivo('600SemiBold')],
    loadSystemFonts: false,
    defaultFontFamily: 'Archivo',
  },
}).render();
writeFileSync(join(outDir, 'feature-graphic-1024x500.png'), encodeRgbPng(feature));
console.log('wrote store/android/feature-graphic-1024x500.png');

// Phone screenshots. Play rejects images whose long side is more than twice the short side.
// The iPhone 18 Pro shots are 1206 × 2622, so crop the iOS status bar off the top to get 1206 × 2412.
const WIDTH = 1206;
const HEIGHT = 2412;
const CROP_TOP = 210;
// The shots come from Expo Go, which draws its developer button at the top right. It isn't part of
// the app, so each row of that area is filled with the color just to its left.
const BUTTON = { left: 975, right: 1165, top: 150 - CROP_TOP, bottom: 350 - CROP_TOP };

const iosDir = join(root, 'store/screenshots');
const shotsDir = join(outDir, 'screenshots');
mkdirSync(shotsDir, { recursive: true });
for (const file of readdirSync(iosDir).filter((name) => /^0\d-.*\.png$/.test(name))) {
  const data = readFileSync(join(iosDir, file)).toString('base64');
  const cropped = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${WIDTH}" height="${HEIGHT}">
    <image x="0" y="-${CROP_TOP}" width="${WIDTH}" height="2622" xlink:href="data:image/png;base64,${data}"/>
  </svg>`;
  // Each read of .pixels returns a new copy of the buffer, so read it once.
  const pixels = new Resvg(cropped).render().pixels;
  for (let y = Math.max(0, BUTTON.top); y < BUTTON.bottom; y++) {
    const source = (y * WIDTH + BUTTON.left - 10) * 4;
    for (let x = BUTTON.left; x < BUTTON.right; x++) pixels.copy(pixels, (y * WIDTH + x) * 4, source, source + 4);
  }
  writeFileSync(join(shotsDir, file), encodeRgbPng({ pixels, width: WIDTH, height: HEIGHT }));
  console.log(`wrote store/android/screenshots/${file}`);
}
