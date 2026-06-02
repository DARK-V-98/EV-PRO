"use client";
import { useState, useEffect, useRef } from "react";
import { Star, Camera, Loader2, Send } from "lucide-react";
import { getReviews, addReview, uploadReviewPhoto, averageRating, type Review } from "@/lib/reviews";
import { haptic } from "@/lib/haptics";

function Stars({ value, onPick, size = 16 }: { value: number; onPick?: (n: number) => void; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onPick}
          onClick={() => onPick?.(n)}
          className={onPick ? "cursor-pointer" : "cursor-default"}
        >
          <Star
            className="transition-colors"
            style={{ width: size, height: size }}
            fill={n <= value ? "#f59e0b" : "none"}
            color={n <= value ? "#f59e0b" : "#cbd5e1"}
          />
        </button>
      ))}
    </div>
  );
}

export function ReviewsSection({ stationId }: { stationId: string }) {
  const firebaseOn = Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [author, setAuthor] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!firebaseOn) { setLoading(false); return; }
    getReviews(stationId).then(setReviews).catch(() => {}).finally(() => setLoading(false));
  }, [stationId, firebaseOn]);

  if (!firebaseOn) return null;

  async function submit() {
    if (!text.trim()) return;
    setSubmitting(true);
    haptic("success");
    try {
      let photoUrl: string | undefined;
      if (photo) {
        try { photoUrl = await uploadReviewPhoto(stationId, photo); } catch { /* storage not set up */ }
      }
      await addReview({ stationId, rating, text: text.trim(), author: author.trim(), photoUrl });
      const fresh = await getReviews(stationId);
      setReviews(fresh);
      setText(""); setAuthor(""); setPhoto(null); setRating(5); setShowForm(false);
    } catch { /* no-op */ }
    setSubmitting(false);
  }

  const avg = averageRating(reviews);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400" style={{ fontFamily: "var(--font-heading)" }}>
          Reviews {reviews.length > 0 && `(${reviews.length})`}
        </p>
        {avg !== null && (
          <div className="flex items-center gap-1.5">
            <Stars value={Math.round(avg)} size={14} />
            <span className="text-xs font-semibold text-slate-600">{avg}</span>
          </div>
        )}
      </div>

      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-slate-300" />
      ) : (
        <>
          {!showForm && (
            <button
              onClick={() => { haptic("light"); setShowForm(true); }}
              className="w-full py-2 rounded-lg text-sm font-semibold text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 transition-colors mb-3"
            >
              ✍️ Write a review
            </button>
          )}

          {showForm && (
            <div className="rounded-xl p-3 bg-slate-50 border border-slate-200 mb-3 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Your rating:</span>
                <Stars value={rating} onPick={setRating} size={20} />
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="How was the charging experience?"
                rows={3}
                className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-2 outline-none focus:border-green-400 resize-none"
              />
              <input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Your name (optional)"
                className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-green-400"
              />
              <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden"
                onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
              <div className="flex items-center gap-2">
                <button onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors">
                  <Camera className="w-3.5 h-3.5" /> {photo ? "Photo added ✓" : "Add photo"}
                </button>
                <button onClick={submit} disabled={submitting || !text.trim()}
                  className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold py-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-3.5 h-3.5" /> Post</>}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="pb-3 border-b border-slate-100 last:border-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-slate-700">{r.author}</span>
                  <Stars value={r.rating} size={12} />
                </div>
                <p className="text-sm text-slate-600">{r.text}</p>
                {r.photoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.photoUrl} alt="Review" className="mt-2 rounded-lg max-h-40 w-auto object-cover" />
                )}
                <p className="text-xs text-slate-400 mt-1">{r.createdAt?.toDate?.().toLocaleDateString?.() ?? ""}</p>
              </div>
            ))}
            {reviews.length === 0 && !showForm && (
              <p className="text-xs text-slate-400 text-center py-2">No reviews yet — be the first!</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
