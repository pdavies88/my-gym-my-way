// Renders the logo in src/components/brand/logo-svg.ts to the PNGs that app.json points at.
// Run after changing the logo:  node scripts/generate-brand-assets.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Resvg } from '@resvg/resvg-js';

import { encodeRgbPng } from './encode-png.mjs';

// Node 24 strips TypeScript types on import, so the app's logo source can be used as-is.
import { buildLogoSvg } from '../src/components/brand/logo-svg.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function render(svg, size, outputPath, { opaque = false } = {}) {
  const image = new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render();
  const png = opaque ? encodeRgbPng(image) : image.asPng();
  mkdirSync(dirname(join(root, outputPath)), { recursive: true });
  writeFileSync(join(root, outputPath), png);
  console.log(`wrote ${outputPath} (${size}px)`);
}

// Shrinks the mark inside its canvas. Adaptive icons and the splash crop or scale the image,
// so the mark needs empty space around it.
function padded(svg, padding) {
  return svg.replace('viewBox="0 0 64 64"', `viewBox="${-padding} ${-padding} ${64 + padding * 2} ${64 + padding * 2}"`);
}

// iOS masks the icon's corners itself, so the tile is drawn square and full-bleed.
render(buildLogoSvg({ cornerRadius: 0 }), 1024, 'assets/images/icon.png', { opaque: true });
render(buildLogoSvg(), 48, 'assets/images/favicon.png');

// The splash background is already near-black, so the splash shows the bare mark.
render(padded(buildLogoSvg({ withBackground: false }), 4), 1024, 'assets/images/splash-icon.png');

// Google Play store listing icon (512 × 512, full-bleed square; Play rounds the corners).
render(buildLogoSvg({ cornerRadius: 0 }), 512, 'store/android/play-icon-512.png', { opaque: true });

// Logo and favicon for the public privacy and support pages in docs/ (GitHub Pages).
render(buildLogoSvg(), 256, 'docs/logo.png');
render(buildLogoSvg(), 48, 'docs/favicon.png');

// Android adaptive icons crop to a central safe zone, so pad the mark into the middle ~60%.
// app.json supplies the background color. The monochrome layer drives Android 13+ themed icons.
render(padded(buildLogoSvg({ withBackground: false }), 18), 1024, 'assets/images/android-icon-foreground.png');
render(
  padded(buildLogoSvg({ withBackground: false, color: '#FFFFFF' }), 18),
  1024,
  'assets/images/android-icon-monochrome.png',
);
