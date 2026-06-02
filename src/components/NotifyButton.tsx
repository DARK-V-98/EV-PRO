"use client";
import { Bell, BellRing, Loader2 } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export function NotifyButton({ compact = false }: { compact?: boolean }) {
  const { supported, subscribed, busy, subscribe } = usePushNotifications();

  if (!supported) return null;

  if (compact) {
    return (
      <button onClick={subscribe} disabled={busy || subscribed}
        className="w-9 h-9 rounded-lg flex items-center justify-center bg-slate-100 hover:bg-green-50 transition-colors"
        aria-label="Enable notifications">
        {busy ? <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
          : subscribed ? <BellRing className="w-4 h-4 text-green-600" />
          : <Bell className="w-4 h-4 text-slate-500" />}
      </button>
    );
  }

  return (
    <button onClick={subscribe} disabled={busy || subscribed}
      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
        subscribed ? "bg-green-50 border-green-200 text-green-700" : "bg-white border-slate-200 text-slate-600 hover:border-green-300"
      }`}>
      {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
        : subscribed ? <><BellRing className="w-3.5 h-3.5" /> Alerts on</>
        : <><Bell className="w-3.5 h-3.5" /> Get alerts</>}
    </button>
  );
}
