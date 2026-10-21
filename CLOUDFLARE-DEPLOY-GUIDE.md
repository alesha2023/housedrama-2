# Deploy HouseDrama ke Cloudflare Workers

Domain target: `https://house-drama.xyz`.

Panduan resmi yang diikuti: [TanStack Start di Cloudflare Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start/) (halaman itu terakhir diperbarui 13 Oktober 2026).

**Status audit 2026-10-21:** `npm run build:cloudflare` lulus pada source ini. Deploy source ini **tidak** dijalankan dari audit. `wrangler deploy --dry-run` **tidak** diulang pada audit final.

Situs `https://house-drama.xyz` sudah menjawab lewat Cloudflare (HTTP 200), tetapi HTML-nya masih build lama: canonical `https://house-drama.web.id/`. Mengunggah ZIP ini tidak otomatis mengganti situs itu. `house-drama.web.id` masih HTTP 200, bukan 301.

## Yang dipakai

| Bagian | Nilai |
| --- | --- |
| Plugin | `@cloudflare/vite-plugin`, `cloudflare({ viteEnvironment: { name: "ssr" } })` |
| Entry | `main`: `@tanstack/react-start/server-entry` |
| Compatibility date | `2026-10-21` |
| Flag | `nodejs_compat` |
| Aset | `dist/client`, dihasilkan plugin, bukan situs statis |
| Config aman | `wrangler.jsonc` — tanpa custom domain |
| Config domain | `wrangler.production.jsonc` — baru dipakai saat Anda sengaja menautkan domain |

`npm run dev` tetap Vite di port 8080 untuk preview. Jangan menggantinya dengan Wrangler.

`npm run build` tetap build workspace (Nitro) plus migrasi lokal. Itu bukan artefak Worker. Yang di-deploy adalah `npm run build:cloudflare`.

`vercel.json` dihapus. Preset Nitro `vercel` sengaja dibiarkan untuk `npm run build` workspace, karena middleware `server/` (halaman install) hanya terpasang lewat itu. Jangan menjalankan hasil build itu di Vercel.

## 1. Build

```bash
npm install
npm run build:cloudflare
```

Hasil: `dist/client` dan `dist/server`. Worker tetap SSR. Ada route API, proxy media/poster, dan klien Neon HTTP.

Di build Cloudflare, `@electric-sql/pglite` diganti stub. PGLite (WASM, memori sementara) hanya untuk preview lokal. Worker menolak memakainya.

## 2. Secrets

Jangan taruh secret di `wrangler.jsonc` atau di git. File contoh: `.env.example`.

```bash
npx wrangler secret put DATABASE_URL
npx wrangler secret put DRAMA_ADMIN_PASSWORD
npx wrangler secret put DRAMA_ADMIN_SECRET
```

`DATABASE_URL` adalah connection string Neon. Worker memakai `@neondatabase/serverless` lewat HTTP (`neon().query(text, params)`), bukan driver `pg` TCP.

`HOUSEDRAMA_REQUIRE_DATABASE=1` sudah ada di `vars`. Kalau `DATABASE_URL` kosong, query melempar error. Tidak ada fallback diam-diam ke database sementara.

Opsional, hanya jika host provider diganti:

```bash
npx wrangler secret put ANYREEL_API_URL
npx wrangler secret put DRAMABOX_API_URL
npx wrangler secret put FREEREELS_API_URL
npx wrangler secret put XAI_API_KEY
```

Untuk `wrangler dev` lokal, salin `.env.example` menjadi `.dev.vars` dan isi di mesin Anda. Jangan commit `.dev.vars`.

## 3. Database

Jangan menjalankan migrasi yang menghapus atau mereset schema. Audit ini tidak terhubung ke Neon dan tidak mengubah data.

`npm run db:migrate` memakai `pg` dari mesin yang bisa membuka TCP. Jalankan hanya jika Anda menambah file `migrations/*.sql`, dan hanya dari komputer Anda. Jangan menjalankannya di dalam Worker.

Tabel statistik drama memakai `CREATE TABLE IF NOT EXISTS`. Itu tidak menghapus baris yang sudah ada.

Query lewat `getSql()` memakai placeholder `$1`, `$2`, bukan string yang digabung.

Better Auth di `src/lib/auth/server.ts` masih memakai pool `pg` untuk mode Node/preview. Modul itu tidak masuk jalur katalog HouseDrama. Jangan mengaktifkan auth Better Auth di Worker sebelum pool itu diganti ke driver HTTP. Default aplikasi ini tidak mengimpor modul tersebut.

## 4. Preview tanpa menyentuh domain

```bash
npm run deploy:cloudflare
```

Perintah itu memakai `wrangler.jsonc` dan subdomain `workers.dev` saja. Tidak memasang `house-drama.xyz`.

Dry-run di audit ini selesai tanpa akun dan tanpa upload. Tidak ada URL `workers.dev` yang bisa dibuka, karena deploy tidak dijalankan.

## 5. Menautkan house-drama.xyz

Lakukan ini hanya setelah secret Neon terpasang dan Anda memang ingin domain live pindah.

Zona `house-drama.xyz` harus sudah berada di akun Cloudflare yang sama.

```bash
npm run deploy:production
```

Itu menjalankan `wrangler deploy --config wrangler.production.jsonc`, yang meminta custom domain:

- `house-drama.xyz`
- `www.house-drama.xyz`

Kalau Wrangler menolak route karena zona belum ada, deploy dulu tanpa file production, lalu pasang domain dari dashboard Workers → Settings → Domains.

Cek:

```bash
curl -sI https://house-drama.xyz | head
```

Harus HTML aplikasi, bukan 301 ke dirinya sendiri. Audit ini **tidak** menjalankan curl itu terhadap domain live.

## 6. Domain lama

`workers/legacy-domain-redirect.js` mengirim **301** ke `https://house-drama.xyz` dengan path dan query yang sama. Deploy sebagai Worker **terpisah** di zona `house-drama.web.id`:

```bash
npx wrangler deploy --config wrangler.legacy.jsonc
```

Ini belum di-deploy dan belum diuji. Jangan memasang skrip redirect itu pada `house-drama.xyz`.

## 7. Log dan rollback

```bash
npx wrangler tail
npx wrangler deployments list
npx wrangler rollback
```

Rollback mengembalikan versi Worker sebelumnya. Data Neon tidak ikut ter-rollback.

Kalau domain salah terpasang, lepas custom domain dari dashboard, atau deploy ulang `wrangler.jsonc` yang tidak berisi `routes`. Melepas domain tidak menghapus database.
