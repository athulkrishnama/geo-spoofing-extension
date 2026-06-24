/**
 * Injected Script (MAIN world)
 *
 * This file runs in the page's MAIN world (not the extension's isolated world).
 * It overrides navigator.geolocation.getCurrentPosition and watchPosition.
 * It receives location updates via a custom '__GEOROUTE_STATE__' DOM event.
 */

(function () {
  'use strict';

  interface GeoRouteState {
    isActive: boolean;
    lat: number | null;
    lng: number | null;
    accuracy: number;
  }

  let state: GeoRouteState = {
    isActive: false,
    lat: null,
    lng: null,
    accuracy: 50,
  };

  // Watch callbacks for spoofed watchPosition calls
  const watchCallbacks = new Map<number, PositionCallback>();
  let watchIdCounter = 1000;

  // Original geolocation methods
  const originalGetCurrentPosition = navigator.geolocation.getCurrentPosition.bind(
    navigator.geolocation
  );
  const originalWatchPosition = navigator.geolocation.watchPosition.bind(
    navigator.geolocation
  );
  const originalClearWatch = navigator.geolocation.clearWatch.bind(
    navigator.geolocation
  );

  function buildPosition(): GeolocationPosition {
    const timestamp = Date.now();
    const coords: GeolocationCoordinates = {
      latitude: state.lat!,
      longitude: state.lng!,
      accuracy: state.accuracy,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
      toJSON() {
        return {
          latitude: this.latitude,
          longitude: this.longitude,
          accuracy: this.accuracy,
          altitude: this.altitude,
          altitudeAccuracy: this.altitudeAccuracy,
          heading: this.heading,
          speed: this.speed,
        };
      },
    };

    return {
      coords,
      timestamp,
      toJSON() {
        return { coords: this.coords.toJSON(), timestamp: this.timestamp };
      },
    };
  }

  // Override getCurrentPosition
  navigator.geolocation.getCurrentPosition = function (
    successCallback: PositionCallback,
    errorCallback?: PositionErrorCallback | null,
    options?: PositionOptions
  ) {
    if (state.isActive && state.lat !== null && state.lng !== null) {
      setTimeout(() => successCallback(buildPosition()), 10);
    } else {
      originalGetCurrentPosition(successCallback, errorCallback ?? undefined, options);
    }
  };

  // Override watchPosition
  navigator.geolocation.watchPosition = function (
    successCallback: PositionCallback,
    errorCallback?: PositionErrorCallback | null,
    options?: PositionOptions
  ): number {
    if (state.isActive && state.lat !== null && state.lng !== null) {
      const id = watchIdCounter++;
      watchCallbacks.set(id, successCallback);
      setTimeout(() => successCallback(buildPosition()), 10);
      return id;
    }
    return originalWatchPosition(successCallback, errorCallback ?? undefined, options);
  };

  // Override clearWatch
  navigator.geolocation.clearWatch = function (id: number) {
    if (watchCallbacks.has(id)) {
      watchCallbacks.delete(id);
    } else {
      originalClearWatch(id);
    }
  };

  // Listen for state updates from content script
  window.addEventListener('__GEOROUTE_STATE__', (e: Event) => {
    const detail = (e as CustomEvent<GeoRouteState>).detail;
    state = { ...state, ...detail };

    // Notify all active watch subscribers
    if (state.isActive && state.lat !== null && state.lng !== null) {
      const pos = buildPosition();
      watchCallbacks.forEach((cb) => cb(pos));
    }
  });

  // Freeze the geolocation object to prevent overrides being detected
  try {
    Object.freeze(navigator.geolocation);
  } catch {
    // May fail in some contexts, ignore
  }
})();
