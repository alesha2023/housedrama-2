# HouseDrama Step 27 — Alternate Drama Poster Fallback

Based on Step 26 Poster Retry & Fallback.

- Keeps the original poster retry and image-optimizer attempt.
- Remembers up to 24 poster URLs that successfully loaded in the current page session.
- If a poster still fails, uses another known-working drama poster from the same session.
- If no alternative poster is known or the alternative also fails, uses the local `/og-v2.jpg` banner.
- Does not change drama URLs, episode playback logic, SEO routes, or theme styles.

Validation: ZIP integrity checked. Vite build/typecheck not run because dependencies (`node_modules`) are not present in this environment.
