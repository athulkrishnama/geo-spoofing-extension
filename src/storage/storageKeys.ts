export const STORAGE_KEYS = {
  SPOOF_STATE: 'georoute_spoof_state',
  SAVED_LOCATIONS: 'georoute_saved_locations',
} as const;

export const DEFAULT_SPOOF_STATE = {
  isActive: false,
  lat: 9.9312, // Kochi, Kerala default
  lng: 76.2673,
  address: 'Kochi, Kerala, India',
  accuracy: 50,
};
