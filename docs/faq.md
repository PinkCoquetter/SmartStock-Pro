# FAQ (Frequently Asked Questions) - SmartStock Pro

**1. Apakah SmartStock Pro membutuhkan internet untuk dijalankan?**
Ya dan Tidak. Karena ini adalah prototype berbasis Single Page Application, data tersimpan di LocalStorage (browser). Namun, untuk menampilkan peta Leaflet dan pustaka ekspor (Chart.js, PapaParse) yang ditarik dari CDN, diperlukan koneksi internet saat pertama kali dimuat.

**2. Data produk saya hilang setelah membuka aplikasi di komputer lain. Kenapa?**
Data saat ini disimpan di *Local Storage* browser spesifik pada komputer yang digunakan. Data tidak akan tersinkronisasi antar perangkat (dalam versi prototype ini).

**3. Bagaimana cara melakukan transfer barang jika stok tidak mencukupi?**
Sistem akan otomatis menolak permintaan transfer dan memunculkan notifikasi merah (*error*) karena fitur validasi (LIFO/FIFO) mengharuskan ketersediaan stok fisik di gudang sumber.

**4. Bisakah saya menambah gudang baru ke sistem?**
Bisa, login sebagai Admin atau Manajer, buka menu "Gudang", lalu klik "Tambah Gudang".

**5. Mengapa notifikasi bel stok (🔔) terus berwarna merah dan ada lencana angka?**
Itu berarti ada barang yang stoknya mencapai batas minimum (stok rendah) atau habis. Buka daftar notifikasi untuk melihat rincian barang tersebut.

**6. Bagaimana cara menggunakan fitur Import CSV?**
Siapkan file berekstensi `.csv` dengan header kolom: `SKU`, `Nama`, `Kategori`, `Gudang`, `Stok`, dan `Harga`. Buka menu Import, seret (*drag and drop*) file tersebut, dan klik Proses Import.

**7. Saat melakukan ekspor PDF, mengapa tabelnya terpotong?**
Laporan PDF dibatasi pada 40 baris per halaman. Jika data lebih dari itu, sistem akan otomatis membuat halaman baru. Pastikan tidak membuka laporan ketika browser sedang sibuk memproses query lain.

**8. Apa perbedaan Staf Gudang dan Manajer Gudang?**
Manajer Gudang dapat mengedit master data produk, kategori, dan supplier. Staf Gudang hanya dapat membuat transaksi (barang masuk/keluar) dan transfer.

**9. Bagaimana cara mereset semua data kembali ke awal (data dummy)?**
Buka Chrome DevTools (tekan F12), masuk ke tab *Console*, ketik `DataStore.resetData()` dan tekan Enter, lalu muat ulang halaman.

**10. Di mana saya bisa melihat log aktivitas pengguna (siapa mengubah apa)?**
Login sebagai Admin, buka menu "Sistem > Audit Log". Di sana terdapat riwayat lengkap (Login, Create, Update, Delete) beserta IP dan timestamp.
