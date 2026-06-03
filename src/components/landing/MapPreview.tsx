"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Maximize2 } from "lucide-react";
import MapContainer from "@/components/map/MapContainer";
import { getStationsFromFirestore } from "@/lib/firestoreStations";
import { getAllStations } from "@/lib/stations";
import type { ChargingStation } from "@/types/station";

export function MapPreview() {
  const router = useRouter();
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const firebaseOn = Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
    const loader = firebaseOn
      ? getStationsFromFirestore().catch(() => getAllStations())
      : getAllStations();
    loader.then(setStations).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-sm"
      style={{ height: "min(60vh, 460px)" }}>
      {loading ? (
        <div className="flex items-center justify-center h-full bg-slate-50">
          <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <MapContainer
          stations={stations}
          selectedStation={null}
          userLocation={null}
          onStationSelect={() => router.push("/map")}
        />
      )}

      {/* Open-full overlay button */}
      <button
        onClick={() => router.push("/map")}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-500 text-white text-sm font-semibold shadow-lg hover:bg-green-600 transition-colors"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        <Maximize2 className="w-4 h-4" /> Open full map
      </button>
    </div>
  );
}
