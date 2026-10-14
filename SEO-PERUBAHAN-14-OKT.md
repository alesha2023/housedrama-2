# Perubahan SEO HouseDrama — 14 Oktober 2026

Perubahan diterapkan pada proyek yang diberikan, tanpa mengubah player, integrasi provider/API, iklan, logo, desain utama, atau ukuran subtitle.

## Yang diperbarui
- Sitemap menggunakan domain produksi `https://house-drama.web.id`, memuat halaman navigasi publik dan URL detail drama yang ditemukan pada katalog beranda saat sitemap diminta.
- `robots.txt` menunjuk ke sitemap absolut di domain produksi.
- Structured data `WebSite` dan `Organization` ditambahkan pada layout utama.
- Metadata halaman detail tetap memakai judul, deskripsi, canonical, poster dan OG tags yang disesuaikan dengan data drama; halaman detail yang tidak berhasil mendapat data tidak diberi instruksi untuk diindeks.
- Structured data `BreadcrumbList` dan breadcrumb navigasi ditambahkan pada halaman detail drama.
- Footer mendapatkan tautan internal tambahan ke Jelajahi, Terbaru, Tren, Kategori, dan Shorts.
- Poster non-prioritas tetap lazy-loaded; gambar prioritas diberi `fetchPriority="high"`.
- Fallback pencarian berdasarkan kecocokan judul yang sudah ada pada proyek dipertahankan.

## Pemeriksaan
- Pemeriksaan statis pada perubahan yang ditambahkan dilakukan.
- Build/typecheck belum dapat dipastikan karena instalasi dependensi `npm ci` tidak selesai dalam lingkungan ini.
- Suite skrip yang tersedia dijalankan: 181 lulus, 16 gagal. Kegagalan yang terlihat terkait file dokumentasi `.grok/skills/og/...` yang tidak disertakan pada ZIP dan konfigurasi lingkungan `with-app-env`, bukan pengujian khusus perubahan SEO. Karena dependensi tidak lengkap, proyek belum boleh dianggap lolos build.

## Batasan sitemap
Sitemap dinamis memasukkan drama yang tampil di katalog beranda ketika endpoint sitemap dipanggil. Ini bukan crawler menyeluruh atas seluruh halaman/provider yang belum muncul pada katalog beranda. Google tetap menentukan halaman mana yang diindeks dan sitelinks apa yang ditampilkan.
