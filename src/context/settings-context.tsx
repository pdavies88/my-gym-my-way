import { createContext, use, useState, type ReactNode } from 'react';

import type { EquipmentId } from '@/lib/equipment';
import { readJson, writeJson } from '@/lib/storage/kv';
import { DEFAULT_SETTINGS, KEYS, SettingsSchema, type Settings } from '@/lib/storage/schemas';

type SettingsContextValue = {
  settings: Settings;
  owned: ReadonlySet<EquipmentId>;
  updateSettings: (patch: Partial<Settings>) => void;
  toggleEquipment: (id: EquipmentId) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  // Read synchronously so the first screen already knows the equipment.
  const [settings, setSettings] = useState(() => readJson(KEYS.settings, SettingsSchema, DEFAULT_SETTINGS));

  const updateSettings = (patch: Partial<Settings>) => {
    setSettings((current) => {
      const next = { ...current, ...patch };
      void writeJson(KEYS.settings, next);
      return next;
    });
  };

  const toggleEquipment = (id: EquipmentId) => {
    setSettings((current) => {
      const has = current.equipment.includes(id);
      const next = {
        ...current,
        equipmentChosen: true,
        equipment: has ? current.equipment.filter((item) => item !== id) : [...current.equipment, id],
      };
      void writeJson(KEYS.settings, next);
      return next;
    });
  };

  const owned = new Set(settings.equipment);

  return <SettingsContext value={{ settings, owned, updateSettings, toggleEquipment }}>{children}</SettingsContext>;
}

export function useSettings(): SettingsContextValue {
  const context = use(SettingsContext);
  if (!context) throw new Error('useSettings must be used within a SettingsProvider');
  return context;
}
