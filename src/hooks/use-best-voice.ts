import * as Speech from 'expo-speech';
import { useEffect, useState } from 'react';

import { pickVoice, type VoiceInfo } from '@/lib/voice';

/** The phone's region, such as en-GB, so a British phone gets a British voice when one is installed. */
function deviceLocale(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale;
  } catch {
    return 'en-US';
  }
}

/**
 * The most natural English voice installed on this phone. Undefined while loading, or when only the
 * system default is available.
 */
export function useBestVoice(): { voice: VoiceInfo | undefined; loaded: boolean } {
  const [state, setState] = useState<{ voice: VoiceInfo | undefined; loaded: boolean }>({
    voice: undefined,
    loaded: false,
  });
  useEffect(() => {
    let cancelled = false;
    Speech.getAvailableVoicesAsync()
      .then((voices) => {
        if (!cancelled) setState({ voice: pickVoice(voices, deviceLocale()), loaded: true });
      })
      .catch(() => {
        if (!cancelled) setState({ voice: undefined, loaded: true });
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return state;
}
