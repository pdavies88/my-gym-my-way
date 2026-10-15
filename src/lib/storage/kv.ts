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

export async function writeJson(key: string, value: unknown): Promise<void> {
  if (value === null || value === undefined) {
    await Storage.removeItemAsync(key);
    return;
  }
  return Storage.setItemAsync(key, JSON.stringify(value));
}
