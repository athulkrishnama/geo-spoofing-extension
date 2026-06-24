import type { NominatimResult } from '../types';

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const HEADERS = {
  'Accept-Language': 'en',
  'User-Agent': 'GeoRoute Chrome Extension/1.0',
};

export async function searchLocations(query: string): Promise<NominatimResult[]> {
  if (!query.trim()) return [];

  // Check if input is coordinates (lat, lng)
  const coordMatch = query.match(/^(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)$/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      // Return as a synthetic result
      return [{
        place_id: -1,
        display_name: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        lat: String(lat),
        lon: String(lng),
      }];
    }
  }

  try {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      limit: '6',
      addressdetails: '1',
    });

    const res = await fetch(`${NOMINATIM_BASE}/search?${params}`, { headers: HEADERS });
    if (!res.ok) return [];
    return await res.json() as NominatimResult[];
  } catch {
    return [];
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lng),
      format: 'json',
      zoom: '14',
      addressdetails: '1',
    });

    const res = await fetch(`${NOMINATIM_BASE}/reverse?${params}`, { headers: HEADERS });
    if (!res.ok) return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

    const data = await res.json();
    return data.display_name
      ? data.display_name.split(',').slice(0, 3).join(',').trim()
      : `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}
