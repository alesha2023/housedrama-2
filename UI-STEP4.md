# HouseDrama Step 4 — Premium UI

Dark cinematic catalog. Black field, crimson accent (`#e11d3a`), Playfair display titles, Inter UI text. Light theme remains on the existing theme switch. No sample catalog data was added. URL patterns, providers, SEO head tags, admin, watchlist, and history are unchanged.

## What changed

- Homepage hero uses live catalog titles and posters, with a film-still shade, featured rail, and red play action.
- Header: desktop search entry, 44px icon targets, active nav underline, compact logo on very narrow screens.
- Rails, grids, search, categories, discover, latest, and trending share the same 2:3 poster cards, two-line titles, and tag chips.
- Drama detail keeps synopsis, metadata, episode grid, and related rails. Poster stays 2:3 beside the title on small screens.
- Loading state is a hero bar plus poster skeletons, with a text status for assistive tech.
- Empty and error states stay readable and wrap instead of overflowing.
- Mobile subtitles are 13px, transparent background, wrapped (not clipped). Desktop captions are 16px.
- Hover zoom stays inside the poster so cards do not jump.

## Checks

- `npm run typecheck` passed.
- Drama regression tests passed (images, proxy guard, provider routes, SEO origin): 11/11.
- `npm run build` passed. TanStack Start is 1.168.60.
- Browser: homepage desktop and mobile rendered real posters and titles, no horizontal overflow, no console errors.
- Search, categories, drama detail, and the player route were opened against live catalog URLs.
- Two pre-existing Grok PWA plugin tests still fail (og card host expectation). They are unrelated to this UI pass.
