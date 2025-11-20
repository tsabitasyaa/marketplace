"use client";
import { useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";

type Product = {
  id: number;
  name: string;
  storeName: string;
  category: string;
  province: string;
  city: string;
  price: string;
  rating: string;
  image: string;
};

export default function Home() {
  // Dummy Products
  const products: Product[] = [
    {
      id: 1,
      name: "Sepatu Running",
      storeName: "Toko Maju Jaya",
      category: "Olahraga",
      province: "Jawa Barat",
      city: "Bandung",
      price: "Rp 250.000",
      rating: "4.5",
      image: "/product-image.png",
    },
    {
      id: 2,
      name: "Kemeja Formal",
      storeName: "Elegan Store",
      category: "Fashion",
      province: "DKI Jakarta",
      city: "Jakarta Selatan",
      price: "Rp 150.000",
      rating: "4.7",
      image: "/product-image.png",
    },
  ];

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  // Data kategori
  const categories = ["Elektronik", "Fashion", "Olahraga", "Makanan", "Aksesoris"];

  // Data lokasi
  const locations = {
    "DKI Jakarta": ["Jakarta Selatan", "Jakarta Timur", "Jakarta Utara"],
    "Jawa Barat": ["Bandung", "Bekasi", "Bogor"],
    "Jawa Timur": ["Surabaya", "Malang", "Sidoarjo"],
  };

  type ProvinceKey = keyof typeof locations;

  // Filter states (multi-select)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedProvinces, setSelectedProvinces] = useState<ProvinceKey[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);

  // Handle category
  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  // Handle province
  const toggleProvince = (prov: ProvinceKey) => {
    setSelectedProvinces((prev) =>
      prev.includes(prov)
        ? prev.filter((p) => p !== prov)
        : [...prev, prov]
    );

    if (selectedProvinces.includes(prov)) {
      setSelectedCities((prev) =>
        prev.filter((c) => !locations[prov].includes(c))
      );
    }
  };

  // Handle city
  const toggleCity = (city: string) => {
    setSelectedCities((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]
    );
  };

  // FINAL FILTER RESULT
  const filteredProducts = products.filter((p) => {
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      p.name.toLowerCase().includes(query) ||
      p.storeName.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.city.toLowerCase().includes(query) ||
      p.province.toLowerCase().includes(query);

    return (
      matchesSearch &&
      (selectedCategories.length ? selectedCategories.includes(p.category) : true) &&
      (selectedProvinces.length ? selectedProvinces.includes(p.province as ProvinceKey) : true) &&
      (selectedCities.length ? selectedCities.includes(p.city) : true)
    );
  });

  return (
    <div className="min-h-screen bg-white text-navy flex flex-col">

      {/* NAVBAR */}
      <header className="w-full bg-teal text-white py-4 px-6 flex items-center justify-between shadow">
        <div className="flex items-center gap-3">
          <img
            src="/Loopy Logo.jpg"
            alt="Loopy"
            className="h-10 w-10 object-cover rounded-md"
          />
          <h1 className="text-2xl font-semibold">Loopy</h1>
        </div>

        {/* Search Bar */}
        <div className="flex items-center bg-white border border-navy rounded-full px-4 py-2 w-[40%]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari produk, toko, kategori, lokasi..."
            className="flex-1 bg-transparent outline-none text-navy"
          />
          <span className="text-navy">🔍</span>
        </div>

        <button className="bg-beige text-navy px-4 py-2 rounded-full shadow hover:bg-navy transition">
          <Link href="/penjual/login">Login as Seller</Link>
        </button>
      </header>

      <div className="flex">

        {/* SIDEBAR FILTER */}
        <aside className="w-64 bg-beige text-navy min-h-screen p-4 space-y-6">
          <p className="font-bold text-lg">FILTER</p>

          {/* KATEGORI */}
          <section>
            <p className="font-semibold mb-2">Kategori Produk</p>
            {categories.map((cat) => (
              <label key={cat} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                />
                {cat}
              </label>
            ))}
          </section>

          {/* PROVINSI */}
          <section>
            <p className="font-semibold mb-2">Provinsi</p>
            {(Object.keys(locations) as ProvinceKey[]).map((prov) => (
              <label key={prov} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedProvinces.includes(prov)}
                  onChange={() => toggleProvince(prov)}
                />
                {prov}
              </label>
            ))}
          </section>

          {/* KOTA */}
          <section>
            <p className="font-semibold mb-2">Kota / Kabupaten</p>

            {selectedProvinces.length === 0 && (
              <p className="text-xs text-gray-500">Pilih provinsi dulu</p>
            )}

            {selectedProvinces.map((prov) => (
              <div key={prov} className="mb-2">
                <p className="text-sm font-medium">{prov}</p>
                {locations[prov].map((city) => (
                  <label key={city} className="flex items-center gap-2 text-xs ml-3">
                    <input
                      type="checkbox"
                      checked={selectedCities.includes(city)}
                      onChange={() => toggleCity(city)}
                    />
                    {city}
                  </label>
                ))}
              </div>
            ))}
          </section>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-8">
          <h2 className="text-2xl font-semibold mb-6">Our Products</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                price={p.price}
                category={p.category}
                rating={p.rating}
                storeName={p.storeName}
                location={`${p.city}, ${p.province}`}
                image={p.image}
              />
            ))}
          </div>
        </main>

      </div>
    </div>
  );
}
