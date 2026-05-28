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
# Analisis Risiko Keamanan Informasi

**Proyek:** Pengembangan Sistem Manajemen Inventaris - PT Maju Bersama Digital
**Unit Kompetensi:** J.62090.018.01 (Mengelola Resiko Keamanan Informasi)

Berikut ini adalah daftar identifikasi risiko celah keamanan pada aplikasi *SmartStock Pro* dan matriks mitigasi yang telah kami implementasikan secara kode:

| No | Nama Kerentanan (Vulnerability) | Tingkat Dampak | Skenario Eksploitasi (Ancaman) | Strategi Mitigasi Kode (Penanganan) |
| :---: | :--- | :---: | :--- | :--- |
| **1.** | **Cross-Site Scripting (XSS)** | TINGGI | Hacker memasukkan payload `<script>alert('hack')</script>` ke dalam nama barang / form input. Skrip mencuri sesi user lain yang melihat tabel inventaris. | Semua input form diproses via fungsi `sanitize(str)` di `utils.js` yang menerjemahkan karakter khusus `<` menjadi `&lt;`. Penggunaan properti `.innerHTML` dilarang untuk rendering teks pengguna mentah. |
| **2.** | **SQL Injection** | TINGGI | Pihak tak bertanggung jawab memasukkan karakter `' OR 1=1 --` ke dalam form pencarian, memaksa database membocorkan seluruh data stok rahasia. | (*Simulasi*): Sistem menggunakan abstraksi pencarian via filter JavaScript Array secara ketat. Di sisi backend produksi (jika ada), diterapkan kueri berparameter (*Parameterized Statements / Prepared Statements*). |
| **3.** | **Pencurian Sesi (Session Hijacking)** | SEDANG | Seseorang meminjam komputer staf gudang yang sedang membuka sistem, dan mengunduh seluruh database pelanggan. | Diterapkan mekanisme *Timeout Idle Sesi* selama 15 Menit di `auth.js`. Sesi diatur di *Session Storage* (terhapus otomatis saat tab ditutup), bukan *Local Storage* permanen. |
| **4.** | **Kebocoran Basis Data Sandi** | TINGGI | Karyawan IT internal / Pihak luar mencuri file database otentikasi dari server, kemudian memakai sandi tersebut. | Sandi pengguna (baik Admin maupun staf) tidak pernah disimpan dalam *plain-text*. Kata sandi diproses dengan algoritma *hashing* menggunakan fungsi kriptografi satu-arah `SHA-256` dari antarmuka Web Crypto API browser. |
| **5.** | **Manipulasi Form Transaksi** | MENENGAH | Staf mengubah kode HTML elemen `input type="number"` lewat *Inspect Element* menjadi nilai negatif untuk manipulasi korupsi barang gudang. | Di dalam *Controller* `inventory.js`, sebelum menyimpan data, dilakukan intersepsi dan *re-validasi* nilai tipe data dengan pemaksaan integer `parseInt()` dan logika pengecekan absolut lebih besar dari 0. |

## Bukti Implementasi *Audit Trail*
Untuk keamanan tata kelola operasional perusahaan (Akuntabilitas), seluruh tindakan yang dilakukan oleh aktor/pengguna (Mulai dari *Login, Hapus barang, Edit supplier, Export PDF*, dll) dicatat secara konstan oleh fungsi `auditLog()` dan tak bisa dimodifikasi staf biasa. Fitur ini dapat dilihat di menu **"Audit Log"**.
# Analisis Tools, Framework, dan Skalabilitas

**Proyek:** Pengembangan Sistem Manajemen Inventaris - PT Maju Bersama Digital
**Unit Kompetensi:** 
- J.620100.001.01 (Menganalisis Tools)
- J.620100.002.01 (Menganalisis Skalabilitas Perangkat Lunak)
- J.620100.003.01 (Identifikasi Library/Framework)

## 1. Pemilihan Library Pihak Ketiga (Third-Party)
Untuk meminimalisir ketergantungan pada *framework* monolith dan mengoptimalkan performa beban komputasi web di sisi klien, kami memilih *Vanilla JavaScript* dan mengimpor modul pustaka spesifik via CDN.

