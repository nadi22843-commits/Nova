# Nova — current test build

Updated mobile-responsive web UI for phone testing through Render.

Changes:
- New light Nova home intro with the supplied robot artwork.
- Single global search field remains in the header.
- Premium photo category cards.
- Promo/ad slider constrained to responsive aspect ratio on phones.
- Two-column listing grid constrained to viewport width.
- Mobile bottom navigation: Home, Favorites, Publish, Messages, Profile.
- Added /messages overview and /location country/city entry point.
- Added a mobile Back control on non-home routes.
- Removed the oversized home Shorts/benefits blocks to reduce clutter.
- Added safe-area and narrow-screen rules for iPhone and Android widths.

Validation note:
- Source archive integrity is checked.
- Full npm typecheck/build could not complete in this environment because dependencies are not installed in the supplied archive; npm install timed out. Runtime must therefore be verified after Render installs dependencies and builds the app.
