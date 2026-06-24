import { STORAGE_KEYS } from '../storage/storageKeys';
import type { SpoofState } from '../types';

// Guard: bail out entirely if we're not in a page context (e.g. service worker)
if (typeof window === 'undefined' || typeof document === 'undefined') {
  // nothing to do outside of a page context
} else {
  let currentState: SpoofState | null = null;
  let isInjected = false;

  function setPageVariable(state: SpoofState) {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(
      new CustomEvent('__GEOROUTE_STATE__', {
        detail: {
          isActive: state.isActive,
          lat: state.lat,
          lng: state.lng,
          accuracy: state.accuracy,
        },
      })
    );
  }

  function injectScript() {
    if (isInjected || typeof document === 'undefined') return;
    isInjected = true;

    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('injected/geolocation.js');
    script.type = 'text/javascript';
    (document.head || document.documentElement).appendChild(script);
    // Remove the tag after it executes — the code is already running
    script.onload = () => script.remove();
  }

  // Initialize: read current spoof state from storage
  function init() {
    chrome.storage.local.get(STORAGE_KEYS.SPOOF_STATE, (result) => {
      const state = result[STORAGE_KEYS.SPOOF_STATE] as SpoofState | undefined;
      injectScript();
      if (state) {
        currentState = state;
        // Wait for injected script to be ready, then fire state
        setTimeout(() => {
          if (currentState) setPageVariable(currentState);
        }, 120);
      }
    });
  }

  // Listen for state updates from background
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'GEOROUTE_UPDATE') {
      currentState = message.payload as SpoofState;
      injectScript();
      setPageVariable(currentState);
    }
  });

  // Also listen to storage directly (catches changes when popup is open)
  chrome.storage.onChanged.addListener((changes) => {
    if (changes[STORAGE_KEYS.SPOOF_STATE]) {
      const state = changes[STORAGE_KEYS.SPOOF_STATE].newValue as SpoofState;
      currentState = state;
      injectScript();
      setPageVariable(state);
    }
  });

  init();
}

export {};
