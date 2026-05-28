/**
 * SmartStock Pro — Notification & Alert System
 */
const Notifications = {
  add(type, title, message) {
    const notifs = DataStore.getAll('notifications');
    notifs.unshift({ id: uid('ntf_'), type, title, message, timestamp: new Date().toISOString(), read: false });
    if (notifs.length > 100) notifs.length = 100;
    DataStore._save('notifications', notifs);
    this.updateBadge();
    console.log(`[NOTIF] ${type}: ${title}`);
  },

  updateBadge() {
    const unread = DataStore.getAll('notifications').filter(n => !n.read).length;
    const b1 = document.getElementById('notif-count');
    const b2 = document.getElementById('notif-header-badge');
    [b1, b2].forEach(b => {
      if (!b) return;
      b.textContent = unread > 99 ? '99+' : unread;
      b.style.display = unread > 0 ? 'flex' : 'none';
    });
  },

  renderDropdown() {
    const list = document.getElementById('notif-list');
    if (!list) return;
    const notifs = DataStore.getAll('notifications').slice(0, 8);
    if (notifs.length === 0) {
      list.innerHTML = '<div style="padding:var(--sp-lg);text-align:center;color:var(--text-muted);font-size:var(--fs-sm)">Tidak ada notifikasi</div>';
      return;
    }
    const colors = { critical:'var(--danger)', warning:'var(--warning)', info:'var(--info)', success:'var(--success)', stock:'var(--warning)' };
    list.innerHTML = notifs.map(n => `
      <div class="notif-item" onclick="Notifications.markRead('${n.id}')">
        <div class="notif-dot" style="background:${colors[n.type]||'var(--primary)'}"></div>
        <div><div class="notif-text"><strong>${sanitize(n.title)}</strong><br>${sanitize(n.message)}</div>
        <div class="notif-time">${timeAgo(n.timestamp)}</div></div>
      </div>`).join('');
  },

  renderAll() {
    const container = document.getElementById('all-notifs-list');
    if (!container) return;
    const notifs = DataStore.getAll('notifications');
    if (notifs.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">🔔</div><h3>Tidak Ada Notifikasi</h3><p>Semua notifikasi akan muncul di sini</p></div>';
      return;
    }
    const colors = { critical:'var(--danger)', warning:'var(--warning)', info:'var(--info)', success:'var(--success)', stock:'var(--warning)' };
    const icons = { critical:'🔴', warning:'🟡', info:'🔵', success:'🟢', stock:'⚠️' };
    container.innerHTML = notifs.map(n => `
      <div class="notif-item" style="padding:var(--sp-md);${n.read?'opacity:.6':''}">
        <div style="font-size:1.2rem;flex-shrink:0">${icons[n.type]||'🔔'}</div>
        <div style="flex:1"><div style="font-weight:var(--fw-semi);font-size:var(--fs-sm)">${sanitize(n.title)}</div>
        <div style="font-size:var(--fs-xs);color:var(--text-secondary)">${sanitize(n.message)}</div>
        <div style="font-size:var(--fs-xs);color:var(--text-muted);margin-top:2px">${formatDateTime(n.timestamp)}</div></div>
      </div>`).join('');
  },

  markRead(id) {
    const notifs = DataStore.getAll('notifications');
    const n = notifs.find(x => x.id === id);
    if (n) { n.read = true; DataStore._save('notifications', notifs); this.updateBadge(); }
  },

  clearAll() {
    DataStore._save('notifications', []);
    this.updateBadge();
    this.renderDropdown();
    this.renderAll();
    toast('Semua notifikasi dibersihkan', 'success');
  },

  checkStockAlerts() {
    const products = DataStore.products;
    let lowCount = 0, outCount = 0;
    products.forEach(p => {
      if (p.stock === 0) { outCount++;
        this.add('critical', 'Stok Habis!', `${p.name} (${p.sku}) di ${DataStore.getWarehouseName(p.warehouse)} stok 0`);
      } else if (p.stock <= (p.minStock || 10)) { lowCount++;
        this.add('stock', 'Stok Rendah', `${p.name} (${p.sku}) — sisa ${p.stock} unit (min: ${p.minStock})`);
      }
    });
    if (outCount > 0) console.log(`[ALERT] ${outCount} produk stok habis`);
    if (lowCount > 0) console.log(`[ALERT] ${lowCount} produk stok rendah`);
    this.updateBadge();
    this.renderDropdown();
  }
};

console.log('[SmartStock] notifications.js loaded');
