import { useState, useEffect } from 'react';
import { SavedSignatureProfile } from '../types';
import { DEFAULT_SIGNATURE_PROFILES } from '../constants/defaults';

const SIGNATURES_STORAGE_KEY = 'zeiss_saved_signature_profiles_v1';

export function useSignatureProfiles() {
  const [profiles, setProfiles] = useState<SavedSignatureProfile[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_SIGNATURE_PROFILES;
    try {
      const stored = localStorage.getItem(SIGNATURES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Guarantee default profile exists if user hasn't created one
          const hasDefault = parsed.some((p: SavedSignatureProfile) => p.isDefault || p.id === 'default-hary-destianto');
          if (!hasDefault) {
            return [...DEFAULT_SIGNATURE_PROFILES, ...parsed];
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load saved signature profiles:', e);
    }
    return DEFAULT_SIGNATURE_PROFILES;
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SIGNATURES_STORAGE_KEY, JSON.stringify(profiles));
    } catch (e) {
      console.warn('Failed to save signature profiles to localStorage:', e);
    }
  }, [profiles]);

  const saveProfile = (newOrUpdated: SavedSignatureProfile) => {
    setProfiles((prev) => {
      const index = prev.findIndex((p) => p.id === newOrUpdated.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = newOrUpdated;
        return updated;
      }
      return [...prev, newOrUpdated];
    });
  };

  const deleteProfile = (profileId: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== profileId && !p.isDefault));
  };

  return {
    profiles,
    saveProfile,
    deleteProfile,
  };
}
