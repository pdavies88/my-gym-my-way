import * as AppIntents from 'expo-app-intents';

import { CARDIO_CATEGORY_LABELS, CARDIO_SESSIONS } from './cardio';

/**
 * Tells Siri and Shortcuts which guided sessions exist, so "Start Quiet morning in My Gym My Way"
 * works. The Swift SessionQuery in app-intents/ reads this catalog.
 */
export function publishSessionsToSiri(): void {
  if (!AppIntents.isAvailable()) return;
  const sessions = CARDIO_SESSIONS.map((session) => ({
    id: session.id,
    title: session.name,
    subtitle: CARDIO_CATEGORY_LABELS[session.category],
    // "Quiet morning" is easy to say. "5-minute stretch" also answers to "five minute stretch".
    synonyms: session.name.startsWith('5-minute') ? [session.name.replace('5-minute', 'five minute')] : [],
  }));
  AppIntents.setEntityCatalogAsync('session', sessions).catch(() => undefined);
}
