"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, Cell
} from "recharts";
import { supabase } from "@/lib/supabase";

// Update interface sesuai dengan database
interface Product {
  id: number;
  name_id: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  condition: string;
  province: string;
  city: string;
  image_url: string;
  created_at: string;
  // Tambahan untuk frontend
  sold?: number;
  rating?: number;
  name?: string;
}

interface Seller {
  id: string;
  store_name: string;
  description: string;
  pic_name: string;
  pic_phone: string;
  pic_email: string;
  pic_address: string;
  rt: string;
  rw: string;
  kelumbar: string;
  city: string;
  province: string;
  pic_kip: string;
  pic_photo_url: string;
  pic_kip_file_url: string;
  verified: string;
  verification_status: string;
  created_at: string;
  it_active: string;
  lecomatan: string;
  user_id: string;
  verification_potes: string;
}

interface DashboardStats {
  totalProducts: number;
  totalSold: number;
  lowStockProducts: number;
  averageRating: number;
  totalRevenue: number;
  totalVisitors: number;
  ratingComments: number;
  visitorsWithComments: number;
}

interface CategoryData {
  category: string;
  count: number;
  percentage: number;
}

interface MonthlyVisitorData {
  month: string;
  visitors: number;
  comments: number;
  ratings: number;
  sold: number;
}

interface RatingDistribution {
  rating: number;
  count: number;
  percentage: number;
}

type ActiveView = 'dashboard' | 'laporan' | 'kelola-produk' | 'tambah-produk' | 'edit-produk';
type ReportType = 'stock-by-stock' | 'stock-by-rating' | 'low-stock';

