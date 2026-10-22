# Checklist migrasi SEO Google

Domain yang dituju: `https://house-drama.xyz`.

Pemeriksaan langsung pada 2026-10-21 sekitar 13:40 UTC: **situs yang sedang online belum memakai source ini.** Canonical live masih `https://house-drama.web.id/`. Jangan anggap Google sudah pindah domain.

## Yang sudah benar di source (belum tentu di server live)

- Canonical, Open Graph, Twitter, hreflang, sitemap, dan JSON-LD memakai `https://house-drama.xyz`.
- Origin tidak diambil dari header `Host`.
- `/en` mengirim 301 ke `/` (teruji di server lokal).
- URL drama tetap `/drama/{provider}/{seriesId}`.
- URL tonton tetap `/watch/{provider}/{seriesId}/{episodeId}`, `noindex`, canonical ke halaman drama.
- Provider tidak dikenal mengirim 404, bukan judul pengganti.
- JSON-LD: `WebSite`, `Organization` (logo `/icon-512.png`), `ItemList`, `BreadcrumbList`, `TVSeries` hanya jika datanya ada. Tidak ada rating palsu.
- `robots.txt` source melarang `/admin`, `/api/`, `/history`, `/watchlist`, `/search`.

## Yang masih harus dikerjakan manual

1. Deploy source ini ke Worker produksi. Sampai itu, Google tetap melihat canonical `.web.id`.
2. Deploy Worker terpisah `workers/legacy-domain-redirect.js` hanya di zona `house-drama.web.id` (`wrangler.legacy.jsonc`). Jangan menaruh domain `.xyz` di Worker itu.
3. Pastikan `www.house-drama.xyz` juga 301 ke apex. Fungsi redirect sudah ada. Respons live `www` **tidak** terverifikasi pada audit ini.
4. Setelah deploy, uji sendiri:

```bash
curl -sI "https://house-drama.xyz/"
curl -sI "https://www.house-drama.xyz/"
curl -sI "https://house-drama.web.id/drama/freereels/LSjOzwuyTG?ref=g"
curl -sI "https://house-drama.xyz/en"
curl -sI "https://house-drama.xyz/sitemap.xml"
curl -s "https://house-drama.xyz/robots.txt"
```

Harapan setelah deploy: apex `200` dan canonical `.xyz`. `www` dan `.web.id` satu `301` dengan path serta query yang sama. `/en` satu `301` ke `/`. Sitemap memuat `https://house-drama.xyz/`.

5. Search Console untuk properti domain baru:
   - Tambah properti `house-drama.xyz`.
   - Kirim `https://house-drama.xyz/sitemap.xml` hanya setelah HTML live sudah canonical `.xyz`.
   - Pakai alat penggantian alamat hanya jika properti lama `house-drama.web.id` sudah terverifikasi dan 301-nya sudah hidup.
   - Pantau cakupan, halaman dikecualikan, dan soft 404. Tidak ada janji indexing instan.
6. Favicon dan logo di hasil Google mengikuti jadwal crawl. File ikon lokal valid. Itu tidak membuktikan ikon sudah tampil di Google.
7. `robots.txt` live saat ini bukan file source (teks content-signal Cloudflare, 3259 byte). Periksa lagi setelah deploy.
8. Sitemap live waktu audit habis waktu 20 detik tanpa byte. Periksa lagi setelah deploy.

## Jangan dilakukan

- Jangan mengganti ID atau slug drama yang sudah terindeks.
- Jangan menaruh rating, jumlah ulasan, atau tanggal rilis yang tidak ada di data provider.
- Jangan mengarahkan canonical dari header `Host`.
