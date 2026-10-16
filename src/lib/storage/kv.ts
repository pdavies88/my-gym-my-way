import Storage from 'expo-sqlite/kv-store';
import type { z } from 'zod';

/** Reads and validates a stored JSON value. Returns `fallback` when it is missing or invalid. */
export function readJson<T>(key: string, schema: z.ZodType<T>, fallback: T): T {
  try {
    const raw = Storage.getItemSync(key);
    if (!raw) return fallback;
    const parsed = schema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Reads a stored list item by item. A record that no longer matches the schema is dropped on its
 * own, so one bad entry can never wipe the rest of the list.
 */
export function readList<T>(key: string, item: z.ZodType<T>): T[] {
  try {
    const raw = Storage.getItemSync(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((entry) => {
      const result = item.safeParse(entry);
      return result.success ? [result.data] : [];
    });
  } catch {
    return [];
  }
}

export async function writeJson(key: string, value: unknown): Promise<void> {
  if (value === null || value === undefined) {
    await Storage.removeItemAsync(key);
    return;
  }
  return Storage.setItemAsync(key, JSON.stringify(value));
}
