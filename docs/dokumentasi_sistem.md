# Dokumentasi Sistem: SmartStock Pro

**Sistem Manajemen Inventaris — PT Maju Bersama Digital**

## 1. Pendahuluan
SmartStock Pro adalah Sistem Manajemen Inventaris yang dibangun untuk mengatasi kendala pencatatan manual, koordinasi transfer barang, dan pelaporan stok di 5 gudang PT Maju Bersama Digital (Jakarta, Surabaya, Bandung, Medan, Makassar).

## 2. Arsitektur Prototype
Karena sistem ini dirancang sebagai prototype untuk sertifikasi BNSP Web Developer (22 Unit Kompetensi), sistem ini berjalan penuh di sisi *client* (SPA - Single Page Application) tanpa memerlukan instalasi backend server aktif.

- **Frontend:** HTML5, CSS3 (Vanilla + CSS Variables), JavaScript ES6+
- **Data Layer:** Web Storage API (localStorage, sessionStorage)
- **Visualisasi & Ekspor:** Chart.js, Leaflet, jsPDF, html2canvas, PapaParse (via CDN)
- **Pemrosesan Paralel:** Web Workers (Import CSV)

## 3. Pemetaan 5 Modul Fungsional
1. **Autentikasi & Keamanan:** Login multi-level (Admin, Manager, Staff, Viewer), enkripsi SHA-256 (Web Crypto API), session timeout 15 menit, dan audit logging.
2. **Dashboard & Real-Time Monitoring:** Grafik tren dan distribusi, peta interaktif Leaflet, dan monitoring resource server tersimulasi.
3. **Manajemen Data (CRUD):** CRUD penuh untuk Produk, Kategori, Gudang, Supplier, dan Transaksi (Masuk/Keluar) dengan filter dan sorting.
4. **Notifikasi & Alert:** Deteksi stok rendah dan notifikasi *in-app* otomatis, serta simulasi error logging.
5. **Pemrosesan Paralel:** Pemindahan stok antar gudang (Transfer) dan fitur Import CSV besar menggunakan Web Workers (non-blocking UI).

## 4. Panduan Menjalankan Sistem
1. Buka file `index.html` menggunakan browser modern (Google Chrome / Mozilla Firefox).
2. Sistem tidak memerlukan *local server* (bisa dijalankan dengan protokol `file:///`).
3. Pada halaman Login, klik salah satu akun Demo (misal: Admin) untuk auto-fill username dan password, lalu klik Masuk.

## 5. Daftar Dokumen Lampiran Tambahan
Terdapat 10 dokumen analisis dan panduan terpisah di dalam folder `/docs` untuk memenuhi seluruh unit kompetensi sertifikasi:
- [Arsitektur Hardware & Topologi](arsitektur_hardware.md)
- [Analisis Tools & Skalabilitas](analisis_tools.md)
- [Analisis Risiko Keamanan](analisis_risiko_keamanan.md)
- [Migrasi Data & Cutover Plan](migrasi_cutover.md)
- [Analisis Dampak Perubahan (Impact Analysis)](analisis_dampak.md)
- [Skenario Pengujian UAT & Debugging](uat_testing.md)
- [Panduan Pengguna (User Guide)](user_guide.md)
- [FAQ (Pertanyaan Umum)](faq.md)
- [Dokumentasi API RESTful (Simulasi)](api_documentation.md)
- [Panduan Troubleshooting](troubleshooting.md)
