/**
 * GeoRoute Injected Script (MAIN world)
 * Overrides navigator.geolocation to return spoofed coordinates.
 * Receives state via '__GEOROUTE_STATE__' custom DOM events from the content script.
 */
(function () {
  'use strict';

  var state = {
    isActive: false,
    lat: null,
    lng: null,
    accuracy: 50,
  };

  // Watch callbacks registry
  var watchCallbacks = new Map();
  var watchIdCounter = 10000;

  // Preserve original methods
  var _geo = navigator.geolocation;
  var _getCurrentPosition = _geo.getCurrentPosition.bind(_geo);
  var _watchPosition = _geo.watchPosition.bind(_geo);
  var _clearWatch = _geo.clearWatch.bind(_geo);

  function buildCoords() {
    return {
      latitude: state.lat,
      longitude: state.lng,
      accuracy: state.accuracy,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
      toJSON: function () {
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
  }

  function buildPosition() {
    var ts = Date.now();
    var coords = buildCoords();
    return {
      coords: coords,
      timestamp: ts,
      toJSON: function () {
        return { coords: this.coords.toJSON(), timestamp: this.timestamp };
      },
    };
  }

  function isSpoofing() {
    return state.isActive && state.lat !== null && state.lng !== null;
  }

  // Override getCurrentPosition
  navigator.geolocation.getCurrentPosition = function (successCb, errorCb, options) {
    if (isSpoofing()) {
      setTimeout(function () { successCb(buildPosition()); }, 10);
    } else {
      _getCurrentPosition(successCb, errorCb, options);
    }
  };

  // Override watchPosition
  navigator.geolocation.watchPosition = function (successCb, errorCb, options) {
    if (isSpoofing()) {
      var id = watchIdCounter++;
      watchCallbacks.set(id, successCb);
      setTimeout(function () { successCb(buildPosition()); }, 10);
      return id;
    }
    return _watchPosition(successCb, errorCb, options);
  };

  // Override clearWatch
  navigator.geolocation.clearWatch = function (id) {
    if (watchCallbacks.has(id)) {
      watchCallbacks.delete(id);
    } else {
      _clearWatch(id);
    }
  };

  // Listen for state updates from the content script (isolated world → main world bridge)
  window.addEventListener('__GEOROUTE_STATE__', function (e) {
    var detail = e.detail;
    if (detail) {
      state.isActive = detail.isActive;
      state.lat = detail.lat;
      state.lng = detail.lng;
      state.accuracy = detail.accuracy || 50;

      // Push update to all active watchers
      if (isSpoofing()) {
        var pos = buildPosition();
        watchCallbacks.forEach(function (cb) { cb(pos); });
      }
    }
  });

  // Signal that we're ready
  window.dispatchEvent(new CustomEvent('__GEOROUTE_READY__'));

})();
