/**
 * SmartStock Pro — Resource Monitoring & Error Log
 */
const Monitoring = {
  _interval: null,
  _metrics: { cpu: 0, ram: 0, disk: 0, responseTime: 0, uptime: 100 },
  _responseHistory: [],
  _uptimeHistory: [],

  start() {
    this.renderGrid();
    this._interval = setInterval(() => this.tick(), 5000);
    // Generate initial history
    for (let i = 0; i < 20; i++) {
      this._responseHistory.push(Math.floor(Math.random() * 80 + 40));
      this._uptimeHistory.push(99 + Math.random());
    }
    console.log('[Monitor] Resource monitoring started');
  },

  stop() { clearInterval(this._interval); },

  tick() {
    // Simulate changing metrics
    this._metrics.cpu = Math.min(100, Math.max(5, this._metrics.cpu + (Math.random() - 0.48) * 15));
    this._metrics.ram = Math.min(100, Math.max(20, this._metrics.ram + (Math.random() - 0.5) * 8));
    this._metrics.disk = Math.min(100, Math.max(30, 45 + Math.random() * 10));
    this._metrics.responseTime = Math.max(20, Math.floor(Math.random() * 120 + 40));
    this._metrics.uptime = Math.min(100, 99 + Math.random());

    this._responseHistory.push(this._metrics.responseTime);
    if (this._responseHistory.length > 30) this._responseHistory.shift();
    this._uptimeHistory.push(this._metrics.uptime);
    if (this._uptimeHistory.length > 30) this._uptimeHistory.shift();

    // Check thresholds — alert if exceeded
    if (this._metrics.cpu > 85) {
      Notifications.add('critical', 'CPU Usage Tinggi', `CPU usage mencapai ${this._metrics.cpu.toFixed(1)}%`);
      this.logError('critical', 'monitoring', `CPU usage tinggi: ${this._metrics.cpu.toFixed(1)}%`);
    }
    if (this._metrics.responseTime > 150) {
      Notifications.add('warning', 'Response Time Lambat', `Response time ${this._metrics.responseTime}ms melebihi threshold 150ms`);
      this.logError('warning', 'monitoring', `Response time tinggi: ${this._metrics.responseTime}ms`);
    }

    if (document.getElementById('view-monitoring')?.classList.contains('active')) {
      this.renderGrid();
    }
  },

  renderGrid() {
    const grid = document.getElementById('monitor-grid');
    if (!grid) return;
    const m = this._metrics;
    const items = [
      { label:'CPU Usage', value:`${m.cpu.toFixed(1)}%`, pct:m.cpu, cls:m.cpu>80?'crit':m.cpu>60?'warn':'ok' },
      { label:'Memory (RAM)', value:`${m.ram.toFixed(1)}%`, pct:m.ram, cls:m.ram>85?'crit':m.ram>70?'warn':'ok' },
      { label:'Disk Usage', value:`${m.disk.toFixed(1)}%`, pct:m.disk, cls:m.disk>90?'crit':m.disk>75?'warn':'ok' },
      { label:'Response Time', value:`${m.responseTime}ms`, pct:Math.min(100,m.responseTime/2), cls:m.responseTime>150?'crit':m.responseTime>100?'warn':'ok' },
      { label:'Uptime', value:`${m.uptime.toFixed(2)}%`, pct:m.uptime, cls:'ok' },
      { label:'Active Connections', value:Math.floor(Math.random()*20+5), pct:30, cls:'ok' }
    ];
    grid.innerHTML = items.map(i => `
      <div class="monitor-item">
        <div class="monitor-label">${i.label}</div>
        <div class="monitor-value">${i.value}</div>
        <div class="monitor-bar"><div class="monitor-bar-fill ${i.cls}" style="width:${i.pct}%"></div></div>
      </div>`).join('');
  },

  renderCharts() {
    // Response time chart
    const ctx1 = document.getElementById('chart-response');
    if (ctx1 && typeof Chart !== 'undefined') {
      if (this._chartResp) this._chartResp.destroy();
      this._chartResp = new Chart(ctx1, {
        type: 'line',
        data: { labels: this._responseHistory.map((_,i)=>i+1),
          datasets: [{ label:'Response Time (ms)', data:this._responseHistory,
            borderColor:'#3b82f6', backgroundColor:'rgba(59,130,246,.1)', fill:true, tension:.4 }]
        },
        options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}},
          scales:{ y:{beginAtZero:true,grid:{color:'rgba(148,163,184,.08)'},ticks:{color:'#94a3b8'}},
            x:{grid:{display:false},ticks:{color:'#94a3b8'}} } }
      });
    }
    // Uptime chart
    const ctx2 = document.getElementById('chart-uptime');
    if (ctx2 && typeof Chart !== 'undefined') {
      if (this._chartUp) this._chartUp.destroy();
      this._chartUp = new Chart(ctx2, {
        type: 'bar',
        data: { labels: this._uptimeHistory.map((_,i)=>i+1),
          datasets: [{ label:'Uptime %', data:this._uptimeHistory,
            backgroundColor:'rgba(16,185,129,.6)', borderRadius:3 }]
        },
        options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}},
          scales:{ y:{min:98,max:100,grid:{color:'rgba(148,163,184,.08)'},ticks:{color:'#94a3b8'}},
            x:{grid:{display:false},ticks:{display:false}} } }
      });
    }
  },

  logError(severity, module, message) {
    const errors = DataStore.getAll('errors');
    errors.unshift({
      id: uid('err_'), timestamp: new Date().toISOString(),
      severity, module, message,
      stack: `at ${module}.js:${Math.floor(Math.random()*200)+1}:${Math.floor(Math.random()*40)+1}`
    });
    if (errors.length > 100) errors.length = 100;
    DataStore._save('errors', errors);
  },

  renderErrorLog() {
    const tbody = document.getElementById('errorlog-tbody');
    if (!tbody) return;
    let errors = DataStore.getAll('errors');
    const filter = document.getElementById('filter-log-severity')?.value;
    if (filter) errors = errors.filter(e => e.severity === filter);
    tbody.innerHTML = errors.slice(0,50).map(e => `
      <tr>
        <td><code>${formatDateTime(e.timestamp)}</code></td>
        <td><span class="log-severity ${e.severity}">${e.severity.toUpperCase()}</span></td>
        <td>${sanitize(e.module)}</td>
        <td>${sanitize(e.message)}</td>
        <td><code style="font-size:.65rem">${sanitize(e.stack)}</code></td>
      </tr>`).join('') || '<tr><td colspan="5" class="text-center" style="padding:var(--sp-xl);color:var(--text-muted)">Tidak ada error log</td></tr>';
  },

  filterLogs() { this.renderErrorLog(); },

  simulateError() {
    const errors = [
      { s:'critical', m:'monitoring', msg:'Database connection timeout after 30s' },
      { s:'critical', m:'auth', msg:'Brute force attack detected from IP 192.168.1.105' },
      { s:'warning', m:'inventory', msg:'Product SKU duplicate detected: EL-099' },
      { s:'warning', m:'transfer', msg:'Transfer queue backlog exceeds 100 items' },
      { s:'info', m:'system', msg:'Scheduled backup completed successfully' },
      { s:'info', m:'cache', msg:'Cache invalidated for products collection' }
    ];
    const e = errors[Math.floor(Math.random() * errors.length)];
    this.logError(e.s, e.m, e.msg);
    Notifications.add(e.s, 'System Alert', e.msg);
    toast(`Simulasi error: ${e.msg}`, e.s === 'info' ? 'info' : 'error');
    this.renderErrorLog();
  },

  renderAuditLog() {
    const timeline = document.getElementById('audit-timeline');
    if (!timeline) return;
    const logs = JSON.parse(localStorage.getItem('ssp_audit') || '[]').reverse().slice(0, 50);
    if (logs.length === 0) {
      timeline.innerHTML = '<div class="empty-state"><div class="empty-icon">📋</div><h3>Belum Ada Aktivitas</h3></div>';
      return;
    }
    const dotClass = { LOGIN:'login', LOGOUT:'login', CREATE:'create', UPDATE:'update', DELETE:'delete', NAVIGATE:'info' };
    timeline.innerHTML = logs.map(l => `
      <div class="audit-item">
        <div class="audit-dot ${dotClass[l.action]||''}"></div>
        <div class="audit-info">
          <div class="audit-action">${sanitize(l.action)} — ${sanitize(l.detail)}</div>
          <div class="audit-meta">${sanitize(l.user)} (${l.role}) · ${formatDateTime(l.timestamp)} · IP: ${l.ip}</div>
        </div>
      </div>`).join('');
  }
};

console.log('[SmartStock] monitoring.js loaded');
