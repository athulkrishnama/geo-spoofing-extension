import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { SavedLocationsList } from './components/SavedLocationsList';
import { MapPanel } from './components/MapPanel';
import { AccuracySlider } from './components/AccuracySlider';
import { SaveLocationModal } from './components/SaveLocationModal';
import { Footer } from './components/Footer';
import { PrimaryButton } from './components/PrimaryButton';
import { useStorage } from '../hooks/useStorage';
import type { SavedLocation } from '../types';

let idCounter = 0;
function generateId(): string {
  return `loc_${Date.now()}_${idCounter++}`;
}

export const App: React.FC = () => {
  const {
    spoofState,
    savedLocations,
    loaded,
    updateSpoofState,
    addSavedLocation,
    deleteSavedLocation,
  } = useStorage();

  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Handle toggle
  const handleToggle = useCallback(() => {
    updateSpoofState({ isActive: !spoofState.isActive });
  }, [spoofState.isActive, updateSpoofState]);

  // Handle map location change
  const handleLocationChange = useCallback(
    (lat: number, lng: number, address: string) => {
      updateSpoofState({ lat, lng, address });
      setSelectedLocationId(null); // Deselect saved location if map is clicked
    },
    [updateSpoofState]
  );

  // Handle search result selection
  const handleSearchSelect = useCallback(
    (lat: number, lng: number, address: string) => {
      updateSpoofState({ lat, lng, address });
      setSelectedLocationId(null);
    },
    [updateSpoofState]
  );

  // Handle saved location selection
  const handleSavedLocationSelect = useCallback(
    (location: SavedLocation) => {
      updateSpoofState({
        lat: location.lat,
        lng: location.lng,
        address: location.address,
      });
      setSelectedLocationId(location.id);
    },
    [updateSpoofState]
  );

  // Handle delete saved location
  const handleDeleteLocation = useCallback(
    (id: string) => {
      deleteSavedLocation(id);
      if (selectedLocationId === id) {
        setSelectedLocationId(null);
      }
    },
    [deleteSavedLocation, selectedLocationId]
  );

  // Handle save current location
  const handleSaveLocation = useCallback(
    (name: string) => {
      const newLocation: SavedLocation = {
        id: generateId(),
        name,
        address: spoofState.address,
        lat: spoofState.lat ?? 0,
        lng: spoofState.lng ?? 0,
      };
      addSavedLocation(newLocation);
      setSelectedLocationId(newLocation.id);
      setShowSaveModal(false);
    },
    [spoofState, addSavedLocation]
  );

  // Handle primary button
  const handlePrimaryButton = useCallback(() => {
    if (!spoofState.isActive && spoofState.lat !== null) {
      updateSpoofState({ isActive: true });
    } else if (spoofState.isActive) {
      updateSpoofState({ isActive: false });
    }
  }, [spoofState.isActive, spoofState.lat, updateSpoofState]);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const lat = spoofState.lat ?? 9.9312;
  const lng = spoofState.lng ?? 76.2673;

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      {/* Header */}
      <Header isActive={spoofState.isActive} onToggle={handleToggle} />

      {/* Search bar */}
      <SearchBar onSelect={handleSearchSelect} />

      {/* Main content: saved locations list + map */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left panel: saved locations */}
        <div className="w-[110px] shrink-0 flex flex-col border-r border-slate-100 overflow-hidden bg-white">
          <SavedLocationsList
            locations={savedLocations}
            selectedId={selectedLocationId}
            onSelect={handleSavedLocationSelect}
            onDelete={handleDeleteLocation}
            onSaveCurrent={() => setShowSaveModal(true)}
          />
        </div>

        {/* Right panel: map */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <MapPanel
              lat={lat}
              lng={lng}
              isActive={spoofState.isActive}
              onLocationChange={handleLocationChange}
            />
          </div>
          <AccuracySlider
            value={spoofState.accuracy}
            onChange={(accuracy) => updateSpoofState({ accuracy })}
          />
        </div>
      </div>

      {/* Footer */}
      <Footer
        isActive={spoofState.isActive}
        address={spoofState.address}
        lat={spoofState.lat}
        lng={spoofState.lng}
      />

      {/* Action bar */}
      <div className="flex gap-2 px-3 py-2.5 border-t border-slate-100 bg-white">
        <PrimaryButton
          isActive={spoofState.isActive}
          onClick={handlePrimaryButton}
          disabled={spoofState.lat === null}
        />
      </div>

      {/* Save location modal */}
      <SaveLocationModal
        isOpen={showSaveModal}
        address={spoofState.address}
        lat={lat}
        lng={lng}
        onSave={handleSaveLocation}
        onCancel={() => setShowSaveModal(false)}
      />
    </div>
  );
};