| Komponen / Fitur | Library Terpilih | Versi | Lisensi | Alasan Pemilihan |
| :--- | :--- | :--- | :--- | :--- |
| **Data Visualization** | `Chart.js` | 4.4.0 | MIT | Library teringan untuk membuat grafik interaktif (Tren stok, donut chart). Render menggunakan elemen `<canvas>` HTML5 sehingga memori stabil (minim DOM node). |
| **Interactive Maps** | `Leaflet.js` | 1.9.4 | BSD-2-Clause | Jauh lebih ringan dibandingkan Google Maps API, tidak membebani *main thread*, kompatibel lintas *browser*, cocok untuk plotting letak 5 gudang fisik. |
| **Data Parsing (CSV)** | `PapaParse` | 5.4.1 | MIT | Dapat mengeksekusi parsing CSV ukuran raksasa di *background* menggunakan Web Workers, mencegah *frozen UI* (jeda antar muka) saat migrasi spreadsheet. |
| **PDF Generation** | `jsPDF` + `html2canvas` | 2.5.1 / 1.4.1 | MIT | Memungkinkan pembuatan laporan PDF murni dari *client-side* tanpa beban server, efisien untuk *billing* & *reporting*. |
| **Iconography** | `Unicode Emojis` / SVG | - | Open | Membuang kebutuhan *font loader* besar seperti FontAwesome. UI memuat seketika tanpa HTTP request tambahan. |

## 2. Analisis Skalabilitas Perangkat Lunak

### A. Skalabilitas Vertikal (Scale-Up)
Saat jumlah transaksi harian PT Maju Bersama meningkat (misal: hari promosi), arsitektur Node.js/PHP backend (pada server asli) dapat di-*scale-up* dengan menambah vCPU dan RAM pada instance Cloud. Aplikasi *client-side* SmartStock tidak terpengaruh secara linear, karena komputasi antarmuka dieksekusi di *resource* komputer milik pegawai gudang (desentralisasi komputasi).

### B. Skalabilitas Horizontal (Scale-Out)
Sistem dirancang sebagai **Single Page Application (SPA) *Stateless***. Hal ini berarti jika server ditambah (*Load Balancing*), pengguna tetap mendapatkan sesi yang persisten karena status otentikasi disimpan dalam JWT/SessionStorage pada *browser*, bukan sesi *file* di server.

### C. Manajemen Data Paralel (Web Workers)
Fitur impor CSV dalam bentuk *batch* dipecah (chunking) dan dilempar ke berkas terpisah (`import-worker.js`). Jika data produk mencapai puluhan ribu baris, *main-thread* UI browser tetap merespon klik dan *scroll*, mencegah notifikasi "*Page unresponsive*". Ini adalah bukti penerapan arsitektur perangkat lunak yang berorientasi pada daya tahan skalabilitas jangka panjang.
# Dokumentasi API (Simulasi RESTful)

*Catatan: SmartStock Pro versi prototype beroperasi pada arsitektur Serverless. Endpoint di bawah adalah desain arsitektur untuk sistem produksi sesungguhnya.*

## Base URL
`https://api.smartstock.co.id/v1`

## Autentikasi
Gunakan **Bearer Token (JWT)** pada header:
`Authorization: Bearer <your_jwt_token>`

---

## 1. Produk

