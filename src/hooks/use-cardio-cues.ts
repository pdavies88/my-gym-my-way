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
  const sounds = settings.sounds !== false;
  const voice = settings.voice !== false;

  useEffect(() => {
    // Chimes still play with the ring/silent switch on, and other apps' audio ducks instead of stopping.
    void setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'duckOthers' }).catch(() => {});
    const loaded = players.current;
    for (const name of Object.keys(SOUNDS) as SoundName[]) loaded[name] = createAudioPlayer(SOUNDS[name]);
    return () => {
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
    if (!voice) return;
    Speech.stop();
    Speech.speak(text, { rate: SPEECH_RATE, ...(bestVoice ? { voice: bestVoice.identifier } : {}) });
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
          // Speak just after the chime so the two don't talk over each other.
          setTimeout(() => say(stepAnnouncement(cue.step)), 450);
          break;
        case 'done':
          chime('done');
          haptics.success();
          setTimeout(() => say('Session complete. Great work.'), 700);
          break;
      }
    },
    /** Announces the first step when the session starts, since no transition leads into it. */
    start(firstStepSeconds: number, firstStepLabel: string) {
      chime('go');
      haptics.thump();
      setTimeout(() => say(`Starting. ${firstStepLabel}. ${spokenDuration(firstStepSeconds)}.`), 450);
    },
    silence() {
      Speech.stop();
    },
  };
}
