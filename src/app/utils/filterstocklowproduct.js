// app/utils/filterLowStockProducts.js

/**
 * Memfilter produk dengan stok kurang dari 2
 * @param {Array} products - Array produk dengan properti stock
 * @returns {Array} Array produk dengan stock < 2
 */
function filterLowStockProducts(products) {
    if (!products || products.length === 0) return [];
    return products.filter(p => p.stock < 2);
  }
  
  module.exports = { filterLowStockProducts };