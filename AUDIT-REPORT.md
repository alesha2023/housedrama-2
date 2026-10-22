# HouseDrama final audit

Date: 2026-10-21, about 13:40 UTC. Source in this workspace. Production host intended: `https://house-drama.xyz`.

This audit did **not** deploy. The live site is still the older build. Google has not been checked in Search Console. The site is not claimed bug-free.

## Live site vs this source

| Check | Live `https://house-drama.xyz` | This source on the local server |
| --- | --- | --- |
| Homepage | HTTP 200, HTML about 585 KB | HTTP 200 |
| Canonical | `https://house-drama.web.id/` | `https://house-drama.xyz/` |
| `og:url` / `og:image` | `house-drama.web.id` | `https://house-drama.xyz` and `/og-v2.jpg` |
| JSON-LD WebSite + Organization | URLs on `.web.id`, logo `/logo.png` (870×196) | URLs on `.xyz`, logo `/icon-512.png` (512×512) |
| `theme-color` | `#b34bff` | `#07080b` |
| `/en` | HTTP 200 | HTTP 301 to `/` |
| Unknown provider `/drama/notaprovider/nope` | HTTP 500 | HTTP 404 |
| `house-drama.web.id` | HTTP 200, no `Location` | Redirect code exists, not deployed |
| `www.house-drama.xyz` | NOT TESTED this pass (no response captured) | Redirect function covered by unit test |
| `sitemap.xml` | Timed out after 20s, 0 bytes | HTTP body starts with `https://house-drama.xyz/` |
| `robots.txt` | HTTP 200, not the source file (Cloudflare content-signal text, 3259 bytes) | Source file, sitemap `https://house-drama.xyz/sitemap.xml` |

Favicon files on the **live** host returned HTTP 200 with image MIME types (`image/vnd.microsoft.icon`, `image/svg+xml`, `image/png` for `icon-512.png`). That does not mean Google has refreshed the icon.

## A. Logo and favicon (local files)

| File | Result |
| --- | --- |
| `public/favicon.ico` | PASS. ICO, 8108 bytes. Local `Content-Type: image/x-icon`. |
| `public/favicon.svg` | PASS. SVG, 522 bytes. Local `image/svg+xml`. Used by the header logo. |
| `public/favicon.png` | PASS. PNG 64×64. |
| `public/apple-touch-icon.png` | PASS. PNG 180×180. |
| `public/icon-192.png` | PASS. PNG 192×192. Linked as an icon. |
| `public/icon-512.png` | PASS. PNG 512×512. Organization `logo`. |
| `public/logo.png` | PASS as a wide wordmark (870×196). Not used as the structured-data logo. |
| `public/og-v2.jpg` | PASS. JPEG 1200×1200, 398597 bytes. Same bytes as `og.jpg`. |
| `public/site.webmanifest` | PASS. `application/manifest+json`. Name HouseDrama. Icons point at the files above. |
| Paths | PASS. Root-relative. No Vercel URL. |

`<head>` still also links `/__grok/manifest.webmanifest` because the app-builder shell requires that link. Brand icons are declared separately.

## B. SEO and domain (source)

| Check | Result |
| --- | --- |
| Canonical origin | PASS. Hardcoded `https://house-drama.xyz`. Not taken from `Host`. |
| Homepage title, description, OG, Twitter, hreflang en/id/x-default | PASS on local HTML. |
| Drama URL `/drama/{provider}/{seriesId}` | PASS. Unchanged. |
| Watch URL canonical | PASS in source. Points at the drama URL, not the episode URL. |
| JSON-LD | PASS. WebSite, Organization, ItemList on the homepage. No invented rating. `<` escaped. |
| `robots.txt` | PASS in source. Disallows `/admin`, `/api/`, `/history`, `/watchlist`, `/search`, and filtered query variants. |
| Sitemap | PASS locally. Apex URLs. `/en` omitted. |
| `/en` | PASS. 301 to `/`. |
| Unknown provider | PASS. 404, not a substitute drama. |
| Old-domain 301 | PASS as code and unit test. FAIL on the live hosts: still HTTP 200. Manual Worker deploy is still required. |
| Indexed URL changes | None in this pass. |

