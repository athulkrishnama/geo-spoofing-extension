export interface SavedLocation {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export interface SpoofState {
  isActive: boolean;
  lat: number | null;
  lng: number | null;
  address: string;
  accuracy: number; // in meters
}

export interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    state?: string;
    country?: string;
  };
}

export interface StorageData {
  spoofState: SpoofState;
  savedLocations: SavedLocation[];
}
