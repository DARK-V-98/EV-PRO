"use client";
import { useEffect } from "react";

export function useDailySync() {
  useEffect(() => {
    // Fire-and-forget — doesn't block the UI.
    // Both APIs self-throttle: each runs once per day after 12:01 AM Sri Lanka time.
    fetch("/api/auto-sync").catch(() => {});
    fetch("/api/auto-sync-services").catch(() => {});
  }, []);
}
