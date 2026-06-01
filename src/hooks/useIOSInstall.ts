"use client";
import { useState, useEffect } from "react";

export function useIOSInstall() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isStandalone = (window.navigator as any).standalone === true;
    const dismissed = localStorage.getItem("evpro-ios-install-dismissed");

    // Show only on iOS Safari, not already installed, not previously dismissed
    if (isIOS && !isStandalone && !dismissed) {
      // Small delay so the map loads first
      const t = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(t);
    }
  }, []);

  function dismiss() {
    setShow(false);
    localStorage.setItem("evpro-ios-install-dismissed", "1");
  }

  return { show, dismiss };
}
