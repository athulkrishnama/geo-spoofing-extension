import React, { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import { reverseGeocode } from '../../services/nominatim';

// Fix Leaflet's default icon path issue in Vite
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom colored SVG pin marker
function createMarker(isActive: boolean) {
  const color = isActive ? '#16a34a' : '#ef4444';
  return L.divIcon({
    html: `
      <div style="position:relative;width:28px;height:36px;">
        <svg viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg" width="28" height="36">
          <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 22 14 22S28 23.333 28 14C28 6.268 21.732 0 14 0z" fill="${color}" />
          <circle cx="14" cy="14" r="6" fill="white" opacity="0.9"/>
        </svg>
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-55%);width:6px;height:6px;background:${color};border-radius:50%;"></div>
      </div>
    `,
    className: '',
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
  });
}

interface MapPanelProps {
  lat: number;
  lng: number;
  isActive: boolean;
  onLocationChange: (lat: number, lng: number, address: string) => void;
}

export const MapPanel: React.FC<MapPanelProps> = ({ lat, lng, isActive, onLocationChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  // Track whether the last lat/lng change originated FROM the map (drag/click)
  // vs from outside (search / saved location). We use the marker's own position
  // as the source of truth: if the marker is already at the incoming props,
  // the change came from the map itself and we should NOT fly again.
  const geocodeAbortRef = useRef<AbortController | null>(null);

  // Handle a new position selected via map interaction (click or drag)
  const handleMapInteraction = useCallback(
    async (newLat: number, newLng: number) => {
      if (!markerRef.current) return;

      // 1. Move the marker immediately (synchronous) so that when the
      //    parent re-renders and passes new props, the useEffect below
      //    sees the marker is already here and skips the flyTo.
      markerRef.current.setLatLng([newLat, newLng]);
      markerRef.current.setIcon(createMarker(isActive));

      // 2. Cancel any in-flight reverse geocode
      if (geocodeAbortRef.current) geocodeAbortRef.current.abort();
      geocodeAbortRef.current = new AbortController();

      // 3. Reverse geocode in background
      const address = await reverseGeocode(newLat, newLng);

      // 4. Notify parent (triggers re-render with new lat/lng props)
      onLocationChange(newLat, newLng, address);
    },
    [isActive, onLocationChange]
  );

  // Initialize the map once on mount
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [lat, lng],
      zoom: 12,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([lat, lng], {
      draggable: true,
      icon: createMarker(isActive),
    }).addTo(map);

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      handleMapInteraction(pos.lat, pos.lng);
    });

    map.on('click', (e: L.LeafletMouseEvent) => {
      handleMapInteraction(e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync handleMapInteraction into the stable map event listeners
  // (avoids stale closure without re-creating the map)
  const handleMapInteractionRef = useRef(handleMapInteraction);
  useEffect(() => {
    handleMapInteractionRef.current = handleMapInteraction;
  }, [handleMapInteraction]);

  // Re-attach map events to always use the fresh callback
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    const map = mapRef.current;
    const marker = markerRef.current;

    const onDragEnd = () => {
      const pos = marker.getLatLng();
      handleMapInteractionRef.current(pos.lat, pos.lng);
    };
    const onClick = (e: L.LeafletMouseEvent) => {
      handleMapInteractionRef.current(e.latlng.lat, e.latlng.lng);
    };

    marker.off('dragend').on('dragend', onDragEnd);
    map.off('click').on('click', onClick);
  });

  // Update marker icon when isActive changes
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setIcon(createMarker(isActive));
    }
  }, [isActive]);

  // ─── KEY FIX ─────────────────────────────────────────────────────────────
  // Fly to a new location ONLY when the update is external (from search or
  // a saved location being selected). We detect this by comparing the
  // incoming props against the marker's CURRENT position:
  //   • If they match → the change came from map interaction (handleMapInteraction
  //     already moved the marker before onLocationChange fired) → skip flyTo.
  //   • If they differ → external update → move marker + fly map.
  // This completely avoids the "isUpdatingRef timeout" race condition.
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;

    const markerPos = markerRef.current.getLatLng();
    const alreadyHere =
      Math.abs(markerPos.lat - lat) < 0.000001 &&
      Math.abs(markerPos.lng - lng) < 0.000001;

    if (alreadyHere) return; // Came from map interaction — no flyTo needed

    // External update (search / saved location)
    markerRef.current.setLatLng([lat, lng]);
    markerRef.current.setIcon(createMarker(isActive));
    mapRef.current.flyTo([lat, lng], 13, { animate: true, duration: 0.8 });
  }, [lat, lng, isActive]);

  return (
    <div className="relative flex flex-col h-full">
      <div ref={containerRef} className="flex-1 w-full" style={{ minHeight: 0 }} />

      {/* Coordinates overlay */}
      <div
        className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-xl px-2.5 py-1.5 text-[10px]"
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12)', zIndex: 1000 }}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-medium w-6">Lat</span>
          <span className="font-semibold text-slate-700 tabular-nums">{lat.toFixed(4)}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-slate-400 font-medium w-6">Lng</span>
          <span className="font-semibold text-slate-700 tabular-nums">{lng.toFixed(4)}</span>
        </div>
      </div>
    </div>
  );
};
