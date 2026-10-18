import { useState } from 'react';

import { ExerciseBrowser } from '@/components/exercise-browser';
import { Screen } from '@/components/screen';
import { SegmentedControl } from '@/components/segmented-control';
import { ThemedText } from '@/components/themed-text';
import { useSettings } from '@/context/settings-context';
import { canDo, EXERCISES } from '@/lib/exercises';

export default function LibraryScreen() {
  const { owned } = useSettings();
  const [scope, setScope] = useState<'mine' | 'all'>('mine');
  const visible = EXERCISES.filter((e) => scope === 'all' || canDo(e, owned));

  return (
    <Screen tab={false}>
      <ThemedText type="small" themeColor="textSecondary">
        {visible.length} exercises. Tap one to watch its demo video and read the form cues.
      </ThemedText>
      <ExerciseBrowser
        exercises={visible}
        dimmed={(exercise) => !canDo(exercise, owned)}
        controls={
          <SegmentedControl
            accessibilityLabel="Which exercises to show"
            options={[
              { value: 'mine', label: 'My gym' },
              { value: 'all', label: 'Everything' },
            ]}
            value={scope}
            onChange={setScope}
          />
        }
      />
    </Screen>
  );
}
