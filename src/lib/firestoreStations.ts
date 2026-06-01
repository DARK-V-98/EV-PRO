import {
  collection, getDocs, query, orderBy,
  writeBatch, doc, getCountFromServer,
} from "firebase/firestore";
import { db } from "./firebase";
import type { ChargingStation } from "@/types/station";

async function seedIfEmpty(): Promise<void> {
  const col = collection(db, "stations");
  const snap = await getCountFromServer(col);
  if (snap.data().count > 0) return;

  const res = await fetch("/data/stations.json");
  const json = await res.json();
  const stations: ChargingStation[] = json.stations;

  const CHUNK = 499;
  for (let i = 0; i < stations.length; i += CHUNK) {
    const batch = writeBatch(db);
    stations.slice(i, i + CHUNK).forEach((s) => {
      batch.set(doc(col, s.id), s);
    });
    await batch.commit();
  }
}

export async function getStationsFromFirestore(): Promise<ChargingStation[]> {
  await seedIfEmpty();
  const q = query(collection(db, "stations"), orderBy("city"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ChargingStation));
}
