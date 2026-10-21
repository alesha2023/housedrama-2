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


## HouseDrama Trending / Visitor verification
- Build: `npm run build:cloudflare`; deploy: `npx wrangler deploy --config dist/server/wrangler.json`.
- Keep the existing Neon `DATABASE_URL` secret in the Cloudflare Worker runtime; do not create a new database.
- `/api/drama-trending` now uses `no-store`; database read failures return HTTP 503 instead of pretending trending is simply empty.
- Visitor count uses unique browser IDs in `housedrama_visitors`; `online` means a visitor heartbeat within the last 90 seconds. It is not a fabricated number.
- Verify production by opening `/api/visitor-count` and `/api/drama-trending`; check Cloudflare Worker logs if either returns an error. A ZIP alone cannot verify production secrets/database connectivity.
