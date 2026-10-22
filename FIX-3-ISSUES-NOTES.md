# HouseDrama audit and targeted fixes

Based on the user-provided `HouseDrama-SITEMAP-GSC-FIX.zip`. Original upload was not overwritten.

## 1. Refresh flash / HTML visible before CSS
- Put the local application stylesheet before the third-party font stylesheet in head ordering.
- Load Google Fonts asynchronously so a slow third-party font stylesheet does not delay the first styled paint.
- Add critical inline background, theme, social footer container, link, and SVG dimensions so the footer cannot briefly render at intrinsic/unbounded sizes before utility CSS loads.
- Removed the independent one-second CSS animation that could hide the boot splash before hydration is ready; splash removal remains controlled by the React timer.

## 2. Oversized Facebook/social icon
- Explicit critical CSS fixes social anchors to 40x40 and their SVG children to 20x20, including min/max sizes and flex sizing.
- SVG components retain explicit width/height attributes and inline styles.

## 3. Trending / view-count reliability
- Found a real tracking bug in the watch page: it wrote the sessionStorage "already viewed" flag before the POST request succeeded. If the API/database request failed once, the same visitor would not retry during that browser session.
- Changed tracking so a temporary pending flag prevents concurrent duplicate posts; the permanent per-session flag is written only after an HTTP-success response, and the pending flag is always removed after completion.
- The Trending page still shows catalog recommendations when recorded view counts are unavailable, and does not mislabel catalog fallback as verified view ranking.
- Real recorded-view rankings still require the production `DATABASE_URL`/Neon binding to be valid and writes to `/api/drama-trending` to return success. This archive cannot verify Cloudflare secrets or live database state.

## Validation status
- Source-level checks and ZIP integrity check only.
- A full TypeScript check, production build, live Cloudflare deployment, browser hard-refresh test, and live database write/read test have not been run in this environment.
