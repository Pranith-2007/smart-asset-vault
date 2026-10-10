# Steps to open locally:
# Smart Asset Vault

A secure mobile application for digital asset management and identity protection.

## Repository

GitHub: https://github.com/Pranith-2007/smart-asset-vault

## Prerequisites

Before running the project, install:

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [Git](https://git-scm.com/downloads)
- [Expo Go](https://expo.dev/go) on an Android phone (optional)

## How to Run the Project

### 1. Clone the repository

Open a terminal and run:

```bash
git clone https://github.com/Pranith-2007/smart-asset-vault.git
```

### 2. Open the project folder

```bash
cd smart-asset-vault
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npx expo start
```

### 5. Open the application

**Option A — Android phone**

1. Install Expo Go from the Google Play Store.
2. Connect your phone and computer to the same Wi-Fi network.
3. Scan the QR code displayed in the terminal using Expo Go.

**Option B — Web browser**

If web support is configured, start the web version with:

```bash
npx expo start --web
```

Then open the local URL displayed in the terminal.

## Troubleshooting

If the app does not load, try restarting Expo with a cleared cache:

```bash
npx expo start --clear
```

Ensure that dependencies are installed and that your phone and computer can communicate over the network.

## Development Status

The application is under active development. Features, integrations, and setup requirements may change as development progresses.



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
