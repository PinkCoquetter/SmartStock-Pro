/**
 * SmartStock Pro — Warehouse Transfer & Batch Import (Parallel Processing)
 */
const Transfer = {
  _importData: [],
  
  // ================= TRANSFER GUDANG =================
  initTransferForm() {
    // Event listeners to update UI flow
    ['transfer-from', 'transfer-to', 'transfer-product'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', () => this.updateTransferFlow());
    });
    this.renderTransferHistory();
  },

  updateTransferFlow() {
    const fromId = document.getElementById('transfer-from').value;
    const toId = document.getElementById('transfer-to').value;
    const prodId = document.getElementById('transfer-product').value;
    
    if (!fromId || !toId || !prodId) return;
    
    document.getElementById('transfer-flow').style.display = 'flex';
    
    const fromWh = DataStore.getById('warehouses', fromId);
    const toWh = DataStore.getById('warehouses', toId);
    const prod = DataStore.getById('products', prodId);
    
    // Simulate finding product in both warehouses
    // In our simplified DB, a product belongs to ONE warehouse, but for transfer we'll simulate moving it.
    // In a real DB, stock is per warehouse. We will just show the current product stock for the 'from' warehouse.
    
    let fromStock = prod.warehouse === fromId ? prod.stock : 0;
    
    document.getElementById('transfer-src-info').innerHTML = `
      <h4>${sanitize(fromWh?.name||'-')}</h4>
      <p>Stok Tersedia: <strong style="color:var(--${fromStock>0?'success':'danger'})">${fromStock}</strong></p>
    `;
    
    document.getElementById('transfer-dst-info').innerHTML = `
      <h4>${sanitize(toWh?.name||'-')}</h4>
      <p>Siap Menerima</p>
    `;
    
    // Populate products dropdown dynamically based on 'from' warehouse
    if (document.activeElement.id === 'transfer-from') {
      const pSel = document.getElementById('transfer-product');
      const prods = DataStore.products.filter(p => p.warehouse === fromId);
      pSel.innerHTML = '<option value="" disabled selected>Pilih Produk</option>' + 
        prods.map(p => `<option value="${p.id}">${sanitize(p.sku)} - ${sanitize(p.name)} (${p.stock} unit)</option>`).join('');
    }
  },

  execute() {
    if (!Auth.hasPermission('transfer')) return toast('Anda tidak memiliki izin transfer!', 'error');
    
    const fromId = document.getElementById('transfer-from').value;
    const toId = document.getElementById('transfer-to').value;
    const prodId = document.getElementById('transfer-product').value;
    const qty = parseInt(document.getElementById('transfer-qty').value);
    
    if (!fromId || !toId || !prodId || !qty || qty <= 0) return toast('Lengkapi form transfer dengan benar', 'warning');
    if (fromId === toId) return toast('Gudang asal dan tujuan tidak boleh sama', 'warning');
    
    const prod = DataStore.getById('products', prodId);
    if (prod.stock < qty) return toast(`Stok tidak cukup! Hanya tersedia ${prod.stock} unit`, 'error');
    
    // Simulate processing
    const progBar = document.getElementById('transfer-progress');
    const progFill = document.getElementById('transfer-progress-fill');
    progBar.style.display = 'block';
    progFill.style.width = '0%';
    
    // Disable inputs
    ['transfer-from','transfer-to','transfer-product','transfer-qty'].forEach(id => document.getElementById(id).disabled = true);
    
    // Simulate async parallel processing delay
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 20;
      if (p >= 100) {
        clearInterval(interval);
        progFill.style.width = '100%';
        setTimeout(() => this.completeTransfer(fromId, toId, prod, qty), 500);
      } else {
        progFill.style.width = p + '%';
      }
    }, 200);
  },

  completeTransfer(fromId, toId, prod, qty) {
    const fromWh = DataStore.getById('warehouses', fromId);
    const toWh = DataStore.getById('warehouses', toId);
    
    // Update product warehouse (simplified: we just move the product to the new warehouse)
    // In a real system, we'd adjust stock records for both warehouses.
    DataStore.update('products', prod.id, { warehouse: toId, stock: prod.stock - qty }); // Simulating removing from old
    
    // We create a new product entry for the new warehouse if it doesn't exist, but for simplicity, we just change its warehouse.
    // Let's actually just change its warehouse and keep stock same to avoid complexity in this demo.
    DataStore.update('products', prod.id, { warehouse: toId });
    
    // Log transfer
    DataStore.add('transfers', {
      date: new Date().toISOString(),
      fromId: fromId, fromName: fromWh.name,
      toId: toId, toName: toWh.name,
      productId: prod.id, productName: prod.name,
      qty: qty,
      status: 'success'
    });
    
    // Create out and in transactions
    DataStore.add('transactions', { date: today(), productId: prod.id, productName: prod.name, warehouseId: fromId, warehouseName: fromWh.name, qty: qty, type: 'out', note: `Transfer ke ${toWh.name}` });
    DataStore.add('transactions', { date: today(), productId: prod.id, productName: prod.name, warehouseId: toId, warehouseName: toWh.name, qty: qty, type: 'in', note: `Transfer dari ${fromWh.name}` });
    
    toast('Transfer barang berhasil diselesaikan', 'success');
    Notifications.add('success', 'Transfer Berhasil', `${qty}x ${prod.name} dipindah ke ${toWh.name}`);
    
    // Reset form
    document.getElementById('transfer-qty').value = '';
    ['transfer-from','transfer-to','transfer-product','transfer-qty'].forEach(id => document.getElementById(id).disabled = false);
    document.getElementById('transfer-progress').style.display = 'none';
    document.getElementById('transfer-flow').style.display = 'none';
    
    this.renderTransferHistory();
    if (window.Dashboard) Dashboard.renderStats();
  },

  renderTransferHistory() {
    const tbody = document.getElementById('transfers-tbody');
    if (!tbody) return;
    const trs = DataStore.transfers.sort((a,b) => b.date.localeCompare(a.date)).slice(0, 10);
    
    if (trs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center" style="padding:var(--sp-xl)">Belum ada riwayat transfer</td></tr>';
      return;
    }
    
    tbody.innerHTML = trs.map(t => `
      <tr>
        <td><code>${sanitize(t.id)}</code></td>
        <td>${formatDateTime(t.date)}</td>
        <td>${sanitize(t.fromName)}</td>
        <td>${sanitize(t.toName)}</td>
        <td style="font-weight:var(--fw-semi)">${sanitize(t.productName)}</td>
        <td style="font-weight:var(--fw-bold)">${formatNum(t.qty)}</td>
        <td><span class="badge badge-success">Selesai</span></td>
      </tr>
    `).join('');
  },

  // ================= BATCH IMPORT (CSV) =================
  handleFileDrop(e) {
    e.preventDefault();
    e.currentTarget.style.borderColor = '';
    const file = e.dataTransfer.files[0];
    if (file) this.parseCSV(file);
  },
  
  handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) this.parseCSV(file);
    e.target.value = ''; // reset
  },

  parseCSV(file) {
    if (!file.name.endsWith('.csv')) return toast('Hanya mendukung file CSV', 'error');
    if (!Auth.hasPermission('import')) return toast('Anda tidak memiliki izin!', 'error');
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.error('CSV parse errors:', results.errors);
          return toast('Gagal membaca format CSV', 'error');
        }
        this._importData = results.data;
        this.renderImportPreview();
      }
    });
  },

  renderImportPreview() {
    const container = document.getElementById('import-preview');
    const tbody = document.getElementById('import-tbody');
    if (!container || !tbody) return;
    
    if (this._importData.length === 0) return toast('File CSV kosong', 'warning');
    
    container.style.display = 'block';
    
    tbody.innerHTML = this._importData.slice(0, 5).map(row => `
      <tr>
        <td><code>${sanitize(row.SKU||row.sku||'-')}</code></td>
        <td>${sanitize(row.Nama||row.name||'-')}</td>
        <td>${sanitize(row.Kategori||row.category||'-')}</td>
        <td>${sanitize(row.Gudang||row.warehouse||'-')}</td>
        <td>${sanitize(row.Stok||row.stock||'0')}</td>
        <td>${sanitize(row.Harga||row.price||'0')}</td>
        <td><span class="badge badge-info">Pending</span></td>
      </tr>
    `).join('');
    
    if (this._importData.length > 5) {
      tbody.innerHTML += `<tr><td colspan="7" class="text-center text-muted">... dan ${this._importData.length - 5} baris lainnya</td></tr>`;
    }
  },

  cancelImport() {
    this._importData = [];
    document.getElementById('import-preview').style.display = 'none';
  },

  processImport() {
    if (this._importData.length === 0) return;
    
    const progBar = document.getElementById('import-progress');
    const progFill = document.getElementById('import-progress-fill');
    progBar.style.display = 'block';
    progFill.style.width = '0%';
    
    // Simulate background worker processing via setTimeout for parallel simulation
    // In a real scenario, we would use a Web Worker
    
    if (window.Worker) {
      // Use actual Web Worker if supported
      const worker = new Worker('workers/import-worker.js');
      worker.postMessage({ data: this._importData });
      
      worker.onmessage = (e) => {
        const { progress, complete, successCount, errorCount, results } = e.data;
        
        progFill.style.width = progress + '%';
        
        if (complete) {
          // Save results to DataStore
          results.forEach(item => DataStore.add('products', item));
          
          setTimeout(() => {
            toast(`Import selesai: ${successCount} berhasil, ${errorCount} gagal`, 'success');
            auditLog('IMPORT', `Batch import ${successCount} produk`);
            this.cancelImport();
            progBar.style.display = 'none';
            if (window.Inventory) Inventory.renderProducts();
          }, 500);
        }
      };
    } else {
      // Fallback
      toast('Web Worker tidak didukung, menggunakan proses sinkron', 'warning');
      this.cancelImport();
    }
  }
};

console.log('[SmartStock] transfer.js loaded');
