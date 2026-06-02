"use client";
import { useState, useCallback, useRef, useEffect } from "react";

export interface UserLocation { lat: number; lng: number; accuracy?: number; heading?: number | null }

export function useGeolocation() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [tracking, setTracking] = useState(false);
  const watchId = useRef<number | null>(null);

  const errorMsg = (code: number) =>
    ({
      1: "Location access denied. Please allow location in your browser settings.",
      2: "Could not detect your location. Check your GPS or internet connection.",
      3: "Location request timed out. Please try again.",
    }[code] ?? "Unknown location error.");

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
          heading: pos.coords.heading,
        });
        setLocating(false);
      },
      (err) => { setLocationError(errorMsg(err.code)); setLocating(false); },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );
  }, []);

  // Live tracking — continuously updates position (for navigation mode)
  const startTracking = useCallback(() => {
    if (!navigator.geolocation || watchId.current !== null) return;
    setTracking(true);
    setLocating(true);
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
          heading: pos.coords.heading,
        });
        setLocating(false);
      },
      (err) => { setLocationError(errorMsg(err.code)); setLocating(false); },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 }
    );
  }, []);

  const stopTracking = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setTracking(false);
  }, []);

  const clearLocation = useCallback(() => {
    stopTracking();
    setUserLocation(null);
    setLocationError(null);
  }, [stopTracking]);

  useEffect(() => () => { if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current); }, []);

  return { userLocation, locating, locationError, tracking, locate, startTracking, stopTracking, clearLocation };
}
