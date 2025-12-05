// app/admin/dashboard/statistics/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from "recharts";
import {
  Users,
  Package,
  MapPin,
  MessageSquare,
  Star,
  UserCheck,
  UserX,
  RefreshCw,
  AlertCircle,
  Database
} from "lucide-react";

// Types untuk data
interface ProductByCategory {
  category_name: string;
  product_count: number;
  percentage: number;
}

interface SellerByProvince {
  province: string;
  seller_count: number;
  percentage: number;
}

interface SellerStatus {
  name: string;
  value: number;
  percentage: number;
}

interface ReviewStats {
  total_reviews: number;
  average_rating: number;
  rating_distribution: { rating: number; count: number; percentage: number }[];
}

interface DashboardData {
  totalSellers: number;
  activeSellers: number;
  inactiveSellers: number;
  totalProducts: number;
  totalCategories: number;
  totalReviews: number;
  avgRating: number;
  verifiedSellers: number;
  productsByCategory: ProductByCategory[];
  sellersByProvince: SellerByProvince[];
  reviewStats: ReviewStats;
}

export default function StatisticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const [dataSource, setDataSource] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalSellers: 0,
    activeSellers: 0,
    inactiveSellers: 0,
    totalProducts: 0,
    totalCategories: 0,
    totalReviews: 0,
    avgRating: 0,
    verifiedSellers: 0,
    productsByCategory: [],
    sellersByProvince: [],
    reviewStats: {
      total_reviews: 0,
      average_rating: 0,
      rating_distribution: []
    }
  });
  
  // Warna untuk chart
  const CATEGORY_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
  const PROVINCE_COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F97316', '#10B981', '#6366F1'];
  const STATUS_COLORS = ['#10B981', '#EF4444']; // Aktif, Tidak Aktif
  const RATING_COLORS = ['#EF4444', '#F59E0B', '#FBBF24', '#34D399', '#10B981'];

  // Fungsi untuk set mock data
  const setMockData = () => {
    console.log("📊 Using mock data for display");
    setUsingMockData(true);
    setDataSource("mock-data");
    
    const mockData = {
      totalSellers: 850,
      activeSellers: 620,
      inactiveSellers: 230,
      verifiedSellers: 480,
      totalProducts: 12500,
      totalCategories: 18,
      totalReviews: 4230,
      avgRating: 4.2,
      productsByCategory: [
        { category_name: 'Elektronik', product_count: 3750, percentage: 30 },
        { category_name: 'Fashion', product_count: 3125, percentage: 25 },
        { category_name: 'Makanan', product_count: 2500, percentage: 20 },
        { category_name: 'Otomotif', product_count: 1875, percentage: 15 },
        { category_name: 'Kesehatan', product_count: 625, percentage: 5 },
        { category_name: 'Lainnya', product_count: 625, percentage: 5 }
      ],
      sellersByProvince: [
        { province: 'Jawa Barat', seller_count: 255, percentage: 30 },
        { province: 'Jawa Timur', seller_count: 212, percentage: 25 },
        { province: 'Jawa Tengah', seller_count: 170, percentage: 20 },
        { province: 'DKI Jakarta', seller_count: 127, percentage: 15 },
        { province: 'Banten', seller_count: 85, percentage: 10 }
      ],
      reviewStats: {
        total_reviews: 4230,
        average_rating: 4.2,
        rating_distribution: [
          { rating: 1, count: 211, percentage: 5 },
          { rating: 2, count: 423, percentage: 10 },
          { rating: 3, count: 846, percentage: 20 },
          { rating: 4, count: 1269, percentage: 30 },
          { rating: 5, count: 1481, percentage: 35 }
        ]
      }
    };
    
    setDashboardData(mockData);
    setLastUpdated(new Date());
  };

  // Fetch semua data statistik dari API /api/admin/statistics
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    setUsingMockData(false);
    
    try {
      console.log("🔄 Fetching dashboard data from API /api/admin/statistics...");
      
      // Menggunakan endpoint /api/admin/statistics
      const response = await fetch('/api/admin/statistics', {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("API route /api/admin/statistics tidak ditemukan. Pastikan file route.ts ada di /app/api/admin/statistics/");
        }
        
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // Ignore JSON parsing error
        }
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        console.warn("API returned warning:", result.message);
        setError(result.message);
      }
      
      // Update data dari API
      const apiData = result.data;
      setDataSource(result.source || "unknown");
      
      setDashboardData({
        totalSellers: apiData.totalSellers || 0,
        activeSellers: apiData.activeSellers || 0,
        inactiveSellers: apiData.inactiveSellers || 0,
        totalProducts: apiData.totalProducts || 0,
        totalCategories: apiData.totalCategories || 0,
        totalReviews: apiData.totalReviews || 0,
        avgRating: apiData.avgRating || 0,
        verifiedSellers: apiData.verifiedSellers || 0,
        productsByCategory: apiData.productsByCategory || [],
        sellersByProvince: apiData.sellersByProvince || [],
        reviewStats: apiData.reviewStats || {
          total_reviews: 0,
          average_rating: 0,
          rating_distribution: []
        }
      });
      
      // Set apakah menggunakan mock data
      const isMockData = result.source?.includes('mock') || result.message?.includes('mock');
      setUsingMockData(isMockData);
      
      if (isMockData) {
        console.warn("⚠️ Using mock data:", result.message);
      } else {
        console.log("✅ Using real data from:", result.source);
      }
      
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMsg);
      
      // Gunakan mock data sebagai fallback
      if (errorMsg.includes('404') || errorMsg.includes('tidak ditemukan')) {
        setError(`${errorMsg} - Menggunakan data contoh`);
      }
      
      setMockData();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh setiap 5 menit
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Data seller status untuk pie chart
  const sellerStatusData = [
    {
      name: 'Aktif',
      value: dashboardData.activeSellers,
      percentage: dashboardData.totalSellers > 0 ? 
        parseFloat((dashboardData.activeSellers / dashboardData.totalSellers * 100).toFixed(1)) : 0
    },
    {
      name: 'Tidak Aktif',
      value: dashboardData.inactiveSellers,
      percentage: dashboardData.totalSellers > 0 ? 
        parseFloat((dashboardData.inactiveSellers / dashboardData.totalSellers * 100).toFixed(1)) : 0
    }
  ];

  // Custom tooltip untuk chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}
              {entry.payload.percentage && ` (${entry.payload.percentage.toFixed(1)}%)`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Format untuk label pie chart
  const renderCustomizedLabel = (entry: any) => {
    return `${entry.name}: ${entry.value} (${entry.percentage.toFixed(1)}%)`;
  };

  // Summary cards
  const summaryCards = [
    {
      title: "Total Produk",
      value: dashboardData.totalProducts.toLocaleString(),
      icon: Package,
      color: "bg-blue-500",
      description: "Tersebar di " + dashboardData.totalCategories + " kategori"
    },
    {
      title: "Total Penjual",
      value: dashboardData.totalSellers.toLocaleString(),
      icon: Users,
      color: "bg-green-500",
      description: `${dashboardData.activeSellers} aktif, ${dashboardData.inactiveSellers} tidak aktif`
    },
    {
      title: "Total Review",
      value: dashboardData.reviewStats.total_reviews.toLocaleString(),
      icon: MessageSquare,
      color: "bg-purple-500",
      description: `Rating rata-rata ${dashboardData.reviewStats.average_rating.toFixed(1)}/5.0`
    },
    {
      title: "Penjual Terverifikasi",
      value: dashboardData.verifiedSellers.toLocaleString(),
      icon: UserCheck,
      color: "bg-indigo-500",
      description: `${dashboardData.verifiedSellers > 0 && dashboardData.totalSellers > 0 ? 
        ((dashboardData.verifiedSellers / dashboardData.totalSellers) * 100).toFixed(1) : 0}% dari total penjual`
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Statistik</h1>
          <p className="text-gray-600 mt-1">Analisis data platform marketplace</p>
          
          {/* Status Information */}
          <div className="flex items-center gap-4 mt-3">
            <div className="text-sm text-gray-500">
              Terakhir update: {lastUpdated.toLocaleTimeString('id-ID', { 
                hour: '2-digit', 
                minute: '2-digit'
              })}
            </div>
            
            {usingMockData ? (
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>Menggunakan data contoh</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">
                <Database className="h-4 w-4" />
                <span>Terkoneksi dengan Database</span>
              </div>
            )}
            
            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm">
                <AlertCircle className="h-4 w-4" />
                <span className="max-w-xs truncate">{error}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col gap-3">
          <div className="text-right">
            <p className="text-sm text-gray-600">Sumber Data</p>
            <p className="font-medium text-gray-900">
              {dataSource === "supabase-database" ? "Database" : 
               dataSource === "mock-data" ? "Data Contoh" : 
               dataSource === "database" ? "Database" : dataSource}
            </p>
          </div>
          
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors min-w-[120px]"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Memuat...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Memuat data statistik...</p>
        </div>
      )}

      {/* Stats Cards Grid */}
      {!loading && (
        <>
          {/* Ringkasan Utama */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {summaryCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div 
                  key={index} 
                  className="bg-white rounded-xl shadow border border-gray-200 p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg ${card.color} text-white`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-sm font-medium text-gray-700 mt-1">{card.title}</p>
                  <p className="text-xs text-gray-500 mt-2">{card.description}</p>
                </div>
              );
            })}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Sebaran Produk Berdasarkan Kategori */}
            <div className="bg-white rounded-xl shadow border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Sebaran Produk Berdasarkan Kategori</h2>
                  <p className="text-sm text-gray-500">Total {dashboardData.totalProducts.toLocaleString()} produk</p>
                </div>
                <Package className="h-5 w-5 text-gray-400" />
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardData.productsByCategory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="category_name" 
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="product_count" 
                      name="Jumlah Produk"
                      radius={[4, 4, 0, 0]}
                    >
                      {dashboardData.productsByCategory.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                {dashboardData.productsByCategory.slice(0, 6).map((category, index) => (
                  <div key={index} className="text-center">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {category.category_name}
                    </div>
                    <div className="text-lg font-bold" style={{ color: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}>
                      {category.product_count.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">{category.percentage.toFixed(1)}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Sebaran Toko Berdasarkan Provinsi */}
            <div className="bg-white rounded-xl shadow border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Sebaran Toko Berdasarkan Provinsi</h2>
                  <p className="text-sm text-gray-500">{dashboardData.sellersByProvince.length} provinsi teratas</p>
                </div>
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={dashboardData.sellersByProvince}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" />
                    <YAxis 
                      type="category" 
                      dataKey="province" 
                      width={90}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="seller_count" 
                      name="Jumlah Toko"
                      radius={[0, 4, 4, 0]}
                    >
                      {dashboardData.sellersByProvince.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={PROVINCE_COLORS[index % PROVINCE_COLORS.length]} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                Total {dashboardData.sellersByProvince.reduce((sum, item) => sum + item.seller_count, 0).toLocaleString()} toko tersebar
              </div>
            </div>
          </div>

          {/* Charts Grid - Baris 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 3. Status Penjual (Aktif/Tidak Aktif) */}
            <div className="bg-white rounded-xl shadow border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Status Penjual</h2>
                  <p className="text-sm text-gray-500">Aktif vs Tidak Aktif</p>
                </div>
                <Users className="h-5 w-5 text-gray-400" />
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sellerStatusData}
                      cx="50%"
                      cy="50%"
                      label={renderCustomizedLabel}
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                    >
                      {sellerStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                {sellerStatusData.map((status, index) => (
                  <div key={index} className="text-center p-3 rounded-lg" 
                    style={{ backgroundColor: `${STATUS_COLORS[index]}15` }}>
                    <div className="text-lg font-bold" style={{ color: STATUS_COLORS[index] }}>
                      {status.value}
                    </div>
                    <div className="text-sm font-medium text-gray-700">{status.name}</div>
                    <div className="text-xs text-gray-500">{status.percentage.toFixed(1)}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Distribusi Rating & Komentar */}
            <div className="bg-white rounded-xl shadow border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Distribusi Rating & Komentar</h2>
                  <p className="text-sm text-gray-500">Total {dashboardData.reviewStats.total_reviews.toLocaleString()} review</p>
                </div>
                <Star className="h-5 w-5 text-gray-400" />
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dashboardData.reviewStats.rating_distribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="rating" 
                      tick={{ fontSize: 12 }}
                      label={{ value: 'Rating (1-5)', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      name="Jumlah Review"
                      stroke="#8B5CF6" 
                      fill="#8B5CF6"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-lg font-bold text-purple-700">
                    {dashboardData.reviewStats.average_rating.toFixed(1)}
                  </div>
                  <div className="text-sm text-purple-600">Rata-rata Rating</div>
                  <div className="text-xs text-gray-500">Skala 1-5</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-700">
                    {dashboardData.reviewStats.total_reviews.toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-600">Total Review</div>
                  <div className="text-xs text-gray-500">
                    {dashboardData.totalSellers > 0 ? 
                      (dashboardData.reviewStats.total_reviews / dashboardData.totalSellers).toFixed(1) : 0} per penjual
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info Status Database */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Informasi Sistem</h3>
                <p className="text-sm text-gray-600">Data diperbarui secara real-time dari database</p>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-600">Status Database</div>
                <div className={`font-medium ${usingMockData ? 'text-amber-600' : 'text-green-600'}`}>
                  {usingMockData ? '⚠️ Data Contoh' : '✅ Database Aktif'}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Data terakhir diperbarui</p>
                  <p className="font-medium text-gray-900">
                    {lastUpdated.toLocaleDateString('id-ID', { 
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              
              {usingMockData && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>Perhatian:</strong> Dashboard menggunakan data contoh. Untuk menghubungkan ke database Supabase Anda:
                  </p>
                  <ul className="text-xs text-amber-700 mt-2 space-y-1 ml-4 list-disc">
                    <li>Pastikan file <code>/app/api/admin/statistics/route.ts</code> ada</li>
                    <li>Periksa kredensial di file .env.local</li>
                    <li>Cek console browser dan terminal untuk error detail</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}