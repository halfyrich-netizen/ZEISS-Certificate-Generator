import { useState, useEffect } from 'react';
import { ProcedurePreset } from '../types';
import { DEFAULT_PROCEDURE_PRESETS } from '../constants/defaults';

const PROCEDURES_STORAGE_KEY = 'zeiss_custom_procedures_v1';

export function useProcedurePresets() {
  const [customPresets, setCustomPresets] = useState<ProcedurePreset[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(PROCEDURES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load custom procedure presets:', e);
    }
    return [];
  });

  // Sync custom presets to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(PROCEDURES_STORAGE_KEY, JSON.stringify(customPresets));
    } catch (e) {
      console.warn('Failed to save custom procedures:', e);
    }
  }, [customPresets]);

  const allPresets: ProcedurePreset[] = [
    ...DEFAULT_PROCEDURE_PRESETS,
    ...customPresets,
  ];

  const addCustomProcedure = (name: string, lines: string[]) => {
    const id = `custom-${Date.now()}`;
    const newPreset: ProcedurePreset = {
      id,
      name: name.trim(),
      lines: lines.map((l) => l.trim()).filter(Boolean),
      isCustom: true,
    };
    setCustomPresets((prev) => [...prev, newPreset]);
    return newPreset;
  };

  const deleteCustomProcedure = (id: string) => {
    setCustomPresets((prev) => prev.filter((p) => p.id !== id));
  };

  return {
    allPresets,
    customPresets,
    addCustomProcedure,
    deleteCustomProcedure,
  };
}
