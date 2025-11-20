import Link from 'next/link';

// Interface untuk Product
interface Product {
  id: number;
  name: string;
  price: string;
  rating: string;
  image: string;
}

export default function Home() {
  // Dummy Products
  const products: Product[] = Array.from({ length: 8 }).map((_, i) => ({
    id: i + 1,
    name: `Product ${i + 1}`,
    price: "Rp 99.000",
    rating: "4.5",
    image: "/product-image.png",
  }));

  return (
    <div className="min-h-screen bg-white text-navy flex flex-col">
      {/* NAVBAR */}
      <header className="w-full bg-teal text-white py-4 px-6 flex items-center justify-between shadow relative z-50">
        <div className="text-xl font-bold">nama & logo aplikasi</div>

        {/* Search Bar */}
        <div className="flex items-center bg-white border border-navy rounded-full px-4 py-2 w-[40%]">
          <input
            type="text"
            placeholder="Cari produk..."
            className="flex-1 bg-transparent outline-none text-navy placeholder-gray-500"
          />
          <span className="text-navy">🔍</span>
        </div>

        {/* BUTTON LOGIN - MENGARAH KE /login */}
        <Link 
          href="/login" 
          className="bg-beige text-navy px-4 py-2 rounded-full shadow hover:bg-navy hover:text-white transition duration-300 font-medium"
        >
          Login as Seller
        </Link>
      </header>

      <div className="flex flex-1">
        {/* SIDEBAR */}
        <aside className="w-56 bg-beige text-navy min-h-screen p-4 space-y-4">
          <p className="font-bold text-lg">FILTER</p>

          <div>
            <p className="font-semibold mb-1">Lokasi</p>
            <ul className="space-y-1 text-sm">
              <li className="hover:text-teal cursor-pointer transition">Jabodetabek</li>
              <li className="hover:text-teal cursor-pointer transition">DKI Jakarta</li>
              <li className="hover:text-teal cursor-pointer transition">Jawa Barat</li>
              <li className="hover:text-teal cursor-pointer transition">Jawa Timur</li>
              <li className="hover:text-teal cursor-pointer transition">Lainnya</li>
            </ul>
          </div>

          <div>
            <p className="font-semibold mb-1">Tipe Penjual</p>
            <ul className="space-y-1 text-sm">
              <li className="hover:text-teal cursor-pointer transition">Dikelola Shopee</li>
              <li className="hover:text-teal cursor-pointer transition">Shopee Mall</li>
              <li className="hover:text-teal cursor-pointer transition">Star</li>
              <li className="hover:text-teal cursor-pointer transition">Star+</li>
            </ul>
          </div>

          <div>
            <p className="font-semibold mb-1">Metode Pembayaran</p>
            <ul className="space-y-1 text-sm">
              <li className="hover:text-teal cursor-pointer transition">COD (Bayar di Tempat)</li>
            </ul>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-8">
          <h2 className="text-2xl font-semibold mb-6 text-navy">Our Products</h2>

          {/* PRODUCT GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product: Product) => (
              <div
                key={product.id}
                className="bg-skyblue p-4 rounded-lg shadow hover:scale-105 transition cursor-pointer"
              >
                <div className="w-full h-40 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-gray-500">Product Image</span>
                </div>

                <h3 className="mt-3 font-semibold text-navy">{product.name}</h3>
                <p className="text-navy font-medium">{product.price}</p>
                <p className="text-sm text-navy">Rating: {product.rating}</p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
