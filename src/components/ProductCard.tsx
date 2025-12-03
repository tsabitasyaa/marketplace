"use client";
import { Star, MapPin, Store} from "lucide-react";
import Link from "next/link";

type ProductCardProps = {
  id: number;
  name: string;
  price: number;
  category: string;
  rating: string;
  storeName: string;
  location: string; // kota + provinsi
  image: string;
  reviewCount: number;
};

  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

export default function ProductCard({
  id,
  name,
  price,
  category,
  rating,
  storeName,
  location,
  image,
  reviewCount,
}: ProductCardProps) {
  return (
    <Link href={`/produk/${id}`}>
        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-200 hover:-translate-y-1">
        
        {/* IMAGE */}
        <div className="w-full h-44 overflow-hidden">
            <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transform hover:scale-105 transition duration-500"
            />
        </div>

        {/* CONTENT */}
        <div className="p-4 flex flex-col space-y-2">

            {/* CATEGORY BADGE */}
            <span className="inline-block bg-teal text-white text-xs px-3 py-1 rounded-full w-fit">
            {category}
            </span>

            {/* PRODUCT NAME */}
            <h3 className="font-semibold text-lg text-navy leading-tight line-clamp-2">
            {name}
            </h3>

            {/* PRICE */}
            <p className="text-teal font-semibold text-md">{formatPrice(price)}</p>

            {/* RATING */}
            <div className="flex items-center gap-1 text-amber-500 text-sm font-medium">
            <Star size={16} className="fill-amber-400 text-amber-400" />
            {rating} <span className="text-gray-500">({reviewCount})</span>
            </div>

            <hr className="my-1" />

            {/* STORE */}
            <div className="flex items-center gap-2 text-sm text-navy">
            <Store size={16} />
            <span className="truncate">{storeName}</span>
            </div>

            {/* LOCATION */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin size={16} />
            <span className="truncate">{location}</span>
            </div>

        </div>
        </div>
    </Link>
  );
}
