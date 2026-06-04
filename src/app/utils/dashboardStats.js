// app/utils/dashboardStats.js

/**
 * Menghitung statistik dashboard berdasarkan data produk
 * @param {Array} products - Array produk dengan properti price, sold, rating
 * @returns {Object} Statistik dashboard
 */
function calculateDashboardStats(products) {
  if (!products || products.length === 0) {
    return {
      totalProducts: 0,
      totalSold: 0,
      totalRevenue: 0,
      averageRating: 0
    };
  }

  const totalProducts = products.length;
  
  const totalSold = products.reduce((sum, product) => sum + (product.sold || 0), 0);
  
  const totalRevenue = products.reduce((sum, product) => {
    return sum + ((product.price || 0) * (product.sold || 0));
  }, 0);
  
  const totalRating = products.reduce((sum, product) => sum + (product.rating || 0), 0);
  const averageRating = parseFloat((totalRating / totalProducts).toFixed(1));
  
  return {
    totalProducts,
    totalSold,
    totalRevenue,
    averageRating
  };
}

module.exports = { calculateDashboardStats };