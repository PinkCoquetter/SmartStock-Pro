/**
 * SmartStock Pro — Data Layer
 * Seed data, localStorage CRUD, DataStore
 */

const SEED_CATEGORIES = [
  { id:'cat_01', name:'Elektronik Konsumen', desc:'Smartphone, tablet, dan perangkat elektronik konsumen' },
  { id:'cat_02', name:'Komputer & Laptop', desc:'Laptop, desktop, dan komponen komputer' },
  { id:'cat_03', name:'Aksesoris', desc:'Aksesoris gadget, kabel, casing, dan pelindung' },
  { id:'cat_04', name:'Perangkat Jaringan', desc:'Router, switch, access point, dan kabel jaringan' },
  { id:'cat_05', name:'Storage & Memory', desc:'SSD, HDD, flash drive, dan memory card' },
  { id:'cat_06', name:'Audio & Video', desc:'Speaker, headphone, kamera, dan proyektor' }
];

const SEED_WAREHOUSES = [
  { id:'wh_01', name:'Gudang Jakarta', city:'Jakarta', address:'Jl. Industri Raya No.12, Cakung', capacity:5000, lat:-6.2088, lng:106.8456 },
  { id:'wh_02', name:'Gudang Surabaya', city:'Surabaya', address:'Jl. Rungkut Industri No.8', capacity:3500, lat:-7.2575, lng:112.7521 },
  { id:'wh_03', name:'Gudang Bandung', city:'Bandung', address:'Jl. Soekarno-Hatta No.45', capacity:2500, lat:-6.9175, lng:107.6191 },
  { id:'wh_04', name:'Gudang Medan', city:'Medan', address:'Jl. Gatot Subroto KM 7.5', capacity:2000, lat:3.5952, lng:98.6722 },
  { id:'wh_05', name:'Gudang Makassar', city:'Makassar', address:'Jl. Perintis Kemerdekaan No.22', capacity:1500, lat:-5.1477, lng:119.4327 }
];

const SEED_SUPPLIERS = [
  { id:'sup_01', name:'PT Distribusi Elektronika Nusantara', contact:'Budi Hartono', phone:'02156781234', email:'budi@den.co.id', city:'Jakarta' },
  { id:'sup_02', name:'CV Mitra Teknologi Abadi', contact:'Siti Rahayu', phone:'03178905678', email:'siti@mitratek.com', city:'Surabaya' },
  { id:'sup_03', name:'PT Global Gadget Indonesia', contact:'Andi Wijaya', phone:'02245671234', email:'andi@globalgadget.id', city:'Bandung' },
  { id:'sup_04', name:'UD Sumber Komputer', contact:'Dewi Lestari', phone:'06145678901', email:'dewi@sumberkomputer.com', city:'Medan' },
  { id:'sup_05', name:'PT Mega Elektronik Sejahtera', contact:'Rizky Pratama', phone:'04115678234', email:'rizky@megaelektronik.id', city:'Makassar' }
];

