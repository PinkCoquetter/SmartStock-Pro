# Panduan Pengguna (User Guide) - SmartStock Pro

## 1. Memulai Aplikasi
1. Buka aplikasi dan pilih akun role di halaman **Login**. 
2. Role yang tersedia:
   - **Admin:** Memiliki akses ke semua fitur (Full Access).
   - **Manajer Gudang:** Dapat mengelola inventaris, transfer, namun tidak dapat mengelola user.
   - **Staf Gudang:** Hanya dapat membuat transaksi dan transfer barang, tidak bisa mengedit master data.
   - **Viewer:** Hanya memiliki akses untuk melihat (Read-only) dan export laporan.

## 2. Navigasi Sidebar
Sidebar di sebelah kiri layar mengelompokkan menu menjadi 5 kategori:
- **Utama:** Dashboard.
- **Inventaris:** Produk, Kategori, Gudang, Supplier, Transaksi.
- **Operasional:** Transfer Gudang, Import Data.
- **Sistem:** Notifikasi, Monitoring, Error Log, Audit Log, SQL Console.
- **Laporan:** Export Laporan.

## 3. Fitur Utama

### A. Dashboard
- Menampilkan metrik utama: Total Produk, Nilai Inventaris, Produk dengan Stok Rendah, Total Gudang.
- **Grafik Tren:** Membandingkan pergerakan barang masuk vs barang keluar 7 hari terakhir.
- **Peta Lokasi Gudang:** Klik pada penanda (marker) di peta untuk melihat jumlah total produk di setiap gudang (misalnya Jakarta, Surabaya, dll).

### B. Kelola Produk (CRUD)
- Buka menu **Produk**.
- Untuk **Menambah Produk**, klik tombol `➕ Tambah Produk`. Isi semua bidang bertanda bintang merah (*). Stok yang dimasukkan otomatis tersimpan.
- Untuk **Mengedit Produk**, klik ikon Pensil (✏️) di baris data tabel produk terkait.
- Jika Stok kurang dari "Minimum Stok", otomatis muncul label `Rendah` warna kuning.

### C. Mencatat Transaksi (Barang Masuk/Keluar)
- Buka menu **Transaksi**.
- Pilih *tab* "Barang Masuk" atau "Barang Keluar".
- Klik `➕ Tambah Transaksi`.
- Masukkan jumlah (*Quantity*). **Perhatian:** Saat membuat transaksi, stok produk utama otomatis bertambah (untuk transaksi masuk) atau berkurang (untuk transaksi keluar).

### D. Transfer Antar Gudang
- Buka menu **Transfer Gudang**.
- Pilih **Gudang Asal**, **Gudang Tujuan**, dan **Produk**. (Sistem otomatis menampilkan stok yang tersedia di gudang asal).
- Masukkan Jumlah, klik **Proses Transfer**.
- Sistem akan memproses dan mencatatkan riwayat transfer.

### E. Import Data Massal (CSV)
- Buka menu **Import Data**.
- Klik area kotak unggah untuk memilih file CSV dari komputer Anda. File CSV harus berisi kolom: SKU, Nama, Kategori, Gudang, Stok, Harga.
- Sistem akan menampilkan pratinjau data (maksimal 5 baris pertama).
- Klik `⚡ Proses Import` untuk menyimpan seluruh data baru ke sistem secara paralel (via Web Worker).

### F. Ekspor Laporan
- Buka menu **Export Laporan**.
- Terdapat 3 opsi laporan:
  1. Laporan Inventaris (PDF): Seluruh daftar stok, kategori, dan gudang.
  2. Laporan Transaksi (PDF): Riwayat barang masuk dan keluar.
  3. Laporan Spreadsheet (CSV): Mengunduh semua data mentah ke excel.

## 4. Personalisasi dan Pengaturan
- **Tema Gelap / Terang:** Klik ikon 🌙/☀️ di pojok kanan atas layar.
- **Logout:** Klik lingkaran Avatar User (contoh: [A]) di ujung kanan atas, lalu klik Logout.
