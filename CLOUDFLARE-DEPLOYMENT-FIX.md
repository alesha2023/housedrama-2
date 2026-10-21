# Cloudflare deployment command fix

The Cloudflare build log showed `npm run build` generating `.vercel/output`, followed by `npx wrangler deploy` reading the root `wrangler.jsonc`. That root config's `main` points at `@tanstack/react-start/server-entry`, which is not a generated Worker entry point for this Cloudflare Vite-plugin build.

For the Git-connected Cloudflare project, set:

- Build command: `npm run build:cloudflare`
- Deploy command: `npx wrangler deploy --config dist/server/wrangler.json`
- Root directory: folder containing `package.json`

The ZIP's `deploy:cloudflare` and `preview:cloudflare` scripts have been updated to use the generated config. Production deployment is opt-in and uses a separate generated config with `house-drama.xyz` and `www.house-drama.xyz` custom domains. Before production deploy, configure Cloudflare secrets (especially `DATABASE_URL`) and test the workers.dev deployment.

This is a configuration correction based on the supplied build log, not proof of a successful live deployment. Build, database connection, playback, and live domain still need testing.


## Important: current diagnostics

- Configure the Git-connected Cloudflare build command as `npm run build:cloudflare`.
- Configure the deploy command as `npx wrangler deploy --config dist/server/wrangler.json`.
- Keep `DATABASE_URL` configured as a Cloudflare Worker secret/variable for the Production environment and verify it points to the existing Neon database. Never paste its value into logs or chat.
- Trending now distinguishes an API/database failure from a successful empty result. This is diagnostic UI, not proof that existing view records are present.
- The app stylesheet is preloaded to reduce unstyled flash; actual behavior still needs a live browser check.


 ## Trending, visitor counter, and refresh diagnostics
 - Build with `npm run build:cloudflare`; deploy with `npx wrangler deploy --config dist/server/wrangler.json`.
 - Keep the existing Neon `DATABASE_URL` secret in the Cloudflare Worker Production runtime. Do not create a new database or delete old visitor rows.
 - `/api/drama-trending` now avoids caching and returns HTTP 503 when the database read fails, instead of returning a misleading empty list.
 - The visitor counter uses the existing `housedrama_visitors` table and 90-second `last_seen` heartbeat window. A failed POST/GET still requires checking Cloudflare Worker logs and the existing Neon connection; code changes cannot repair a missing/wrong secret.
 - Test after deployment: open `/api/visitor-count` (should return `online`, `today`, `total`) and `/api/drama-trending` (should return `items`). If visitor endpoint returns 503, check Worker Production `DATABASE_URL` and runtime logs. If trending returns an empty `items` array with 200, there are no valid recorded rows for supported providers yet; watch an episode to create a view record.
 - A small critical dark CSS rule was added to reduce the unstyled flash while the main stylesheet loads; verify on a real mobile refresh.
 