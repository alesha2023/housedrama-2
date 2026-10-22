# Hasil pengujian Cloudflare — 2026-10-21

Tidak ada deploy. Domain `house-drama.xyz` tidak dihubungkan dan tidak dicek sebagai situs live.

| Pemeriksaan | Hasil |
| --- | --- |
| `npm run build:cloudflare` | PASS. Client dan server SSR terbentuk. Neon HTTP ada di bundle (`serverless-*.js`). PGLite asli tidak ikut; yang ada `pglite-workers-stub`. |
| `dist/server/wrangler.json` | PASS. `compatibility_date` 2026-10-21, `nodejs_compat`, `assets` ke `../client`, var `HOUSEDRAMA_REQUIRE_DATABASE=1`. Tidak ada custom domain. |
| `npx wrangler deploy --dry-run` | PASS. Wrangler membaca 56 file aset, total upload sekitar 2923 KiB. Keluar sebelum upload. Binding yang terlihat hanya `HOUSEDRAMA_REQUIRE_DATABASE`. |
| `npm run deploy:production` | NOT RUN. File `wrangler.production.jsonc` berisi custom domain, tetapi perintahnya tidak dijalankan supaya domain live tidak berubah. |
| `npx tsc --noEmit` | PASS. |
| ESLint pada file yang diubah di tahap ini (`db.ts`, stub, `vite.config.ts`) | PASS. |
| `npx eslint . --quiet` | FAIL, 3 error lama, bukan dari perubahan adapter: `public/sw.js` (`importScripts`), `src/lib/app-data/client.server.ts` (blok kosong), `src/lib/drama/images.ts` (regex `\x09`). |
| Tes drama (gambar, proxy, route parser) | PASS. 8 lulus. |
| `wrangler dev` / smoke HTTP di workers.dev | NOT TESTED. Butuh akun Cloudflare dan deploy. |
| Koneksi Neon, migrasi, visitor count, view count terhadap database sungguhan | NOT TESTED. `DATABASE_URL` tidak ada di lingkungan ini, dan tidak dibuat secret. |
| Redirect `house-drama.web.id` | NOT TESTED. Tidak di-deploy. |

`npm test` penuh tidak diulang di tahap ini. Tahap sebelumnya: 196 lulus, 2 gagal di `scripts/grok-pwa-plugin.test.mjs` (URL `og.grok.me`), di luar adapter Cloudflare.
