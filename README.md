# SmartStock Pro 📦

![SmartStock Pro](https://img.shields.io/badge/Status-Completed-success)
![Platform](https://img.shields.io/badge/Platform-Web%20SPA-blue)
![Tech Stack](https://img.shields.io/badge/Tech-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-orange)

Aplikasi ini dirancang untuk mendemonstrasikan penguasaan 22 Unit Kompetensi SKKNI melalui pendekatan antarmuka modern (Single Page Application).

Sistem ini mensimulasikan manajemen stok terpadu untuk 5 lokasi gudang (Jakarta, Surabaya, Bandung, Medan, Makassar) milik "PT Maju Bersama Digital".

---

## 🚀 Fitur Utama

- **Sistem Keamanan & Autentikasi (RBAC)**: Login multi-role (Admin, Manager, Staff, Viewer) dengan simulasi enkripsi SHA-256 dan perlindungan dari eksploitasi XSS.
- **Manajemen Data Real-Time (CRUD)**: Kelola data Produk, Kategori, Gudang, dan Supplier secara instan.
- **Visualisasi Dashboard & Spasial**: 
  - Grafik metrik menggunakan **Chart.js** (Line, Bar, Doughnut chart).
  - Peta lokasi interaktif (GIS) menggunakan **Leaflet.js** untuk melihat stok per lokasi fisik.
- **Batch Processing & Web Workers**: Fitur _Import CSV_ skala besar diproses di latar belakang (*background thread*) menggunakan _Web Workers_ agar UI tidak *freeze*.
- **Export Laporan Lengkap**: Konversi data otomatis ke format tabel PDF (via **jsPDF**) dan _spreadsheet_ CSV.
- **Notifikasi Cerdas**: Peringatan otomatis sistem saat jumlah stok menyentuh titik minimum atau habis (Real-time bell notification).
- **Audit & Error Logging**: Rekam jejak (_audit trail_) yang mencatat setiap aktivitas user secara aman dan simulasi sistem deteksi *error* server.

---

## 🛠️ Teknologi yang Digunakan

Aplikasi ini mendemonstrasikan keandalan pengembangan web tanpa kebergantungan pada framework monolitik besar. 
- **Core**: HTML5, CSS3 (Vanilla + CSS Variables untuk *Dark/Light Theme*), JavaScript ES6+
- **Data Layer**: Web Storage API (`localStorage` & `sessionStorage`)
- **Libraries (via CDN)**:
  - `Chart.js` — Rendering Grafik
  - `Leaflet.js` — Rendering Peta
  - `PapaParse` — Parsing & Unparsing file CSV
  - `jsPDF` & `html2canvas` — Generator dokumen PDF
- **Performa**: Web Workers API

---

## 📂 Struktur Direktori Proyek

```text
smartstock-pro/
├── css/
│   └── style.css            # Master design system & component styles
├── js/
│   ├── app.js               # Main SPA router & UI logic
│   ├── auth.js              # Session & role management
│   ├── data.js              # LocalStorage CRUD & Seed Data
│   ├── dashboard.js         # Chart.js & Leaflet map integration
│   ├── inventory.js         # Produk, Kategori, Transaksi logic
│   ├── transfer.js          # Transfer gudang & form handling
│   ├── monitoring.js        # Simulasi resource CPU/RAM & Error logs
│   ├── notifications.js     # Low-stock alerts & badges
│   ├── reports.js           # PDF & CSV Export engines
│   └── utils.js             # Helpers (Sanitize, formatter, pagination)
├── workers/
│   └── import-worker.js     # Script background thread untuk impor paralel
├── docs/                    # Berisi 11 Dokumen Kompetensi BNSP
│   ├── dokumentasi_sistem.md
│   ├── user_guide.md
│   ├── arsitektur_hardware.md
│   └── ... (dan lainnya)
├── app.html                 # Shell utama aplikasi (Views container)
├── index.html               # Halaman Login
└── README.md                # Dokumentasi proyek (File ini)
```

---

## 💻 Cara Menjalankan Aplikasi

Aplikasi ini berbasis **Client-Side (Serverless)**, sehingga sangat mudah untuk dijalankan dan dipresentasikan tanpa perlu instalasi database (MySQL/PostgreSQL) ataupun bahasa backend (PHP/Node.js).

1. Buka folder proyek ini di komputer Anda.
2. Klik dua kali *(double-click)* pada berkas **`index.html`** untuk membukanya di peramban web modern (Google Chrome, Firefox, atau Edge).
3. Anda akan melihat Halaman Login. Klik salah satu "Role" yang tersedia di kotak abu-abu (misal: tombol `[Admin]`) untuk mengisi formulir otomatis, lalu klik **Masuk**.
4. Semua data dummy (Produk, Kategori, Riwayat) sudah di-*generate* otomatis ke dalam browser Anda di pemuatan pertama.

*(Catatan: Pastikan komputer Anda terhubung ke internet saat membuka aplikasi agar library eksternal (CDN) untuk grafik dan peta dapat termuat).*

---

## 📖 Dokumen Pendukung (Untuk Keperluan BNSP)

Untuk mematuhi standar 22 Unit Kompetensi yang diujikan, telah disediakan dokumen-dokumen pendukung pada folder `docs/`:

1. [Dokumentasi Sistem Utama](docs/dokumentasi_sistem.md)
2. [Buku Panduan Pengguna (User Guide)](docs/user_guide.md)
3. [Arsitektur Hardware & Topologi](docs/arsitektur_hardware.md)
4. [Analisis Skalabilitas & Tools](docs/analisis_tools.md)
5. [Analisis Risiko Keamanan](docs/analisis_risiko_keamanan.md)
6. [Analisis Dampak Perubahan Sistem](docs/analisis_dampak.md)
7. [Rencana Migrasi & Cutover Aplikasi](docs/migrasi_cutover.md)
8. [UAT (Skenario Uji Coba Pengguna) & Log Debugging](docs/uat_testing.md)
9. [Dokumentasi API RESTful (Simulasi)](docs/api_documentation.md)
10. [Buku Manual Troubleshooting](docs/troubleshooting.md)
11. [FAQ Umum](docs/faq.md)

---

**© 2025 - Calon Web Developer Profesional** 
*Dibuat khusus untuk keperluan Uji Kompetensi Sertifikasi BNSP Web Developer.*
