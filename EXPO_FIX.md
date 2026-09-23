# Expo Go fix

- Mobile upgraded from Expo SDK 52 to SDK 57 dependency line.
- React / React Native / Expo companion packages aligned to SDK 57.
- Added clean-cache start and tunnel fallback.
- No files under apps/web, apps/api, packages/core, or apps/mobile/src were changed by this compatibility fix.
- package-lock.json was intentionally removed because it pinned SDK 52; `npm install` regenerates a consistent lockfile.
