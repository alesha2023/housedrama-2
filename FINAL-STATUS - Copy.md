# HouseDrama final package

This archive is the working source after the upgrades in this project. It is not a claim that house-drama.xyz has been redeployed.

Included:

- Dark pink and black theme (`#09090D`, `#FF2D8D`)
- Share card at `public/og.jpg`, 1200×630
- Provider catalog routes for FlexTV (`/get-hot`), Velolo (`/get-list`), and Shortmax (`/get-hot`)
- Picker order with working catalogs first and failed catalogs last
- Drama URLs, provider IDs, Neon usage, and Cloudflare config left in place

Checked on 21 October 2026 in this workspace:

| Check | Status |
|---|---|
| Drama unit tests (images, catalog routes, SEO, proxy, audience) | PASS 12/12 |
| `tsc --noEmit` | PASS |
| `@tanstack/react-start` | 1.168.60 |
| Production build | NOT RUN |
| Browser playback | NOT RUN |
| Live domain deploy | NOT RUN |

Do not commit `.env`. Copy `.env.example` and set the Neon and Cloudflare secrets before deploy.
