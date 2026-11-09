import { useState, useEffect, useRef } from 'react';
import { CertificateData } from '../types';
import { INITIAL_CERTIFICATE_DATA } from '../constants/defaults';

const STORAGE_KEY = 'zeiss_certificate_draft_v1';

export function useCertificateStorage() {
  const [data, setData] = useState<CertificateData>(() => {
    if (typeof window === 'undefined') return INITIAL_CERTIFICATE_DATA;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_CERTIFICATE_DATA,
          ...parsed,
          recipients: Array.isArray(parsed.recipients) && parsed.recipients.length > 0
            ? parsed.recipients
            : INITIAL_CERTIFICATE_DATA.recipients,
        };
      }
    } catch (e) {
      console.warn('Failed to parse saved certificate draft:', e);
    }
    return INITIAL_CERTIFICATE_DATA;
  });

  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save debounced whenever data changes
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        setLastSaved(new Date());
      } catch (err) {
        console.warn('Failed to save certificate draft offline:', err);
      }
    }, 400);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [data]);

  const updateData = (updated: Partial<CertificateData>) => {
    setData((prev) => ({ ...prev, ...updated }));
  };

  const resetToDefaults = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setData(INITIAL_CERTIFICATE_DATA);
    setLastSaved(null);
  };

  return {
    data,
    setData,
    updateData,
    resetToDefaults,
    lastSaved,
  };
}
