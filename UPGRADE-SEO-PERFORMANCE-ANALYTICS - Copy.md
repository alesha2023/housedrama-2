# HouseDrama SEO, performance, and analytics upgrade

Date: 2026-10-21. The live workspace was kept. It is newer than `HouseDrama-FINAL-Cloudflare-house-drama.xyz.zip` because it already has the dark-cinema share image and the mobile subtitle position. That ZIP was not extracted over the app and was not overwritten.

No visitor rows were deleted. Drama and episode URLs are unchanged. The share image is not drawn on the homepage.

## Changes

| File | Change |
| --- | --- |
| `src/lib/drama/server/audience.ts` | Reads real visitor and drama-view counts. Creates `housedrama_visitor_days` only if missing. |
| `src/lib/drama/server/audience-dates.ts` | Builds the 30-day axis. A missing day stays 0. |
| `src/lib/drama/server/audience.test.ts` | Checks that date fill. |
| `src/routes/api/visitor-count.ts` | After the existing upsert, stores one daily row. If that insert fails, the old counter still returns. |
| `src/lib/drama/server/admin.ts` | The admin snapshot adds the audience report, or null if the database read fails. |
| `src/routes/admin.tsx` | Password-gated panel: totals, 30-day bars, most-watched dramas. |
| `src/components/drama/shell.tsx` | One visitor POST. The extra GET on the same tick was removed. |
| `src/routes/api/drama-trending.ts` | The public list may be cached for 30 seconds. Writes stay uncached. |
| `src/routes/drama/$provider/$seriesId.tsx` | A drama with no poster shares `/og.jpg`, not a fake poster. |
| `package.json` | The audience date test is included in `npm test`. |

## SEO

Left as already implemented: canonical `https://house-drama.xyz`, per-page titles, English as the default, `/en` redirecting to `/`, drama URLs `/drama/{provider}/{seriesId}`, watch pages `noindex` with a canonical back to the drama, sitemap on the production origin, and robots that allow CSS and JavaScript while disallowing `/admin`, `/api/`, `/history`, `/watchlist`, and `/search`.

JSON-LD remains WebSite, Organization, ItemList, BreadcrumbList, and TVSeries only after a drama loads. No rating, actor, or duration was invented. VideoObject was not added because duration and upload date are not stored.

The share image is `public/og.jpg`, 1200×630. `public/og-image.png` is the same artwork. Drama posters stay on their own images.

This pass did not deploy. An earlier live check still showed canonical `house-drama.web.id`. The old-domain 301 is in code only until `wrangler.legacy.jsonc` is deployed on that host.

## Performance

Posters stay lazy except the first hero image, which stays eager. The 2:3 ratio is unchanged. The player chunk is still separate. Visitor counting no longer sends a GET and a POST together, and a failed write does not block the page. Trending JSON may be cached for 30 seconds. Lighthouse was not run, so no Core Web Vitals score is claimed.

## Analytics

| Metric | Meaning |
| --- | --- |
| Unique visitors | Rows in `housedrama_visitors`. Old rows kept. |
| Visited today | Ids whose latest visit date is today in Asia/Jakarta. |
| Online | `last_seen` within 90 seconds. |
| Unique, 7 and 30 days | Distinct ids in the new daily log only. |
| Daily bars | `housedrama_visitor_days`. Days before the first stored day were not recorded. A zero is not proof of an empty day in the past. |
| Most watched | One increment per watch-page open. Not unique viewers. Catalog trending is unchanged. |
| Page views | Not stored. The panel says so. |

No IP is saved. No sample numbers are shown. `/admin` shows a login form until the password is accepted. There is no default password. Set `DRAMA_ADMIN_PASSWORD` and `DRAMA_ADMIN_SECRET`.

The new table is `CREATE TABLE IF NOT EXISTS`. No destructive migration.

## Tests

| Test | Status | Result | Next step |
| --- | --- | --- | --- |
| `tsc --noEmit` | PASS | No type errors. | — |
| ESLint on edited source | PASS | No errors. | — |
| Audience date unit test | PASS | Missing days stay 0. | — |
| Site, image, proxy, domain, and SEO contract tests | PASS | 15 checks. | — |
| `npm run build:cloudflare` | PASS | Client and SSR bundles built. | — |
| Homepage HTML | PASS | HTTP 200. The share banner is not in the page. | — |
| `POST /api/visitor-count` | PASS | Local JSON total 4. A second post did not increase it. | Repeat on production Neon after deploy. |
| `GET /api/drama-trending` | PASS | HTTP 200, cache 30 seconds. | — |
| `/admin` without a token | PASS | Login form only. | — |
| Admin panel with a real password | NOT RUN | No admin secret in this workspace. | Sign in after secrets are set. |
| Production Neon | NOT RUN | No production database URL here. | Open `/admin` after deploy. |
| Live canonical and old-domain 301 | NOT RUN this pass | Earlier live HTML still used `house-drama.web.id`. Code tests pass. | Deploy, then check with curl. |
| Lighthouse | NOT RUN | No lab score. | Run PageSpeed after deploy. |
| Full `npm test` | NOT RUN | Older unrelated PWA plugin tests were already failing. | Do not treat that suite as a pass. |
| Browser screenshots | NOT RUN this pass | The share image was removed from the homepage markup. | Confirm the preview no longer shows that card. |

## Deploy

```bash
npm install
npm run build:cloudflare
npx wrangler secret put DATABASE_URL
npx wrangler secret put DRAMA_ADMIN_PASSWORD
npx wrangler secret put DRAMA_ADMIN_SECRET
npx wrangler deploy --config wrangler.production.jsonc
```

Use `wrangler.legacy.jsonc` only on `house-drama.web.id`. No manual SQL. The daily table is created on the first successful visit write. After deploy, check `/`, `/sitemap.xml`, `/robots.txt`, `/og.jpg`, one drama page, and `/admin`.
