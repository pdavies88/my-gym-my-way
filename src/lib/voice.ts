/** The fields of a device voice this app looks at. Matches expo-speech's `Voice`. */
export interface VoiceInfo {
  identifier: string;
  name: string;
  quality: string;
  language: string;
}

/** Speaking speed for cardio cues: 85% of the system's normal rate. Calmer and easier to follow mid-set. */
export const SPEECH_RATE = 0.85;

/** Apple's novelty voices and the older synthesizer voices sound robotic, so they are never picked. */
const ROBOTIC = [
  'albert',
  'bad news',
  'bahh',
  'bells',
  'boing',
  'bubbles',
  'cellos',
  'good news',
  'jester',
  'organ',
  'superstar',
  'trinoids',
  'whisper',
  'wobble',
  'zarvox',
  'fred',
  'junior',
  'kathy',
  'ralph',
  'grandma',
  'grandpa',
  'rocko',
  'sandy',
  'shelley',
  'reed',
  'flo',
  'eddy',
];

/** Apple's most natural English voices. When one is downloaded in Enhanced or Premium quality, it wins. */
const PREFERRED = ['ava', 'zoe'];

/** Voices that sound natural even at standard quality. */
const NATURAL = [
  'ava',
  'zoe',
  'evan',
  'nathan',
  'joelle',
  'noelle',
  'samantha',
  'allison',
  'susan',
  'tom',
  'serena',
  'daniel',
  'karen',
  'moira',
];

function score(voice: VoiceInfo, locale: string): number {
  const id = voice.identifier.toLowerCase();
  const name = voice.name.toLowerCase();
  if (id.includes('eloquence') || ROBOTIC.some((n) => name === n || name.startsWith(`${n} `))) return -1;
  let points = 0;
  if (id.includes('premium')) points += 4;
  else if (voice.quality === 'Enhanced' || id.includes('enhanced')) points += 3;
  if (PREFERRED.some((n) => name.startsWith(n))) points += 1.5;
  if (NATURAL.some((n) => name.startsWith(n))) points += 1;
  if (voice.language.toLowerCase() === locale.toLowerCase()) points += 0.5;
  return points;
}

/**
 * Picks the most natural English voice installed, preferring the phone's own English region.
 * Returns undefined to fall back to the system default when nothing better is available.
 */
export function pickVoice(voices: readonly VoiceInfo[], locale = 'en-US'): VoiceInfo | undefined {
  const english = voices.filter((v) => v.language.toLowerCase().startsWith('en'));
  let best: VoiceInfo | undefined;
  let bestScore = 0;
  for (const voice of english) {
    const s = score(voice, locale);
    if (s > bestScore) {
      best = voice;
      bestScore = s;
    }
  }
  return best;
}

/** True when the best voice is only standard quality, so a download would sound better. */
export function couldUpgradeVoice(voice: VoiceInfo | undefined): boolean {
  if (!voice) return true;
  const id = voice.identifier.toLowerCase();
  return !id.includes('premium') && voice.quality !== 'Enhanced' && !id.includes('enhanced');
}
