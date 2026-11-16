import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';

import { useStartProgramDay } from '@/hooks/use-start-program-day';
import { getCardioSession } from '@/lib/cardio';

/**
 * Where the home screen widget's links land: mygymmyway://start?program=next starts the next
 * program workout, and mygymmyway://start?session=quiet-morning starts that guided session.
 * It puts the Train tab underneath, then opens the workout.
 */
export default function StartLink() {
  const params = useLocalSearchParams<{ program?: string; session?: string }>();
  const startDay = useStartProgramDay();

  useEffect(() => {
    router.replace('/');
    if (params.session && getCardioSession(params.session)) {
      router.push({ pathname: '/cardio-player/[id]', params: { id: params.session } });
    } else if (params.program === 'next') {
      startDay();
    }
    // Runs once per link.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.program, params.session]);

  return null;
}
