# Rencana Migrasi dan Cutover Plan

**Proyek:** Pengembangan Sistem Manajemen Inventaris - PT Maju Bersama Digital
**Unit Kompetensi:** 
- J.620100.024.02 (Melakukan Migrasi ke Teknologi Baru)
- J.620100.041.01 (Melaksanakan Cutover Aplikasi)

## 1. Strategi Migrasi Data

Perpindahan dari sistem warisan (Spreadsheet manual Excel/G-Sheets) ke *SmartStock Pro* akan dilakukan dengan strategi **Parallel Adoption (Phased)**. Sistem lama akan berjalan berdampingan dengan sistem baru selama 2 minggu, sebelum sepenuhnya dimatikan.

### A. Pemetaan Kolom (*Mapping Field*)
| Header Excel Lama | Struktur Kolom Database (SmartStock) | Tipe Data & Validasi |
| :--- | :--- | :--- |
| Kode Barang | `sku` | VARCHAR(20), UNIQUE, Wajib Isi |
| Nama Barang Lengkap | `name` | VARCHAR(100), Sanitisasi HTML |
| Kategori | `category_id` | INT (Relasi ke tabel *categories*) |
| Stok Cabang | `stock` | INT, Wajib lebih besar/sama 0 |
| Nilai Rp | `price` | DECIMAL, Float Numeric |

### B. Proses Validasi Pasca-Migrasi
Setelah diekspor ke `.csv` dan dimasukkan via modul "Batch Import", staf *Quality Assurance* akan menjalankan kueri SQL di *SQL Console* (Fitur SmartStock):
`SELECT COUNT(*) FROM products WHERE price < 0;`
Untuk memvalidasi integritas anomali harga. Selisih data (*data discrepancy*) harus 0% sebelum berlanjut ke tahap *Cutover*.

---

## 2. Dokumen Rencana Cutover (*Cutover Plan*)

**Target Tanggal Pelaksanaan:** Jumat, 10 Oktober 2025 (Pukul 22.00 - 04.00 WIB)
**Window Maintenance:** 6 Jam (Dilakukan pada *weekend* untuk menghindari interupsi operasional cabang).

### A. Timeline Pelaksanaan
| Waktu | Aktivitas | PIC (Penanggung Jawab) |
| :--- | :--- | :--- |
| **21:00** | Rapat akhir koordinasi (*Go/No-Go Decision*) | Project Manager |
| **22:00** | *Freeze* sistem spreadsheet lama (Ubah akses ke *Read-Only*) | IT Support Gudang |
| **23:00** | *Export* file CSV final dari semua 5 Gudang (JKT, SBY, dll) | Admin Data |
| **00:00** | *Deploy* dan sinkronisasi paralel Batch CSV ke SmartStock Pro | Backend Engineer |
| **02:00** | Pengujian integritas (UAT Cepat) & Cek Log Monitoring Sistem | Tim QA |
| **03:30** | Pembersihan *cache*, restart service DNS lokal | Tim Jaringan |
| **04:00** | Tanda tangan *Sign-Off Cutover*. Aplikasi resmi *LIVE* | Project Manager |

### B. Checklist Pra-Cutover
- [ ] Dokumen User Guide telah dibagikan ke Manajer Gudang.
- [ ] Server Produksi AWS/GCP dalam kondisi stabil (*Uptime 100% 24jam terakhir*).
- [ ] Domain `smartstock.co.id` siap di-*switch* dari IP Staging ke IP Production.

### C. Rencana Putar Balik (*Rollback Plan*)
Jika pada pukul 03:00 WIB, ditemukan anomali sistem kritis (contoh: kalkulasi Transfer Barang antar gudang salah):
1. **Keputusan Rollback:** PM memerintahkan aborsi skenario *live*.
2. **Eksekusi:** Arahkan kembali rute jaringan DNS staf cabang ke alamat sistem lama.
3. **Komunikasi:** Broadcast email ke semua kepala cabang: "Implementasi ditunda, kembali menggunakan Spreadsheet besok". 
4. Semua data log yang salah saat *cutover* dihapus.
