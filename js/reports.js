/**
 * SmartStock Pro — Reports Export (PDF & CSV)
 */
const Reports = {
  
  exportCSV() {
    if (!Auth.hasPermission('export')) return toast('Anda tidak memiliki izin export!', 'error');
    
    const products = DataStore.products.map(p => ({
      SKU: p.sku,
      Nama_Produk: p.name,
      Kategori: DataStore.getCategoryName(p.category),
      Gudang: DataStore.getWarehouseName(p.warehouse),
      Stok: p.stock,
      Harga: p.price,
      Supplier: DataStore.getSupplierName(p.supplier)
    }));
    
    const csv = Papa.unparse(products);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Inventory_Export_${today()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    auditLog('EXPORT', 'Export CSV Data Inventaris');
    toast('File CSV berhasil diunduh', 'success');
  },

  exportPDF(type) {
    if (!Auth.hasPermission('export')) return toast('Anda tidak memiliki izin export!', 'error');
    if (typeof jspdf === 'undefined') return toast('Library PDF belum dimuat', 'error');
    
    toast('Membuat laporan PDF...', 'info');
    
    const { jsPDF } = jspdf;
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(59, 130, 246); // Primary color
    doc.text('SmartStock Pro', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('PT Maju Bersama Digital', 14, 30);
    doc.text(`Tanggal Laporan: ${formatDate(new Date())}`, 14, 36);
    doc.text(`Dicetak oleh: ${Auth.getSession()?.name || 'System'}`, 14, 42);
    
    // Line separator
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 46, 196, 46);
    
    if (type === 'inventory') {
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('LAPORAN DATA INVENTARIS', 14, 56);
      
      // We'll generate a simple text table since autoTable plugin isn't included by default
      // In a real app, use jspdf-autotable
      
      let startY = 65;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('SKU', 14, startY);
      doc.text('Nama Produk', 40, startY);
      doc.text('Kategori', 100, startY);
      doc.text('Gudang', 140, startY);
      doc.text('Stok', 180, startY);
      
      doc.setFont('helvetica', 'normal');
      doc.line(14, startY+2, 196, startY+2);
      
      startY += 8;
      
      const products = DataStore.products.slice(0, 40); // limit for demo to fit 1 page
      products.forEach(p => {
        if (startY > 280) {
          doc.addPage();
          startY = 20;
        }
        
        doc.text(p.sku.substring(0, 10), 14, startY);
        doc.text(p.name.substring(0, 25), 40, startY);
        doc.text(DataStore.getCategoryName(p.category).substring(0, 15), 100, startY);
        doc.text(DataStore.getWarehouseName(p.warehouse).substring(0, 15), 140, startY);
        doc.text(p.stock.toString(), 180, startY);
        
        startY += 6;
      });
      
    } else if (type === 'transaction') {
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('LAPORAN TRANSAKSI', 14, 56);
      
      let startY = 65;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Tanggal', 14, startY);
      doc.text('Tipe', 40, startY);
      doc.text('Produk', 60, startY);
      doc.text('Gudang', 130, startY);
      doc.text('Qty', 180, startY);
      
      doc.setFont('helvetica', 'normal');
      doc.line(14, startY+2, 196, startY+2);
      
      startY += 8;
      
      const txs = DataStore.transactions.slice(0, 40);
      txs.forEach(t => {
        if (startY > 280) { doc.addPage(); startY = 20; }
        
        doc.text(t.date, 14, startY);
        if (t.type === 'in') doc.setTextColor(16, 185, 129); else doc.setTextColor(239, 68, 68);
        doc.text(t.type === 'in' ? 'Masuk' : 'Keluar', 40, startY);
        doc.setTextColor(0, 0, 0);
        doc.text(t.productName.substring(0, 30), 60, startY);
        doc.text(t.warehouseName.substring(0, 20), 130, startY);
        doc.text((t.type === 'in' ? '+' : '-') + t.qty, 180, startY);
        
        startY += 6;
      });
    }
    
    // Save
    doc.save(`SmartStock_${type}_${today()}.pdf`);
    auditLog('EXPORT', `Export PDF Laporan ${type}`);
    toast('File PDF berhasil diunduh', 'success');
  }
};

console.log('[SmartStock] reports.js loaded');
