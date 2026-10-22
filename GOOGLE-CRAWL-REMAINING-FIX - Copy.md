# Google Search Console remaining asset errors

This update routes MyDramaWave poster URLs through HouseDrama's existing same-origin `/api/media?u=...` endpoint. It preserves the provider URL as the upstream target and uses the existing allowlist in `src/routes/api/media.ts`.

## Verify after deployment

1. Deploy this ZIP using the already-working Cloudflare build/deploy settings.
2. Open `https://house-drama.xyz/api/drama-trending` directly. It must return HTTP 200 and JSON (normally `{ "items": [] }` if there are no recorded views). If it errors, inspect Cloudflare Worker logs and the database binding/connection; code changes alone cannot repair missing production credentials.
3. In the homepage HTML, inspect the current stylesheet URL. The old `styles-O8vx01H7.css` URL in Search Console may be a cached/stale rendered version. Open the current CSS URL directly and confirm HTTP 200 with `text/css`.
4. Run Search Console's Live Test again. Google can continue showing third-party failures from an earlier crawl until it recrawls.

This ZIP does not claim the live API or CSS issue is fixed without checking the deployed responses. The MyDramaWave images are routed through the same-origin media proxy, but that proxy still depends on the upstream provider allowing Cloudflare's request.
