# EV PRO — Android App

The Android app is a **Capacitor** wrapper around the same Next.js web app. It loads
the live site, so it shares **100% of the code, all features, and the same Firebase
database** automatically. Anything you change on the web instantly appears in the app.

## What you need (one-time setup)
1. **Android Studio** — https://developer.android.com/studio (includes the Android SDK + Gradle)
2. **Java JDK 17** (Android Studio bundles one)

## How it works
- `capacitor.config.ts` → `server.url` points to your deployed site (`https://evpro.esystemlk.com`).
- The app is a native shell with a full-screen WebView loading that URL.
- Native plugins added: Geolocation, Share, Haptics, Push Notifications.

## Build & run the app

```bash
# 1. Make sure server.url in capacitor.config.ts is correct:
#    - Production:   https://evpro.esystemlk.com   (after you deploy to Vercel)
#    - Local test:   http://<your-PC-LAN-IP>:3000  (run `npm run dev` first)

# 2. Sync config + plugins into the android project
npx cap sync android

# 3. Open in Android Studio
npx cap open android
```

Then in Android Studio: press **Run ▶** to launch on an emulator or a connected phone
(enable USB debugging on the phone).

## Build an installable APK / Play Store bundle
In Android Studio:
- **Build → Build Bundle(s) / APK(s) → Build APK(s)** → produces `app-debug.apk`
- For Play Store: **Build → Generate Signed Bundle/APK → Android App Bundle (.aab)**

## App identity
- App name: **EV PRO**
- Package id: **com.esystemlk.evpro**
- Icon/splash: generated from `public/ev.png` (re-run `npx @capacitor/assets generate --android` to update)

## Important
- The app needs the website **deployed and reachable** at `server.url`.
  Deploy to Vercel first, then the app works for everyone.
- For local testing, your phone and PC must be on the same Wi-Fi and you must set
  `server.url` to your PC's LAN IP with `cleartext: true` (HTTP).
