"use client";
import { useEffect, useState } from "react";
import { Zap, Wrench, MapPin, Building2 } from "lucide-react";
import { getStationsFromFirestore } from "@/lib/firestoreStations";
import { getServices } from "@/lib/services";
import { getAllStations } from "@/lib/stations";

interface Stats { chargers: number; services: number; cities: number; showrooms: number }

export function LiveStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const firebaseOn = Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
        const chargers = firebaseOn
          ? await getStationsFromFirestore().catch(() => getAllStations())
          : await getAllStations();
        const services = await getServices().catch(() => []);
        const cities = new Set([...chargers.map((c) => c.city), ...services.map((s) => s.city)]);
        setStats({
          chargers: chargers.length,
          services: services.length,
          cities: cities.size,
          showrooms: services.filter((s) => s.category === "showroom").length,
        });
      } catch {
        setStats({ chargers: 0, services: 0, cities: 0, showrooms: 0 });
      }
    })();
  }, []);

  const items = [
    { icon: Zap, label: "Charging Stations", value: stats?.chargers, color: "text-green-600", bg: "bg-green-50" },
    { icon: Wrench, label: "Service Places", value: stats?.services, color: "text-sky-600", bg: "bg-sky-50" },
    { icon: Building2, label: "Showrooms", value: stats?.showrooms, color: "text-violet-600", bg: "bg-violet-50" },
    { icon: MapPin, label: "Cities Covered", value: stats?.cities, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {items.map(({ icon: Icon, label, value, color, bg }) => (
        <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 text-center">
          <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          <p className={`text-2xl md:text-3xl font-bold ${color}`} style={{ fontFamily: "var(--font-heading)" }}>
            {value === undefined ? <span className="inline-block w-12 h-7 skeleton rounded" /> : value.toLocaleString()}
            {value !== undefined && "+"}
          </p>
          <p className="text-xs text-slate-500 mt-1">{label}</p>
        </div>
      ))}
    </div>
  );
}
