"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { haptic } from "@/lib/haptics";

const KEY = "evpro-charging-timer";

export interface ChargingTimer {
  stationId: string;
  stationName: string;
  startMs: number;
  endMs: number;
}

function read(): ChargingTimer | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function useChargingTimer() {
  const [timer, setTimer] = useState<ChargingTimer | null>(null);
  const [now, setNow] = useState(Date.now());
  const notified = useRef(false);

  useEffect(() => {
    const t = read();
    if (t) setTimer(t);
  }, []);

  // tick every second while a timer is active
  useEffect(() => {
    if (!timer) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [timer]);

  // fire notification when done
  useEffect(() => {
    if (!timer || notified.current) return;
    if (now >= timer.endMs) {
      notified.current = true;
      haptic("success");
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification("⚡ Charging likely complete", {
          body: `Your session at ${timer.stationName} should be done.`,
          icon: "/icons/icon-192.png",
        });
      }
    }
  }, [now, timer]);

  const start = useCallback((stationId: string, stationName: string, durationMin: number) => {
    const startMs = Date.now();
    const t: ChargingTimer = { stationId, stationName, startMs, endMs: startMs + durationMin * 60_000 };
    notified.current = false;
    try { localStorage.setItem(KEY, JSON.stringify(t)); } catch { /* no-op */ }
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
    haptic("success");
    setTimer(t);
    setNow(Date.now());
  }, []);

  const stop = useCallback(() => {
    try { localStorage.removeItem(KEY); } catch { /* no-op */ }
    notified.current = false;
    setTimer(null);
  }, []);

  const remainingMs = timer ? Math.max(0, timer.endMs - now) : 0;
  const totalMs = timer ? timer.endMs - timer.startMs : 0;
  const progress = totalMs > 0 ? Math.min(1, (now - timer!.startMs) / totalMs) : 0;
  const done = timer ? now >= timer.endMs : false;

  return { timer, start, stop, remainingMs, progress, done };
}

export function formatRemaining(ms: number): string {
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    return `${h}h ${m % 60}m`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}
