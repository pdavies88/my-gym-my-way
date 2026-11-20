import { useRef, useState } from 'react';

import { writeJson } from '@/lib/storage/kv';

/**
 * State that is saved to storage on every change, built for fast, overlapping updates.
 *
 * - `update` always works on the newest value, even when several updates land before React
 *   renders. Two quick taps both count; neither overwrites the other with an old copy.
 * - It returns the new value at once, so a caller can use the result without waiting for a render.
 * - Saves run one after another in order, and a save that a newer change has already replaced is
 *   skipped, so storage always ends on the latest value.
 */
export function useStoredState<T>(key: string, read: () => T) {
  const [value, setValue] = useState(read);
  const latest = useRef(value);
  const saving = useRef<Promise<void>>(Promise.resolve());

  const update = (change: (current: T) => T): T => {
    const next = change(latest.current);
    if (Object.is(next, latest.current)) return next;
    latest.current = next;
    setValue(next);
    saving.current = saving.current
      .then(() => (latest.current === next ? writeJson(key, next) : undefined))
      .catch(() => undefined);
    return next;
  };

  return [value, update, latest] as const;
}
