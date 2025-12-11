# iOS Setup Guide (Idle Ants)

This repo is wired for Capacitor-based iOS builds. You'll need:

- macOS with Xcode installed
- Node.js + npm
- An Apple Developer account (for App Store distribution)

## 1. Install dependencies

From the project root:

```bash
npm install
```

This installs Vite, Capacitor, and related tooling.

## 2. Build the web app

```bash
npm run build
```

This produces the production build in `dist/`, which Capacitor will bundle.

## 3. Initialize Capacitor (first time only)

```bash
npm run cap:init
```

If you prefer a different bundle ID, replace `com.alankern.idleants` in:

- `package.json` `cap:*` scripts
- `capacitor.config.ts` `appId`

## 4. Add iOS platform and sync

```bash
npm run cap:ios
```

This will:

- Sync Capacitor configuration
- Create or update the `ios/` Xcode project
- Open the project in Xcode

If `npx cap open ios` does not open Xcode automatically, you can open the `ios/App/App.xcworkspace` manually.

## 5. Xcode configuration checklist

In Xcode, select the `App` target and configure:

- General:
  - Display Name: `Idle Ants` (or your choice)
  - Bundle Identifier: matches `capacitor.config.ts` `appId`
  - Version / Build: set as needed
  - Deployment target: choose your minimum iOS version
- Signing & Capabilities:
  - Team: your Apple Developer team
  - Automatically manage signing: enabled

UI / behavior:

- Force your desired orientation (likely landscape)
- Hide the status bar for full-screen gameplay
- Verify the webview is full-screen and respects safe areas

## 6. Game behavior on iOS

In the JS game, ensure:

- Touch / pointer events are the primary interaction (no desktop-only controls)
- The game listens for `visibilitychange` to pause when the app goes to background
- Audio is started only after a user tap (iOS requires a gesture to start audio)

## 7. App Store submission

High-level steps:

1. Create an App Store Connect app entry using the same bundle ID.
2. Archive and upload your build from Xcode (`Product > Archive`, then `Distribute App`).
3. Provide:
   - App name, subtitle, description
   - Keywords, category (Games > Simulation / Strategy, etc.)
   - Screenshots (iPhone and iPad if supported)
   - App icon and promotional assets
   - Privacy policy URL and data collection answers
4. Submit for review and respond to any feedback from Apple.
