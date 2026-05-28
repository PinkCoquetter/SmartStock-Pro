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
