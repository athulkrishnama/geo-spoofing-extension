import { useState, useEffect, useCallback } from 'react';
import type { SpoofState, SavedLocation } from '../types';
import { STORAGE_KEYS, DEFAULT_SPOOF_STATE } from '../storage/storageKeys';

function isChromeExtension(): boolean {
  return typeof chrome !== 'undefined' && !!chrome.storage;
}

export function useStorage() {
  const [spoofState, setSpoofState] = useState<SpoofState>(DEFAULT_SPOOF_STATE);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isChromeExtension()) {
      setLoaded(true);
      return;
    }

    chrome.storage.local.get(
      [STORAGE_KEYS.SPOOF_STATE, STORAGE_KEYS.SAVED_LOCATIONS],
      (result: Record<string, unknown>) => {
        if (result[STORAGE_KEYS.SPOOF_STATE]) {
          setSpoofState(result[STORAGE_KEYS.SPOOF_STATE] as SpoofState);
        }
        if (result[STORAGE_KEYS.SAVED_LOCATIONS]) {
          setSavedLocations(result[STORAGE_KEYS.SAVED_LOCATIONS] as SavedLocation[]);
        }
        setLoaded(true);
      }
    );
  }, []);

  const updateSpoofState = useCallback((updates: Partial<SpoofState>) => {
    setSpoofState((prev) => {
      const next = { ...prev, ...updates };
      if (isChromeExtension()) {
        chrome.storage.local.set({ [STORAGE_KEYS.SPOOF_STATE]: next });
        // Notify background service worker
        chrome.runtime.sendMessage({ type: 'SPOOF_STATE_CHANGED', payload: next });
      }
      return next;
    });
  }, []);

  const addSavedLocation = useCallback((location: SavedLocation) => {
    setSavedLocations((prev) => {
      const next = [...prev, location];
      if (isChromeExtension()) {
        chrome.storage.local.set({ [STORAGE_KEYS.SAVED_LOCATIONS]: next });
      }
      return next;
    });
  }, []);

  const deleteSavedLocation = useCallback((id: string) => {
    setSavedLocations((prev) => {
      const next = prev.filter((l) => l.id !== id);
      if (isChromeExtension()) {
        chrome.storage.local.set({ [STORAGE_KEYS.SAVED_LOCATIONS]: next });
      }
      return next;
    });
  }, []);

  return {
    spoofState,
    savedLocations,
    loaded,
    updateSpoofState,
    addSavedLocation,
    deleteSavedLocation,
  };
}
