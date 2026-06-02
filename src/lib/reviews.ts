import {
  collection, addDoc, query, where, orderBy, limit, getDocs, Timestamp,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "./firebase";

export interface Review {
  id: string;
  stationId: string;
  rating: number;       // 1-5
  text: string;
  author: string;
  photoUrl?: string;
  createdAt: Timestamp;
}

export async function uploadReviewPhoto(stationId: string, file: File): Promise<string> {
  const storage = getStorage();
  const path = `reviews/${stationId}/${Date.now()}-${file.name}`;
  const snap = await uploadBytes(ref(storage, path), file);
  return getDownloadURL(snap.ref);
}

export async function addReview(input: {
  stationId: string;
  rating: number;
  text: string;
  author: string;
  photoUrl?: string;
}): Promise<void> {
  await addDoc(collection(db, "reviews"), {
    ...input,
    author: input.author || "Anonymous",
    createdAt: Timestamp.now(),
  });
}

export async function getReviews(stationId: string): Promise<Review[]> {
  const q = query(
    collection(db, "reviews"),
    where("stationId", "==", stationId),
    orderBy("createdAt", "desc"),
    limit(20)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Review));
}

export function averageRating(reviews: Review[]): number | null {
  if (reviews.length === 0) return null;
  return Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10;
}
