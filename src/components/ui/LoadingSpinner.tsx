export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-full w-full bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-green-100" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-green-500"
            style={{ animation: "spin 0.9s linear infinite" }} />
          <div className="absolute inset-0 flex items-center justify-center text-xl">⚡</div>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-700" style={{ fontFamily: "var(--font-heading)" }}>
            Loading stations
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Fetching live data...</p>
        </div>
      </div>
    </div>
  );
}
