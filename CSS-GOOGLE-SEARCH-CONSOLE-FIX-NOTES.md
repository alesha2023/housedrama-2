# HouseDrama — CSS Googlebot / Cloudflare build fix

## Perubahan
- Build Nitro sekarang memakai preset `cloudflare_module` untuk target Cloudflare Workers, bukan preset `vercel`.
- Menambahkan script `build:cloudflare` dan `deploy:cloudflare` agar proses build/deploy Cloudflare konsisten.
- Link stylesheet utama tetap memakai URL hasil build Vite (`src/styles.css?url`), sehingga nama CSS ber-hash dibuat oleh build dan ditautkan ke HTML oleh router.
- URL drama, rute aplikasi, desain, dan isi stylesheet tidak diubah.

## Cara menerapkan
1. Ekstrak ZIP ini dan unggah isinya ke repository GitHub yang benar.
2. Jalankan `npm install` lalu `npm run build:cloudflare`.
3. Pastikan build menghasilkan aset CSS dan konfigurasi Wrangler.
4. Deploy dengan `npm run deploy:cloudflare` atau jalankan perintah deploy yang sesuai pipeline Cloudflare proyek.
5. Setelah deployment, buka halaman utama dan periksa DevTools/Network atau akses URL CSS yang tampil pada HTML; pastikan respons `200` dan `Content-Type: text/css`.
6. Di Google Search Console, gunakan URL CSS yang gagal pada detail laporan lalu tekan **Uji URL yang dipublikasikan** / validasi setelah URL CSS mengembalikan `200`.

## Batas verifikasi
ZIP ini adalah perbaikan sumber. Build produksi dan pemeriksaan Googlebot belum dapat dinyatakan lulus dari lingkungan ini karena dependensi tidak terpasang dan belum dilakukan deployment. Jika error tetap muncul, URL CSS spesifik dari laporan Search Console perlu diperiksa terhadap respons HTTP aktif.
