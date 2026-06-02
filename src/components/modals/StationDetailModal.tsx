"use client";
import { useState } from "react";
import { X, MapPin, Clock, Zap, Phone, Globe, Wifi, Car, Coffee, Bath, Navigation, Star, Share2, Check } from "lucide-react";
import type { ChargingStation } from "@/types/station";
import { ChargerBadge, SpeedBadge, VerifiedBadge } from "@/components/ui/Badge";
import type { RoadInfo } from "@/lib/routing";
import { shareStation } from "@/lib/share";
import { haptic } from "@/lib/haptics";
import { StatusReporter } from "@/components/community/StatusReporter";
import { ReviewsSection } from "@/components/community/ReviewsSection";
import { TimerStarter } from "@/components/charging/TimerStarter";

interface StationDetailModalProps {
  station: ChargingStation | null;
  onClose: () => void;
  roadInfo?: RoadInfo;
  haversineKm?: number;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onStartTimer?: (stationId: string, stationName: string, minutes: number) => void;
}

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  Parking:  <Car className="w-3.5 h-3.5" />,
  Restrooms:<Bath className="w-3.5 h-3.5" />,
  Cafe:     <Coffee className="w-3.5 h-3.5" />,
  WiFi:     <Wifi className="w-3.5 h-3.5" />,
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-400 shrink-0 mt-0.5 w-20">{label}</span>
      <span className="text-sm text-slate-700 flex-1">{children}</span>
    </div>
  );
}

function StatBox({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className="rounded-xl p-3 text-center bg-slate-50 border border-slate-200">
      <p className="text-xs text-slate-400 mb-0.5">{label}</p>
      <p className={`text-sm font-bold ${className}`} style={{ fontFamily: "var(--font-heading)" }}>{value}</p>
    </div>
  );
}

