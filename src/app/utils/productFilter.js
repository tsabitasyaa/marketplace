function filterProducts(
  products,
  searchQuery,
  selectedCategories,
  selectedProvince,
  selectedCity
) {
  return products.filter((p) => {
    const q = searchQuery.toLowerCase();

    const matchesSearch =
      p.name?.toLowerCase().includes(q) ||
      p.storeName?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.city?.toLowerCase().includes(q) ||
      p.province?.toLowerCase().includes(q);

    return (
      matchesSearch &&
      (selectedCategories.length === 0 ||
        selectedCategories.includes(p.category)) &&
      (!selectedProvince ||
        p.province?.trim().toLowerCase() ===
          selectedProvince.trim().toLowerCase()) &&
      (!selectedCity ||
        p.city?.trim().toLowerCase() ===
          selectedCity.trim().toLowerCase())
    );
  });
}

module.exports = {
  filterProducts,
};