# HouseDrama — perbaikan poster

Perubahan pada versi ini:
- Komponen poster mencoba endpoint gambar alternatif `images.weserv.nl` satu kali jika URL poster melalui `wsrv.nl` gagal.
- Jika gambar tetap gagal, komponen menampilkan placeholder HouseDrama yang rapi, bukan ikon gambar rusak browser.
- Menambahkan `decoding="async"` dan `referrerPolicy="no-referrer"` pada gambar poster.

Tidak ada perubahan pada logika player, sumber API drama, database, autentikasi, iklan, atau sitemap.

Catatan: fallback endpoint gambar perlu diuji di deployment karena keberhasilan gambar bergantung pada ketersediaan host gambar dan URL sumber dari provider.
