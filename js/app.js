/**
 * SmartStock Pro — Main Application Controller & Router
 */
const App = {
  
  init() {
    // 1. Auth check
    if (!Auth.check()) return;
    Auth.renderSessionInfo();
    Auth.setupSessionTimeout();

    // 2. Setup theme
    const theme = localStorage.getItem('ssp_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelector('.header-icon-btn[title="Toggle Tema"]').textContent = theme === 'dark' ? '🌙' : '☀️';

    // 3. Setup event listeners
    this.setupListeners();

    // 4. Initial Render
    Dashboard.render();
    Notifications.checkStockAlerts();
    Monitoring.start();
    
    // Check hash for initial route
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById('view-' + hash)) {
      this.go(hash);
    }
  },

  setupListeners() {
    // Escape to close modals
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(el => el.classList.remove('active'));
      }
    });

    // Click outside to close modals
    document.querySelectorAll('.modal-overlay').forEach(el => {
      el.addEventListener('mousedown', e => {
        if (e.target === el) el.classList.remove('active');
      });
    });

    // Click outside to close notif dropdown
    document.addEventListener('click', e => {
      const drop = document.getElementById('notif-dropdown');
      const btn = document.getElementById('notif-btn');
      if (drop && drop.classList.contains('open') && !drop.contains(e.target) && !btn.contains(e.target)) {
        drop.classList.remove('open');
      }
    });
  },

  go(viewName) {
    // Hide all views
    document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
    
    // Remove active from nav
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    
    // Show view
    const view = document.getElementById('view-' + viewName);
    if (view) view.classList.add('active');
    
    // Activate nav
    const nav = document.querySelector(`.nav-item[data-view="${viewName}"]`);
    if (nav) nav.classList.add('active');
    
    // Update header
    const titles = {
      dashboard: 'Dashboard', products: 'Produk', categories: 'Kategori',
      warehouses: 'Gudang', suppliers: 'Supplier', transactions: 'Transaksi',
      transfer: 'Transfer Antar Gudang', import: 'Batch Import',
      notifications: 'Semua Notifikasi', monitoring: 'Resource Monitoring',
      errorlog: 'Error Log', audit: 'Audit Log', sql: 'SQL Console',
      reports: 'Laporan & Export', gallery: 'Galeri Produk'
    };
    
    const titleText = titles[viewName] || viewName;
    document.getElementById('page-title').textContent = titleText;
    document.getElementById('page-breadcrumb').textContent = `SmartStock Pro / ${titleText}`;
    
    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
      document.getElementById('sidebar').classList.remove('open');
    }
    
    // Trigger view-specific render
    if (viewName === 'dashboard') Dashboard.render();
    if (['products','categories','warehouses','suppliers','transactions'].includes(viewName)) Inventory.renderAll();
    if (viewName === 'transfer') Transfer.initTransferForm();
    if (viewName === 'notifications') Notifications.renderAll();
    if (viewName === 'monitoring') Monitoring.renderCharts();
    if (viewName === 'errorlog') Monitoring.renderErrorLog();
    if (viewName === 'audit') Monitoring.renderAuditLog();
    
    window.location.hash = viewName;
    auditLog('NAVIGATE', `Membuka halaman ${titleText}`);
  },

  toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
  },

  toggleTheme() {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('ssp_theme', newTheme);
    document.querySelector('.header-icon-btn[title="Toggle Tema"]').textContent = isDark ? '☀️' : '🌙';
  },

  toggleNotifDropdown() {
    const drop = document.getElementById('notif-dropdown');
    if (drop) {
      drop.classList.toggle('open');
      if (drop.classList.contains('open')) Notifications.renderDropdown();
    }
  },

  closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
  },

  openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
  },

  globalSearch(val) {
    const term = val.trim();
    if (!document.getElementById('view-products').classList.contains('active') && term.length > 0) {
      this.go('products');
    }
    if (window.Inventory) {
      Inventory.state.search = term;
      // Debounce logic is built into the call here manually via timeout
      if (this._searchTimeout) clearTimeout(this._searchTimeout);
      this._searchTimeout = setTimeout(() => Inventory.applyFilters(), 400);
    }
  },

  logout() {
    Auth.logout();
  },

  // ================= SQL SIMULATION =================
  loadSampleSQL() {
    document.getElementById('sql-editor').value = 
`-- Query stok rendah
SELECT sku, name, stock, warehouse FROM products WHERE stock <= 10;

-- Menghitung total stok per kategori
SELECT category, count(*) as count FROM products;

-- Menampilkan aktivitas transfer
SELECT fromName, toName, productName, qty FROM transfers;`;
  },

  executeSQL() {
    if (!Auth.hasPermission('execute_sql')) return toast('Anda tidak memiliki izin!', 'error');
    
    const query = document.getElementById('sql-editor').value.trim();
    const resultBox = document.getElementById('sql-result');
    const outputEl = document.getElementById('sql-output');
    
    if (!query) return;
    
    resultBox.style.display = 'block';
    outputEl.innerHTML = '<span class="text-muted">Mengeksekusi query...</span>';
    
    // Very naive SQL parser simulation
    setTimeout(() => {
      try {
        let q = query.replace(/--.*$/gm, '').trim().replace(/\s+/g, ' '); // remove comments and extra spaces
        if (!q.toUpperCase().startsWith('SELECT')) throw new Error('Hanya mendukung perintah SELECT');
        
        let match = q.match(/SELECT\s+(.+?)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+?))?(?:;|$)/i);
        if (!match) throw new Error('Syntax error. Contoh: SELECT * FROM products WHERE stock < 10');
        
        const cols = match[1].split(',').map(c => c.trim().replace(/^.* as /i, ''));
        const table = match[2].toLowerCase();
        const where = match[3];
        
        let data = DataStore.getAll(table);
        if (!data || data.length === 0) throw new Error(`Tabel '${table}' tidak ditemukan atau kosong.`);
        
        // Very basic WHERE simulation
        if (where) {
          const condition = where.split(/(=|<=|>=|<|>)/);
          if (condition.length === 3) {
            const f = condition[0].trim();
            const op = condition[1].trim();
            const v = condition[2].trim().replace(/['"]/g, '');
            
            data = data.filter(item => {
              const itemV = item[f];
              if (itemV === undefined) return false;
              if (op === '=') return String(itemV) === String(v);
              if (op === '<') return Number(itemV) < Number(v);
              if (op === '>') return Number(itemV) > Number(v);
              if (op === '<=') return Number(itemV) <= Number(v);
              if (op === '>=') return Number(itemV) >= Number(v);
              return true;
            });
          }
        }
        
        if (data.length === 0) {
          outputEl.innerHTML = '0 rows returned.';
          return;
        }
        
        // Select specific columns or *
        let results = data;
        let actualCols = cols[0] === '*' ? Object.keys(data[0]) : cols;
        
        // Aggregation simulation for COUNT(*)
        if (cols[0].toLowerCase().includes('count(*)')) {
          const groupCol = cols.find(c => !c.toLowerCase().includes('count'));
          if (groupCol) {
            const counts = {};
            data.forEach(row => { counts[row[groupCol]] = (counts[row[groupCol]] || 0) + 1; });
            results = Object.keys(counts).map(k => ({ [groupCol]: k, count: counts[k] }));
            actualCols = [groupCol, 'count'];
          }
        } else if (cols[0] !== '*') {
          results = data.map(row => {
            const newRow = {};
            actualCols.forEach(c => newRow[c] = row[c]);
            return newRow;
          });
        }
        
        // Format as ASCII table
        // Find max widths
        const widths = {};
        actualCols.forEach(c => widths[c] = c.length);
        results.forEach(row => {
          actualCols.forEach(c => {
            const len = String(row[c] || '').length;
            if (len > (widths[c] || 0)) widths[c] = len;
          });
        });
        
        // Build table string
        let sep = '+'; actualCols.forEach(c => sep += '-'.repeat(Math.min(30, widths[c]) + 2) + '+');
        let head = '|'; actualCols.forEach(c => {
          let s = String(c); if(s.length>30) s=s.substring(0,27)+'...';
          head += ' ' + s.padEnd(Math.min(30, widths[c])) + ' |';
        });
        
        let out = sep + '\n' + head + '\n' + sep + '\n';
        
        results.forEach(row => {
          let line = '|';
          actualCols.forEach(c => {
            let s = String(row[c] || 'NULL'); if(s.length>30) s=s.substring(0,27)+'...';
            line += ' ' + s.padEnd(Math.min(30, widths[c])) + ' |';
          });
          out += line + '\n';
        });
        out += sep + '\n';
        out += `${results.length} rows returned.`;
        
        outputEl.textContent = out;
        auditLog('EXECUTE_SQL', `Tabel: ${table}`);
        
      } catch (err) {
        outputEl.innerHTML = `<span style="color:var(--danger)">Error: ${sanitize(err.message)}</span>`;
      }
    }, 500);
  }
};

// Initialize App when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
