# HouseDrama SEO Step 6 — Playback availability guard

Base: HouseDrama-SEO-Step5-Performance.zip.

## Change
- The watch route no longer fabricates a fallback episode with `access: "open"` when the provider did not return the requested episode.
- If a requested episode is absent from the provider's detail response, the route shows an unavailable message rather than a fake playable episode.
- Existing drama URLs, provider IDs, stream adapters, ads, and previous SEO changes are retained.

## Verification
- ZIP integrity checked after writing.
- Production build/typecheck not run in this environment because project dependencies are not installed. Deploy only after running `npm ci`, `npm run typecheck`, and `npm run build` in the project environment.
