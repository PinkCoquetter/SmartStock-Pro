/**
 * SmartStock Pro — Authentication & Session Management
 */
const Auth = {
  check() {
    const s = this.getSession();
    if (!s || new Date(s.expiresAt) <= new Date()) {
      sessionStorage.removeItem('ssp_session');
      window.location.href = 'index.html';
      return false;
    }
    return true;
  },

  getSession() {
    try { return JSON.parse(sessionStorage.getItem('ssp_session') || 'null'); }
    catch { return null; }
  },

  getRole() { const s = this.getSession(); return s ? s.role : 'viewer'; },

  hasPermission(action) {
    const role = this.getRole();
    const perms = {
      admin: ['create_product','edit_product','delete_product','create_transaction','transfer','import','export','manage_users','view_audit','view_monitoring','execute_sql'],
      manager: ['create_product','edit_product','delete_product','create_transaction','transfer','import','export','view_audit','view_monitoring','execute_sql'],
      staff: ['create_transaction','transfer','import','export'],
      viewer: ['export']
    };
    return (perms[role] || []).includes(action);
  },

  refreshSession() {
    const s = this.getSession();
    if (s) {
      s.expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      sessionStorage.setItem('ssp_session', JSON.stringify(s));
    }
  },

  logout() {
    auditLog('LOGOUT', 'User logout');
    sessionStorage.removeItem('ssp_session');
    window.location.href = 'index.html';
  },

  setupSessionTimeout() {
    setInterval(() => {
      const s = this.getSession();
      if (!s) return;
      const remaining = new Date(s.expiresAt).getTime() - Date.now();
      if (remaining <= 0) {
        toast('Sesi habis. Silakan login kembali.', 'warning');
        setTimeout(() => this.logout(), 1500);
      } else if (remaining <= 120000) {
        document.getElementById('session-info').innerHTML =
          `<span style="color:var(--warning)">⚠ Sesi berakhir ${Math.ceil(remaining/60000)} menit</span>`;
      }
    }, 30000);
  },

  renderSessionInfo() {
    const s = this.getSession();
    if (!s) return;
    const el = document.getElementById('session-info');
    if (el) el.innerHTML = `<span style="color:var(--accent)">${sanitize(s.name)}</span> (${s.role})`;
    const av = document.getElementById('user-avatar');
    if (av) av.textContent = (s.name || 'U')[0].toUpperCase();
  }
};

console.log('[SmartStock] auth.js loaded');
