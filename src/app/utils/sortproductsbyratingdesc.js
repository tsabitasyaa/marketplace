// app/utils/sortProductsByRatingDesc.js

/**
 * Mengurutkan produk berdasarkan rating tertinggi ke terendah
 * @param {Array} products - Array produk dengan properti rating
 * @returns {Array} Array produk terurut secara descending berdasarkan rating
 */
function sortProductsByRatingDesc(products) {
    if (!products || products.length === 0) return [];
    return [...products].sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0));
  }
  
  module.exports = { sortProductsByRatingDesc };