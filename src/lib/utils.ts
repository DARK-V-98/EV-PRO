import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)} km`;
}

/** Returns true if the station is currently open (Sri Lanka time UTC+5:30). */
export function isOpenNow(hours: { is24Hours: boolean; open?: string; close?: string }): boolean {
  if (hours.is24Hours) return true;
  if (!hours.open || !hours.close) return true; // unknown — assume open
  const now = new Date();
  const slt = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  const mins = slt.getUTCHours() * 60 + slt.getUTCMinutes();
  const [oh, om] = hours.open.split(":").map(Number);
  const [ch, cm] = hours.close.split(":").map(Number);
  const openMins = oh * 60 + om;
  const closeMins = ch * 60 + cm;
  if (closeMins > openMins) return mins >= openMins && mins < closeMins;
  return mins >= openMins || mins < closeMins; // overnight
}
