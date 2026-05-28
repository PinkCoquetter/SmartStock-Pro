/**
 * SmartStock Pro — Utility Functions
 * Helpers, sanitizer, formatters, ID generator
 */

// XSS Sanitizer — Anti Cross-Site Scripting
function sanitize(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// Generate unique ID
function uid(prefix = '') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// Format currency to IDR
function formatRp(n) {
  return 'Rp ' + Number(n||0).toLocaleString('id-ID');
}

// Format number with thousand separator
function formatNum(n) {
  return Number(n||0).toLocaleString('id-ID');
}

// Format date to Indonesian locale
function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' });
}

// Format datetime
function formatDateTime(d) {
  if (!d) return '-';
  return new Date(d).toLocaleString('id-ID', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

// Relative time (e.g. "5 menit lalu")
function timeAgo(d) {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return mins + ' menit lalu';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + ' jam lalu';
  return Math.floor(hrs / 24) + ' hari lalu';
}

// Get today's date as YYYY-MM-DD
function today() {
  return new Date().toISOString().slice(0, 10);
}

// Toast notification
function toast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.innerHTML = `<span class="toast-icon">${icons[type]||icons.success}</span>
    <span class="toast-msg">${sanitize(msg)}</span>
    <button class="toast-close" onclick="this.parentElement.classList.add('removing');setTimeout(()=>this.parentElement.remove(),250)">✕</button>`;
  container.appendChild(el);
  setTimeout(() => { if (el.parentElement) { el.classList.add('removing'); setTimeout(() => el.remove(), 250); } }, 4000);
}

// Audit Log helper
function auditLog(action, detail) {
  const session = JSON.parse(sessionStorage.getItem('ssp_session') || '{}');
  const logs = JSON.parse(localStorage.getItem('ssp_audit') || '[]');
  logs.push({
    id: uid('aud_'), user: session.user || 'system', role: session.role || '-',
    action, detail, timestamp: new Date().toISOString(),
    ip: '192.168.1.' + Math.floor(Math.random() * 254 + 1)
  });
  // Keep last 200
  if (logs.length > 200) logs.splice(0, logs.length - 200);
  localStorage.setItem('ssp_audit', JSON.stringify(logs));
  console.log(`[AUDIT] ${action}: ${detail}`);
}

// Debounce function
function debounce(fn, ms = 300) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}

// Simple pagination helper
function paginate(arr, page, perPage = 10) {
  const total = Math.ceil(arr.length / perPage);
  const start = (page - 1) * perPage;
  return { data: arr.slice(start, start + perPage), page, total, count: arr.length, start: start + 1, end: Math.min(start + perPage, arr.length) };
}

// Render pagination HTML
function renderPagination(containerId, pag, goFn) {
  const c = document.getElementById(containerId);
  if (!c || pag.total <= 1) { if (c) c.innerHTML = ''; return; }
  let html = `<div class="pagination-info">Menampilkan ${pag.start}–${pag.end} dari ${pag.count}</div><div class="pagination-btns">`;
  html += `<button class="page-btn" onclick="${goFn}(${pag.page-1})" ${pag.page===1?'disabled':''}>‹</button>`;
  for (let i = 1; i <= pag.total; i++) {
    if (pag.total > 7 && !(i === 1 || i === pag.total || Math.abs(i - pag.page) <= 1)) {
      if (i === pag.page - 2 || i === pag.page + 2) html += '<span style="padding:0 3px;color:var(--text-muted)">…</span>';
      continue;
    }
    html += `<button class="page-btn ${i===pag.page?'active':''}" onclick="${goFn}(${i})">${i}</button>`;
  }
  html += `<button class="page-btn" onclick="${goFn}(${pag.page+1})" ${pag.page===pag.total?'disabled':''}>›</button></div>`;
  c.innerHTML = html;
}

console.log('[SmartStock] utils.js loaded');
