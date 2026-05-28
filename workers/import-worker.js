/**
 * SmartStock Pro — Web Worker for Batch Import (Parallel Processing)
 * Simulate heavy data parsing and validation in background thread
 */

self.onmessage = function(e) {
  const { data } = e.data;
  
  if (!data || !Array.isArray(data)) {
    self.postMessage({ error: 'Data invalid' });
    return;
  }
  
  const total = data.length;
  let processed = 0;
  let successCount = 0;
  let errorCount = 0;
  const results = [];
  
  // Simulate heavy processing by yielding chunks via setTimeout
  // Since workers don't have standard setTimeout natively blocking, we'll just process in chunks
  
  function processChunk(startIndex) {
    const chunkSize = Math.max(1, Math.floor(total / 10)); // 10% chunks
    const end = Math.min(startIndex + chunkSize, total);
    
    for (let i = startIndex; i < end; i++) {
      const row = data[i];
      
      // Basic validation simulation
      if (!row.SKU && !row.sku) {
        errorCount++;
      } else {
        // Map CSV fields to our schema
        results.push({
          id: 'prd_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
          sku: row.SKU || row.sku || '-',
          name: row.Nama || row.name || 'Produk Tanpa Nama',
          category: row.Kategori || row.category || 'cat_01',
          warehouse: row.Gudang || row.warehouse || 'wh_01',
          stock: parseInt(row.Stok || row.stock) || 0,
          minStock: 10,
          price: parseFloat(row.Harga || row.price) || 0,
          supplier: '',
          createdAt: new Date().toISOString().slice(0,10)
        });
        successCount++;
      }
      processed++;
    }
    
    const progress = Math.floor((processed / total) * 100);
    
    // Post progress
    if (processed < total) {
      self.postMessage({ progress, complete: false });
      // Simulate delay for heavy processing visualization
      setTimeout(() => processChunk(end), 300);
    } else {
      self.postMessage({ progress: 100, complete: true, successCount, errorCount, results });
    }
  }
  
  // Start processing
  processChunk(0);
};
