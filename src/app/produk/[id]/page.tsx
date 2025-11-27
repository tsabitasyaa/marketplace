"use client";

import { useState, useEffect } from "react";
import { Star, Store, MapPin, X } from "lucide-react";

export default function ProductDetail({ params }: { params: { id: string } }) {
  const productId = params.id;

  // Dummy product
  const product = {
    id: productId,
    name: "Sepatu Running Premium",
    price: "Rp 250.000",
    category: "Olahraga",
    rating: 4.7,
    condition: "Baru",
    description:
      "Sepatu running terbaik dengan bahan ringan, nyaman digunakan, dan cocok untuk aktivitas outdoor maupun gym.",
    storeName: "Toko Maju Jaya",
    province: "Jawa Barat",
    city: "Bandung",
    image: "/product-image.png",
  };

  // Dummy komentar awal
  const [comments, setComments] = useState<
    { name: string; rating: number; comment: string; province: string }[]
  >([
    {
      name: "Budi Santoso",
      rating: 5,
      comment: "Kualitas bagus, pengiriman cepat!",
      province: "Jawa Barat",
    },
    {
      name: "Ayu Lestari",
      rating: 4,
      comment: "Produk oke, sesuai deskripsi.",
      province: "DKI Jakarta",
    },
  ]);

  // State form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [province, setProvince] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);

  // State Popup
  const [showModal, setShowModal] = useState(false);

  // Cek apakah user sudah pernah komentar
  const [hasCommented, setHasCommented] = useState(false);

  useEffect(() => {
    const commented = localStorage.getItem(`commented_${productId}`);
    if (commented) setHasCommented(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (hasCommented) {
      alert("Anda sudah memberikan komentar untuk produk ini.");
      return;
    }

    // Tambahkan komentar baru
    setComments((prev) => [...prev, { name, rating, comment, province }]);

    // Cegah komentar ulang
    localStorage.setItem(`commented_${productId}`, "true");
    setHasCommented(true);

    alert(`Terima kasih! Email ucapan terkirim ke ${email}`);

    // Reset input
    setName("");
    setPhone("");
    setEmail("");
    setProvince("");
    setComment("");
    setRating(0);

    // Tutup popup
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-white text-navy p-6 md:p-12 flex flex-col items-center">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* FOTO PRODUK */}
        <div className="w-full">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-80 object-cover rounded-xl shadow-lg"
          />
        </div>

        {/* DETAIL PRODUK */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{product.name}</h1>

          <p className="text-2xl font-semibold text-teal">{product.price}</p>

          <div className="flex items-center gap-2 text-amber-500">
            <Star className="fill-amber-400" />
            <span className="font-medium">{product.rating}</span>
          </div>

          <p className="text-sm bg-teal text-white px-3 py-1 rounded-full w-fit">
            {product.category}
          </p>

          <p>
            <strong>Kondisi:</strong> {product.condition}
          </p>

          <p className="text-gray-700 leading-relaxed">{product.description}</p>

          <div className="flex items-center gap-2 text-navy">
            <Store size={18} />
            <span>{product.storeName}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <MapPin size={18} />
            <span>
              {product.city}, {product.province}
            </span>
          </div>
        </div>
      </div>

      {/* KOMENTAR */}
      <div className="max-w-5xl w-full mt-16">
        <h2 className="text-2xl font-semibold mb-4">Komentar & Rating</h2>

        <div className="space-y-4">
          {comments.map((c, i) => (
            <div
              key={i}
              className="p-4 bg-beige rounded-xl shadow border border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{c.name}</h3>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="fill-amber-400" size={16} />
                  {c.rating}
                </div>
              </div>
              <p className="text-sm text-gray-700">{c.comment}</p>
              <p className="text-xs text-gray-500 mt-1">{c.province}</p>
            </div>
          ))}
        </div>
      </div>

      {/* BUTTON BERIKAN RATING */}
      {!hasCommented && (
        <button
          onClick={() => setShowModal(true)}
          className="mt-8 bg-teal text-white px-6 py-3 rounded-lg font-semibold hover:bg-navy transition"
        >
          Beri Rating
        </button>
      )}

      {/* POPUP FORM */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-xl relative">
            
            {/* CLOSE BUTTON */}
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
              onClick={() => setShowModal(false)}
            >
              <X size={22} />
            </button>

            <h2 className="text-xl font-bold mb-4">Beri Komentar & Rating</h2>

            <form className="grid grid-cols-1 gap-4" onSubmit={handleSubmit}>
              <input
                className="px-4 py-2 rounded border"
                placeholder="Nama Anda"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <input
                className="px-4 py-2 rounded border"
                placeholder="Nomor HP"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />

              <input
                type="email"
                className="px-4 py-2 rounded border"
                placeholder="Email Anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                className="px-4 py-2 rounded border"
                placeholder="Provinsi"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                required
              />

              <textarea
                className="px-4 py-2 rounded border"
                placeholder="Komentar Anda"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              />

              {/* PILIH RATING */}
              <div className="flex gap-2 justify-center mb-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    size={32}
                    className={`cursor-pointer ${
                      rating >= n
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-400"
                    }`}
                    onClick={() => setRating(n)}
                  />
                ))}
              </div>

              <button className="mt-4 bg-teal text-white px-4 py-2 rounded-lg hover:bg-navy transition">
                Kirim Komentar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