export default function DashboardPenjual() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [currentSeller, setCurrentSeller] = useState<Seller | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalSold: 0,
    lowStockProducts: 0,
    averageRating: 0,
    totalRevenue: 0,
    totalVisitors: 1560,
    ratingComments: 342,
    visitorsWithComments: 120
  });
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [monthlyVisitors, setMonthlyVisitors] = useState<MonthlyVisitorData[]>([]);
  const [ratingDistribution, setRatingDistribution] = useState<RatingDistribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ReportType>('stock-by-stock');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    name_id: "",
    category: "",
    price: "",
    stock: "",
    description: "",
    condition: "Baru",
    province: "",
    city: "",
    image_url: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfData, setPdfData] = useState<Product[]>([]);
  const [pdfTitle, setPdfTitle] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

  // Dummy data generator untuk data yang tidak ada di database
  const generateRandomSold = useCallback(() => Math.floor(Math.random() * 50) + 10, []);
  const generateRandomRating = useCallback(() => parseFloat((3.5 + Math.random() * 1.5).toFixed(1)), []);
  const generateRandomVisitors = useCallback(() => Math.floor(Math.random() * 200) + 100, []);
  const generateRandomComments = useCallback(() => Math.floor(Math.random() * 60) + 20, []);
  const generateRandomSoldMonth = useCallback(() => Math.floor(Math.random() * 40) + 30, []);

  // Define COLORS inside useMemo to prevent unnecessary re-renders
  const COLORS = useMemo(() => ['#567C8D', '#2F4156', '#C8D9E6', '#94A9C9', '#6B8BA4', '#3A506B'], []);

  // Fetch current seller from session
  useEffect(() => {
    const fetchCurrentSeller = async () => {
      try {
        // Ambil session dari Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user?.id) {
          router.push('/penjual/login');
          return;
        }

        // Fetch seller data berdasarkan user_id
        const { data: sellerData, error: sellerError } = await supabase
          .from('sellers')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (sellerError) {
          console.error('Error fetching seller:', sellerError);
          router.push('/penjual/login');
          return;
        }

        setCurrentSeller(sellerData);
        
        // Fetch products for this seller
        await fetchSellerProducts(sellerData.id);
      } catch (error) {
        console.error('Error fetching seller data:', error);
        router.push('/penjual/login');
      }
    };

    fetchCurrentSeller();
  }, [router]);

  // Fetch products for specific seller
  const fetchSellerProducts = async (sellerId: string) => {
    try {
      setIsLoading(true);
      
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', sellerId) // Asumsi ada kolom seller_id di tabel products
        .order('created_at', { ascending: false });

      if (productsError) {
        console.error('Error fetching products:', productsError);
        return;
      }

      // Tambahkan data dummy untuk sold dan rating (karena tidak ada di database)
      const productsWithAdditionalData = productsData.map(product => ({
        ...product,
        sold: generateRandomSold(),
        rating: generateRandomRating(),
        name: product.name_id // Menggunakan name_id sebagai nama produk
      })) as Product[];

      setProducts(productsWithAdditionalData);
      
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate all months data (12 months)
  const generateAllMonthsData = useCallback(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    return months.map((month) => ({
      month,
      visitors: generateRandomVisitors(),
      comments: generateRandomComments(),
      ratings: Math.floor(generateRandomComments() * 0.7),
      sold: generateRandomSoldMonth()
    }));
  }, [generateRandomVisitors, generateRandomComments, generateRandomSoldMonth]);

  const getDisplayedMonths = useCallback(() => {
    const allMonths = generateAllMonthsData();
    return allMonths.slice(currentMonthIndex, currentMonthIndex + 6);
  }, [currentMonthIndex, generateAllMonthsData]);

  const handleNextMonths = () => {
    setCurrentMonthIndex(prev => Math.min(prev + 3, 6));
  };

  const handlePrevMonths = () => {
    setCurrentMonthIndex(prev => Math.max(prev - 3, 0));
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (products.length === 0 || !currentSeller) return;

      try {
        setIsLoading(true);
        
        // Calculate category data
        const categoryCounts: Record<string, number> = {};
        products.forEach(product => {
          categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
        });

        const totalProducts = products.length;
        const categoryData: CategoryData[] = Object.entries(categoryCounts).map(([category, count]) => ({
          category,
          count,
          percentage: parseFloat(((count / totalProducts) * 100).toFixed(1)),
        }));
        setCategories(categoryData);

        // Generate monthly visitors data
        const monthlyData = generateAllMonthsData();
        setMonthlyVisitors(monthlyData);
        
        // Set rating distribution
        const ratingData: RatingDistribution[] = [
          { rating: 5, count: 45, percentage: 35 },
          { rating: 4, count: 60, percentage: 46 },
          { rating: 3, count: 15, percentage: 12 },
          { rating: 2, count: 8, percentage: 6 },
          { rating: 1, count: 2, percentage: 1 }
        ];
        setRatingDistribution(ratingData);
        
        // Calculate statistics
        const lowStockProducts = products.filter(product => product.stock < 2).length;
        const averageRating = products.reduce((acc, product) => acc + (product.rating || 0), 0) / totalProducts;
        const totalRevenue = products.reduce((acc, product) => acc + (product.price * (product.sold || 0)), 0);
        const totalSold = products.reduce((acc, product) => acc + (product.sold || 0), 0);

        const totalVisitors = monthlyData.reduce((acc, month) => acc + month.visitors, 0);
        const totalRatingComments = monthlyData.reduce((acc, month) => acc + month.comments, 0);

        setStats(prev => ({
          ...prev,
          totalProducts,
          totalSold,
          lowStockProducts,
          averageRating: parseFloat(averageRating.toFixed(1)),
          totalRevenue,
          totalVisitors,
          ratingComments: totalRatingComments,
          visitorsWithComments: Math.floor(totalVisitors * 0.25)
        }));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [products, currentSeller, generateAllMonthsData]);

  const generateReport = () => {
    let dataToExport: Product[] = [];
    let title = "";
    let reportId = "";
    
    switch (selectedReport) {
      case 'stock-by-stock':
        dataToExport = [...products].sort((a, b) => b.stock - a.stock);
        title = "Laporan Daftar Produk Berdasarkan Stock";
        reportId = "SRS-MartPlace-12";
        break;
      case 'stock-by-rating':
        dataToExport = [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        title = "Laporan Daftar Produk Berdasarkan Rating";
        reportId = "SRS-MartPlace-13";
        break;
      case 'low-stock':
        dataToExport = [...products]
          .filter(product => product.stock < 2)
          .sort((a, b) => a.category.localeCompare(b.category) || a.name_id.localeCompare(b.name_id));
        title = "Laporan Daftar Produk Segera Dipesan";
        reportId = "SRS-MartPlace-14";
        break;
    }
    
    setPdfData(dataToExport);
    setPdfTitle(title);
    setShowPdfPreview(true);
  };

  const downloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const currentUser = currentSeller?.store_name || "Penjual";

    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${pdfTitle}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          .header {
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #567C8D;
          }
          .report-id {
            color: #666;
            font-size: 12px;
            margin-bottom: 5px;
          }
          .title {
            color: #283593;
            font-size: 24px;
            margin: 0 0 5px 0;
          }
          .subtitle {
            color: #666;
            font-size: 14px;
            margin-top: 5px;
          }
          .date-info {
            margin-top: 10px;
            font-size: 14px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th {
            background-color: #567C8D;
            color: white;
            padding: 10px;
            text-align: left;
            font-weight: bold;
            border: 1px solid #ddd;
          }
          td {
            padding: 8px 10px;
            border: 1px solid #ddd;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .footer-note {
            margin-top: 20px;
            padding: 10px;
            background-color: #f5f5f5;
            border-radius: 5px;
            font-style: italic;
            font-size: 12px;
          }
          .no-print {
            display: block;
          }
          .print-button {
            background-color: #567C8D;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin-right: 10px;
          }
          .close-button {
            background-color: #f44336;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
          }
          @media print {
            body {
              margin: 0;
              padding: 20px;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="report-id">${pdfTitle === "Laporan Daftar Produk Berdasarkan Stock" ? "(SRS-MartPlace-12)" : 
                           pdfTitle === "Laporan Daftar Produk Berdasarkan Rating" ? "(SRS-MartPlace-13)" : 
                           "(SRS-MartPlace-14)"}</div>
          <h1 class="title">${pdfTitle}</h1>
          <div class="date-info">
            <p>Tanggal dibuat: ${dateStr} oleh <strong>${currentUser}</strong></p>
          </div>
        </div>
    `;

    if (selectedReport === 'stock-by-stock') {
      htmlContent += `
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Produk</th>
              <th>Kategori</th>
              <th>Harga</th>
              <th>Rating</th>
              <th>Stock</th>
            </tr>
          </thead>
          <tbody>
            ${pdfData.map((product, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${product.name_id}</td>
                <td>${product.category}</td>
                <td>${formatCurrency(product.price)}</td>
                <td>${product.rating?.toFixed(1) || 'N/A'}</td>
                <td>${product.stock}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer-note">*) urutkan berdasarkan stock</div>
      `;
    } else if (selectedReport === 'stock-by-rating') {
      htmlContent += `
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Produk</th>
              <th>Kategori</th>
              <th>Harga</th>
              <th>Stock</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            ${pdfData.map((product, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${product.name_id}</td>
                <td>${product.category}</td>
                <td>${formatCurrency(product.price)}</td>
                <td>${product.stock}</td>
                <td>${product.rating?.toFixed(1) || 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer-note">*) urutkan berdasarkan rating</div>
      `;
    } else if (selectedReport === 'low-stock') {
      htmlContent += `
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Produk</th>
              <th>Kategori</th>
              <th>Harga</th>
              <th>Stock</th>
            </tr>
          </thead>
          <tbody>
            ${pdfData.map((product, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${product.name_id}</td>
                <td>${product.category}</td>
                <td>${formatCurrency(product.price)}</td>
                <td>${product.stock}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer-note">*) urutkan berdasarkan kategori dan produk</div>
      `;
    }

    htmlContent += `
        <div class="no-print" style="margin-top: 30px; text-align: center; padding: 20px;">
          <button onclick="window.print()" class="print-button">
            🖨️ Cetak Laporan
          </button>
          <button onclick="window.close()" class="close-button">
            ❌ Tutup
          </button>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
          };
          
          window.onafterprint = function() {
            document.querySelector('.no-print').style.display = 'block';
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setShowPdfPreview(false);
  };

  const handleDeleteProduct = async (productId: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', productId);

        if (error) throw error;

        // Update local state
        const newProducts = products.filter(product => product.id !== productId);
        setProducts(newProducts);
        alert('Produk berhasil dihapus!');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Gagal menghapus produk');
      }
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct({...product});
    setImagePreview(product.image_url);
    setActiveView('edit-produk');
  };

  const handleSaveEdit = async () => {
    if (!editingProduct || !currentSeller) return;

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name_id: editingProduct.name_id,
          category: editingProduct.category,
          price: editingProduct.price,
          stock: editingProduct.stock,
          description: editingProduct.description,
          condition: editingProduct.condition,
          province: editingProduct.province,
          city: editingProduct.city,
          image_url: editingProduct.image_url,
        })
        .eq('id', editingProduct.id)
        .eq('seller_id', currentSeller.id);

      if (error) throw error;

      // Update local state
      const newProducts = products.map(p => 
        p.id === editingProduct.id ? editingProduct : p
      );
      setProducts(newProducts);
      
      setEditingProduct(null);
      setImagePreview(null);
      setActiveView('kelola-produk');
      alert('Produk berhasil diperbarui!');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Gagal memperbarui produk');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB');
        return;
      }
      
      if (!file.type.match('image.*')) {
        alert('Hanya file gambar yang diperbolehkan');
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      
      if (isEdit && editingProduct) {
        setEditingProduct({
          ...editingProduct,
          image_url: imageUrl
        });
      } else {
        setImagePreview(imageUrl);
        setNewProduct({
          ...newProduct,
          image_url: imageUrl
        });
      }
    }
  };

  const handleAddProduct = async () => {
    if (!currentSeller) {
      alert('Seller tidak ditemukan');
      return;
    }

    if (!newProduct.name_id || !newProduct.category || !newProduct.price || !newProduct.stock) {
      alert('Harap isi semua field yang diperlukan!');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name_id: newProduct.name_id,
          category: newProduct.category,
          price: Number(newProduct.price),
          stock: Number(newProduct.stock),
          description: newProduct.description,
          condition: newProduct.condition || "Baru",
          province: newProduct.province || currentSeller.province,
          city: newProduct.city || currentSeller.city,
          image_url: newProduct.image_url,
          seller_id: currentSeller.id,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Tambahkan data dummy untuk frontend
      const newProductObj: Product = {
        ...data,
        sold: generateRandomSold(),
        rating: generateRandomRating(),
        name: data.name_id
      };

      const newProducts = [newProductObj, ...products];
      setProducts(newProducts);
      
      setNewProduct({ 
        name_id: "", 
        category: "", 
        price: "", 
        stock: "",
        description: "",
        condition: "Baru",
        province: "",
        city: "",
        image_url: "" 
      });
      setImagePreview(null);
      setActiveView('kelola-produk');
      alert('Produk berhasil ditambahkan!');
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Gagal menambahkan produk');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/penjual/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const renderLogoutConfirmation = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-[var(--color-navy)] mb-4">Konfirmasi Logout</h3>
          <p className="text-[var(--color-teal)] mb-6">Apakah Anda yakin ingin logout dari dashboard penjual?</p>
          <p className="text-sm text-gray-600 mb-4">Catatan: Data produk Anda akan tetap tersimpan.</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="px-4 py-2 border border-[var(--color-sky-blue)] text-[var(--color-navy)] rounded-lg hover:bg-[var(--color-sky-blue)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
            >
              Batal
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );

const renderDashboard = () => {
    const displayedMonths = getDisplayedMonths();
    
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[var(--color-white)] rounded-lg shadow-sm border border-[var(--color-sky-blue)] p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-teal)]">Total Produk</p>
                <p className="text-2xl font-semibold text-[var(--color-navy)]">{stats.totalProducts}</p>
                <p className="text-xs text-[var(--color-teal)] mt-1">
                  {categories.length} kategori aktif
                </p>
              </div>
              <div className="rounded-full bg-[var(--color-sky-blue)] p-3">
                <svg className="w-6 h-6 text-[var(--color-teal)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-[var(--color-white)] rounded-lg shadow-sm border border-[var(--color-sky-blue)] p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-teal)]">Pengunjung & Rating</p>
                <p className="text-2xl font-semibold text-[var(--color-navy)]">{formatNumber(stats.totalVisitors)}</p>
                <p className="text-xs text-[var(--color-teal)] mt-1">
                  {stats.visitorsWithComments} memberikan komentar
                </p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-[var(--color-white)] rounded-lg shadow-sm border border-[var(--color-sky-blue)] p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-teal)]">Rating & Komentar</p>
                <p className="text-2xl font-semibold text-[var(--color-navy)]">{formatNumber(stats.ratingComments)}</p>
                <p className="text-xs text-[var(--color-teal)] mt-1">
                  Rata-rata rating: {stats.averageRating}/5
                </p>
              </div>
              <div className="rounded-full bg-yellow-100 p-3">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[var(--color-white)] rounded-lg shadow-sm border border-[var(--color-sky-blue)] p-6">
            <h3 className="text-lg font-semibold text-[var(--color-navy)] mb-4">Sebaran Jumlah Stok Setiap Produk</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categories}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#C8D9E6" />
                  <XAxis dataKey="category" stroke="#2F4156" fontSize={12} />
                  <YAxis stroke="#2F4156" fontSize={12} />
                  <Tooltip 
                    formatter={(value) => [`${value} produk`, "Jumlah"]}
                    labelFormatter={(label) => `Kategori: ${label}`}
                    contentStyle={{ 
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #C8D9E6',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="count" name="Jumlah Produk" radius={[4, 4, 0, 0]} fill="#567C8D" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {categories.map((category, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${index % 2 === 0 ? 'bg-[#567C8D]' : 'bg-[#2F4156]'}`} />
                  <span className="text-sm text-[var(--color-navy)]">
                    {category.category}: {category.count} produk ({category.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[var(--color-white)] rounded-lg shadow-sm border border-[var(--color-sky-blue)] p-6">
            <h3 className="text-lg font-semibold text-[var(--color-navy)] mb-4">Distribusi Rating Pengunjung</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratingDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#C8D9E6" />
                  <XAxis dataKey="rating" stroke="#2F4156" fontSize={12} />
                  <YAxis stroke="#2F4156" fontSize={12} />
                  <Tooltip 
                    formatter={(value, name) => [`${value} rating`, name]}
                    labelFormatter={(label) => `Rating: ${label} bintang`}
                    contentStyle={{ 
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #C8D9E6',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="count" name="Jumlah Rating" radius={[4, 4, 0, 0]} fill="#2F4156" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-sm text-[var(--color-navy)]">
              Total {ratingDistribution.reduce((acc, item) => acc + item.count, 0)} rating diberikan oleh pengunjung
            </div>
          </div>
        </div>

        <div className="bg-[var(--color-white)] rounded-lg shadow-sm border border-[var(--color-sky-blue)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[var(--color-navy)]">Trend Pengunjung, Komentar & Penjualan</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevMonths}
                disabled={currentMonthIndex === 0}
                className="p-2 rounded-lg bg-[var(--color-sky-blue)] text-[var(--color-navy)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-teal)] hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
                aria-label="Bulan sebelumnya"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-sm text-[var(--color-navy)]">
                Bulan {displayedMonths[0]?.month} - {displayedMonths[displayedMonths.length - 1]?.month}
              </span>
              <button
                onClick={handleNextMonths}
                disabled={currentMonthIndex >= 6}
                className="p-2 rounded-lg bg-[var(--color-sky-blue)] text-[var(--color-navy)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-teal)] hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
                aria-label="Bulan berikutnya"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayedMonths}>
                <CartesianGrid strokeDasharray="3 3" stroke="#C8D9E6" />
                <XAxis dataKey="month" stroke="#2F4156" fontSize={12} />
                <YAxis stroke="#2F4156" fontSize={12} />
                <Tooltip contentStyle={{ 
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #C8D9E6',
                  borderRadius: '8px'
                }} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="visitors" 
                  name="Pengunjung" 
                  stroke="#567C8D" 
                  fill="#567C8D"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="comments" 
                  name="Komentar" 
                  stroke="#2F4156" 
                  fill="#2F4156"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="sold" 
                  name="Terjual" 
                  stroke="#4CAF50" 
                  fill="#4CAF50"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-[var(--color-navy)]">
            <p>Rata-rata: {Math.round(displayedMonths.reduce((acc, month) => acc + month.visitors, 0) / displayedMonths.length)} pengunjung, 
            {Math.round(displayedMonths.reduce((acc, month) => acc + month.comments, 0) / displayedMonths.length)} komentar,
            {Math.round(displayedMonths.reduce((acc, month) => acc + month.sold, 0) / displayedMonths.length)} produk terjual</p>
          </div>
        </div>

        <div className="bg-[var(--color-white)] rounded-lg shadow-sm border border-[var(--color-sky-blue)] p-6">
          <h3 className="text-lg font-semibold text-[var(--color-navy)] mb-4">Top 5 Produk Terlaris</h3>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--color-beige)]">
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-teal)] uppercase tracking-wider">Produk</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-teal)] uppercase tracking-wider">Kategori</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-teal)] uppercase tracking-wider">Harga</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-teal)] uppercase tracking-wider">Terjual</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-teal)] uppercase tracking-wider">Pendapatan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-teal)] uppercase tracking-wider">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-sky-blue)]">
                {[...products]
                  .sort((a, b) => (b.sold || 0) - (a.sold || 0))
                  .slice(0, 5)
                  .map((product) => (
                    <tr key={product.id} className="hover:bg-[var(--color-beige)]">
                      <td className="px-6 py-4 whitespace-nowrap text-[var(--color-navy)] font-medium">
                        {product.name_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[var(--color-navy)]">
                        <span className="px-2 py-1 text-xs bg-[var(--color-sky-blue)] text-[var(--color-navy)] rounded-full">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[var(--color-navy)] font-semibold">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                          {product.sold || 0} unit
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[var(--color-navy)] font-bold">
                        {formatCurrency(product.price * (product.sold || 0))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-[var(--color-navy)] font-medium">{product.rating?.toFixed(1) || 'N/A'}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderLaporan = () => (
    <div className="bg-[var(--color-white)] rounded-lg shadow-sm border border-[var(--color-sky-blue)] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-[var(--color-navy)]">Laporan Produk</h2>
          <p className="text-[var(--color-teal)]">Generate laporan produk sesuai SRS MartPlace</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <label htmlFor="report-select" className="sr-only">Pilih Jenis Laporan</label>
          <select
            id="report-select"
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value as ReportType)}
            className="border border-[var(--color-sky-blue)] rounded-lg px-4 py-2 text-[var(--color-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
            aria-label="Pilih jenis laporan"
          >
            <option value="stock-by-stock">Laporan Daftar Produk Berdasarkan Stock</option>
            <option value="stock-by-rating">Laporan Daftar Produk Berdasarkan Rating</option>
            <option value="low-stock">Laporan Daftar Produk Segera Dipesan</option>
          </select>

          <button
            onClick={generateReport}
            className="bg-[var(--color-teal)] text-white px-4 py-2 rounded-lg hover:bg-[var(--color-navy)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
            aria-label="Generate PDF laporan"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Generate PDF
          </button>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full">
          <thead>
            <tr className="bg-[var(--color-beige)]">
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-teal)] uppercase tracking-wider">No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-teal)] uppercase tracking-wider">Gambar</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-teal)] uppercase tracking-wider">Produk</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-teal)] uppercase tracking-wider">Kategori</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-teal)] uppercase tracking-wider">Harga</th>
              {selectedReport === 'stock-by-stock' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-teal)] uppercase tracking-wider">Rating</th>
              )}
              {selectedReport === 'stock-by-rating' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-teal)] uppercase tracking-wider">Stock</th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-teal)] uppercase tracking-wider">
                {selectedReport === 'stock-by-stock' ? 'Stock' : 
                 selectedReport === 'stock-by-rating' ? 'Rating' : 'Stock'}
              </th>
              {selectedReport === 'low-stock' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-teal)] uppercase tracking-wider">Status</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-sky-blue)]">
            {(() => {
              let dataToShow: Product[] = [];
              switch (selectedReport) {
                case 'stock-by-stock':
                  dataToShow = [...products].sort((a, b) => b.stock - a.stock);
                  break;
                case 'stock-by-rating':
                  dataToShow = [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0));
                  break;
                case 'low-stock':
                  dataToShow = [...products]
                    .filter(product => product.stock < 2)
                    .sort((a, b) => a.category.localeCompare(b.category) || a.name_id.localeCompare(b.name_id));
                  break;
                default:
                  dataToShow = products;
              }

              return dataToShow.map((product, index) => (
                <tr key={product.id} className="hover:bg-[var(--color-beige)]">
                  <td className="px-6 py-4 whitespace-nowrap text-[var(--color-navy)]">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                      {product.image_url ? (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-300 flex items-center justify-center text-blue-800 text-xs">
                          <div className="text-center">
                            <div className="text-lg">📷</div>
                            <div className="text-[10px] mt-1">Image</div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-500 text-xs">No Image</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[var(--color-navy)]">{product.name_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-[var(--color-navy)]">{product.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-[var(--color-navy)]">{formatCurrency(product.price)}</td>
                  {selectedReport === 'stock-by-stock' && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-[var(--color-navy)]">{product.rating?.toFixed(1) || 'N/A'}</span>
                      </div>
                    </td>
                  )}
                  {selectedReport === 'stock-by-rating' && (
                    <td className="px-6 py-4 whitespace-nowrap text-[var(--color-navy)]">{product.stock}</td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {selectedReport === 'stock-by-stock' ? (
                      <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                        {product.stock}
                      </span>
                    ) : selectedReport === 'stock-by-rating' ? (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-[var(--color-navy)] font-medium">{product.rating?.toFixed(1) || 'N/A'}</span>
                      </div>
                    ) : (
                      <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                        {product.stock}
                      </span>
                    )}
                  </td>
                  {selectedReport === 'low-stock' && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Stok Rendah
                      </span>
                    </td>
                  )}
                </tr>
              ));
            })()}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 p-4 bg-[var(--color-beige)] rounded-lg">
        <h3 className="text-lg font-semibold text-[var(--color-navy)] mb-3">Ringkasan Laporan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[var(--color-white)] p-4 rounded-lg shadow-sm">
            <p className="text-sm text-[var(--color-teal)]">Jenis Laporan</p>
            <p className="text-lg font-bold text-[var(--color-navy)]">
              {selectedReport === 'stock-by-stock' && 'Laporan Daftar Produk Berdasarkan Stock'}
              {selectedReport === 'stock-by-rating' && 'Laporan Daftar Produk Berdasarkan Rating'}
              {selectedReport === 'low-stock' && 'Laporan Daftar Produk Segera Dipesan'}
            </p>
            <p className="text-xs text-[var(--color-teal)] mt-1">
              {selectedReport === 'stock-by-stock' && '(SRS-MartPlace-12)'}
              {selectedReport === 'stock-by-rating' && '(SRS-MartPlace-13)'}
              {selectedReport === 'low-stock' && '(SRS-MartPlace-14)'}
            </p>
          </div>
          <div className="bg-[var(--color-white)] p-4 rounded-lg shadow-sm">
            <p className="text-sm text-[var(--color-teal)]">Jumlah Produk</p>
            <p className="text-2xl font-bold text-[var(--color-navy)]">
              {(() => {
                switch (selectedReport) {
                  case 'stock-by-stock': return products.length;
                  case 'stock-by-rating': return products.length;
                  case 'low-stock': return products.filter(p => p.stock < 2).length;
                  default: return products.length;
                }
              })()}
            </p>
          </div>
          <div className="bg-[var(--color-white)] p-4 rounded-lg shadow-sm">
            <p className="text-sm text-[var(--color-teal)]">Format</p>
            <p className="text-lg font-bold text-[var(--color-navy)]">PDF Document</p>
            <p className="text-xs text-[var(--color-teal)] mt-1">
              Siap untuk dicetak
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Update renderKelolaProduk untuk menggunakan data dari database
  const renderKelolaProduk = () => (
    <div className="bg-[var(--color-white)] rounded-lg shadow-sm border border-[var(--color-sky-blue)] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-[var(--color-navy)]">Kelola Produk</h2>
          <p className="text-[var(--color-teal)]">Kelola produk yang Anda jual. Data akan tetap tersimpan di database.</p>
          <p className="text-sm text-[var(--color-teal)] mt-1">
            Total {products.length} produk ditemukan
          </p>
        </div>
        
        <button
          onClick={() => setActiveView('tambah-produk')}
          className="bg-[var(--color-teal)] text-white px-4 py-2 rounded-lg hover:bg-[var(--color-navy)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
          aria-label="Tambah produk baru"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Produk
        </button>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full">
          <thead>
            <tr className="bg-[var(--color-beige)]">
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-teal)] uppercase tracking-wider">Gambar</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-teal)] uppercase tracking-wider">Produk</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-teal)] uppercase tracking-wider">Kategori</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-teal)] uppercase tracking-wider">Harga</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-teal)] uppercase tracking-wider">Stok</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-teal)] uppercase tracking-wider">Kondisi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-teal)] uppercase tracking-wider">Terjual</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-teal)] uppercase tracking-wider">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-teal)] uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-sky-blue)]">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-[var(--color-beige)]">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                    {product.image_url ? (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-300 flex items-center justify-center text-blue-800">
                        <div className="text-center">
                          <div className="text-lg">📷</div>
                          <div className="text-[10px] mt-1">Image</div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                        <span className="text-gray-500">No Image</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[var(--color-navy)] font-medium">
                  {product.name_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[var(--color-navy)]">
                  <span className="px-2 py-1 text-xs bg-[var(--color-sky-blue)] text-[var(--color-navy)] rounded-full">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[var(--color-navy)] font-semibold">
                  {formatCurrency(product.price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    product.stock < 2 
                      ? 'bg-red-100 text-red-800' 
                      : product.stock < 5 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                  }`}>
                    {product.stock} unit
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    product.condition === 'Baru' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {product.condition}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                    {product.sold || 0} unit
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-[var(--color-navy)] font-medium">{product.rating?.toFixed(1) || 'N/A'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <button
                    onClick={() => handleEditProduct(product)}
                    className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                    aria-label={`Edit produk ${product.name_id}`}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="inline-flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                    aria-label={`Hapus produk ${product.name_id}`}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 011.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 p-4 bg-[var(--color-beige)] rounded-lg">
        <h3 className="text-lg font-semibold text-[var(--color-navy)] mb-3">Ringkasan Produk</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[var(--color-white)] p-4 rounded-lg shadow-sm">
            <p className="text-sm text-[var(--color-teal)]">Total Produk</p>
            <p className="text-2xl font-bold text-[var(--color-navy)]">{products.length}</p>
          </div>
          <div className="bg-[var(--color-white)] p-4 rounded-lg shadow-sm">
            <p className="text-sm text-[var(--color-teal)]">Total Terjual</p>
            <p className="text-2xl font-bold text-[var(--color-navy)]">
              {formatNumber(products.reduce((acc, product) => acc + (product.sold || 0), 0))} unit
            </p>
          </div>
          <div className="bg-[var(--color-white)] p-4 rounded-lg shadow-sm">
            <p className="text-sm text-[var(--color-teal)]">Rata-rata Rating</p>
            <p className="text-2xl font-bold text-[var(--color-navy)]">
              {(products.reduce((acc, product) => acc + (product.rating || 0), 0) / products.length).toFixed(1)}/5
            </p>
          </div>
          <div className="bg-[var(--color-white)] p-4 rounded-lg shadow-sm">
            <p className="text-sm text-[var(--color-teal)]">Stok Rendah</p>
            <p className="text-2xl font-bold text-[var(--color-navy)]">
              {products.filter(p => p.stock < 2).length} produk
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Update renderTambahProduk untuk form tambah produk
  const renderTambahProduk = () => (
    <div className="bg-[var(--color-white)] rounded-lg shadow-sm border border-[var(--color-sky-blue)] p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold text-[var(--color-navy)] mb-6">Tambah Produk Baru</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-navy)] mb-2">
            Gambar Produk
          </label>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              className="w-32 h-32 border-2 border-dashed border-[var(--color-sky-blue)] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[var(--color-teal)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
              onClick={() => document.getElementById('image-upload')?.click()}
              aria-label="Upload gambar produk"
            >
              {imagePreview ? (
                <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl">📷</div>
                    <div className="text-xs mt-2">Preview Image</div>
                  </div>
                </div>
              ) : (
                <>
                  <svg className="w-8 h-8 text-[var(--color-sky-blue)] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs text-[var(--color-sky-blue)]">Upload Gambar</span>
                </>
              )}
            </button>
            <div>
              <p className="text-sm text-[var(--color-navy)] mb-2">Format yang didukung: JPG, PNG, GIF</p>
              <p className="text-xs text-[var(--color-teal)]">Maksimal ukuran: 5MB</p>
            </div>
          </div>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, false)}
            className="hidden"
            aria-label="Pilih gambar produk"
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="product-name" className="block text-sm font-medium text-[var(--color-navy)] mb-2">
              Nama Produk <span className="text-red-500">*</span>
            </label>
            <input
              id="product-name"
              type="text"
              value={newProduct.name_id}
              onChange={(e) => setNewProduct({...newProduct, name_id: e.target.value})}
              className="w-full px-3 py-2 border border-[var(--color-sky-blue)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
              placeholder="Masukkan nama produk"
              required
            />
          </div>

          <div>
            <label htmlFor="product-category" className="block text-sm font-medium text-[var(--color-navy)] mb-2">
              Kategori <span className="text-red-500">*</span>
            </label>
            <select
              id="product-category"
              value={newProduct.category}
              onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
              className="w-full px-3 py-2 border border-[var(--color-sky-blue)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
              required
              aria-label="Pilih kategori produk"
            >
              <option value="">Pilih Kategori</option>
              <option value="Pakaian">Pakaian</option>
              <option value="Sepatu">Sepatu</option>
              <option value="Aksesoris">Aksesoris</option>
              <option value="Elektronik">Elektronik</option>
              <option value="Makanan">Makanan</option>
            </select>
          </div>

          <div>
            <label htmlFor="product-price" className="block text-sm font-medium text-[var(--color-navy)] mb-2">
              Harga <span className="text-red-500">*</span>
            </label>
            <input
              id="product-price"
              type="number"
              value={newProduct.price}
              onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
              className="w-full px-3 py-2 border border-[var(--color-sky-blue)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
              placeholder="Masukkan harga"
              required
              min="0"
            />
          </div>

          <div>
            <label htmlFor="product-stock" className="block text-sm font-medium text-[var(--color-navy)] mb-2">
              Stok <span className="text-red-500">*</span>
            </label>
            <input
              id="product-stock"
              type="number"
              value={newProduct.stock}
              onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
              className="w-full px-3 py-2 border border-[var(--color-sky-blue)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
              placeholder="Masukkan jumlah stok"
              required
              min="0"
            />
          </div>

          <div>
            <label htmlFor="product-condition" className="block text-sm font-medium text-[var(--color-navy)] mb-2">
              Kondisi
            </label>
            <select
              id="product-condition"
              value={newProduct.condition}
              onChange={(e) => setNewProduct({...newProduct, condition: e.target.value})}
              className="w-full px-3 py-2 border border-[var(--color-sky-blue)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
            >
              <option value="Baru">Baru</option>
              <option value="Bekas">Bekas</option>
            </select>
          </div>

          <div>
            <label htmlFor="product-description" className="block text-sm font-medium text-[var(--color-navy)] mb-2">
              Deskripsi
            </label>
            <textarea
              id="product-description"
              value={newProduct.description}
              onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
              className="w-full px-3 py-2 border border-[var(--color-sky-blue)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
              placeholder="Masukkan deskripsi produk"
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            onClick={() => {
              setActiveView('kelola-produk');
              setImagePreview(null);
            }}
            className="px-4 py-2 border border-[var(--color-sky-blue)] text-[var(--color-navy)] rounded-lg hover:bg-[var(--color-sky-blue)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
          >
            Batal
          </button>
          <button
            onClick={handleAddProduct}
            className="bg-[var(--color-teal)] text-white px-4 py-2 rounded-lg hover:bg-[var(--color-navy)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
          >
            Simpan Produk
          </button>
        </div>
      </div>
    </div>
  );

  const renderEditProduk = () => {
    if (!editingProduct) return null;

    return (
      <div className="bg-[var(--color-white)] rounded-lg shadow-sm border border-[var(--color-sky-blue)] p-6 max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold text-[var(--color-navy)] mb-6">Edit Produk</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-navy)] mb-2">
              Gambar Produk
            </label>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                className="w-32 h-32 border-2 border-dashed border-[var(--color-sky-blue)] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[var(--color-teal)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
                onClick={() => document.getElementById('edit-image-upload')?.click()}
                aria-label="Ganti gambar produk"
              >
                <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl">📷</div>
                    <div className="text-xs mt-2">Product Image</div>
                  </div>
                </div>
              </button>
              <div>
                <p className="text-sm text-[var(--color-navy)] mb-2">Klik untuk mengganti gambar</p>
                <p className="text-xs text-[var(--color-teal)]">Format: JPG, PNG, GIF (max 5MB)</p>
              </div>
            </div>
            <input
              id="edit-image-upload"
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, true)}
              className="hidden"
              aria-label="Pilih gambar produk baru"
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="edit-product-name" className="block text-sm font-medium text-[var(--color-navy)] mb-2">
                Nama Produk
              </label>
              <input
                id="edit-product-name"
                type="text"
                value={editingProduct.name}
                onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                className="w-full px-3 py-2 border border-[var(--color-sky-blue)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
              />
            </div>

            <div>
              <label htmlFor="edit-product-category" className="block text-sm font-medium text-[var(--color-navy)] mb-2">
                Kategori
              </label>
              <select
                id="edit-product-category"
                value={editingProduct.category}
                onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                className="w-full px-3 py-2 border border-[var(--color-sky-blue)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
                aria-label="Pilih kategori produk"
              >
                <option value="Pakaian">Pakaian</option>
                <option value="Sepatu">Sepatu</option>
                <option value="Aksesoris">Aksesoris</option>
                <option value="Elektronik">Elektronik</option>
                <option value="Makanan">Makanan</option>
              </select>
            </div>

            <div>
              <label htmlFor="edit-product-price" className="block text-sm font-medium text-[var(--color-navy)] mb-2">
                Harga
              </label>
              <input
                id="edit-product-price"
                type="number"
                value={editingProduct.price}
                onChange={(e) => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-[var(--color-sky-blue)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
                min="0"
              />
            </div>

            <div>
              <label htmlFor="edit-product-stock" className="block text-sm font-medium text-[var(--color-navy)] mb-2">
                Stok
              </label>
              <input
                id="edit-product-stock"
                type="number"
                value={editingProduct.stock}
                onChange={(e) => setEditingProduct({...editingProduct, stock: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-[var(--color-sky-blue)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
                min="0"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => {
                setEditingProduct(null);
                setActiveView('kelola-produk');
              }}
              className="px-4 py-2 border border-[var(--color-sky-blue)] text-[var(--color-navy)] rounded-lg hover:bg-[var(--color-sky-blue)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
            >
              Batal
            </button>
            <button
              onClick={handleSaveEdit}
              className="bg-[var(--color-teal)] text-white px-4 py-2 rounded-lg hover:bg-[var(--color-navy)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
            >
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderPdfPreview = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-[var(--color-navy)]">Preview Laporan</h2>
          <button
            onClick={() => setShowPdfPreview(false)}
            className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
            aria-label="Tutup preview laporan"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-6">
          <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
            <div className="text-center mb-6">
              <div className="text-sm text-gray-600 mb-1">
                {pdfTitle === "Laporan Daftar Produk Berdasarkan Stock" && "(SRS-MartPlace-12)"}
                {pdfTitle === "Laporan Daftar Produk Berdasarkan Rating" && "(SRS-MartPlace-13)"}
                {pdfTitle === "Laporan Daftar Produk Segera Dipesan" && "(SRS-MartPlace-14)"}
              </div>
              <h3 className="text-lg font-bold text-[var(--color-navy)] mb-2">{pdfTitle}</h3>
              <p className="text-sm text-gray-600">
                Tanggal dibuat: {new Date().toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })} oleh <strong>Penjual Toko Fashion XYZ</strong>
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-[var(--color-teal)] text-white">
                    <th className="border border-gray-300 p-2 text-left text-sm font-medium">No</th>
                    <th className="border border-gray-300 p-2 text-left text-sm font-medium">Produk</th>
                    <th className="border border-gray-300 p-2 text-left text-sm font-medium">Kategori</th>
                    <th className="border border-gray-300 p-2 text-left text-sm font-medium">Harga</th>
                    {selectedReport === 'stock-by-stock' && (
                      <th className="border border-gray-300 p-2 text-left text-sm font-medium">Rating</th>
                    )}
                    {selectedReport === 'stock-by-rating' && (
                      <th className="border border-gray-300 p-2 text-left text-sm font-medium">Stock</th>
                    )}
                    <th className="border border-gray-300 p-2 text-left text-sm font-medium">
                      {selectedReport === 'stock-by-stock' ? 'Stock' : 
                       selectedReport === 'stock-by-rating' ? 'Rating' : 'Stock'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pdfData.map((product, index) => (
                    <tr key={product.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="border border-gray-300 p-2 text-sm text-center">{index + 1}</td>
                      <td className="border border-gray-300 p-2 text-sm">{product.name}</td>
                      <td className="border border-gray-300 p-2 text-sm">{product.category}</td>
                      <td className="border border-gray-300 p-2 text-sm">{formatCurrency(product.price)}</td>
                      {selectedReport === 'stock-by-stock' && (
                        <td className="border border-gray-300 p-2 text-sm text-center">{product.rating}</td>
                      )}
                      {selectedReport === 'stock-by-rating' && (
                        <td className="border border-gray-300 p-2 text-sm text-center">{product.stock}</td>
                      )}
                      <td className="border border-gray-300 p-2 text-sm text-center">
                        {selectedReport === 'stock-by-stock' || selectedReport === 'low-stock' 
                          ? product.stock 
                          : product.rating}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 text-sm text-gray-600 italic">
              {selectedReport === 'stock-by-stock' && "*) urutkan berdasarkan stock"}
              {selectedReport === 'stock-by-rating' && "*) urutkan berdasarkan rating"}
              {selectedReport === 'low-stock' && "*) urutkan berdasarkan kategori dan produk"}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 p-6 border-t">
          <button
            onClick={() => setShowPdfPreview(false)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
          >
            Batal
          </button>
          <button
            onClick={downloadPDF}
            className="bg-[var(--color-teal)] text-white px-4 py-2 rounded-lg hover:bg-[var(--color-navy)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)] flex items-center"
            aria-label="Generate dan cetak PDF"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Generate & Cetak PDF
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return renderDashboard();
      case 'laporan':
        return renderLaporan();
      case 'kelola-produk':
        return renderKelolaProduk();
      case 'tambah-produk':
        return renderTambahProduk();
      case 'edit-produk':
        return renderEditProduk();
      default:
        return renderDashboard();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-beige)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-teal)] mx-auto"></div>
          <p className="mt-4 text-[var(--color-navy)]">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-beige)] flex">
      <div className={`bg-[var(--color-white)] shadow-lg border-r border-[var(--color-sky-blue)] transition-all duration-300 ${
        isSidebarOpen ? 'w-64' : 'w-20'
      }`}>
        <div className="p-4 border-b border-[var(--color-sky-blue)]">
          <div className="flex items-center justify-between">
            {isSidebarOpen && (
              <h2 className="text-xl font-bold text-[var(--color-navy)]">Menu Penjual</h2>
            )}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-[var(--color-sky-blue)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
              aria-label={isSidebarOpen ? "Sembunyikan sidebar" : "Tampilkan sidebar"}
            >
              <svg className="w-5 h-5 text-[var(--color-teal)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isSidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`w-full flex items-center p-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)] ${
              activeView === 'dashboard' 
                ? 'bg-[var(--color-teal)] text-white' 
                : 'text-[var(--color-navy)] hover:bg-[var(--color-sky-blue)]'
            }`}
            aria-label="Dashboard"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {isSidebarOpen && <span className="ml-3">Dashboard</span>}
          </button>

          <button
            onClick={() => setActiveView('kelola-produk')}
            className={`w-full flex items-center p-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)] ${
              ['kelola-produk', 'tambah-produk', 'edit-produk'].includes(activeView)
                ? 'bg-[var(--color-teal)] text-white' 
                : 'text-[var(--color-navy)] hover:bg-[var(--color-sky-blue)]'
            }`}
            aria-label="Kelola Produk"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            {isSidebarOpen && <span className="ml-3">Kelola Produk</span>}
          </button>

          <button
            onClick={() => setActiveView('laporan')}
            className={`w-full flex items-center p-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)] ${
              activeView === 'laporan' 
                ? 'bg-[var(--color-teal)] text-white' 
                : 'text-[var(--color-navy)] hover:bg-[var(--color-sky-blue)]'
            }`}
            aria-label="Laporan"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {isSidebarOpen && <span className="ml-3">Laporan</span>}
          </button>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="Logout"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {isSidebarOpen && <span className="ml-3">Logout</span>}
          </button>
        </nav>
      </div>

      <div className="flex-1 overflow-auto">
        <header className="bg-[var(--color-white)] shadow-sm border-b border-[var(--color-sky-blue)]">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-[var(--color-navy)]">
                  {activeView === 'dashboard' && 'Dashboard Analytics'}
                  {activeView === 'laporan' && 'Laporan Produk'}
                  {activeView === 'kelola-produk' && 'Kelola Produk'}
                  {activeView === 'tambah-produk' && 'Tambah Produk'}
                  {activeView === 'edit-produk' && 'Edit Produk'}
                </h1>
                <p className="text-[var(--color-teal)]">
                  {activeView === 'dashboard' && 'Ringkasan statistik dan analisis platform'}
                  {activeView === 'laporan' && 'Generate laporan produk sesuai SRS MartPlace'}
                  {activeView === 'kelola-produk' && 'Kelola produk yang Anda jual'}
                  {activeView === 'tambah-produk' && 'Tambahkan produk baru ke toko Anda'}
                  {activeView === 'edit-produk' && 'Edit informasi produk'}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-[var(--color-navy)] font-medium">
                    {currentSeller ? currentSeller.store_name : 'Toko Tidak Ditemukan'}
                    </p>
                  <p className="text-xs text-[var(--color-teal)]">Penjual</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[var(--color-sky-blue)] flex items-center justify-center">
                  <svg className="w-6 h-6 text-[var(--color-teal)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          {renderContent()}
        </main>
      </div>

      {showPdfPreview && renderPdfPreview()}
      {showLogoutConfirm && renderLogoutConfirmation()}
    </div>
  );
}