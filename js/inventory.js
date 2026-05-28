/**
 * SmartStock Pro — Inventory Management (CRUD)
 */
const Inventory = {
  state: {
    sort: { field: 'name', order: 'asc' },
    page: 1,
    perPage: 10,
    txTab: 'in',
    search: ''
  },

  renderAll() {
    this.populateDropdowns();
    this.renderProducts();
    this.renderCategories();
    this.renderWarehouses();
    this.renderSuppliers();
    this.renderTransactions();
  },

  populateDropdowns() {
    const cats = DataStore.categories.map(c => `<option value="${c.id}">${sanitize(c.name)}</option>`).join('');
    const whs = DataStore.warehouses.map(w => `<option value="${w.id}">${sanitize(w.name)} - ${sanitize(w.city)}</option>`).join('');
    const sups = DataStore.suppliers.map(s => `<option value="${s.id}">${sanitize(s.name)}</option>`).join('');
    
    // Product filters
    const fCat = document.getElementById('filter-product-cat');
    if (fCat) fCat.innerHTML = '<option value="">Semua Kategori</option>' + cats;
    const fWh = document.getElementById('filter-product-wh');
    if (fWh) fWh.innerHTML = '<option value="">Semua Gudang</option>' + whs;
    
    // Product form
    const pCat = document.getElementById('prod-category');
    if (pCat) pCat.innerHTML = '<option value="" disabled selected>Pilih Kategori</option>' + cats;
    const pWh = document.getElementById('prod-warehouse');
    if (pWh) pWh.innerHTML = '<option value="" disabled selected>Pilih Gudang</option>' + whs;
    const pSup = document.getElementById('prod-supplier');
    if (pSup) pSup.innerHTML = '<option value="">Pilih Supplier (Opsional)</option>' + sups;

    // Transaction filter
    const fTxWh = document.getElementById('filter-tx-wh');
    if (fTxWh) fTxWh.innerHTML = '<option value="">Semua Gudang</option>' + whs;
    
    // Transaction form
    const tWh = document.getElementById('tx-warehouse');
    if (tWh) tWh.innerHTML = '<option value="" disabled selected>Pilih Gudang</option>' + whs;
    
    // Transfer form (will be handled by Transfer module, but we can populate here too)
    const trFrom = document.getElementById('transfer-from');
    if (trFrom) trFrom.innerHTML = '<option value="" disabled selected>Dari Gudang</option>' + whs;
    const trTo = document.getElementById('transfer-to');
    if (trTo) trTo.innerHTML = '<option value="" disabled selected>Ke Gudang</option>' + whs;
  },

  // ================= PRODUCTS =================
  renderProducts() {
    const tbody = document.getElementById('products-tbody');
    const empty = document.getElementById('products-empty');
    const tableCard = tbody ? tbody.closest('.card') : null;
    if (!tbody) return;

    let products = [...DataStore.products];

    // Filter
    const fCat = document.getElementById('filter-product-cat')?.value;
    const fWh = document.getElementById('filter-product-wh')?.value;
    const fStock = document.getElementById('filter-product-stock')?.value;
    
    if (fCat) products = products.filter(p => p.category === fCat);
    if (fWh) products = products.filter(p => p.warehouse === fWh);
    if (fStock === 'in') products = products.filter(p => p.stock > (p.minStock || 10));
    else if (fStock === 'low') products = products.filter(p => p.stock > 0 && p.stock <= (p.minStock || 10));
    else if (fStock === 'out') products = products.filter(p => p.stock === 0);
    
    if (this.state.search) {
      const q = this.state.search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.sku.toLowerCase().includes(q)
      );
    }

    // Sort
    const field = this.state.sort.field;
    const order = this.state.sort.order === 'asc' ? 1 : -1;
    products.sort((a, b) => {
      let valA = a[field];
      let valB = b[field];
      if (field === 'category') { valA = DataStore.getCategoryName(valA); valB = DataStore.getCategoryName(valB); }
      if (field === 'warehouse') { valA = DataStore.getWarehouseName(valA); valB = DataStore.getWarehouseName(valB); }
      if (typeof valA === 'string') return valA.localeCompare(valB) * order;
      return (valA - valB) * order;
    });

    // Update sort headers
    document.querySelectorAll('#products-table th').forEach(th => th.classList.remove('sort-active'));
    const thMap = { sku: 0, name: 1, category: 2, warehouse: 3, stock: 4, price: 5 };
    const thIdx = thMap[field];
    if (thIdx !== undefined) {
      const th = document.querySelectorAll('#products-table th')[thIdx];
      if (th) {
        th.classList.add('sort-active');
        th.querySelector('.sort-icon').textContent = order === 1 ? '↑' : '↓';
      }
    }

    if (products.length === 0) {
      if (tableCard) tableCard.style.display = 'none';
      if (empty) empty.style.display = 'block';
      renderPagination('products-pagination', {total:0}, '');
      return;
    }

    if (tableCard) tableCard.style.display = 'block';
    if (empty) empty.style.display = 'none';

    // Paginate
    const pag = paginate(products, this.state.page, this.state.perPage);
    
    // Render
    tbody.innerHTML = pag.data.map(p => {
      let stockStatus = p.stock === 0 ? '<span class="badge badge-danger">Habis</span>' :
                        p.stock <= (p.minStock || 10) ? '<span class="badge badge-warning">Rendah</span>' :
                        '<span class="badge badge-success">Cukup</span>';
      
      const thumb = p.image ? `<img src="${p.image}" class="product-thumb"/>` : `<div class="product-thumb">📦</div>`;
      
      return `
      <tr>
        <td><code>${sanitize(p.sku)}</code></td>
        <td>
          <div class="cell-product">
            ${thumb}
            <div>
              <div class="product-name">${sanitize(p.name)}</div>
              <div class="product-sku truncate" style="max-width:200px" title="${sanitize(p.desc||'')}">${sanitize(p.desc||'-')}</div>
            </div>
          </div>
        </td>
        <td><span class="badge badge-secondary">${sanitize(DataStore.getCategoryName(p.category))}</span></td>
        <td>${sanitize(DataStore.getWarehouseName(p.warehouse))}</td>
        <td style="font-weight:var(--fw-bold);color:var(--${p.stock===0?'danger':p.stock<=(p.minStock||10)?'warning':'success'})">${formatNum(p.stock)}</td>
        <td>${formatRp(p.price)}</td>
        <td>${stockStatus}</td>
        <td>
          <div class="action-btns">
            ${Auth.hasPermission('edit_product') ? `<button class="btn-icon edit" onclick="Inventory.editProduct('${p.id}')" title="Edit">✏️</button>` : ''}
            ${Auth.hasPermission('delete_product') ? `<button class="btn-icon delete" onclick="Inventory.deleteItem('products', '${p.id}')" title="Hapus">🗑️</button>` : ''}
          </div>
        </td>
      </tr>
    `}).join('');

    renderPagination('products-pagination', pag, 'Inventory.productPage');
  },

  applyFilters() {
    this.state.page = 1;
    this.renderProducts();
  },

  sort(field) {
    if (this.state.sort.field === field) {
      this.state.sort.order = this.state.sort.order === 'asc' ? 'desc' : 'asc';
    } else {
      this.state.sort.field = field;
      this.state.sort.order = 'asc';
    }
    this.renderProducts();
  },

  productPage(p) {
    this.state.page = p;
    this.renderProducts();
  },

  openAddProduct() {
    if (!Auth.hasPermission('create_product')) return toast('Anda tidak memiliki izin!', 'error');
    document.getElementById('form-product').reset();
    document.getElementById('prod-id').value = '';
    document.getElementById('modal-product-title').textContent = 'Tambah Produk';
    App.openModal('modal-product');
  },

  editProduct(id) {
    if (!Auth.hasPermission('edit_product')) return toast('Anda tidak memiliki izin!', 'error');
    const p = DataStore.getById('products', id);
    if (!p) return;
    document.getElementById('prod-id').value = p.id;
    document.getElementById('prod-sku').value = p.sku;
    document.getElementById('prod-name').value = p.name;
    document.getElementById('prod-category').value = p.category;
    document.getElementById('prod-warehouse').value = p.warehouse;
    document.getElementById('prod-stock').value = p.stock;
    document.getElementById('prod-min-stock').value = p.minStock || 10;
    document.getElementById('prod-price').value = p.price;
    document.getElementById('prod-supplier').value = p.supplier || '';
    document.getElementById('prod-desc').value = p.desc || '';
    
    document.getElementById('modal-product-title').textContent = 'Edit Produk';
    App.openModal('modal-product');
  },

  saveProduct(e) {
    e.preventDefault();
    const id = document.getElementById('prod-id').value;
    const data = {
      sku: document.getElementById('prod-sku').value,
      name: document.getElementById('prod-name').value,
      category: document.getElementById('prod-category').value,
      warehouse: document.getElementById('prod-warehouse').value,
      stock: parseInt(document.getElementById('prod-stock').value),
      minStock: parseInt(document.getElementById('prod-min-stock').value) || 10,
      price: parseFloat(document.getElementById('prod-price').value),
      supplier: document.getElementById('prod-supplier').value,
      desc: document.getElementById('prod-desc').value
    };

    if (id) {
      DataStore.update('products', id, data);
      toast('Produk berhasil diperbarui');
    } else {
      data.createdAt = today();
      DataStore.add('products', data);
      toast('Produk berhasil ditambahkan');
    }
    
    App.closeModal('modal-product');
    this.renderProducts();
    if (window.Dashboard) Dashboard.renderStats();
    Notifications.checkStockAlerts();
    return false;
  },

  // ================= CATEGORIES =================
  renderCategories() {
    const tbody = document.getElementById('categories-tbody');
    if (!tbody) return;
    const cats = DataStore.categories;
    const prods = DataStore.products;
    
    if (cats.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center" style="padding:var(--sp-xl)">Belum ada kategori</td></tr>';
      return;
    }
    
    tbody.innerHTML = cats.map(c => {
      const count = prods.filter(p => p.category === c.id).length;
      return `
      <tr>
        <td><code>${sanitize(c.id)}</code></td>
        <td style="font-weight:var(--fw-semi)">${sanitize(c.name)}</td>
        <td class="text-muted">${sanitize(c.desc||'-')}</td>
        <td><span class="badge badge-info">${count} Produk</span></td>
        <td>
          <div class="action-btns">
            ${Auth.hasPermission('edit_product') ? `<button class="btn-icon edit" onclick="Inventory.editCategory('${c.id}')" title="Edit">✏️</button>` : ''}
            ${Auth.hasPermission('delete_product') ? `<button class="btn-icon delete" onclick="Inventory.deleteItem('categories', '${c.id}')" title="Hapus">🗑️</button>` : ''}
          </div>
        </td>
      </tr>
    `}).join('');
  },

  openAddCategory() {
    if (!Auth.hasPermission('create_product')) return toast('Anda tidak memiliki izin!', 'error');
    document.getElementById('form-category').reset();
    document.getElementById('cat-id').value = '';
    document.getElementById('modal-category-title').textContent = 'Tambah Kategori';
    App.openModal('modal-category');
  },

  editCategory(id) {
    if (!Auth.hasPermission('edit_product')) return toast('Anda tidak memiliki izin!', 'error');
    const c = DataStore.getById('categories', id);
    if (!c) return;
    document.getElementById('cat-id').value = c.id;
    document.getElementById('cat-name').value = c.name;
    document.getElementById('cat-desc').value = c.desc || '';
    document.getElementById('modal-category-title').textContent = 'Edit Kategori';
    App.openModal('modal-category');
  },

  saveCategory(e) {
    e.preventDefault();
    const id = document.getElementById('cat-id').value;
    const data = {
      name: document.getElementById('cat-name').value,
      desc: document.getElementById('cat-desc').value
    };

    if (id) {
      DataStore.update('categories', id, data);
      toast('Kategori berhasil diperbarui');
    } else {
      DataStore.add('categories', data);
      toast('Kategori berhasil ditambahkan');
    }
    
    App.closeModal('modal-category');
    this.renderCategories();
    this.populateDropdowns();
    return false;
  },

  // ================= WAREHOUSES =================
  renderWarehouses() {
    const tbody = document.getElementById('warehouses-tbody');
    if (!tbody) return;
    const whs = DataStore.warehouses;
    const prods = DataStore.products;
    
    tbody.innerHTML = whs.map(w => {
      const stock = prods.filter(p => p.warehouse === w.id).reduce((s, p) => s + p.stock, 0);
      const cap = w.capacity || 1000;
      const pct = Math.min(100, (stock / cap) * 100);
      const cls = pct > 90 ? 'crit' : pct > 75 ? 'warn' : 'ok';
      
      return `
      <tr>
        <td><code>${sanitize(w.id)}</code></td>
        <td style="font-weight:var(--fw-semi)">${sanitize(w.name)}</td>
        <td>${sanitize(w.city)}</td>
        <td>${formatNum(cap)}</td>
        <td>${formatNum(stock)}</td>
        <td style="min-width:150px">
          <div style="display:flex;justify-content:space-between;font-size:var(--fs-xs);margin-bottom:3px">
            <span>Kapasitas</span><span>${pct.toFixed(1)}%</span>
          </div>
          <div class="monitor-bar"><div class="monitor-bar-fill ${cls}" style="width:${pct}%"></div></div>
        </td>
        <td>
          <div class="action-btns">
            ${Auth.hasPermission('edit_product') ? `<button class="btn-icon edit" onclick="toast('Demo: Edit gudang','info')" title="Edit">✏️</button>` : ''}
          </div>
        </td>
      </tr>
    `}).join('');
  },

  openAddWarehouse() {
    if (!Auth.hasPermission('create_product')) return toast('Anda tidak memiliki izin!', 'error');
    toast('Demo: Form tambah gudang belum diimplementasi penuh', 'info');
  },

  // ================= SUPPLIERS =================
  renderSuppliers() {
    const tbody = document.getElementById('suppliers-tbody');
    if (!tbody) return;
    const sups = DataStore.suppliers;
    
    if (sups.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center" style="padding:var(--sp-xl)">Belum ada supplier</td></tr>';
      return;
    }
    
    tbody.innerHTML = sups.map(s => `
      <tr>
        <td><code>${sanitize(s.id)}</code></td>
        <td style="font-weight:var(--fw-semi)">${sanitize(s.name)}</td>
        <td>${sanitize(s.contact)}</td>
        <td><a href="mailto:${sanitize(s.email)}">${sanitize(s.email)}</a><br><small class="text-muted">${sanitize(s.phone)}</small></td>
        <td>${sanitize(s.city)}</td>
        <td>
          <div class="action-btns">
            ${Auth.hasPermission('edit_product') ? `<button class="btn-icon edit" onclick="Inventory.editSupplier('${s.id}')" title="Edit">✏️</button>` : ''}
            ${Auth.hasPermission('delete_product') ? `<button class="btn-icon delete" onclick="Inventory.deleteItem('suppliers', '${s.id}')" title="Hapus">🗑️</button>` : ''}
          </div>
        </td>
      </tr>
    `).join('');
  },

  openAddSupplier() {
    if (!Auth.hasPermission('create_product')) return toast('Anda tidak memiliki izin!', 'error');
    document.getElementById('form-supplier').reset();
    document.getElementById('sup-id').value = '';
    document.getElementById('modal-supplier-title').textContent = 'Tambah Supplier';
    App.openModal('modal-supplier');
  },

  editSupplier(id) {
    if (!Auth.hasPermission('edit_product')) return toast('Anda tidak memiliki izin!', 'error');
    const s = DataStore.getById('suppliers', id);
    if (!s) return;
    document.getElementById('sup-id').value = s.id;
    document.getElementById('sup-name').value = s.name;
    document.getElementById('sup-contact').value = s.contact || '';
    document.getElementById('sup-phone').value = s.phone || '';
    document.getElementById('sup-email').value = s.email || '';
    document.getElementById('sup-city').value = s.city || '';
    document.getElementById('modal-supplier-title').textContent = 'Edit Supplier';
    App.openModal('modal-supplier');
  },

  saveSupplier(e) {
    e.preventDefault();
    const id = document.getElementById('sup-id').value;
    const data = {
      name: document.getElementById('sup-name').value,
      contact: document.getElementById('sup-contact').value,
      phone: document.getElementById('sup-phone').value,
      email: document.getElementById('sup-email').value,
      city: document.getElementById('sup-city').value
    };

    if (id) {
      DataStore.update('suppliers', id, data);
      toast('Supplier berhasil diperbarui');
    } else {
      DataStore.add('suppliers', data);
      toast('Supplier berhasil ditambahkan');
    }
    
    App.closeModal('modal-supplier');
    this.renderSuppliers();
    this.populateDropdowns();
    return false;
  },

  // ================= TRANSACTIONS =================
  switchTxTab(tab) {
    this.state.txTab = tab;
    document.querySelectorAll('#tx-tabs .tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`#tx-tabs .tab:nth-child(${tab==='in'?1:2})`).classList.add('active');
    
    const btn = document.getElementById('btn-add-tx');
    if (btn) {
      btn.innerHTML = tab === 'in' ? '➕ Tambah Transaksi Masuk' : '➖ Tambah Transaksi Keluar';
      btn.className = tab === 'in' ? 'btn btn-primary' : 'btn btn-danger';
    }
    
    this.renderTransactions();
  },

  filterTx() { this.renderTransactions(); },

  renderTransactions() {
    const tbody = document.getElementById('transactions-tbody');
    if (!tbody) return;
    
    let txs = DataStore.transactions.filter(t => t.type === this.state.txTab);
    const fWh = document.getElementById('filter-tx-wh')?.value;
    if (fWh) txs = txs.filter(t => t.warehouseId === fWh);
    
    // Sort descending by date/id
    txs.sort((a, b) => b.id.localeCompare(a.id));
    
    if (txs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding:var(--sp-xl)">Tidak ada transaksi barang ${this.state.txTab==='in'?'masuk':'keluar'}</td></tr>`;
      return;
    }
    
    tbody.innerHTML = txs.map(t => {
      const isOut = t.type === 'out';
      return `
      <tr>
        <td><code>${sanitize(t.id)}</code></td>
        <td>${formatDate(t.date)}</td>
        <td style="font-weight:var(--fw-semi)">${sanitize(t.productName)}</td>
        <td>${sanitize(t.warehouseName)}</td>
        <td style="font-weight:var(--fw-bold);color:var(--${isOut?'danger':'success'})">
          ${isOut?'-':'+'}${formatNum(t.qty)}
        </td>
        <td><span class="badge ${isOut?'badge-danger':'badge-success'}">${isOut?'Keluar':'Masuk'}</span></td>
        <td class="text-muted">${sanitize(t.note||'-')}</td>
      </tr>
    `}).join('');
  },

  openAddTransaction() {
    if (!Auth.hasPermission('create_transaction')) return toast('Anda tidak memiliki izin!', 'error');
    document.getElementById('form-transaction').reset();
    document.getElementById('tx-type').value = this.state.txTab;
    document.getElementById('tx-date').value = today();
    
    // Populate products for this modal specifically
    const pSel = document.getElementById('tx-product');
    if (pSel) {
      pSel.innerHTML = '<option value="" disabled selected>Pilih Produk</option>' + 
        DataStore.products.map(p => `<option value="${p.id}">${sanitize(p.sku)} - ${sanitize(p.name)}</option>`).join('');
    }
    
    document.getElementById('modal-tx-title').textContent = this.state.txTab === 'in' ? 'Tambah Transaksi Masuk' : 'Tambah Transaksi Keluar';
    App.openModal('modal-transaction');
  },

  saveTransaction(e) {
    e.preventDefault();
    const type = document.getElementById('tx-type').value;
    const pId = document.getElementById('tx-product').value;
    const wId = document.getElementById('tx-warehouse').value;
    const qty = parseInt(document.getElementById('tx-qty').value);
    
    const prod = DataStore.getById('products', pId);
    const wh = DataStore.getById('warehouses', wId);
    
    if (!prod || !wh) return toast('Pilih produk dan gudang valid', 'error');
    
    // Auto update stock
    let newStock = prod.stock;
    if (type === 'in') {
      newStock += qty;
    } else {
      if (prod.stock < qty) return toast(`Stok tidak cukup! (Sisa: ${prod.stock})`, 'error');
      newStock -= qty;
    }
    
    DataStore.update('products', pId, { stock: newStock });
    
    DataStore.add('transactions', {
      date: document.getElementById('tx-date').value || today(),
      productId: pId,
      productName: prod.name,
      warehouseId: wId,
      warehouseName: wh.name,
      qty: qty,
      type: type,
      note: document.getElementById('tx-note').value
    });
    
    toast('Transaksi berhasil disimpan');
    App.closeModal('modal-transaction');
    this.renderTransactions();
    this.renderProducts();
    if (window.Dashboard) Dashboard.renderStats();
    Notifications.checkStockAlerts();
    return false;
  },

  // ================= GENERAL DELETE =================
  deleteItem(type, id) {
    if (!Auth.hasPermission('delete_product')) return toast('Anda tidak memiliki izin!', 'error');
    document.getElementById('delete-msg').textContent = `Anda yakin ingin menghapus data ${type} ini?`;
    document.getElementById('btn-confirm-delete').onclick = () => {
      DataStore.remove(type, id);
      toast('Data berhasil dihapus');
      App.closeModal('modal-delete');
      if (type === 'products') this.renderProducts();
      else if (type === 'categories') { this.renderCategories(); this.populateDropdowns(); }
      else if (type === 'suppliers') { this.renderSuppliers(); this.populateDropdowns(); }
      if (window.Dashboard) Dashboard.renderStats();
    };
    App.openModal('modal-delete');
  },

  // ================= GALLERY =================
  showGallery() {
    App.go('gallery');
    this.renderGallery();
  },

  renderGallery() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;
    
    let images = DataStore.images || [];
    let prods = DataStore.products.filter(p => p.image);
    
    // If no real images, generate some placeholders for demo
    let itemsHtml = '';
    if (prods.length === 0 && images.length === 0) {
      itemsHtml = `
        <div class="empty-state" style="grid-column: 1/-1">
          <div class="empty-icon">🖼️</div>
          <h3>Galeri Kosong</h3><p>Upload gambar produk pertama Anda</p>
        </div>`;
    } else {
      itemsHtml = prods.map(p => `
        <div class="gallery-item" onclick="Inventory.previewImage('${p.image}')">
          <img src="${p.image}" alt="${sanitize(p.name)}"/>
          <div style="padding:8px;font-size:var(--fs-xs);text-align:center" class="truncate">${sanitize(p.name)}</div>
        </div>
      `).join('');
      
      itemsHtml += images.map(img => `
        <div class="gallery-item" onclick="Inventory.previewImage('${img.dataUrl}')">
          <img src="${img.dataUrl}" alt="Uploaded image"/>
        </div>
      `).join('');
    }
    
    // We add the upload button back at the start
    grid.innerHTML = itemsHtml;
  },
  
  previewImage(url) {
    document.getElementById('modal-image-preview').src = url;
    App.openModal('modal-image');
  },

  uploadImage() {
    document.getElementById('gallery-upload-input').click();
  },

  handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast('Harap pilih file gambar', 'error');
    if (file.size > 2 * 1024 * 1024) return toast('Ukuran gambar max 2MB', 'error');
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      const id = uid('img_');
      
      const images = DataStore.images || [];
      images.push({ id, dataUrl, timestamp: new Date().toISOString() });
      DataStore._save('images', images);
      
      toast('Gambar berhasil diunggah', 'success');
      this.renderGallery();
    };
    reader.readAsDataURL(file);
  }
};

console.log('[SmartStock] inventory.js loaded');
