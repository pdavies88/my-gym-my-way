import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Speech from 'expo-speech';
import { useEffect, useRef } from 'react';

import { useSettings } from '@/context/settings-context';
import { useBestVoice } from '@/hooks/use-best-voice';
import { spokenName, stepAnnouncement, type CardioStep, type Cue } from '@/lib/cardio';
import { SPEECH_RATE } from '@/lib/voice';

const SOUNDS = {
  tick: require('@/assets/sounds/tick.wav'),
  go: require('@/assets/sounds/go.wav'),
  done: require('@/assets/sounds/done.wav'),
} as const;

type SoundName = keyof typeof SOUNDS;

/** After a chime, the voice waits this long so it doesn't talk over it. */
const AFTER_CHIME_MS = 450;
/**
 * After a skip, the voice waits this long. Taps faster than this only announce the step you land
 * on, instead of queueing a line for every step you passed.
 */
const AFTER_SKIP_MS = 400;
/** The same chime can't restart within this window, so fast taps don't stack sounds. */
const CHIME_GAP_MS = 120;

/**
 * Plays the cardio timer's cues as soft chimes and a spoken voice, each following its setting.
 * Music or podcasts keep playing and dip in volume under each cue.
 *
 * The voice has one slot: each new line replaces whatever was waiting or speaking, so the voice
 * always describes the step on screen. A line only speaks if nothing newer arrived before its turn.
 */
export function useCardioCues() {
  const { settings } = useSettings();
  const { voice: bestVoice } = useBestVoice();
  const players = useRef<Partial<Record<SoundName, AudioPlayer>>>({});
  const lastChime = useRef<Partial<Record<SoundName, number>>>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Every new line bumps this. A delayed line that finds a newer number was replaced, and stays quiet.
  const generation = useRef(0);
  // Read when a line plays, so muting stops a line that was already waiting.
  const latest = useRef({ voice: true, sounds: true, voiceId: undefined as string | undefined });
  useEffect(() => {
    latest.current = {
      voice: settings.voice !== false,
      sounds: settings.sounds !== false,
      voiceId: bestVoice?.identifier,
    };
  });

  useEffect(() => {
    // Chimes still play with the ring/silent switch on, and other apps' audio ducks instead of stopping.
    void setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'duckOthers' }).catch(() => {});
    const loaded = players.current;
    const lines = generation;
    for (const name of Object.keys(SOUNDS) as SoundName[]) loaded[name] = createAudioPlayer(SOUNDS[name]);
    return () => {
      lines.current++;
      if (timer.current) clearTimeout(timer.current);
      Speech.stop();
      for (const player of Object.values(loaded)) player?.remove();
      players.current = {};
    };
  }, []);

  const chime = (name: SoundName) => {
    const player = players.current[name];
    if (!latest.current.sounds || !player) return;
    const now = Date.now();
    if (now - (lastChime.current[name] ?? 0) < CHIME_GAP_MS) return;
    lastChime.current[name] = now;
    // seekTo and play are fired, not awaited, so a slow seek never holds up the next cue.
    player.seekTo(0).catch(() => {});
    player.play();
  };

  /** Clears the voice: nothing waiting, nothing speaking. Returns the new generation. */
  const clear = () => {
    generation.current++;
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    Speech.stop();
    return generation.current;
  };

  /** Replaces whatever the voice was saying or about to say with `text`, after `delayMs`. */
  const say = (text: string, delayMs: number) => {
    const mine = clear();
    // iOS can drop a line spoken in the same moment as a stop, so every line waits at least a beat.
    timer.current = setTimeout(
      () => {
        timer.current = null;
        const { voice, voiceId } = latest.current;
        if (generation.current !== mine || !voice) return;
        Speech.speak(text, { rate: SPEECH_RATE, ...(voiceId ? { voice: voiceId } : {}) });
      },
      Math.max(delayMs, 60),
    );
  };

  return {
    play(cue: Cue) {
      switch (cue.kind) {
        case 'heads-up':
          say(`Next, ${spokenName(cue.next)}.`, 0);
          break;
        case 'tick':
          chime('tick');
          break;
        case 'step':
          chime('go');
          say(stepAnnouncement(cue.step), AFTER_CHIME_MS);
          break;
        case 'done':
          chime('done');
          say('Session complete. Great work.', 700);
          break;
      }
    },
    /** Announces the first step when the session starts, since no transition leads into it. */
    start(first: CardioStep) {
      chime('go');
      say(stepAnnouncement(first), AFTER_CHIME_MS);
    },
    /** A skip forward or back: chime now, then name the step you land on once the tapping stops. */
    jump(to: CardioStep) {
      chime('go');
      say(stepAnnouncement(to), AFTER_SKIP_MS);
    },
    silence() {
      clear();
    },
  };
}
