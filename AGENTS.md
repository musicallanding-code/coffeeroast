# coffeeroast — agent notes

## Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.
SDK 57, React Native 0.86, React 19.2, expo-router 57 (typed routes, routes live in `src/app`).

## What this app is

Cross-platform coffee-roasting log. Reimplementation of a legacy Windows FoxPro app (`cafe4`).
See `README.md` for structure and roadmap.

- Temperature comes from `src/sensors/` behind the `Sensor` interface. Only `MockSensor` exists
  today. Do **not** add native BLE/USB modules that break Expo Go while the app is mock-only —
  those wait for a custom dev build (roadmap phase 3).
- Backend is Supabase; every table is owner-scoped by RLS. Schema: `supabase/migrations/`.
- Data-fetching is `@tanstack/react-query` hooks in `src/db/`. Live-roast state is the zustand
  store in `src/roast/sessionStore.ts`.
- UI strings are zh-TW in `src/i18n/zh-TW.ts` — no hard-coded user-facing text elsewhere.
- Path alias: `@/*` → `src/*`, `@/assets/*` → `assets/*`.
