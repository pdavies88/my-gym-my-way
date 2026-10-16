import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Speech from 'expo-speech';
import { useEffect, useRef } from 'react';

import { useSettings } from '@/context/settings-context';
import { useBestVoice } from '@/hooks/use-best-voice';
import { useFeedback } from '@/hooks/use-feedback';
import { spokenDuration, stepAnnouncement, type Cue } from '@/lib/cardio';
import { SPEECH_RATE } from '@/lib/voice';

const SOUNDS = {
  tick: require('@/assets/sounds/tick.wav'),
  go: require('@/assets/sounds/go.wav'),
  done: require('@/assets/sounds/done.wav'),
} as const;

type SoundName = keyof typeof SOUNDS;

/**
 * Plays the cardio timer's cues as soft chimes, a spoken voice and haptics, each following its setting.
 * Music or podcasts keep playing and dip in volume under each cue.
 */
export function useCardioCues() {
  const { settings } = useSettings();
  const haptics = useFeedback();
  const { voice: bestVoice } = useBestVoice();
  const players = useRef<Partial<Record<SoundName, AudioPlayer>>>({});
  const pending = useRef<ReturnType<typeof setTimeout>[]>([]);
  // Delayed lines check the voice setting when they play, so muting stops a line already queued.
  const latest = useRef({ voice: true, voiceId: undefined as string | undefined });
  const sounds = settings.sounds !== false;
  useEffect(() => {
    latest.current = { voice: settings.voice !== false, voiceId: bestVoice?.identifier };
  });

  const cancelPending = () => {
    for (const id of pending.current) clearTimeout(id);
    pending.current = [];
  };

  useEffect(() => {
    // Chimes still play with the ring/silent switch on, and other apps' audio ducks instead of stopping.
    void setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'duckOthers' }).catch(() => {});
    const loaded = players.current;
    for (const name of Object.keys(SOUNDS) as SoundName[]) loaded[name] = createAudioPlayer(SOUNDS[name]);
    const queued = pending;
    return () => {
      for (const id of queued.current) clearTimeout(id);
      queued.current = [];
      Speech.stop();
      for (const player of Object.values(loaded)) player?.remove();
      players.current = {};
    };
  }, []);

  const chime = (name: SoundName) => {
    const player = players.current[name];
    if (!sounds || !player) return;
    void player.seekTo(0).then(() => player.play());
  };

  const say = (text: string) => {
    const { voice, voiceId } = latest.current;
    if (!voice) return;
    Speech.stop();
    Speech.speak(text, { rate: SPEECH_RATE, ...(voiceId ? { voice: voiceId } : {}) });
  };

  /** Speaks after a short delay, so the voice doesn't talk over the chime. */
  const sayLater = (text: string, delayMs: number) => {
    pending.current.push(setTimeout(() => say(text), delayMs));
  };

  return {
    play(cue: Cue) {
      switch (cue.kind) {
        case 'heads-up':
          say(`10 seconds. Next, ${stepAnnouncement(cue.next).replace(/\.$/, '')}`);
          break;
        case 'tick':
          chime('tick');
          haptics.tap();
          break;
        case 'step':
          chime('go');
          haptics.thump();
          sayLater(stepAnnouncement(cue.step), 450);
          break;
        case 'done':
          chime('done');
          haptics.success();
          sayLater('Session complete. Great work.', 700);
          break;
      }
    },
    /** Announces the first step when the session starts, since no transition leads into it. */
    start(firstStepSeconds: number, firstStepLabel: string) {
      chime('go');
      haptics.thump();
      sayLater(`Starting. ${firstStepLabel}. ${spokenDuration(firstStepSeconds)}.`, 450);
    },
    silence() {
      cancelPending();
      Speech.stop();
    },
  };
}
