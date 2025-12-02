"use client";

import { useState, useEffect, use } from "react";
import { Star, Store, MapPin, X, Mail, Phone, User, ChevronDown } from "lucide-react";

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  province: string;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  rating: string;
  condition: string;
  description: string;
  storeName: string;
  storeLocation: string;
  image: string;
  stock: number;
  reviews: Review[];
}

interface Province {
  id: string;
  name: string;
}

function formatProvinceName(provinceName: string): string {
  if (!provinceName) return '';
  
  // Jika sudah dalam format yang benar, return as is
  if (/^[A-Z][a-z]+(\s+[A-Z][a-z]+)*$/.test(provinceName)) {
    return provinceName;
  }
  
  // Convert ALL CAPS atau random case ke Proper Case
  return provinceName
    .toLowerCase()
    .split(' ')
    .map(word => {
      // Handle special cases untuk kepulauan
      const lowerWord = word.toLowerCase();
      if (lowerWord === 'di' || lowerWord === 'kep.' || lowerWord === 'kepulauan') {
        return word;
      }
      // Handle D.I. (Daerah Istimewa)
      if (lowerWord === 'd.i.') {
        return 'D.I.';
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const productId = id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [province, setProvince] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // State untuk dropdown provinsi
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [provincesError, setProvincesError] = useState("");

  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  

  // Fetch data provinsi
  useEffect(() => {
    async function fetchProvinces() {
      try {
        setLoadingProvinces(true);
        setProvincesError("");

        const res = await fetch("https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json");
        
        if (!res.ok) {
          throw new Error(`Gagal memuat data provinsi: ${res.status}`);
        }

        const data = await res.json();
        setProvinces(data);
        
        console.log(`✅ Loaded ${data.length} provinces`);

      } catch (err: any) {
        console.error("Error fetching provinces:", err);
        setProvincesError(err.message || "Gagal memuat data provinsi");
      } finally {
        setLoadingProvinces(false);
      }
    }

    fetchProvinces();
  }, []);

  // Fetch product data dengan error handling yang lebih baik
  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        setError("");

        console.log(`🔄 Fetching product with ID: ${productId}`);

        const res = await fetch(`/api/products/${productId}`);
        
        // Cek status HTTP
        if (!res.ok) {
          // Coba baca response body untuk detail error
          let errorMessage = `HTTP error! status: ${res.status}`;
          try {
            const errorData = await res.json();
            errorMessage = errorData.message || errorMessage;
          } catch {
            // Jika response bukan JSON, gunakan status text
            errorMessage = res.statusText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        const json = await res.json();

        if (!json.success) {
          throw new Error(json.message || "Gagal memuat data produk");
        }

        setProduct(json.data);
        console.log("✅ Product data loaded:", json.data);

      } catch (err: any) {
        console.error("Error fetching product:", err);
        setError(err.message || "Terjadi kesalahan saat memuat produk");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      fetchProduct();
    } else {
      setError("Product ID tidak valid");
      setLoading(false);
    }
  }, [productId]);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitError("");

  if (!product) return;

  // Validasi client-side sederhana
  if (!email.includes('@')) {
    alert("❌ Format email tidak valid");
    return;
  }

  setSubmitting(true);

  try {
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: productId,
        user_name: name,
        user_phone: phone,
        user_email: email,
        user_province: province,
        rating,
        comment
      }),
    });

    const json = await res.json();

    if (!json.success) {
      // TAMPILKAN ALERT UNTUK ERROR DUPLICATE EMAIL
      alert(`❌ ${json.message}`);
      setSubmitError(json.message);
      return;
    }

    // Refresh product data untuk mendapatkan review terbaru
    const productRes = await fetch(`/api/products/${productId}`);
    const productJson = await productRes.json();
    
    if (productJson.success) {
      setProduct(productJson.data);
    }

    // TAMPILKAN ALERT SUKSES
    alert(`✅ ${json.message}`);
    console.log("✅ Review submitted successfully");

    // Reset form
    setName("");
    setPhone("");
    setEmail("");
    setProvince("");
    setComment("");
    setRating(0);
    setShowModal(false);
    setSubmitError("");

  } catch (err: any) {
    console.error("Error submitting review:", err);
    const errorMessage = err.message || "Terjadi kesalahan saat mengirim review";
    alert(`❌ ${errorMessage}`);
    setSubmitError(errorMessage);
  } finally {
    setSubmitting(false);
  }
};

  const resetForm = () => {
    setName("");
    setPhone("");
    setEmail("");
    setProvince("");
    setComment("");
    setRating(0);
    setSubmitError("");
  };

  // Tampilkan loading
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal mx-auto"></div>
          <p className="mt-4 text-navy">Memuat produk...</p>
        </div>
      </div>
    );
  }

  // Tampilkan error
  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-navy mb-2">Produk Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-6">
            {error || "Produk yang Anda cari tidak tersedia."}
          </p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => window.history.back()}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition"
            >
              Kembali
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="bg-teal text-white px-6 py-2 rounded-lg hover:bg-navy transition"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-navy p-6 md:p-12 flex flex-col items-center">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* FOTO PRODUK */}
        <div className="w-full">
          <img
            src={product.image || "/placeholder-product.jpg"}
            alt={product.name}
            className="w-full h-80 object-cover rounded-xl shadow-lg"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder-product.jpg";
            }}
          />
        </div>

        {/* DETAIL PRODUK */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{product.name}</h1>

          <p className="text-2xl font-semibold text-teal">
            {formatPrice(product.price)}
          </p>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="fill-amber-400" />
              <span className="font-medium">{product.rating}</span>
              <span className="text-gray-500">({product.reviews.length} review)</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-sm bg-teal text-white px-3 py-1 rounded-full">
              {product.category}
            </span>
            <span className="text-sm bg-beige text-navy px-3 py-1 rounded-full">
              Stok: {product.stock}
            </span>
            <span className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded-full">
              {product.condition}
            </span>
          </div>

          <p className="text-gray-700 leading-relaxed">{product.description}</p>

          <div className="flex items-center gap-2 text-navy">
            <Store size={18} />
            <span className="font-semibold">{product.storeName}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <MapPin size={18} />
            <span>{product.storeLocation}</span>
          </div>

          {/* BUTTON BERIKAN RATING */}
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 bg-teal text-white px-6 py-3 rounded-lg font-semibold hover:bg-navy transition w-full md:w-auto"
          >
            Beri Rating & Review
          </button>
        </div>
      </div>

      {/* KOMENTAR SECTION */}
      <div className="max-w-5xl w-full mt-16">
        <h2 className="text-2xl font-semibold mb-6">
          Komentar & Rating ({product.reviews.length})
        </h2>

        {product.reviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-500 text-lg mb-2">Belum ada review</p>
            <p className="text-gray-400 text-sm">Jadilah yang pertama memberikan review!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {product.reviews.map((review) => (
              <div
                key={review.id}
                className="p-6 bg-beige rounded-xl shadow border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{review.name}</h3>
                    <p className="text-sm text-gray-500">{formatProvinceName(review.province)}</p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="fill-amber-400" size={20} />
                    <span className="font-bold text-lg">{review.rating}</span>
                  </div>
                </div>
                <p className="text-gray-700 mb-2">{review.comment}</p>
                <p className="text-xs text-gray-400 text-right">
                  {new Date(review.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* POPUP FORM REVIEW */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-xl relative max-h-[90vh] overflow-y-auto">
            
            {/* CLOSE BUTTON */}
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              disabled={submitting}
            >
              <X size={22} />
            </button>

            <h2 className="text-xl font-bold mb-4">Beri Komentar & Rating</h2>
            <p className="text-sm text-gray-600 mb-4">
              Silakan isi informasi Anda untuk memberikan review
            </p>

            {/* ERROR MESSAGE */}
            {submitError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {submitError}
              </div>
            )}

            <form className="grid grid-cols-1 gap-4" onSubmit={handleSubmit}>
              {/* NAMA */}
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  className="pl-10 pr-4 py-2 rounded border border-gray-300 focus:border-teal focus:outline-none w-full"
                  placeholder="Nama Lengkap"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>

              {/* EMAIL */}
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="email"
                  className="pl-10 pr-4 py-2 rounded border border-gray-300 focus:border-teal focus:outline-none w-full"
                  placeholder="Alamat Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>

              {/* TELEPON */}
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  className="pl-10 pr-4 py-2 rounded border border-gray-300 focus:border-teal focus:outline-none w-full"
                  placeholder="Nomor Telepon/HP"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>

              {/* PROVINSI - DROPDOWN */}
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                <select
                  className="pl-10 pr-10 py-2 rounded border border-gray-300 focus:border-teal focus:outline-none w-full appearance-none bg-white cursor-pointer"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  required
                  disabled={submitting || loadingProvinces}
                >
                  <option value="">Pilih Provinsi</option>
                  {provinces.map((prov) => (
                    <option key={prov.id} value={prov.name}>
                      {prov.name}
                    </option>
                  ))}
                </select>
                <ChevronDown 
                  className="absolute right-3 top-3 text-gray-400 pointer-events-none" 
                  size={18} 
                />
              </div>

              {/* Loading state untuk provinces */}
              {loadingProvinces && (
                <div className="text-center text-sm text-gray-500">
                  Memuat data provinsi...
                </div>
              )}

              {/* Error state untuk provinces */}
              {provincesError && (
                <div className="text-center text-sm text-red-500 bg-red-50 p-2 rounded">
                  {provincesError}
                  <button 
                    onClick={() => window.location.reload()}
                    className="ml-2 text-blue-500 hover:text-blue-700"
                  >
                    Coba lagi
                  </button>
                </div>
              )}

              {/* KOMENTAR */}
              <textarea
                className="px-4 py-2 rounded border border-gray-300 focus:border-teal focus:outline-none"
                placeholder="Tulis komentar Anda tentang produk ini..."
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                disabled={submitting}
              />

              {/* RATING */}
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Berikan rating:</p>
                <div className="flex gap-2 justify-center mb-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      disabled={submitting}
                      className="focus:outline-none transform hover:scale-110 transition-transform"
                    >
                      <Star
                        size={32}
                        className={`cursor-pointer ${
                          rating >= n
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-300"
                        } ${submitting ? 'opacity-50' : ''}`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  {rating > 0 ? `Rating: ${rating} bintang` : 'Pilih rating 1-5 bintang'}
                </p>
              </div>

              {/* SUBMIT BUTTON */}
              <button 
                type="submit"
                disabled={submitting || rating === 0}
                className="mt-4 bg-teal text-white px-4 py-3 rounded-lg hover:bg-navy transition disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
              >
                {submitting ? "Mengirim Review..." : "Kirim Review"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}