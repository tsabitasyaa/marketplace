// utils/sellerStatus.js

/**
 * Menghitung data status penjual (Aktif/Tidak Aktif)
 * @param {number} activeSellers - Jumlah penjual aktif
 * @param {number} inactiveSellers - Jumlah penjual tidak aktif
 * @param {number} totalSellers - Total penjual
 * @returns {Array} Array berisi objek status penjual
 */
function calculateSellerStatusData(activeSellers, inactiveSellers, totalSellers) {
  return [
    {
      name: 'Aktif',
      value: activeSellers,
      percentage: totalSellers > 0 
        ? parseFloat((activeSellers / totalSellers * 100).toFixed(1)) 
        : 0
    },
    {
      name: 'Tidak Aktif',
      value: inactiveSellers,
      percentage: totalSellers > 0 
        ? parseFloat((inactiveSellers / totalSellers * 100).toFixed(1)) 
        : 0
    }
  ];
}

module.exports = { calculateSellerStatusData };