### GET `/products`
Mengambil semua data produk dengan dukungan filter dan pagination.
**Query Parameters:**
- `page` (int) - Nomor halaman
- `limit` (int) - Jumlah per halaman
- `warehouse` (string) - ID gudang
- `search` (string) - Kata kunci pencarian

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": [
    {
      "id": "prd_01",
      "sku": "EL-001",
      "name": "Samsung Galaxy S24 Ultra",
      "stock": 85,
      "price": 19999000
    }
  ],
  "meta": { "total": 1, "page": 1, "last_page": 1 }
}
```

### POST `/products`
Membuat produk baru.

**Payload:**
```json
{
  "sku": "EL-002",
  "name": "iPhone 15 Pro",
  "category": "cat_01",
  "warehouse": "wh_01",
  "stock": 42,
  "minStock": 10,
  "price": 20000000
}
```

---

## 2. Transaksi

### POST `/transactions`
Mencatat stok masuk atau keluar. Secara otomatis mengubah (mutasi) stok di master produk menggunakan algoritma trigger.

**Payload:**
```json
{
  "productId": "prd_01",
  "warehouseId": "wh_01",
  "qty": 10,
  "type": "out",
  "note": "Pengiriman ke cabang"
}
```

---

## 3. Web Worker / Background Job

### POST `/jobs/import`
Endpoint untuk mengunggah file CSV besar. Memanggil antrean proses paralel.

**Payload:** Form-data berisi `file` bertipe text/csv.
**Response:** `202 Accepted`
```json
{
  "status": "processing",
  "job_id": "job_9921",
  "message": "CSV uploaded, queued for parallel processing"
}
```
*Gunakan GET `/jobs/status/job_9921` untuk melakukan polling progres.*
# Arsitektur Hardware dan Jaringan - SmartStock Pro

**Proyek:** Pengembangan Sistem Manajemen Inventaris - PT Maju Bersama Digital
**Unit Kompetensi:** TIK.SM03.001.01 (Menentukan Arsitektur Perangkat Keras)

## 1. Topologi Jaringan Terdistribusi

Sistem ini didesain menggunakan topologi *Cloud-based Hub and Spoke Architecture*, di mana Cloud Server bertindak sebagai *hub* pusat yang melayani permintaan dari 5 gudang cabang (*spokes*) di Jakarta, Surabaya, Bandung, Medan, dan Makassar.

```mermaid
graph TD
    subgraph Cloud Infrastructure (AWS / GCP)
        LB[Load Balancer]
        WS1[Web/App Server 1]
        WS2[Web/App Server 2]
        DB[(Cluster Database PostgreSQL)]
        Cache[(Redis Cache)]
        MQ[(RabbitMQ - Job Queue)]
        
        LB --> WS1
        LB --> WS2
        WS1 --> DB
        WS2 --> DB
        WS1 --> Cache
        WS2 --> Cache
        WS1 --> MQ
        WS2 --> MQ
    end
    
    subgraph Gudang Jakarta
        Router_JKT[Router VPN] --> LAN_JKT[LAN]
        LAN_JKT --> PC1[PC Admin]
        LAN_JKT --> Scanner1[Barcode Scanner]
    end
    
    subgraph Gudang Surabaya
        Router_SBY[Router VPN] --> LAN_SBY[LAN]
        LAN_SBY --> PC2[PC Staf]
    end
    
    subgraph Gudang Lainnya
        Router_DLL[Router VPN (BDG, MDN, MKS)]
    end
    
    Router_JKT <===> |Fiber Optic / 4G Backup| LB
    Router_SBY <===> |Fiber Optic / 4G Backup| LB
    Router_DLL <===> |Fiber Optic / 4G Backup| LB
