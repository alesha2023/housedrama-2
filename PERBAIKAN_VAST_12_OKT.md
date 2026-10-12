# DramaLuma — Perbaikan Diagnostik VAST

Perubahan pada `src/components/drama/player.tsx`:

- Memastikan Google IMA SDK dipreload dan `AdDisplayContainer.initialize()` dipanggil secara sinkron dari interaksi tombol Play, penting untuk browser mobile.
- Tidak lagi menunggu pemuatan SDK setelah klik Play; bila SDK belum siap, pemain meminta pengguna menekan Play lagi setelah SDK siap.
- Memakai nama kunci sessionStorage versi `v2` agar flag lama dari deployment sebelumnya tidak melewati iklan pertama.
- Menampilkan pesan error IMA yang lebih spesifik (kode dan pesan) ketika tag gagal, tidak memberi respons, atau gagal memutar media.
- Mempertahankan perilaku fallback: jika permintaan iklan benar-benar gagal, konten drama dapat lanjut dan kegagalan tidak dihitung sebagai iklan selesai.
- Menetapkan dimensi slot berdasarkan ukuran player yang tersedia dan mengirim metadata judul/durasi.

## Catatan verifikasi

Build belum dijalankan karena dependensi proyek belum terpasang di lingkungan ini. Tag VAST dan ketersediaan iklan di akun HilltopAds juga belum dapat diverifikasi dari sini. Setelah deploy, pesan yang tampil di pemutar dan error di console akan membantu membedakan SDK gagal, tag kosong, timeout, atau tidak ada iklan yang tersedia.
