# HouseDrama — fitur pengunjung dan SEO

## Fitur yang tersedia / dilengkapi
1. Lanjutkan Menonton: progres episode disimpan di browser dan ditampilkan di beranda.
2. Favorit / Drama Saya: daftar tontonan lokal tanpa wajib membuat akun.
3. Pencarian: pencocokan judul, judul alternatif, dan sinopsis; saran judul diambil dari hasil katalog yang cocok; status provider bermasalah tetap diberi pesan.
4. Drama serupa: rekomendasi dari metadata dan provider yang tersedia pada halaman detail.
5. Riwayat Menonton: daftar tontonan terakhir dengan progres.
6. Filter kategori/genre serta halaman Trending/Populer.
7. Episode berikutnya otomatis dengan sakelar yang tersimpan di browser, pilihan kecepatan dan subtitle tetap tersedia.
8. Pemulihan video: tombol coba lagi dan sumber/provider alternatif bila tersedia.
9. Drama/episode terbaru: landing page publik untuk pembaruan katalog.

## SEO
- Metadata Indonesia dan canonical untuk halaman publik Trending, Terbaru, Jelajahi, dan Kategori.
- Structured data `ItemList` pada landing page katalog publik.
- Halaman detail drama memakai metadata dinamis, canonical, `TVSeries`, dan breadcrumb.
- Sitemap mengutamakan halaman publik dan detail drama yang berhasil ditemukan dari katalog.
- Pencarian, daftar tontonan, riwayat, dan halaman pemutar episode tetap `noindex,follow` karena bukan landing page pencarian yang stabil.

## Batasan yang perlu diketahui
- Riwayat dan favorit tersimpan di browser perangkat tersebut; tidak tersinkron antarperangkat.
- Hasil rekomendasi, trending, dan episode terbaru bergantung pada data yang benar-benar dikembalikan API provider.
- Tidak ada jaminan peringkat Google. Setelah deploy, kirim `/sitemap.xml` ke Google Search Console dan inspeksi beberapa URL detail.
- Build/typecheck harus dijalankan setelah dependensi proyek terpasang lengkap. Pemeriksaan pada lingkungan kerja ini terhalang definisi tipe `node` dan `vite/client` yang tidak tersedia lengkap.
