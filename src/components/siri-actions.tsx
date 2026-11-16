import * as AppIntents from 'expo-app-intents';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';

import { useStartProgramDay } from '@/hooks/use-start-program-day';
import { getCardioSession } from '@/lib/cardio';
import { publishSessionsToSiri } from '@/lib/siri';

/**
 * Carries out what Siri or the Shortcuts app asked for. The Swift intents in app-intents/ open the
 * app and queue the request, and this handles each one once. Renders nothing. Android, the web and
 * Expo Go have no App Intents, so it does nothing there.
 */
export function SiriActions() {
  return AppIntents.isAvailable() ? <SiriHandler /> : null;
}

function SiriHandler() {
  const startDay = useStartProgramDay();
  const handled = useRef(new Set<string>());

  useEffect(() => {
    publishSessionsToSiri();
  }, []);

  AppIntents.useAppIntents(async (pending) => {
    for (const invocation of pending) {
      if (handled.current.has(invocation.id)) continue;
      handled.current.add(invocation.id);
      const sessionId = invocation.params.sessionId;
      if (invocation.name === 'startNextWorkout') {
        startDay();
      } else if (invocation.name === 'startSession' && typeof sessionId === 'string' && getCardioSession(sessionId)) {
        router.navigate({ pathname: '/cardio-player/[id]', params: { id: sessionId } });
      }
      await AppIntents.removePendingInvocationAsync(invocation.id).catch(() => undefined);
    }
  });

  return null;
}
