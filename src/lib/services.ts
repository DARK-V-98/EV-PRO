import {
  collection, getDocs, query, orderBy, writeBatch, doc, getCountFromServer,
} from "firebase/firestore";
import { db } from "./firebase";
import type { ServicePlace } from "@/types/service";

const CACHE_KEY = "evpro-services-cache";

async function getFromJson(): Promise<ServicePlace[]> {
  const res = await fetch("/data/services.json");
  const json = await res.json();
  return json.services;
}

async function seedIfEmpty(): Promise<void> {
  const col = collection(db, "services");
  const snap = await getCountFromServer(col);
  if (snap.data().count > 0) return;
  const services = await getFromJson();
  const batch = writeBatch(db);
  services.forEach((s) => batch.set(doc(col, s.id), s));
  await batch.commit();
}

export async function getServices(): Promise<ServicePlace[]> {
  const firebaseOn = Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  try {
    let data: ServicePlace[];
    if (firebaseOn) {
      await seedIfEmpty();
      const q = query(collection(db, "services"), orderBy("city"));
      const snap = await getDocs(q);
      data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ServicePlace));
    } else {
      data = await getFromJson();
    }
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch { /* no-op */ }
    return data;
  } catch {
    // offline fallback
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) return JSON.parse(raw);
    } catch { /* no-op */ }
    return getFromJson().catch(() => []);
  }
}

export function getServiceCities(services: ServicePlace[]): string[] {
  return [...new Set(services.map((s) => s.city))].sort();
}
