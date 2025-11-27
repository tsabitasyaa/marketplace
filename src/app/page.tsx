"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  // LOAD PRODUCTS FROM SUPABASE
  useEffect(() => {
    async function fetchProducts() {
      try {
        console.log("Page: Fetching products from API...");
        
        const res = await fetch("/api/products");
        
        if (!res.ok) {
          throw new Error(`API error: ${res.status} ${res.statusText}`);
        }
        
        const json = await res.json();
        
        console.log("Page: Received products from API:", json);
        setProducts(json);
        setError(null);
      } catch (error) {
        console.error("Page: Error fetching products:", error);
        setError(error instanceof Error ? error.message : "Unknown error occurred");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // LOAD CATEGORY FROM SUPABASE
  useEffect(() => {
    async function loadCategories() {
      try {
        const { data, error } = await supabase
          .from("category")
          .select("name")
          .order("name");
        
        if (error) throw error;
        if (data) setCategories(data.map((c) => c.name));
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    }
    loadCategories();
  }, []);

  // LOAD PROVINCES
  useEffect(() => {
    async function loadProvinces() {
      try {
        const res = await fetch(
          "https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json"
        );
        const data = await res.json();
        setProvinces(data);
      } catch (error) {
        console.error("Error loading provinces:", error);
      }
    }
    loadProvinces();
  }, []);

  // LOAD CITIES WHEN PROVINCE SELECTED
  useEffect(() => {
    if (!selectedProvince) {
      setCities([]);
      return;
    }

    async function loadCities() {
      try {
        const provId = provinces.find((p) => p.name === selectedProvince)?.id;
        if (!provId) return;

        const res = await fetch(
          `https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provId}.json`
        );
        const data = await res.json();
        setCities(data);
      } catch (error) {
        console.error("Error loading cities:", error);
      }
    }

    loadCities();
  }, [selectedProvince, provinces]);

  // FILTER PRODUCTS
  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase();

    const matchesSearch =
      p.name?.toLowerCase().includes(q) ||
      p.storeName?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.city?.toLowerCase().includes(q) ||
      p.province?.toLowerCase().includes(q);

    return (
      matchesSearch &&
      // CATEGORY
      (selectedCategories.length === 0 ||
        selectedCategories.includes(p.category)) &&
      // PROVINCE
      (!selectedProvince ||
        p.province?.trim().toLowerCase() === selectedProvince.trim().toLowerCase()) &&
      // CITY
      (!selectedCity ||
        p.city?.trim().toLowerCase() === selectedCity.trim().toLowerCase())
    );
  });

  // UI --------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-navy text-lg">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-teal text-white px-6 py-2 rounded-full hover:bg-navy transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-navy flex flex-col">
      {/* HEADER */}
      <header className="w-full bg-teal text-white py-4 px-6 flex items-center justify-between shadow">
        <div className="flex items-center gap-3">
          <img
            src="/Loopy Logo.jpg"
            alt="Loopy"
            className="h-10 w-10 object-cover rounded-md"
          />
          <h1 className="text-2xl font-semibold">Loopy</h1>
        </div>

        {/* SEARCH BAR */}
        <div className="flex items-center bg-white border border-navy rounded-full px-4 py-2 w-[40%]">
          <input
            type="text"
            placeholder="Cari produk, toko, kategori, lokasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-navy placeholder-gray-500"
          />
          <span className="text-navy">🔍</span>
        </div>

        <button className="bg-beige text-navy px-4 py-2 rounded-full shadow hover:bg-navy hover:text-white transition">
          <Link href="/penjual/login">Login as Seller</Link>
        </button>
      </header>

      <div className="flex">
        {/* SIDEBAR FILTER */}
        <aside className="w-64 bg-beige text-navy min-h-screen p-4 space-y-6">
          <p className="font-bold text-lg">FILTER</p>

          {/* CATEGORY FILTER */}
          <section>
            <p className="font-semibold mb-2">Kategori Produk</p>
            {categories.length === 0 && (
              <p className="text-sm text-gray-500">Loading categories...</p>
            )}
            {categories.map((cat) => (
              <label key={cat} className="flex items-center gap-2 text-sm mb-1">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat)}
                  onChange={() =>
                    setSelectedCategories((prev) =>
                      prev.includes(cat)
                        ? prev.filter((c) => c !== cat)
                        : [...prev, cat]
                    )
                  }
                  className="rounded border-navy"
                />
                {cat}
              </label>
            ))}
          </section>

          {/* PROVINCE FILTER */}
          <section>
            <p className="font-semibold mb-2">Provinsi</p>
            <select
              className="w-full p-2 border border-navy rounded bg-white"
              value={selectedProvince}
              onChange={(e) => {
                setSelectedProvince(e.target.value);
                setSelectedCity("");
              }}
            >
              <option value="">-- Pilih Provinsi --</option>
              {provinces.map((prov) => (
                <option key={prov.id} value={prov.name}>
                  {prov.name}
                </option>
              ))}
            </select>
          </section>

          {/* CITY FILTER */}
          <section>
            <p className="font-semibold mb-2">Kota/Kabupaten</p>
            <select
              className="w-full p-2 border border-navy rounded bg-white"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              disabled={!selectedProvince}
            >
              <option value="">-- Pilih Kota/Kabupaten --</option>
              {cities.map((city) => (
                <option key={city.id} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
          </section>

          {/* CLEAR FILTERS */}
          {(selectedCategories.length > 0 || selectedProvince || selectedCity) && (
            <button
              onClick={() => {
                setSelectedCategories([]);
                setSelectedProvince("");
                setSelectedCity("");
              }}
              className="w-full bg-navy text-white py-2 rounded hover:bg-teal transition"
            >
              Clear Filters
            </button>
          )}
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Our Products</h2>
            <p className="text-gray-600">
              {filteredProducts.length} produk ditemukan
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Tidak ada produk yang sesuai dengan filter.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategories([]);
                  setSelectedProvince("");
                  setSelectedCity("");
                }}
                className="mt-4 bg-teal text-white px-6 py-2 rounded-full hover:bg-navy transition"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                  reviewCount={p.reviewCount}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}