## C. Performance

| Check | Result |
| --- | --- |
| Main client bundle | Measured. `index` about 460 KB, `hls` about 575 KB in its own chunk. |
| Poster loading | PASS by code. Cards use lazy images. Hero first slide is eager. |
| One provider down | PASS by code. Catalog calls are isolated with `safe()` / `catch`. A failed provider does not throw the homepage away. |
| Poster proxy SSRF | PASS. `GET /api/poster?u=https://127.0.0.1/a.jpg` is HTTP 403. |
| Duplicate home request | The homepage loader loads the catalog once. `/api/drama-trending` is a second, different request for HouseDrama view counts. |
| LCP, INP, CLS | NOT TESTED. No Lighthouse run. |
| Stream URL expiry in a real player | NOT TESTED this pass. |
| Google font stylesheets | Still render-blocking. Left in place so the type does not shift. |

## D. Regression and deployment

| Check | Result |
| --- | --- |
| `npm install` | NOT RUN. Dependencies were already installed. |
| `npm run typecheck` | PASS. |
| `npx eslint src --quiet` | PASS after two lint fixes (empty `catch`, control character in an image URL check). |
| Drama, domain, and SEO tests | PASS. 16/16. |
| Full `npm test` | NOT RE-RUN as one command this pass. Two older Grok PWA plugin tests were already failing on an unrelated card-host expectation. |
| `npm run build:cloudflare` | PASS. `nodejs_compat`, compatibility date `2026-10-21`. |
| TanStack Start | PASS. `1.168.60`. |
| Local homepage, search, categories | PASS. Search HTTP 200. Categories canonical `https://house-drama.xyz/categories`. |
| Local episode player | PASS in the previous UI pass (video element, no console error). Not repeated after the lint-only edit. |
| Browser desktop and mobile homepage | PASS in the previous UI pass. No horizontal overflow, no console errors. Not repeated this pass. |
| `GET /api/visitor-count` | PASS locally. JSON `{"total":3,"today":3,"online":0}`. This is the local database, not production Neon. |
| Production Neon | NOT TESTED. `DATABASE_URL` is not in this workspace. `.env` was not created. |
| Admin | PASS by code review. Login returns null unless both `DRAMA_ADMIN_PASSWORD` and `DRAMA_ADMIN_SECRET` are set. Comparison is length-checked and timing-safe. Page is `noindex`. Direct HTTP login was not called. |
| Cloudflare deploy of this source | NOT DONE. |
| Wrangler dry-run | NOT RUN this pass. |

## Fixes in this pass

- `src/lib/drama/images.ts`: same unsafe-URL check, without a control character in the regex. Image tests still pass.
- `src/lib/app-data/client.server.ts`: empty `catch` now has a comment so lint passes. Behavior unchanged.

## Still open

1. Deploy this source. Until then, Google still sees `house-drama.web.id` canonicals on the live apex.
2. Put the legacy redirect Worker on `house-drama.web.id`, and the apex redirect for `www.house-drama.xyz`. Confirm with `curl -sI` after deploy. Do not assume it from this report.
3. Set `DATABASE_URL`, `DRAMA_ADMIN_PASSWORD`, and `DRAMA_ADMIN_SECRET` as Worker secrets. Do not ship them in the ZIP.
4. Submit the new sitemap in Search Console after the new HTML is live. Indexing is not instant.
5. `velolo` (`/api/get-home` HTTP 500), `moboreels` (HTTP 502), and `playlet` (HTTP 502 on this probe) are still visible and can fail a section. They do not take the whole site down.
6. Hidden providers listed in the API report are still hidden, not deleted.
7. Live `robots.txt` does not match this source. Recheck after deploy. Cloudflare may prepend its own content-signal block.
8. Live sitemap timed out. Recheck after deploy.
9. Subtitle position (20px, lower-middle on phones) is a CSS change and was not re-measured in a playing video this pass.