export function StationDetailModal({ station, onClose, roadInfo, haversineKm, isFavorite, onToggleFavorite, onStartTimer }: StationDetailModalProps) {
  const [shareState, setShareState] = useState<"idle" | "copied">("idle");

  if (!station) return null;

  const speedCls = station.speedKw > 50 ? "text-orange-600" : station.speedKw > 22 ? "text-sky-600" : "text-slate-700";

  async function handleShare() {
    if (!station) return;
    const result = await shareStation(station);
    if (result === "copied") {
      setShareState("copied");
      setTimeout(() => setShareState("idle"), 2000);
    }
  }

  return (
    <div className="absolute inset-0 md:inset-y-0 md:left-auto md:right-0 flex flex-col z-[1000] bg-white fade-in"
      style={{ width: "100%", maxWidth: "420px", borderLeft: "1px solid #e2e8f0", boxShadow: "-4px 0 32px rgba(15,23,42,0.1)" }}>

      {/* Header */}
      <div className="p-5 shrink-0 bg-white border-b border-slate-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex gap-2 mb-2 flex-wrap">
              <ChargerBadge type={station.chargerType} />
              <SpeedBadge kw={station.speedKw} />
              {station.verified && <VerifiedBadge />}
            </div>
            <h2 className="text-base font-bold text-slate-900 leading-snug" style={{ fontFamily: "var(--font-heading)" }}>
              {station.name}
            </h2>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" />{station.city}, {station.province}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {onToggleFavorite && (
              <button onClick={() => onToggleFavorite(station.id)}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 hover:bg-amber-50 transition-colors"
                aria-label="Favorite">
                <Star className={`w-4 h-4 transition-all ${isFavorite ? "fill-amber-400 text-amber-400" : "text-slate-500"}`} />
              </button>
            )}
            <button onClick={handleShare}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 hover:bg-green-50 transition-colors"
              aria-label="Share">
              {shareState === "copied"
                ? <Check className="w-4 h-4 text-green-600" />
                : <Share2 className="w-4 h-4 text-slate-500" />}
            </button>
            <button onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 hover:bg-slate-200 transition-colors">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>
        {shareState === "copied" && <p className="text-xs text-green-600 mt-2">✓ Link copied to clipboard</p>}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">

        {/* Road distance banner */}
        {(roadInfo || haversineKm !== undefined) && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-sky-50 border border-sky-200">
            <Car className="w-5 h-5 text-sky-500 shrink-0" />
            <div className="flex-1">
              {roadInfo ? (
                <>
                  <p className="text-sm font-bold text-sky-700" style={{ fontFamily: "var(--font-heading)" }}>
                    {roadInfo.distanceKm} km · ~{roadInfo.durationMin} min drive
                  </p>
                  <p className="text-xs text-slate-400">
                    via road · straight line {haversineKm !== undefined ? `${haversineKm.toFixed(1)} km` : ""}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-slate-600" style={{ fontFamily: "var(--font-heading)" }}>
                    ~{haversineKm?.toFixed(1)} km away
                  </p>
                  <p className="text-xs text-slate-400 animate-pulse">Calculating road distance...</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Live status reporter */}
        <StatusReporter stationId={station.id} />

        {/* Charging timer */}
        {onStartTimer && <TimerStarter station={station} onStart={onStartTimer} />}

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2">
          <StatBox label="Speed" value={`${station.speedKw} kW`} className={speedCls} />
          <StatBox label="Ports" value={`${station.numberOfPorts}`} className="text-slate-700" />
          <StatBox
            label="Cost"
            value={station.cost.flat === 0 ? "Free" : station.cost.perKwh ? `LKR ${station.cost.perKwh}` : "—"}
            className={station.cost.flat === 0 ? "text-green-600" : "text-slate-700"}
          />
        </div>

        {/* Details */}
        <div>
          <Row label="Address">
            <div className="flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />{station.address}
            </div>
          </Row>
          <Row label="Hours">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {station.hours.is24Hours
                ? <span className="font-semibold text-green-600">Open 24 hours</span>
                : <span>{station.hours.open} – {station.hours.close}</span>
              }
            </div>
          </Row>
          <Row label="Connectors">
            <div className="flex gap-1.5 flex-wrap">
              {station.connectors.map((c) => (
                <span key={c} className="text-xs px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600">{c}</span>
              ))}
            </div>
          </Row>
          {station.network && <Row label="Network">{station.network}</Row>}
          {station.cost.notes && <Row label="Cost note"><span className="text-slate-500">{station.cost.notes}</span></Row>}
        </div>

        {/* Amenities */}
        {station.amenities && station.amenities.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2" style={{ fontFamily: "var(--font-heading)" }}>Amenities</p>
            <div className="flex gap-2 flex-wrap">
              {station.amenities.map((a) => (
                <div key={a} className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-600">
                  {AMENITY_ICONS[a] ?? <Zap className="w-3.5 h-3.5" />}{a}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact */}
        {(station.contact.phone || station.contact.website) && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2" style={{ fontFamily: "var(--font-heading)" }}>Contact</p>
            <div className="space-y-1.5">
              {station.contact.phone && (
                <a href={`tel:${station.contact.phone}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-green-600 transition-colors">
                  <Phone className="w-4 h-4" />{station.contact.phone}
                </a>
              )}
              {station.contact.website && (
                <a href={station.contact.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-slate-600 hover:text-green-600 transition-colors">
                  <Globe className="w-4 h-4" />Website
                </a>
              )}
            </div>
          </div>
        )}

        {/* Reviews & photos */}
        <div className="pt-2 border-t border-slate-100">
          <ReviewsSection stationId={station.id} />
        </div>

        <p className="text-xs text-slate-400">
          Updated {station.lastUpdated}
          {station.submittedBy === "admin" && " · Admin verified"}
          {station.submittedBy === "auto-sync" && " · Google Places"}
        </p>
      </div>

      {/* CTA */}
      <div className="p-4 shrink-0 bg-white border-t border-slate-100">
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${station.coordinates.lat},${station.coordinates.lng}`}
          target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm bg-green-500 hover:bg-green-600 text-white transition-colors"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <Navigation className="w-4 h-4" />Get Directions
        </a>
      </div>
    </div>
  );
}
