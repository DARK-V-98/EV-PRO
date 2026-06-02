"use client";
import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { reportStatus, getStatusSummary, type StatusSummary } from "@/lib/statusReports";
import { haptic } from "@/lib/haptics";

const REPORTED_KEY = "evpro-reported";

export function StatusReporter({ stationId }: { stationId: string }) {
  const [summary, setSummary] = useState<StatusSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [justReported, setJustReported] = useState<boolean | null>(null);

  const firebaseOn = Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

  useEffect(() => {
    if (!firebaseOn) { setLoading(false); return; }
    getStatusSummary(stationId)
      .then(setSummary)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [stationId, firebaseOn]);

  async function handleReport(working: boolean) {
    haptic(working ? "success" : "error");
    setSubmitting(true);
    try {
      await reportStatus(stationId, working);
      setJustReported(working);
      // refresh summary
      const fresh = await getStatusSummary(stationId);
      setSummary(fresh);
      try {
        const reported = JSON.parse(localStorage.getItem(REPORTED_KEY) ?? "{}");
        reported[stationId] = Date.now();
        localStorage.setItem(REPORTED_KEY, JSON.stringify(reported));
      } catch { /* no-op */ }
    } catch { /* no-op */ }
    setSubmitting(false);
  }

  if (!firebaseOn) return null;

  const total = (summary?.working ?? 0) + (summary?.notWorking ?? 0);
  const pctWorking = total > 0 ? Math.round((summary!.working / total) * 100) : null;

  return (
    <div className="rounded-xl p-4 bg-slate-50 border border-slate-200">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400" style={{ fontFamily: "var(--font-heading)" }}>
          Live Status
        </p>
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-300" />
        ) : pctWorking !== null ? (
          <span className={`text-xs font-bold ${pctWorking >= 60 ? "text-green-600" : pctWorking >= 30 ? "text-amber-500" : "text-red-500"}`}>
            {pctWorking}% working
          </span>
        ) : (
          <span className="text-xs text-slate-400">No reports yet</span>
        )}
      </div>

      {summary?.lastReport && (
        <p className="text-xs text-slate-400 mb-3">
          Last report: {summary.lastReport.working ? "✅ working" : "⚠️ not working"} on {summary.lastReport.date}
        </p>
      )}

      {justReported !== null ? (
        <p className="text-sm font-medium text-green-600 text-center py-1">
          ✓ Thanks for your report!
        </p>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => handleReport(true)}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50"
          >
            <ThumbsUp className="w-4 h-4" /> Working
          </button>
          <button
            onClick={() => handleReport(false)}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            <ThumbsDown className="w-4 h-4" /> Not working
          </button>
        </div>
      )}
    </div>
  );
}
