/**
 * Writes the cardio timer's sound cues as small 16-bit mono WAV files in assets/sounds.
 * They are soft bell chimes built from sine waves, so there is nothing to license. Run: node scripts/generate-sounds.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';

const RATE = 22050;

/**
 * Partials of a soft chime: [frequency ratio, loudness, ring time in seconds]. The low partials
 * ring longest, which is what makes it sound like a bell rather than a beep.
 */
const BELL = [
  [1, 1, 1.4],
  [2, 0.32, 0.7],
  [3.01, 0.14, 0.45],
  [4.17, 0.08, 0.3],
  [5.43, 0.04, 0.2],
];

/** One bell strike at `freq` Hz, `seconds` long, peaking at `volume` (0–1). */
function bell(freq, seconds, volume, ring = 1) {
  const n = Math.round(RATE * seconds);
  const attack = Math.round(RATE * 0.004);
  const out = new Float32Array(n);
  for (const [ratio, amp, decay] of BELL) {
    const f = freq * ratio;
    // A twin 0.08% sharp makes the gentle shimmer of a real bell.
    for (let i = 0; i < n; i++) {
      const t = i / RATE;
      const env = Math.min(1, i / attack) * Math.exp(-t / (decay * ring));
      out[i] += amp * env * (Math.sin(2 * Math.PI * f * t) + 0.5 * Math.sin(2 * Math.PI * f * 1.0008 * t));
    }
  }
  // Fade the tail so the file never ends on a click.
  const fade = Math.round(RATE * 0.05);
  for (let i = 0; i < fade; i++) out[n - 1 - i] *= i / fade;
  const peak = out.reduce((m, x) => Math.max(m, Math.abs(x)), 0) || 1;
  return out.map((x) => (x / peak) * volume);
}

/** Lays notes over each other at the given start times, so each one keeps ringing under the next. */
function chord(total, ...notes) {
  const out = new Float32Array(Math.round(RATE * total));
  for (const [start, samples] of notes) {
    const offset = Math.round(RATE * start);
    for (let i = 0; i < samples.length && offset + i < out.length; i++) out[offset + i] += samples[i];
  }
  return out;
}

function wav(samples) {
  const buffer = Buffer.alloc(44 + samples.length * 2);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + samples.length * 2, 4);
  buffer.write('WAVEfmt ', 8);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(RATE, 24);
  buffer.writeUInt32LE(RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((s, i) => buffer.writeInt16LE(Math.round(Math.max(-1, Math.min(1, s)) * 32767), 44 + i * 2));
  return buffer;
}

mkdirSync('assets/sounds', { recursive: true });
const files = {
  // 3, 2, 1 before every step change: a quiet, short ding on A5.
  'tick.wav': bell(880, 0.5, 0.22, 0.35),
  // A new step starts: two notes rising a fourth, E6 then A6.
  'go.wav': chord(1.4, [0, bell(1319, 1.2, 0.26, 0.8)], [0.12, bell(1760, 1.25, 0.3, 0.8)]),
  // Session done: a gentle A major arpeggio that rings out.
  'done.wav': chord(
    2.4,
    [0, bell(880, 2.2, 0.22)],
    [0.16, bell(1109, 2.1, 0.22)],
    [0.32, bell(1319, 2, 0.24)],
    [0.5, bell(1760, 1.9, 0.26)],
  ),
};
for (const [name, samples] of Object.entries(files)) {
  writeFileSync(`assets/sounds/${name}`, wav(samples));
  console.log(`assets/sounds/${name}`);
}
