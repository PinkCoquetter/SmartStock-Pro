# Dokumen Pengujian oleh Pengguna (UAT)

**Proyek:** Pengembangan Sistem Manajemen Inventaris - PT Maju Bersama Digital
**Unit Kompetensi:** J.620100.038.01 (Melaksanakan Pengujian Oleh Pengguna (UAT))

## 1. Deskripsi Pengujian
UAT (User Acceptance Testing) dilakukan untuk memastikan aplikasi berfungsi sesuai kebutuhan fungsional (FSD - Functional Spesification Document) dan bebas dari galat interaksi (*bugs*).

- **Tester:** (Perwakilan Manajer Gudang PT Maju Bersama)
- **Lingkungan Uji:** Browser Google Chrome v115 (Resolusi 1920x1080)
- **Status:** **LULUS (Passed)**

---

## 2. Skenario & Checklist Uji Coba Aplikasi

### Skenario 1: Modul Autentikasi dan Hak Akses Role
| ID | Skenario Uji | Tindakan | Hasil yang Diharapkan | Status |
|:---|:---|:---|:---|:---:|
| UAT-1.1 | Login sukses (Role: Admin) | Memasukkan kredensial "admin" - "admin123" | Muncul notifikasi sesi, diarahkan ke halaman Dashboard | ✅ Pass |
| UAT-1.2 | Validasi salah sandi | Masukkan "admin" - sandi ngawur | Tertolak, alert merah "Username/password salah" muncul | ✅ Pass |
| UAT-1.3 | Uji pembatasan akses (*Authorization*) | Login sebagai **Staf Gudang**, lalu mencoba tombol "Tambah Produk" (Master Data) | Tombol tidak berfungsi, memunculkan Toast merah "Anda tidak memiliki izin" | ✅ Pass |

### Skenario 2: Modul Transfer Paralel & Notifikasi Stok (Real-Time)
| ID | Skenario Uji | Tindakan | Hasil yang Diharapkan | Status |
|:---|:---|:---|:---|:---:|
| UAT-2.1 | Transfer Barang Lintas Gudang | Klik menu Transfer, pilih Gudang Jakarta -> Surabaya. Pilih Produk A, Qty: 10. | Progress bar berjalan mulus, histori tercetak, stok Jakarta terpotong, notifikasi muncul. | ✅ Pass |
| UAT-2.2 | Transfer over-limit | Transfer Qty barang melebihi stok tersedia. | Transaksi tertolak, muncul error "Stok tidak cukup". | ✅ Pass |
| UAT-2.3 | Fitur Alert Batas Minimum Stok | Ubah Master Produk, atur batas Min-Stok ke 20. Lalu buat Transaksi Keluar hingga stok menjadi 10. | Lonceng Notif (🔔) di pojok atas otomatis berangka, berstatus Alert "Stok Rendah". | ✅ Pass |

### Skenario 3: Visualisasi Data & Pelaporan (Reporting)
| ID | Skenario Uji | Tindakan | Hasil yang Diharapkan | Status |
|:---|:---|:---|:---|:---:|
| UAT-3.1 | Rendering Peta Interaktif Leaflet | Buka Dashboard, lihat *widget* peta lokasi di panel bawah. | Peta memuat satelit map. Saat markah (marker) di-klik, muncul balon informasi stok gudang terkait. | ✅ Pass |
| UAT-3.2 | Export Dokumen Laporan CSV | Buka Ekspor Laporan, tekan "Download CSV". | File Spreadsheet `Inventory_Export_202X.csv` terunduh. Berisi tabel utuh produk. | ✅ Pass |
| UAT-3.3 | Batch Data Paralel CSV | Buka menu Import Data. Seret berkas sampel `contoh.csv` produk bervolume. Klik impor. | Simulasi parsing paralel via *Web Worker* bergerak, tabel pratinjau merespon lancar tanpa antarmuka *freeze* / hang. | ✅ Pass |

---

## 3. Log Debugging & Penanganan Isu Selama Fase Pengembangan

(Pemenuhan Unit Kompetensi J.620100.025.02 - Melakukan Debugging)

- **[BUG-01]** *Isu:* Tabel produk gagal me-render status label jika stok 0 (undefined).
  - *Identifikasi Log Error:* `TypeError: Cannot read properties of undefined (reading 'minStock')` di modul `inventory.js`.
  - *Tindakan Debugging:* Melakukan isolasi Try-Catch. Memperbaiki logika ternary menjadi `p.stock <= (p.minStock || 10)`. Diperbaiki.
- **[BUG-02]** *Isu:* Formulir Login ter-reset otomatis jika tombol ditekan dengan cepat.
  - *Tindakan Debugging:* Menambahkan `e.preventDefault()` di `auth.js` dan memberikan nilai _return false_ pada *listener submit*. Diperbaiki.
