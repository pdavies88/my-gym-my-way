/**
 * The My Gym My Way mark: a slanted, hard-edged "M" racked over a loaded barbell, in acid lime
 * on a near-black tile.
 *
 * This file is the single source for the logo. `scripts/generate-brand-assets.mjs` renders the
 * same markup to the app icon, splash, favicon and Android adaptive icon PNGs.
 * Keep it free of imports so Node can load it directly.
 */

const LIME = '#C8FF2E';

export type LogoSvgOptions = {
  /** Corner radius of the tile in 64-unit space. Use 0 for the iOS icon, which iOS masks itself. */
  cornerRadius?: number;
  /** Draw the dark tile. Turn off for the splash and the Android adaptive icon foreground. */
  withBackground?: boolean;
  /** Color of the mark. Android's themed (monochrome) icon wants plain white. */
  color?: string;
};

export function buildLogoSvg({
  cornerRadius = 14,
  withBackground = true,
  color = LIME,
}: LogoSvgOptions = {}): string {
  const background = withBackground
    ? `<defs>
    <linearGradient id="tile" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1A1D1B"/>
      <stop offset="1" stop-color="#0A0B0A"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="${cornerRadius}" fill="url(#tile)"/>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  ${background}
  <g transform="translate(32 32) scale(0.86) skewX(-12) translate(-32 -32.5)" fill="${color}">
    <path d="M14 40V12h8.5L32 25.5 41.5 12H50v28h-8V26.5L34 37.5h-4L22 26.5V40z"/>
    <rect x="11" y="45.5" width="42" height="3"/>
    <rect x="9" y="41" width="4" height="12" rx="0.6"/>
    <rect x="14" y="42.5" width="2.5" height="9" rx="0.4"/>
    <rect x="51" y="41" width="4" height="12" rx="0.6"/>
    <rect x="47.5" y="42.5" width="2.5" height="9" rx="0.4"/>
  </g>
</svg>`;
}
