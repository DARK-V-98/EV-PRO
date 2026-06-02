import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.esystemlk.evpro",
  appName: "EV PRO",
  // Capacitor requires a webDir even when loading a remote server.
  webDir: "public",
  server: {
    // The Android app loads the SAME live Next.js app, so it shares all code,
    // API routes (daily sync) and the SAME Firebase database automatically.
    // Change this to your deployed domain. For local testing on a device on the
    // same Wi-Fi, use your PC's LAN IP, e.g. "http://192.168.8.207:3000".
    url: "https://evpro.esystemlk.com",
    cleartext: false,
  },
  android: {
    backgroundColor: "#ffffff",
  },
};

export default config;