const SEED_PRODUCTS = [
  { id:'prd_01',sku:'EL-001',name:'Samsung Galaxy S24 Ultra',category:'cat_01',warehouse:'wh_01',stock:85,minStock:20,price:19999000,supplier:'sup_01',desc:'Smartphone flagship Samsung terbaru',image:null,createdAt:'2025-01-10' },
  { id:'prd_02',sku:'EL-002',name:'iPhone 15 Pro Max',category:'cat_01',warehouse:'wh_01',stock:42,minStock:15,price:24999000,supplier:'sup_03',desc:'Apple iPhone 15 Pro Max 256GB',image:null,createdAt:'2025-01-12' },
  { id:'prd_03',sku:'KL-001',name:'ASUS VivoBook 15',category:'cat_02',warehouse:'wh_01',stock:30,minStock:10,price:8499000,supplier:'sup_01',desc:'Laptop ASUS VivoBook 15 Intel i5',image:null,createdAt:'2025-01-15' },
  { id:'prd_04',sku:'KL-002',name:'Lenovo ThinkPad X1 Carbon',category:'cat_02',warehouse:'wh_02',stock:18,minStock:10,price:22500000,supplier:'sup_02',desc:'Laptop bisnis premium Lenovo',image:null,createdAt:'2025-01-18' },
  { id:'prd_05',sku:'KL-003',name:'HP Pavilion Gaming 15',category:'cat_02',warehouse:'wh_03',stock:5,minStock:10,price:12999000,supplier:'sup_03',desc:'Laptop gaming HP Pavilion',image:null,createdAt:'2025-02-01' },
  { id:'prd_06',sku:'AK-001',name:'Logitech MX Master 3S',category:'cat_03',warehouse:'wh_01',stock:120,minStock:30,price:1299000,supplier:'sup_01',desc:'Mouse wireless ergonomis premium',image:null,createdAt:'2025-02-05' },
  { id:'prd_07',sku:'AK-002',name:'Keychron K2 Mechanical Keyboard',category:'cat_03',warehouse:'wh_02',stock:65,minStock:15,price:1450000,supplier:'sup_02',desc:'Keyboard mekanik wireless 75%',image:null,createdAt:'2025-02-10' },
  { id:'prd_08',sku:'AK-003',name:'Samsung Galaxy Buds2 Pro',category:'cat_03',warehouse:'wh_01',stock:0,minStock:20,price:2999000,supplier:'sup_01',desc:'TWS ANC premium Samsung',image:null,createdAt:'2025-02-12' },
  { id:'prd_09',sku:'PJ-001',name:'TP-Link Archer AX73',category:'cat_04',warehouse:'wh_02',stock:45,minStock:15,price:1549000,supplier:'sup_02',desc:'WiFi 6 Router AX5400 Dual-Band',image:null,createdAt:'2025-02-15' },
  { id:'prd_10',sku:'PJ-002',name:'Ubiquiti UniFi AP AC Pro',category:'cat_04',warehouse:'wh_03',stock:8,minStock:10,price:2850000,supplier:'sup_03',desc:'Access point enterprise',image:null,createdAt:'2025-02-20' },
  { id:'prd_11',sku:'PJ-003',name:'Cisco SG350-28 Switch',category:'cat_04',warehouse:'wh_04',stock:12,minStock:5,price:7500000,supplier:'sup_04',desc:'Managed switch 28-port gigabit',image:null,createdAt:'2025-03-01' },
  { id:'prd_12',sku:'SM-001',name:'Samsung 970 EVO Plus 1TB',category:'cat_05',warehouse:'wh_01',stock:200,minStock:40,price:1699000,supplier:'sup_01',desc:'NVMe M.2 SSD 1TB',image:null,createdAt:'2025-03-05' },
  { id:'prd_13',sku:'SM-002',name:'WD Elements 2TB',category:'cat_05',warehouse:'wh_02',stock:90,minStock:25,price:899000,supplier:'sup_02',desc:'External HDD portable 2TB',image:null,createdAt:'2025-03-08' },
  { id:'prd_14',sku:'SM-003',name:'SanDisk Ultra 128GB MicroSD',category:'cat_05',warehouse:'wh_03',stock:350,minStock:50,price:225000,supplier:'sup_03',desc:'MicroSD card UHS-I 128GB',image:null,createdAt:'2025-03-10' },
  { id:'prd_15',sku:'SM-004',name:'Kingston FURY 16GB DDR5',category:'cat_05',warehouse:'wh_04',stock:3,minStock:15,price:1150000,supplier:'sup_04',desc:'RAM DDR5 16GB 4800MHz',image:null,createdAt:'2025-03-12' },
  { id:'prd_16',sku:'AV-001',name:'JBL Flip 6 Speaker',category:'cat_06',warehouse:'wh_01',stock:55,minStock:15,price:1799000,supplier:'sup_01',desc:'Portable Bluetooth speaker IP67',image:null,createdAt:'2025-03-15' },
  { id:'prd_17',sku:'AV-002',name:'Sony WH-1000XM5',category:'cat_06',warehouse:'wh_02',stock:28,minStock:10,price:4999000,supplier:'sup_02',desc:'Headphone ANC premium Sony',image:null,createdAt:'2025-03-18' },
  { id:'prd_18',sku:'AV-003',name:'Logitech C920 HD Pro Webcam',category:'cat_06',warehouse:'wh_03',stock:40,minStock:10,price:1299000,supplier:'sup_03',desc:'Webcam Full HD 1080p',image:null,createdAt:'2025-03-20' },
  { id:'prd_19',sku:'EL-003',name:'Xiaomi Pad 6',category:'cat_01',warehouse:'wh_04',stock:15,minStock:10,price:4999000,supplier:'sup_04',desc:'Tablet Xiaomi 11 inch Snapdragon',image:null,createdAt:'2025-04-01' },
  { id:'prd_20',sku:'EL-004',name:'Samsung Galaxy Watch 6',category:'cat_01',warehouse:'wh_05',stock:22,minStock:10,price:4299000,supplier:'sup_05',desc:'Smartwatch Samsung terbaru',image:null,createdAt:'2025-04-05' },
  { id:'prd_21',sku:'KL-004',name:'Acer Aspire 5 Slim',category:'cat_02',warehouse:'wh_05',stock:0,minStock:8,price:7999000,supplier:'sup_05',desc:'Laptop Acer Aspire Slim AMD Ryzen',image:null,createdAt:'2025-04-10' },
  { id:'prd_22',sku:'AK-004',name:'Anker PowerCore 20000mAh',category:'cat_03',warehouse:'wh_04',stock:75,minStock:20,price:499000,supplier:'sup_04',desc:'Power bank 20000mAh fast charge',image:null,createdAt:'2025-04-12' },
  { id:'prd_23',sku:'AV-004',name:'Epson EpiqVision Mini EF-11',category:'cat_06',warehouse:'wh_05',stock:7,minStock:5,price:11999000,supplier:'sup_05',desc:'Proyektor laser mini 1080p',image:null,createdAt:'2025-04-15' },
  { id:'prd_24',sku:'PJ-004',name:'Mikrotik RB750Gr3',category:'cat_04',warehouse:'wh_05',stock:35,minStock:10,price:950000,supplier:'sup_05',desc:'Router MikroTik hEX 5-port Gigabit',image:null,createdAt:'2025-04-18' },
  { id:'prd_25',sku:'AK-005',name:'USB-C Hub 7-in-1',category:'cat_03',warehouse:'wh_03',stock:110,minStock:25,price:359000,supplier:'sup_03',desc:'USB-C Hub HDMI/USB3/SD/PD',image:null,createdAt:'2025-04-20' }
];

