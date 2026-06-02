"use client";
import { useState, useEffect, useCallback } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { haptic } from "@/lib/haptics";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export function usePushNotifications() {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const ok = typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      Boolean(VAPID_PUBLIC);
    setSupported(ok);
    if (ok) {
      navigator.serviceWorker.ready
        .then((reg) => reg.pushManager.getSubscription())
        .then((sub) => setSubscribed(!!sub))
        .catch(() => {});
    }
  }, []);

  const subscribe = useCallback(async () => {
    if (!VAPID_PUBLIC) return;
    setBusy(true);
    haptic("medium");
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { setBusy(false); return; }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC) as BufferSource,
      });

      // Store subscription in Firestore so the server can send pushes
      await addDoc(collection(db, "pushSubscriptions"), {
        subscription: JSON.parse(JSON.stringify(sub)),
        createdAt: Timestamp.now(),
      });

      setSubscribed(true);
    } catch {
      /* no-op */
    }
    setBusy(false);
  }, []);

  return { supported, subscribed, busy, subscribe };
}
