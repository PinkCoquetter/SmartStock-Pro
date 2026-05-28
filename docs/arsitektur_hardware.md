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
