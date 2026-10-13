# HouseDrama — SEO Indonesia

Perubahan pada versi ini:
- Judul dan deskripsi halaman utama disesuaikan dengan pencarian drama China pendek subtitle Indonesia.
- Menambahkan metadata Open Graph dan Twitter Card untuk halaman utama dan detail drama.
- Menambahkan canonical URL untuk halaman utama dan setiap halaman detail drama.
- Memperbaiki metadata halaman detail agar judul/deskripsi mengikuti data drama yang tersedia, tanpa menumpuk kata kunci.
- Menandai halaman pencarian, daftar tontonan, riwayat, dan pemutar episode sebagai `noindex,follow` karena bukan landing page pencarian yang stabil.
- Sitemap tidak lagi menyertakan halaman pencarian, daftar tontonan, atau riwayat; halaman detail drama yang ditemukan dari katalog tetap ditambahkan secara dinamis.
- Mempertahankan fallback poster dari versi sebelumnya.

Tidak ada perubahan yang disengaja pada player, API provider, database, autentikasi, atau logika iklan.

Catatan: perubahan SEO tidak menjamin peringkat atau pengindeksan instan. Setelah deploy, kirim ulang `/sitemap.xml` di Google Search Console dan inspeksi beberapa halaman detail.