```

## 2. Spesifikasi Perangkat Keras Minimum

### A. Lingkungan Server (Cloud)
Karena aplikasi diharapkan melayani 5 gudang besar secara real-time dan skalabel, direkomendasikan menggunakan instance Cloud:
*   **Web/App Server (Minimal 2 Instances untuk High Availability):**
    *   CPU: 4 vCPU (Intel Xeon / AMD EPYC)
    *   RAM: 16 GB ECC
    *   Storage: 100 GB NVMe SSD
    *   Bandwidth: 1 Gbps up/down
*   **Database Server (Master-Slave Replication):**
    *   CPU: 8 vCPU (Optimized untuk operasional I/O tinggi)
    *   RAM: 32 GB ECC
    *   Storage: 500 GB Provisioned IOPS SSD
*   **Cache & Queue Server (Redis + RabbitMQ):**
    *   CPU: 2 vCPU
    *   RAM: 8 GB

### B. Lingkungan Klien (Perangkat Gudang)
Untuk memastikan staf gudang dapat memuat SPA dan halaman web secara halus tanpa *lag*:
*   **PC Desktop / Laptop Karyawan:**
    *   CPU: Minimal Intel Core i3 / AMD Ryzen 3 (Gen 10+)
    *   RAM: 8 GB DDR4 (Wajib untuk aplikasi SPA berbasis DOM berat)
    *   Storage: 128 GB SSD (OS boot dan browser cache)
    *   Monitor: Resolusi minimal 1366 x 768 (Disarankan 1920 x 1080)
    *   Network: Koneksi kabel Gigabit Ethernet atau Wi-Fi 5 (802.11ac)

## 3. Analisis Kebutuhan Jaringan (*Bandwidth*)
Setiap aksi CRUD mengirimkan payload JSON kecil (~5 KB). Jika kita asumsikan pada jam sibuk ada **1.000 transaksi/jam** per gudang, maka *throughput* data relatif kecil. Namun, untuk stabilitas *Real-Time Notifikasi* (misalnya via WebSocket), latensi sangat kritis.
*   **Kecepatan Minimal per Gudang:** 20 Mbps Dedikasi.
*   **Rekomendasi:** Menggunakan ISP Fiber Optic (Indihome/Biznet) dengan *failover* router ke jaringan seluler 4G/5G guna menjamin *uptime* 99,9% saat *cutover*.
# Dokumentasi Sistem: SmartStock Pro

**Sistem Manajemen Inventaris â€” PT Maju Bersama Digital**

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
# FAQ (Frequently Asked Questions) - SmartStock Pro

**1. Apakah SmartStock Pro membutuhkan internet untuk dijalankan?**
Ya dan Tidak. Karena ini adalah prototype berbasis Single Page Application, data tersimpan di LocalStorage (browser). Namun, untuk menampilkan peta Leaflet dan pustaka ekspor (Chart.js, PapaParse) yang ditarik dari CDN, diperlukan koneksi internet saat pertama kali dimuat.

**2. Data produk saya hilang setelah membuka aplikasi di komputer lain. Kenapa?**
Data saat ini disimpan di *Local Storage* browser spesifik pada komputer yang digunakan. Data tidak akan tersinkronisasi antar perangkat (dalam versi prototype ini).

**3. Bagaimana cara melakukan transfer barang jika stok tidak mencukupi?**
Sistem akan otomatis menolak permintaan transfer dan memunculkan notifikasi merah (*error*) karena fitur validasi (LIFO/FIFO) mengharuskan ketersediaan stok fisik di gudang sumber.

**4. Bisakah saya menambah gudang baru ke sistem?**
Bisa, login sebagai Admin atau Manajer, buka menu "Gudang", lalu klik "Tambah Gudang".

**5. Mengapa notifikasi bel stok (ðŸ””) terus berwarna merah dan ada lencana angka?**
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
| UAT-1.1 | Login sukses (Role: Admin) | Memasukkan kredensial "admin" - "admin123" | Muncul notifikasi sesi, diarahkan ke halaman Dashboard | âœ… Pass |
| UAT-1.2 | Validasi salah sandi | Masukkan "admin" - sandi ngawur | Tertolak, alert merah "Username/password salah" muncul | âœ… Pass |
| UAT-1.3 | Uji pembatasan akses (*Authorization*) | Login sebagai **Staf Gudang**, lalu mencoba tombol "Tambah Produk" (Master Data) | Tombol tidak berfungsi, memunculkan Toast merah "Anda tidak memiliki izin" | âœ… Pass |

### Skenario 2: Modul Transfer Paralel & Notifikasi Stok (Real-Time)
| ID | Skenario Uji | Tindakan | Hasil yang Diharapkan | Status |
|:---|:---|:---|:---|:---:|
| UAT-2.1 | Transfer Barang Lintas Gudang | Klik menu Transfer, pilih Gudang Jakarta -> Surabaya. Pilih Produk A, Qty: 10. | Progress bar berjalan mulus, histori tercetak, stok Jakarta terpotong, notifikasi muncul. | âœ… Pass |
| UAT-2.2 | Transfer over-limit | Transfer Qty barang melebihi stok tersedia. | Transaksi tertolak, muncul error "Stok tidak cukup". | âœ… Pass |
| UAT-2.3 | Fitur Alert Batas Minimum Stok | Ubah Master Produk, atur batas Min-Stok ke 20. Lalu buat Transaksi Keluar hingga stok menjadi 10. | Lonceng Notif (ðŸ””) di pojok atas otomatis berangka, berstatus Alert "Stok Rendah". | âœ… Pass |

### Skenario 3: Visualisasi Data & Pelaporan (Reporting)
| ID | Skenario Uji | Tindakan | Hasil yang Diharapkan | Status |
|:---|:---|:---|:---|:---:|
| UAT-3.1 | Rendering Peta Interaktif Leaflet | Buka Dashboard, lihat *widget* peta lokasi di panel bawah. | Peta memuat satelit map. Saat markah (marker) di-klik, muncul balon informasi stok gudang terkait. | âœ… Pass |
| UAT-3.2 | Export Dokumen Laporan CSV | Buka Ekspor Laporan, tekan "Download CSV". | File Spreadsheet `Inventory_Export_202X.csv` terunduh. Berisi tabel utuh produk. | âœ… Pass |
| UAT-3.3 | Batch Data Paralel CSV | Buka menu Import Data. Seret berkas sampel `contoh.csv` produk bervolume. Klik impor. | Simulasi parsing paralel via *Web Worker* bergerak, tabel pratinjau merespon lancar tanpa antarmuka *freeze* / hang. | âœ… Pass |

---

## 3. Log Debugging & Penanganan Isu Selama Fase Pengembangan

(Pemenuhan Unit Kompetensi J.620100.025.02 - Melakukan Debugging)

- **[BUG-01]** *Isu:* Tabel produk gagal me-render status label jika stok 0 (undefined).
  - *Identifikasi Log Error:* `TypeError: Cannot read properties of undefined (reading 'minStock')` di modul `inventory.js`.
  - *Tindakan Debugging:* Melakukan isolasi Try-Catch. Memperbaiki logika ternary menjadi `p.stock <= (p.minStock || 10)`. Diperbaiki.
- **[BUG-02]** *Isu:* Formulir Login ter-reset otomatis jika tombol ditekan dengan cepat.
  - *Tindakan Debugging:* Menambahkan `e.preventDefault()` di `auth.js` dan memberikan nilai _return false_ pada *listener submit*. Diperbaiki.
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
- Untuk **Menambah Produk**, klik tombol `âž• Tambah Produk`. Isi semua bidang bertanda bintang merah (*). Stok yang dimasukkan otomatis tersimpan.
- Untuk **Mengedit Produk**, klik ikon Pensil (âœï¸) di baris data tabel produk terkait.
- Jika Stok kurang dari "Minimum Stok", otomatis muncul label `Rendah` warna kuning.

### C. Mencatat Transaksi (Barang Masuk/Keluar)
- Buka menu **Transaksi**.
- Pilih *tab* "Barang Masuk" atau "Barang Keluar".
- Klik `âž• Tambah Transaksi`.
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
- Klik `âš¡ Proses Import` untuk menyimpan seluruh data baru ke sistem secara paralel (via Web Worker).

### F. Ekspor Laporan
- Buka menu **Export Laporan**.
- Terdapat 3 opsi laporan:
  1. Laporan Inventaris (PDF): Seluruh daftar stok, kategori, dan gudang.
  2. Laporan Transaksi (PDF): Riwayat barang masuk dan keluar.
  3. Laporan Spreadsheet (CSV): Mengunduh semua data mentah ke excel.

## 4. Personalisasi dan Pengaturan
- **Tema Gelap / Terang:** Klik ikon ðŸŒ™/â˜€ï¸ di pojok kanan atas layar.
- **Logout:** Klik lingkaran Avatar User (contoh: [A]) di ujung kanan atas, lalu klik Logout.
