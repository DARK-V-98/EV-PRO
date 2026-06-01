"use client";
import { useState } from "react";
import type { Filters } from "@/types/station";

const defaultFilters: Filters = {
  city: "",
  province: "",
  chargerType: "",
  connector: "",
  searchQuery: "",
  speedTier: "",
  isFree: false,
  is24Hours: false,
  verifiedOnly: false,
  amenities: [],
  radiusKm: null,
};

export function useFilters() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  function setFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function toggleAmenity(amenity: string) {
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  }

  function clearFilters() {
    setFilters(defaultFilters);
  }

  return { filters, setFilter, toggleAmenity, clearFilters };
}
