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
