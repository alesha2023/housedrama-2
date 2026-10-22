# HouseDrama Cloudflare deploy fix

## Perubahan
- Nitro preset di `vite.config.ts` diubah dari `vercel` menjadi `cloudflare_module`.
- Script `build:cloudflare` menjalankan build aplikasi.
- Script `deploy:cloudflare` memakai konfigurasi hasil build `.output/server/wrangler.json`, bukan `dist/server/wrangler.json`.

## Cara pakai
1. Pastikan package manager menginstal dependency dari `package-lock.json` (`npm ci`).
2. Jalankan `npm run build:cloudflare`.
3. Pastikan `.output/server/wrangler.json` ada.
4. Jalankan `npm run deploy:cloudflare`.

Jangan mengisi `dist/server/wrangler.json` secara manual. Jika build tidak menghasilkan `.output/server/wrangler.json`, hentikan deploy dan periksa log build/preset Nitro.

Catatan: ZIP ini berisi perubahan source, tetapi build produksi belum dijalankan di lingkungan ini karena dependency belum terinstal. Pastikan variabel environment Cloudflare/Neon sudah diatur di dashboard sebelum deploy.