// Generate seed transactions for the last 30 days
function generateSeedTransactions() {
  const txs = [];
  const types = ['in','out'];
  const notes = { in:['Pengadaan rutin','Restok dari supplier','Penerimaan batch baru','Return dari pelanggan'],
                  out:['Pengiriman ke pelanggan','Permintaan cabang','Stok display','Pengiriman proyek'] };
  for (let i = 0; i < 20; i++) {
    const t = types[i % 3 === 0 ? 1 : 0];
    const p = SEED_PRODUCTS[i % SEED_PRODUCTS.length];
    const w = SEED_WAREHOUSES.find(w => w.id === p.warehouse) || SEED_WAREHOUSES[0];
    const d = new Date(); d.setDate(d.getDate() - Math.floor(Math.random() * 30));
    txs.push({
      id: 'tx_' + String(i+1).padStart(3,'0'),
      date: d.toISOString().slice(0,10),
      productId: p.id, productName: p.name,
      warehouseId: w.id, warehouseName: w.name,
      qty: Math.floor(Math.random() * 50) + 5,
      type: t,
      note: notes[t][Math.floor(Math.random() * notes[t].length)]
    });
  }
  return txs.sort((a,b) => b.date.localeCompare(a.date));
}

// DataStore — localStorage CRUD wrapper
const DataStore = {
  _prefix: 'ssp_',

  _load(key) {
    try { return JSON.parse(localStorage.getItem(this._prefix + key) || 'null'); }
    catch(e) { console.error('[DataStore] Load error:', key, e); return null; }
  },

  _save(key, data) {
    try { localStorage.setItem(this._prefix + key, JSON.stringify(data)); }
    catch(e) { console.error('[DataStore] Save error:', key, e); toast('Gagal menyimpan data!','error'); }
  },

  init() {
    if (!this._load('products')) {
      this._save('products', SEED_PRODUCTS);
      this._save('categories', SEED_CATEGORIES);
      this._save('warehouses', SEED_WAREHOUSES);
      this._save('suppliers', SEED_SUPPLIERS);
      this._save('transactions', generateSeedTransactions());
      this._save('transfers', []);
      this._save('notifications', []);
      this._save('errors', []);
      this._save('images', []);
      console.log('[DataStore] Seed data loaded.');
    } else {
      console.log('[DataStore] Existing data loaded.');
    }
  },

  getAll(entity) { return this._load(entity) || []; },
  getById(entity, id) { return this.getAll(entity).find(i => i.id === id) || null; },

  add(entity, item) {
    const arr = this.getAll(entity);
    if (!item.id) item.id = uid(entity.slice(0,3) + '_');
    arr.push(item);
    this._save(entity, arr);
    auditLog('CREATE', `Tambah ${entity}: ${item.name || item.sku || item.id}`);
    return item;
  },

  update(entity, id, data) {
    const arr = this.getAll(entity);
    const idx = arr.findIndex(i => i.id === id);
    if (idx === -1) return null;
    arr[idx] = { ...arr[idx], ...data };
    this._save(entity, arr);
    auditLog('UPDATE', `Edit ${entity}: ${data.name || data.sku || id}`);
    return arr[idx];
  },

  remove(entity, id) {
    let arr = this.getAll(entity);
    const item = arr.find(i => i.id === id);
    arr = arr.filter(i => i.id !== id);
    this._save(entity, arr);
    if (item) auditLog('DELETE', `Hapus ${entity}: ${item.name || item.sku || id}`);
    return true;
  },

  get products() { return this.getAll('products'); },
  get categories() { return this.getAll('categories'); },
  get warehouses() { return this.getAll('warehouses'); },
  get suppliers() { return this.getAll('suppliers'); },
  get transactions() { return this.getAll('transactions'); },
  get transfers() { return this.getAll('transfers'); },
  get notifications() { return this.getAll('notifications'); },
  get errors() { return this.getAll('errors'); },
  get images() { return this.getAll('images'); },

  getCategoryName(id) { const c = this.getById('categories', id); return c ? c.name : id; },
  getWarehouseName(id) { const w = this.getById('warehouses', id); return w ? w.name : id; },
  getSupplierName(id) { const s = this.getById('suppliers', id); return s ? s.name : id; },

  resetData() {
    ['products','categories','warehouses','suppliers','transactions','transfers','notifications','errors','images','audit'].forEach(k => localStorage.removeItem(this._prefix + k));
    this.init();
    console.log('[DataStore] Data reset.');
  }
};

DataStore.init();
console.log('[SmartStock] data.js loaded —', DataStore.products.length, 'products');
