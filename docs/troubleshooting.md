# Panduan Troubleshooting - SmartStock Pro

Berikut adalah daftar masalah umum yang mungkin terjadi selama penggunaan sistem beserta langkah-langkah mitigasi dan resolusinya.

### 1. Masalah: Layar Dashboard "Blank" atau Putih
**Penyebab:** LocalStorage penuh, atau browser tidak mendukung ES6 JS Modules.
**Solusi:**
1. Tekan `Ctrl + Shift + R` untuk membersihkan *cache* paksa (Hard Reload).
2. Tekan `F12` untuk membuka Developer Tools, buka tab `Application`, pilih `Local Storage`, klik kanan pada domain dan pilih `Clear`.
3. Muat ulang halaman (F5).

### 2. Masalah: Peta (Map) Gudang Tidak Muncul
**Penyebab:** Tidak ada koneksi internet (library Leaflet dan map tiles OpenStreetMap gagal dimuat).
**Solusi:**
1. Pastikan komputer terhubung ke internet.
2. Periksa konsol browser (F12 > Console) untuk melihat pesan error seperti `ERR_NAME_NOT_RESOLVED` atau `CORS Policy Blocked`.

### 3. Masalah: Import CSV Selalu Gagal/Error
**Penyebab:** Format kolom CSV tidak sesuai standar aplikasi.
**Solusi:**
1. Buka file CSV Anda dengan Excel atau Notepad.
2. Pastikan Header baris pertama harus memiliki teks yang *persis*: `SKU, Nama, Kategori, Gudang, Stok, Harga`.
3. Jangan gunakan tanda titik koma (`;`) sebagai pemisah, gunakan koma (`,`). (Ganti delimiter excel atau gunakan *save as CSV UTF-8*).

### 4. Masalah: Data Hilang Saat Pindah Komputer
**Penyebab:** Arsitektur SPA menyimpan data di `LocalStorage` spesifik pada satu browser di satu komputer.
**Solusi:**
Untuk memindahkan ke komputer lain:
1. Pergi ke menu "Laporan & Export".
2. Unduh CSV Inventaris.
3. Di komputer baru, pergi ke menu "Batch Import" dan masukkan CSV tadi.
*(Catatan: Audit Log dan Transaksi histori tidak ikut tersalin pada versi klien lokal).*

### 5. Masalah: Fitur Transfer Antar Gudang Menyangkut di "Progress Bar"
**Penyebab:** Background *Web Worker* di-blokir oleh sekuriti peramban jika dijalankan pada protokol lokal yang ketat (misal: di beberapa versi Safari tanpa server).
**Solusi:**
1. Pastikan Anda menjalankan ini dari local web server ringan, bukan sekadar klik dua kali file `index.html`.
2. Cara menjalankan via Python: buka terminal CMD/PowerShell di folder proyek, ketik `python -m http.server 8000`, lalu buka `http://localhost:8000` di browser Anda.

### 6. Masalah: Alert Stok Rendah Sering Muncul Padahal Sudah di-Restock
**Penyebab:** Notifikasi *unread* yang ditumpuk di sistem (belum di-klik).
**Solusi:**
Buka dropdown Notifikasi (Ikon Lonceng di sudut kanan atas) lalu klik `Bersihkan`. Atau buka menu `Semua Notifikasi` pada Sidebar dan klik `Bersihkan Semua`.
