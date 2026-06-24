import { STORAGE_KEYS } from '../storage/storageKeys';
import type { SpoofState } from '../types';

// Set badge when spoofing state changes
function updateBadge(isActive: boolean) {
  if (isActive) {
    chrome.action.setBadgeText({ text: 'ON' });
    chrome.action.setBadgeBackgroundColor({ color: '#16a34a' });
    chrome.action.setBadgeTextColor({ color: '#ffffff' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

// Broadcast spoof state to all tabs
async function broadcastToAllTabs(state: SpoofState) {
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (tab.id && tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
      chrome.tabs.sendMessage(tab.id, { type: 'GEOROUTE_UPDATE', payload: state }).catch(() => {
        // Tab may not have content script, ignore
      });
    }
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'SPOOF_STATE_CHANGED') {
    const state = message.payload as SpoofState;
    updateBadge(state.isActive);
    broadcastToAllTabs(state);
  }
});

// Restore badge on startup
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(STORAGE_KEYS.SPOOF_STATE, (result) => {
    const state = result[STORAGE_KEYS.SPOOF_STATE] as SpoofState | undefined;
    if (state) {
      updateBadge(state.isActive);
    }
  });
});

// Restore badge when extension is installed/updated
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(STORAGE_KEYS.SPOOF_STATE, (result) => {
    const state = result[STORAGE_KEYS.SPOOF_STATE] as SpoofState | undefined;
    if (state) {
      updateBadge(state.isActive);
    }
  });
});

export {};
