/**
 * SmartStock Pro — Dashboard Module (Chart.js + Leaflet)
 */
const Dashboard = {
  _charts: {},
  _map: null,

  render() {
    this.renderStats();
    this.renderTrendChart();
    this.renderWarehouseChart();
    this.renderCategoryChart();
    this.renderMap();
  },

  destroyCharts() {
    Object.values(this._charts).forEach(c => { if (c) c.destroy(); });
    this._charts = {};
  },

  renderStats() {
    const products = DataStore.products;
    const totalProducts = products.length;
    const totalValue = products.reduce((s, p) => s + (p.price * p.stock), 0);
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= (p.minStock || 10)).length;
    const outStock = products.filter(p => p.stock === 0).length;
    const totalWarehouses = DataStore.warehouses.length;

    document.getElementById('stats-row').innerHTML = `
      <div class="stat-card">
        <div class="stat-icon blue">📦</div>
        <div><div class="stat-label">Total Produk</div>
        <div class="stat-value">${totalProducts}</div>
        <div class="stat-change up">${outStock} habis stok</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon purple">💰</div>
        <div><div class="stat-label">Nilai Inventaris</div>
        <div class="stat-value">${formatRp(totalValue)}</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange">⚠️</div>
        <div><div class="stat-label">Stok Rendah</div>
        <div class="stat-value">${lowStock + outStock}</div>
        <div class="stat-change down">${lowStock} rendah · ${outStock} habis</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">🏭</div>
        <div><div class="stat-label">Total Gudang</div>
        <div class="stat-value">${totalWarehouses}</div>
        <div class="stat-change up">5 kota</div></div>
      </div>`;
  },

  renderTrendChart() {
    const ctx = document.getElementById('chart-trend');
    if (!ctx || typeof Chart === 'undefined') return;
    if (this._charts.trend) this._charts.trend.destroy();

    const txs = DataStore.transactions;
    const labels = []; const dataIn = []; const dataOut = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().slice(0, 10);
      labels.push(d.toLocaleDateString('id-ID', { day:'numeric', month:'short' }));
      dataIn.push(txs.filter(t => t.date === ds && t.type === 'in').reduce((s, t) => s + t.qty, 0) || Math.floor(Math.random()*30+5));
      dataOut.push(txs.filter(t => t.date === ds && t.type === 'out').reduce((s, t) => s + t.qty, 0) || Math.floor(Math.random()*20+3));
    }

    this._charts.trend = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label:'Barang Masuk', data:dataIn, borderColor:'#06b6d4', backgroundColor:'rgba(6,182,212,.1)', fill:true, tension:.4 },
          { label:'Barang Keluar', data:dataOut, borderColor:'#ef4444', backgroundColor:'rgba(239,68,68,.1)', fill:true, tension:.4 }
        ]
      },
      options: {
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ labels:{ color:'#94a3b8', usePointStyle:true, padding:15 } } },
        scales:{
          y:{ beginAtZero:true, grid:{ color:'rgba(148,163,184,.08)' }, ticks:{ color:'#94a3b8' } },
          x:{ grid:{ display:false }, ticks:{ color:'#94a3b8' } }
        }
      }
    });
  },

  renderWarehouseChart() {
    const ctx = document.getElementById('chart-warehouse');
    if (!ctx || typeof Chart === 'undefined') return;
    if (this._charts.warehouse) this._charts.warehouse.destroy();

    const warehouses = DataStore.warehouses;
    const products = DataStore.products;
    const labels = warehouses.map(w => w.city);
    const data = warehouses.map(w => products.filter(p => p.warehouse === w.id).reduce((s, p) => s + p.stock, 0));
    const colors = ['#3b82f6','#8b5cf6','#06b6d4','#10b981','#f59e0b'];

    this._charts.warehouse = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets: [{ label:'Total Stok', data, backgroundColor:colors, borderRadius:6 }] },
      options: {
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ display:false } },
        scales:{
          y:{ beginAtZero:true, grid:{ color:'rgba(148,163,184,.08)' }, ticks:{ color:'#94a3b8' } },
          x:{ grid:{ display:false }, ticks:{ color:'#94a3b8' } }
        }
      }
    });
  },

  renderCategoryChart() {
    const ctx = document.getElementById('chart-category');
    if (!ctx || typeof Chart === 'undefined') return;
    if (this._charts.category) this._charts.category.destroy();

    const categories = DataStore.categories;
    const products = DataStore.products;
    const labels = categories.map(c => c.name);
    const data = categories.map(c => products.filter(p => p.category === c.id).length);
    const colors = ['#3b82f6','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444'];

    this._charts.category = new Chart(ctx, {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor:colors, borderWidth:0 }] },
      options: {
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ position:'bottom', labels:{ color:'#94a3b8', usePointStyle:true, padding:12, font:{size:11} } } }
      }
    });
  },

  renderMap() {
    const container = document.getElementById('warehouse-map');
    if (!container || typeof L === 'undefined') return;

    if (this._map) { this._map.invalidateSize(); return; }

    this._map = L.map(container).setView([-2.5, 118], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this._map);

    const products = DataStore.products;
    DataStore.warehouses.forEach(w => {
      const stock = products.filter(p => p.warehouse === w.id).reduce((s, p) => s + p.stock, 0);
      const count = products.filter(p => p.warehouse === w.id).length;
      L.marker([w.lat, w.lng]).addTo(this._map)
        .bindPopup(`<strong>${sanitize(w.name)}</strong><br>${sanitize(w.city)}<br>
          📦 ${count} produk · ${formatNum(stock)} unit<br>
          🏢 Kapasitas: ${formatNum(w.capacity)}`);
    });

    setTimeout(() => this._map.invalidateSize(), 300);
  }
};

console.log('[SmartStock] dashboard.js loaded');
