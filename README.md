# HouseDrama

Catalog of Chinese and Asian short dramas. Production domain: `https://house-drama.xyz`.

Drama URLs are unchanged:

- `/drama/{provider}/{seriesId}`
- `/watch/{provider}/{seriesId}/{episodeId}`

## Scripts

- `npm run dev` — local preview
- `npm run build` — Vercel/Nitro build used by this workspace's preview tooling
- `npm run build:cloudflare` — Cloudflare Workers build (`@cloudflare/vite-plugin`)
- `npm run deploy:cloudflare` — build, then `wrangler deploy`
- `npm run typecheck` / `npm test`

See `CLOUDFLARE-DEPLOY-GUIDE.md` before deploying. Do not commit `.env`.
