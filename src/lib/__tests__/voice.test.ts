import { describe, expect, it } from '@jest/globals';

import { couldUpgradeVoice, pickVoice, type VoiceInfo } from '../voice';

const v = (
  name: string,
  quality: string,
  language: string,
  identifier = `com.apple.voice.compact.${language}.${name}`,
): VoiceInfo => ({
  name,
  quality,
  language,
  identifier,
});

describe('pickVoice', () => {
  it('prefers premium, then enhanced, voices', () => {
    const voices = [
      v('Fred', 'Default', 'en-US', 'com.apple.speech.synthesis.voice.Fred'),
      v('Samantha', 'Default', 'en-US'),
      v('Ava', 'Enhanced', 'en-US', 'com.apple.voice.enhanced.en-US.Ava'),
      v('Zoe', 'Enhanced', 'en-US', 'com.apple.voice.premium.en-US.Zoe'),
    ];
    expect(pickVoice(voices)?.name).toBe('Zoe');
    expect(pickVoice(voices.slice(0, 3))?.name).toBe('Ava');
    expect(pickVoice(voices.slice(0, 2))?.name).toBe('Samantha');
  });

  it('never picks novelty or Eloquence voices', () => {
    expect(
      pickVoice([v('Zarvox', 'Default', 'en-US'), v('Eddy', 'Default', 'en-US', 'com.apple.eloquence.en-US.Eddy')]),
    ).toBeUndefined();
  });

  it('skips other languages and prefers the phone’s English region', () => {
    expect(pickVoice([v('Amélie', 'Enhanced', 'fr-CA')])).toBeUndefined();
    expect(pickVoice([v('Daniel', 'Default', 'en-GB'), v('Karen', 'Default', 'en-AU')], 'en-AU')?.name).toBe('Karen');
  });

  it('suggests a download only when the best voice is standard quality', () => {
    expect(couldUpgradeVoice(v('Samantha', 'Default', 'en-US'))).toBe(true);
    expect(couldUpgradeVoice(v('Ava', 'Enhanced', 'en-US'))).toBe(false);
    expect(couldUpgradeVoice(undefined)).toBe(true);
  });
});
