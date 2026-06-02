"use client";
import { useState, useEffect, useCallback } from "react";
import { haptic } from "@/lib/haptics";

const KEY = "evpro-favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setFavorites(new Set(JSON.parse(raw)));
    } catch {
      /* no-op */
    }
  }, []);

  const persist = useCallback((next: Set<string>) => {
    setFavorites(new Set(next));
    try {
      localStorage.setItem(KEY, JSON.stringify([...next]));
    } catch {
      /* no-op */
    }
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    haptic("medium");
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(KEY, JSON.stringify([...next]));
      } catch {
        /* no-op */
      }
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: string) => favorites.has(id), [favorites]);

  return { favorites, toggleFavorite, isFavorite, persist };
}
