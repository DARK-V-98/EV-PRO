"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, MapPin, Phone, Globe, Zap, ChevronRight, ArrowLeft, Building2, Package, Wrench, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import ServicesMapContainer from "@/components/services/ServicesMapContainer";
import { getServices, getServiceCities } from "@/lib/services";
import { SERVICE_CATEGORIES, type ServicePlace, type ServiceCategory, type ServiceFilters } from "@/types/service";
import { useDebounce } from "@/hooks/useDebounce";
import { useDailySync } from "@/hooks/useDailySync";

const CAT_ICONS: Record<ServiceCategory, LucideIcon> = {
  showroom: Building2,
  spareparts: Package,
  garage: Wrench,
  repair: Settings,
};

export default function ServicesPage() {
  useDailySync();
  const [places, setPlaces] = useState<ServicePlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ServiceFilters>({ category: "", city: "", searchQuery: "" });
  const [selected, setSelected] = useState<ServicePlace | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [showList, setShowList] = useState(false);
  const debounced = useDebounce(searchInput, 300);

  useEffect(() => { getServices().then(setPlaces).finally(() => setLoading(false)); }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setFilters((f) => ({ ...f, searchQuery: debounced })); }, [debounced]);

  const cities = getServiceCities(places);

  const filtered = useMemo(() => places.filter((p) => {
    const mc = !filters.category || p.category === filters.category;
    const mci = !filters.city || p.city === filters.city;
    const ms = !filters.searchQuery ||
      [p.name, p.address, p.city, ...(p.brands ?? []), ...(p.services ?? [])]
        .join(" ").toLowerCase().includes(filters.searchQuery.toLowerCase());
    return mc && mci && ms;
  }), [places, filters]);

  function setCat(c: ServiceCategory | "") { setFilters((f) => ({ ...f, category: f.category === c ? "" : c })); }

  const panel = (
    <>
      {/* Header */}
      <div className="px-5 py-4 shrink-0 bg-white border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/ev.png" alt="EV PRO" width={36} height={36} className="rounded-xl shrink-0" />
            <div>
              <h1 className="text-base font-bold text-slate-900" style={{ fontFamily: "var(--font-heading)" }}>
                EV <span className="text-green-600">Services</span>
              </h1>
              <p className="text-xs text-slate-400">{places.length} places · Sri Lanka</p>
            </div>
          </div>
          <Link href="/" className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 transition-colors">
            <Zap className="w-3.5 h-3.5" /> Chargers
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-slate-100 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search showrooms, garages, brands..."
            className="w-full pl-9 pr-8 py-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-green-400 text-slate-800" />
          {searchInput && <button onClick={() => setSearchInput("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><X className="w-3.5 h-3.5" /></button>}
        </div>

        {/* Category pills */}
        <div className="flex gap-1.5 flex-wrap mt-3">
          {SERVICE_CATEGORIES.map((c) => {
            const active = filters.category === c.value;
            const Icon = CAT_ICONS[c.value];
            return (
              <button key={c.value} onClick={() => setCat(c.value)}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border font-medium transition-all"
                style={active ? { background: c.color, borderColor: c.color, color: "#fff" } : { background: "#fff", borderColor: "#e2e8f0", color: "#64748b" }}>
                <Icon className="w-3.5 h-3.5" /> {c.label}
              </button>
            );
          })}
        </div>

        <select value={filters.city} onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
          className="w-full mt-2.5 text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 outline-none focus:border-green-400">
          <option value="">All Cities</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <p className="text-xs text-slate-400 mt-2"><span className="text-green-600 font-semibold">{filtered.length}</span> of {places.length} places</p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        {filtered.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-10">No places found</p>
        ) : filtered.map((p) => {
          const cat = SERVICE_CATEGORIES.find((c) => c.value === p.category)!;
          return (
            <button key={p.id} onClick={() => { setSelected(p); setShowList(false); }}
              className={`w-full text-left px-4 py-3.5 border-b border-slate-100 transition-all ${selected?.id === p.id ? "bg-green-50 border-l-4 border-l-green-500" : "bg-white hover:bg-slate-50 border-l-4 border-l-transparent"}`}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800" style={{ fontFamily: "var(--font-heading)" }}>{p.name}</p>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0 mt-0.5" />
              </div>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-medium" style={{ background: cat.color + "1a", color: cat.color }}>
                  {(() => { const I = CAT_ICONS[cat.value]; return <I className="w-3 h-3" />; })()} {cat.label.slice(0, -1)}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-0.5"><MapPin className="w-3 h-3" />{p.city}</span>
              </div>
              {p.brands && <p className="text-xs text-slate-500 mt-1">{p.brands.join(", ")}</p>}
            </button>
          );
        })}
      </div>
    </>
  );

  return (
    <div className="flex h-full overflow-hidden bg-slate-50">
      <h1 className="sr-only">EV Showrooms, Spare Parts, Garages & Repair Shops in Sri Lanka</h1>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-96 shrink-0 bg-white border-r border-slate-200">{panel}</aside>

      {/* Map */}
      <main className="flex-1 relative">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <ServicesMapContainer places={filtered} onSelect={setSelected} selected={selected} />
        )}

        {/* Detail panel */}
        {selected && <ServiceDetail place={selected} onClose={() => setSelected(null)} />}

        {/* Mobile bottom bar */}
        <div className="md:hidden absolute bottom-0 left-0 right-0 z-[950]">
          <div className="bg-white border-t border-slate-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/" className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center"><ArrowLeft className="w-4 h-4 text-slate-500" /></Link>
              <div>
                <p className="text-sm font-bold text-slate-800" style={{ fontFamily: "var(--font-heading)" }}>EV Services</p>
                <p className="text-xs text-slate-400">{filtered.length} places</p>
              </div>
            </div>
            <button onClick={() => setShowList(!showList)} className="text-sm font-semibold px-4 py-2 rounded-xl bg-green-50 border border-green-200 text-green-700">
              {showList ? "Close" : "Browse"}
            </button>
          </div>
          {showList && <div className="bg-white h-[60vh] overflow-y-auto border-t border-slate-200 flex flex-col">{panel}</div>}
        </div>
      </main>
    </div>
  );
}

