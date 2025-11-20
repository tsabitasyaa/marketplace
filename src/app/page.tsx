export default function Home() {
  // Dummy Products — tinggal ganti dengan data asli (API, DB, props, dll.)
  const products = Array.from({ length: 8 }).map((_, i) => ({
    id: i + 1,
    name: `Product ${i + 1}`,
    price: "Rp 99.000",
    rating: "4.5",
    image: "/product-image.png", // ganti dengan gambar asli nanti
  }));

  return (
    <div className="min-h-screen bg-white text-navy flex flex-col">

      {/* NAVBAR */}
      <header className="w-full bg-teal text-white py-4 px-6 flex items-center justify-between shadow">
        <div className="text-xl font-bold">nama & logo aplikasi</div>

        {/* Search Bar */}
        <div className="flex items-center bg-white border border-navy rounded-full px-4 py-2 w-[40%]">
          <input
            type="text"
            placeholder="Cari produk..."
            className="flex-1 bg-transparent outline-none text-navy"
          />
          <span className="text-navy">🔍</span>
        </div>

        <button className="bg-beige text-navy px-4 py-2 rounded-full shadow hover:bg-navy transition">
          Login as Seller
        </button>
      </header>

      <div className="flex">
        
        {/* SIDEBAR */}
        <aside className="w-56 bg-beige text-navy min-h-screen p-4 space-y-4">
          <p className="font-bold text-lg">FILTER</p>

          <div>
            <p className="font-semibold mb-1">Lokasi</p>
            <ul className="space-y-1 text-sm">
              <li>Jabodetabek</li>
              <li>DKI Jakarta</li>
              <li>Jawa Barat</li>
              <li>Jawa Timur</li>
              <li>Lainnya</li>
            </ul>
          </div>

          <div>
            <p className="font-semibold mb-1">Tipe Penjual</p>
            <ul className="space-y-1 text-sm">
              <li>Dikelola Shopee</li>
              <li>Shopee Mall</li>
              <li>Star</li>
              <li>Star+</li>
            </ul>
          </div>

          <div>
            <p className="font-semibold mb-1">Metode Pembayaran</p>
            <ul className="space-y-1 text-sm">
              <li>COD (Bayar di Tempat)</li>
            </ul>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-8">

          <h2 className="text-2xl font-semibold mb-6">our product</h2>

          {/* PRODUCT GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <div
                key={product.id}
                className="bg-skyblue p-4 rounded-lg shadow hover:scale-105 transition cursor-pointer"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded"
                />

                <h3 className="mt-3 font-semibold text-navy">{product.name}</h3>
                <p className="text-navy">{product.price}</p>
                <p className="text-sm text-navy">Rating: {product.rating}</p>
              </div>
            ))}
          </div>

        </main>
      </div>
    </div>
  );
}