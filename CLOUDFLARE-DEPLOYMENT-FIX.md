# Cloudflare deployment command fix

The Cloudflare build log showed `npm run build` generating `.vercel/output`, followed by `npx wrangler deploy` reading the root `wrangler.jsonc`. That root config's `main` points at `@tanstack/react-start/server-entry`, which is not a generated Worker entry point for this Cloudflare Vite-plugin build.

For the Git-connected Cloudflare project, set:

- Build command: `npm run build:cloudflare`
- Deploy command: `npx wrangler deploy --config dist/server/wrangler.json`
- Root directory: folder containing `package.json`

The ZIP's `deploy:cloudflare` and `preview:cloudflare` scripts have been updated to use the generated config. Production deployment is opt-in and uses a separate generated config with `house-drama.xyz` and `www.house-drama.xyz` custom domains. Before production deploy, configure Cloudflare secrets (especially `DATABASE_URL`) and test the workers.dev deployment.

This is a configuration correction based on the supplied build log, not proof of a successful live deployment. Build, database connection, playback, and live domain still need testing.
