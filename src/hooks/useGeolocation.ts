"use client";
import { useState, useCallback } from "react";

export interface UserLocation { lat: number; lng: number; accuracy?: number }

export function useGeolocation() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

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
        });
        setLocating(false);
      },
      (err) => {
        const messages: Record<number, string> = {
          1: "Location access denied. Please allow location in your browser settings.",
          2: "Could not detect your location. Check your GPS or internet connection.",
          3: "Location request timed out. Please try again.",
        };
        setLocationError(messages[err.code] ?? "Unknown location error.");
        setLocating(false);
      },
      {
        enableHighAccuracy: true,  // forces GPS, not IP/WiFi estimate
        maximumAge: 0,             // never use cached position
        timeout: 15000,
      }
    );
  }, []);

  const clearLocation = useCallback(() => {
    setUserLocation(null);
    setLocationError(null);
  }, []);

  return { userLocation, locating, locationError, locate, clearLocation };
}
