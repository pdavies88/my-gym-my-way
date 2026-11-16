import { router } from 'expo-router';
import { Alert } from 'react-native';

import { useTraining } from '@/context/training-context';

/**
 * Starts a program day and opens the workout. Defaults to the next day not done yet. Asks first
 * when another workout is still in progress.
 */
export function useStartProgramDay() {
  const { active, program, startProgramDay } = useTraining();

  return (day?: { week: number; day: number }) => {
    if (!program) {
      router.navigate('/program');
      return;
    }
    const begin = () => {
      if (startProgramDay(day)) router.navigate('/session');
      else router.navigate('/program');
    };
    if (!active) return begin();
    Alert.alert('Replace the current session?', `“${active.name}” is still in progress.`, [
      { text: 'Keep it', style: 'cancel', onPress: () => router.navigate('/session') },
      { text: 'Replace', style: 'destructive', onPress: begin },
    ]);
  };
}
