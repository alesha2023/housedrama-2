# Perubahan iklan HouseDrama

- Monetag direct link tetap dipakai saat pengguna membuka/memilih episode dan saat menekan tombol lanjut setelah transisi otomatis.
- Adsterra Social Bar hanya dimuat pada halaman daftar drama/home (src/routes/index.tsx), tidak dipasang pada layout root atau halaman menonton. Saat meninggalkan halaman daftar, elemen script dihapus; tampilan pihak ketiga yang sudah dibuat script tetap perlu diuji pada navigasi SPA.
- Adsterra Popunder script diminta pada setiap transisi episode ke-3 menggunakan penghitung localStorage.
- Penghitung Adsterra tersimpan di browser, sehingga tidak reset setiap kali halaman dimuat ulang.
- Browser popup restrictions dan frequency cap Adsterra dapat memengaruhi apakah Popunder benar-benar ditampilkan pada transisi yang diminta. Ini tidak bisa dijamin hanya dari kode website.
- Desain player, subtitle, dan logika streaming tidak diubah.