function ServiceDetail({ place, onClose }: { place: ServicePlace; onClose: () => void }) {
  const cat = SERVICE_CATEGORIES.find((c) => c.value === place.category)!;
  const dir = `https://www.google.com/maps/dir/?api=1&destination=${place.coordinates.lat},${place.coordinates.lng}`;
  const wa = place.whatsapp ? `https://wa.me/${place.whatsapp}` : null;
  return (
    <div className="absolute inset-0 md:inset-y-0 md:left-auto md:right-0 flex flex-col z-[1000] bg-white fade-in"
      style={{ width: "100%", maxWidth: "420px", borderLeft: "1px solid #e2e8f0", boxShadow: "-4px 0 32px rgba(15,23,42,0.1)" }}>
      <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-medium" style={{ background: cat.color + "1a", color: cat.color }}>
            {(() => { const I = CAT_ICONS[cat.value]; return <I className="w-3 h-3" />; })()} {cat.label.slice(0, -1)}
          </span>
          <h2 className="text-base font-bold text-slate-900 mt-2" style={{ fontFamily: "var(--font-heading)" }}>{place.name}</h2>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" />{place.city}, {place.province}</p>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0"><X className="w-4 h-4 text-slate-500" /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4 text-sm">
        <p className="text-slate-600 flex items-start gap-2"><MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />{place.address}</p>
        {place.hours && (
          <p className="text-slate-600">{place.hours.is24Hours ? "Open 24 hours" : `${place.hours.open} – ${place.hours.close}`}</p>
        )}
        {place.brands && place.brands.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">Brands</p>
            <div className="flex flex-wrap gap-1.5">{place.brands.map((b) => <span key={b} className="text-xs px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600">{b}</span>)}</div>
          </div>
        )}
        {place.services && place.services.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">Services</p>
            <div className="flex flex-wrap gap-1.5">{place.services.map((s) => <span key={s} className="text-xs px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600">{s}</span>)}</div>
          </div>
        )}
        <div className="space-y-1.5">
          {place.phone && <a href={`tel:${place.phone}`} className="flex items-center gap-2 text-slate-600 hover:text-green-600"><Phone className="w-4 h-4" />{place.phone}</a>}
          {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-green-600">💬 WhatsApp</a>}
          {place.website && <a href={place.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-600 hover:text-green-600"><Globe className="w-4 h-4" />Website</a>}
        </div>
      </div>

      <div className="p-4 border-t border-slate-100">
        <a href={dir} target="_blank" rel="noopener noreferrer"
          className="block w-full text-center py-3 rounded-xl font-semibold text-sm text-white" style={{ background: cat.color, fontFamily: "var(--font-heading)" }}>
          Get Directions
        </a>
      </div>
    </div>
  );
}
