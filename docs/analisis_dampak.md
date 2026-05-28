# Analisis Dampak Perubahan (Impact Analysis)

**Proyek:** Pengembangan Sistem Manajemen Inventaris - PT Maju Bersama Digital
**Unit Kompetensi:** J.620100.043.01 (Menganalisis Dampak Perubahan Terhadap Aplikasi)

## 1. Tujuan Dokumen
Mendokumentasikan bagaimana sebuah pembaruan perangkat lunak (contoh: Penambahan fitur baru / modifikasi fitur lama) akan mempengaruhi sistem atau modul lain yang ada di dalam *SmartStock Pro*. Hal ini penting dalam skenario rilis iteratif.

## 2. Skenario Pembaruan Perangkat Lunak
Skenario (Asumsi): Manajemen meminta fitur baru agar nilai *Harga Produk* di database dapat memiliki mata uang ganda (USD dan Rupiah), bukan lagi *integer* tunggal.

### A. Tabel Dampak Perubahan Lintas Modul

| Modul Terdampak | Level Dampak | Analisis Potensi Gangguan (*Breaking Changes*) |
| :--- | :---: | :--- |
| **Modul Manajemen (CRUD)** | Tinggi | Kolom input harga di form tidak lagi menerima tipe data tunggal. Validasi form di `inventory.js` (fungsi `saveProduct`) akan gagal/rusak (melempar *error*) jika kita menyisipkan simbol *string* kurs tanpa penyesuaian skema. |
| **Modul Dashboard (Chart)** | Menengah | Total akumulasi Metrik "Nilai Inventaris" di *Dashboard* akan error memunculkan `NaN` (Not a Number) karena sistem lama mengalikan harga dengan stok, dan tidak paham format konversi ganda. |
| **Modul Ekspor Laporan (PDF)**| Menengah | Fungsi `formatRp()` di `utils.js` yang digunakan untuk rendering PDF akan mencetak salah tata letak format angka saat mendeteksi tipe mata uang asing (USD). |

### B. Strategi Mitigasi Perubahan
Untuk menangani kasus dampak lintas modul ini, tim pengembang tidak boleh memodifikasi sistem yang sedang berjalan secara langsung (Live Code).

1. **Penggunaan Version Control System (Git):** Pembaruan dikembangkan dalam cabang (*branch*) terpisah: `git checkout -b feature/multi-currency`.
2. **Backwards Compatibility:** Struktur tabel data lama diubah secara mulus menggunakan migrasi database skema, sehingga data dengan *integer* lama diasumsikan sebagai Rupiah (IDR) secara default.
3. **Pengujian Regresi:** Menjalankan Unit Testing di *branch* baru sebelum menggabungkan rilis akhir.

Sistem berbasis *Javascript Modules* ES6 memungkinkan pengkapsulan, sehingga kita meminimalisasi *Global Pollution*, namun *event* reaktivitas tetap harus dicek ulang pasca perubahan skema.
