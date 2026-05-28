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
