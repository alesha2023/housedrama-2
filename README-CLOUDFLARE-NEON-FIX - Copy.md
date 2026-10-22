# HouseDrama Cloudflare + Neon repair

Changes in this archive:
- Replaced the node-postgres `Pool` path in `src/lib/db.ts` with `@neondatabase/serverless`, which is designed to connect to Neon from serverless/edge runtimes such as Cloudflare Workers.
- Cached per-isolate creation of the visitor and drama-view tables so each request does not issue `CREATE TABLE IF NOT EXISTS`.
- Replaced the visitor counter's permanent `...`/hidden state on API failure with a clear temporary-unavailable message. It never fabricates counts.
- Kept the existing routes and drama URLs unchanged.

## Deployment note
`@neondatabase/serverless` was added to `package.json`. This environment could not reach npm registry to regenerate a lockfile or run a full production build, so this archive is source-edited but **not build-verified**. Before production deployment, run `npm install` (which generates a fresh package-lock.json), then `npm run typecheck` and `npm run build`. Set `DATABASE_URL` as a **Secret** in the Cloudflare Worker Production environment, using a rotated Neon password/connection string. Never commit the connection string.
