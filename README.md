# Smart Asset Vault (frontend, stage 1)

Expo SDK 57, React Native, TypeScript, Expo Router. Android-first. No backend yet.

## Run
```bash
npm install
npx expo start          # then press "a" with an Android emulator or device running Expo Go
npm run typecheck
```
If Expo Go on your device doesn't support SDK 57 yet, build a development client:
`npx expo run:android` (needs Android Studio / SDK) or `npx eas-cli@latest build --profile development --platform android`.

## Where things live
- `src/app`       routes only (Expo Router)
- `src/components` reusable UI (Button, Field, Entry/Register, Dial, States, Sheets, Toast...)
- `src/theme`     design tokens: colour, type, space, radius
- `src/domain`    types, selectors, security-check logic (pure, no UI)
- `src/state`     React context: preview session, vault store, security preferences
- `src/services`  the backend seam: `VaultRepository` + `AuthService` interfaces
- `src/data/mock` MOCK ONLY: fixtures and the in-memory repository

## Connecting Supabase later
1. Write `supabaseVaultRepository` implementing `VaultRepository` and a Supabase `AuthService`.
2. Change the two exports in `src/services/index.ts`.
3. Replace `state/session.tsx` with a real session provider.
4. Delete `src/data/mock` and the "Preview tools" section of the profile screen.
Only the public anon key belongs in the app (`.env.example`).
