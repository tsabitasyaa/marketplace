"use client";

import { useState, useEffect } from "react";

interface SellerData {
  id: string;
  email?: string;
  name?: string;
  pic_name?: string;
  store_name?: string;
  status?: string;
  verified?: boolean;
  verification_status?: string;
  is_active?: boolean;
  province?: string;
  city?: string;
  created_at: string;
}

interface ProductData {
  id: string;
  product_name?: string;
  category?: string;
  price: number;
  rating: number;
  total_reviews?: number;
  store_name?: string;
  province?: string;
  seller_province?: string;
  condition?: string;
  stock?: number;
  created_at: string;
}

type ReportData = SellerData | ProductData;

export default function LaporanPage() {
  const [selectedReport, setSelectedReport] = useState("seller-status");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [provinces, setProvinces] = useState<any[]>([]);
  const [data, setData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Fetch provinces on mount
  useEffect(() => {
    fetchProvinces();
  }, []);

  // Fetch report data when filters change
  useEffect(() => {
    if (selectedReport) {
      fetchReportData();
    }
  }, [selectedReport, selectedProvince]);

  const fetchProvinces = async () => {
    try {
      console.log("🔄 Fetching provinces...");
      const response = await fetch('/api/admin/laporan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get-provinces'
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Loaded ${result.data.length} provinces`);
        setProvinces(result.data);
      } else {
        console.warn("⚠️ Using static provinces due to API error");
        // Fallback to static provinces
        const staticProvinces = [
          {"id":"31","name":"DKI JAKARTA"},{"id":"32","name":"JAWA BARAT"},
          {"id":"33","name":"JAWA TENGAH"},{"id":"34","name":"DI YOGYAKARTA"},
          {"id":"35","name":"JAWA TIMUR"},{"id":"36","name":"BANTEN"},
          {"id":"51","name":"BALI"},{"id":"52","name":"NUSA TENGGARA BARAT"},
          {"id":"53","name":"NUSA TENGGARA TIMUR"},{"id":"61","name":"KALIMANTAN BARAT"},
          {"id":"62","name":"KALIMANTAN TENGAH"},{"id":"63","name":"KALIMANTAN SELATAN"},
          {"id":"64","name":"KALIMANTAN TIMUR"},{"id":"65","name":"KALIMANTAN UTARA"},
          {"id":"71","name":"SULAWESI UTARA"},{"id":"72","name":"SULAWESI TENGAH"},
          {"id":"73","name":"SULAWESI SELATAN"},{"id":"74","name":"SULAWESI TENGGARA"},
          {"id":"75","name":"GORONTALO"},{"id":"76","name":"SULAWESI BARAT"},
          {"id":"81","name":"MALUKU"},{"id":"82","name":"MALUKU UTARA"},
          {"id":"91","name":"PAPUA BARAT"},{"id":"94","name":"PAPUA"}
        ];
        setProvinces(staticProvinces);
      }
    } catch (err: any) {
      console.error('Error fetching provinces:', err);
      // Fallback to static provinces
      const staticProvinces = [
        {"id":"31","name":"DKI JAKARTA"},{"id":"32","name":"JAWA BARAT"},
        {"id":"33","name":"JAWA TENGAH"},{"id":"34","name":"DI YOGYAKARTA"},
        {"id":"35","name":"JAWA TIMUR"},{"id":"36","name":"BANTEN"}
      ];
      setProvinces(staticProvinces);
    }
  };

  const fetchReportData = async () => {
    setLoading(true);
    setError("");
    setData([]);
    
    try {
      // Build query params - HANYA report type dan province
      const params = new URLSearchParams({
        type: selectedReport,
        ...(selectedProvince && selectedReport === 'sellers-by-province' && { province: selectedProvince })
      });

      const apiUrl = `/api/admin/laporan?${params.toString()}`;
      console.log(`🔄 Fetching report data from: ${apiUrl}`);
      
      const response = await fetch(apiUrl);
      
      console.log(`📊 Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Server error (${response.status}):`, errorText);
        
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          // Jika bukan JSON, gunakan teks error
        }
        
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log(`📦 API Response:`, result);
      
      if (result.success) {
        setData(result.data || []);
        console.log(`✅ Loaded ${result.data?.length || 0} records`);
      } else {
        throw new Error(result.message || "Gagal mengambil data laporan");
      }
    } catch (err: any) {
      console.error('❌ Error fetching report data:', err);
      
      let userErrorMessage = err.message || "Gagal mengambil data";
      
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        userErrorMessage = "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
      } else if (err.message.includes('500') || err.message.includes('internal')) {
        userErrorMessage = "Server sedang mengalami masalah. Silakan coba lagi nanti.";
      } else if (err.message.includes('404')) {
        userErrorMessage = "API endpoint tidak ditemukan. Periksa konfigurasi server.";
      }
      
      setError(userErrorMessage);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = () => {
    if (data.length === 0) {
      alert("⚠️ Tidak ada data untuk di-generate PDF");
      return;
    }

    // Buat window baru untuk PDF
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("⚠️ Pop-up diblokir. Izinkan pop-up untuk generate PDF.");
      return;
    }

    const title = getDisplayTitle();
    const now = new Date();
    const formattedDate = now.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Nama file
    const reportType = getDisplayTitle().replace(/\s+/g, '_');
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const fileName = `Laporan_${reportType}_${dateStr}.pdf`;
    
    // Buat HTML untuk PDF
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <meta charset="UTF-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body { 
            font-family: 'Arial', sans-serif; 
            margin: 15mm;
            color: #333;
            line-height: 1.4;
            font-size: 11px;
          }
          
          .header { 
            text-align: center; 
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #2c3e50;
          }
          
          .header h1 { 
            margin: 0 0 5px 0; 
            font-size: 18px; 
            color: #2c3e50;
            font-weight: bold;
          }
          
          .subtitle {
            font-size: 10px;
            color: #666;
          }
          
          .info-box {
            margin-bottom: 15px;
            font-size: 10px;
            color: #2c3e50;
            background: #f5f7fa;
            padding: 10px;
            border-radius: 4px;
            border-left: 3px solid #3498db;
          }
          
          .info-box p {
            margin: 3px 0;
          }
          
          .info-box strong {
            color: #2c3e50;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            font-size: 9px;
          }
          
          thead {
            background: #2c3e50;
          }
          
          th {
            color: white;
            padding: 8px 5px;
            text-align: left;
            border: 1px solid #1a252f;
            font-weight: bold;
          }
          
          td {
            padding: 6px 5px;
            border: 1px solid #ddd;
            vertical-align: top;
          }
          
          tbody tr:nth-child(even) {
            background-color: #f8f9fa;
          }
          
          .status-badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 10px;
            font-size: 8px;
            font-weight: bold;
            text-align: center;
            min-width: 70px;
          }
          
          .status-aktif {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
          }
          
          .status-tidak-aktif {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
          }
          
          .status-menunggu {
            background-color: #fff3cd;
            color: #856404;
            border: 1px solid #ffeaa7;
          }
          
          .status-ditolak {
            background-color: #d6d8d9;
            color: #383d41;
            border: 1px solid #c6c8ca;
          }
          
          .rating {
            display: inline-flex;
            align-items: center;
            gap: 2px;
            font-weight: bold;
          }
          
          .rating-high {
            color: #27ae60;
          }
          
          .rating-medium {
            color: #f39c12;
          }
          
          .rating-low {
            color: #e74c3c;
          }
          
          .footer {
            margin-top: 20px;
            font-size: 8px;
            color: #666;
            text-align: center;
            padding-top: 10px;
            border-top: 1px solid #ccc;
          }
          
          .print-controls {
            display: none;
          }
          
          @media print {
            @page {
              size: A4 portrait;
              margin: 15mm;
            }
            
            body { 
              margin: 0;
              font-size: 9px;
            }
          }
        </style>
      </head>
      <body>
        <!-- Header -->
        <div class="header">
          <h1>${title}</h1>
          <div class="subtitle">Laporan Platform Marketplace</div>
        </div>
        
        <!-- Info Box -->
        <div class="info-box">
          <p><strong>Dibuat pada:</strong> ${formattedDate}</p>
          ${selectedReport === "sellers-by-province" && selectedProvince ? 
            `<p><strong>Provinsi:</strong> ${provinces.find(p => p.id === selectedProvince)?.name || selectedProvince}</p>` : ''}
          <p><strong>Total Data:</strong> ${data.length} records</p>
          <p><strong>Nama File:</strong> ${fileName}</p>
        </div>
    `;

    // Tabel berdasarkan jenis laporan
    if (selectedReport === "seller-status") {
      htmlContent += `
        <table>
          <thead>
            <tr>
              <th width="5%">No</th>
              <th width="25%">Nama User</th>
              <th width="20%">Nama PIC</th>
              <th width="25%">Nama Toko</th>
              <th width="15%">Status</th>
              <th width="10%">Tanggal Bergabung</th>
            </tr>
          </thead>
          <tbody>
            ${data.map((item, index) => {
              const sellerItem = item as SellerData;
              const status = sellerItem.status || "Tidak Aktif";
              
              let statusClass = "status-tidak-aktif";
              if (status === "Aktif") statusClass = "status-aktif";
              if (status === "Menunggu Verifikasi" || status === "Belum Diverifikasi") statusClass = "status-menunggu";
              if (status === "Ditolak") statusClass = "status-ditolak";
              
              return `
                <tr>
                  <td class="text-center">${index + 1}</td>
                  <td>${escapeHtml(sellerItem.email || '-')}</td>
                  <td>${escapeHtml(sellerItem.pic_name || sellerItem.name || '-')}</td>
                  <td>${escapeHtml(sellerItem.store_name || '-')}</td>
                  <td class="text-center">
                    <span class="status-badge ${statusClass}">
                      ${status}
                    </span>
                  </td>
                  <td>${formatDateForPDF(sellerItem.created_at)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
    } else if (selectedReport === "sellers-by-province") {
      htmlContent += `
        <table>
          <thead>
            <tr>
              <th width="5%">No</th>
              <th width="35%">Nama Toko</th>
              <th width="25%">Nama PIC</th>
              <th width="20%">Provinsi</th>
              <th width="15%">Kota</th>
            </tr>
          </thead>
          <tbody>
            ${data.map((item, index) => {
              const sellerItem = item as SellerData;
              return `
                <tr>
                  <td class="text-center">${index + 1}</td>
                  <td>${escapeHtml(sellerItem.store_name || '-')}</td>
                  <td>${escapeHtml(sellerItem.pic_name || sellerItem.name || '-')}</td>
                  <td>${escapeHtml(sellerItem.province || '-')}</td>
                  <td>${escapeHtml(sellerItem.city || '-')}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
    } else if (selectedReport === "products-rating") {
      htmlContent += `
        <table>
          <thead>
            <tr>
              <th width="5%">No</th>
              <th width="20%">Produk</th>
              <th width="15%">Kategori</th>
              <th width="15%">Harga</th>
              <th width="10%">Rating</th>
              <th width="20%">Nama Toko</th>
              <th width="15%">Provinsi</th>
            </tr>
          </thead>
          <tbody>
            ${data.map((item, index) => {
              const productItem = item as ProductData;
              const rating = productItem.rating || 0;
              const ratingClass = rating >= 4 ? 'rating-high' : rating >= 3 ? 'rating-medium' : 'rating-low';
              
              return `
                <tr>
                  <td class="text-center">${index + 1}</td>
                  <td>${escapeHtml(productItem.product_name || '-')}</td>
                  <td>${escapeHtml(productItem.category || '-')}</td>
                  <td class="text-right">${formatCurrencyForPDF(productItem.price || 0)}</td>
                  <td class="text-center">
                    <span class="rating ${ratingClass}">
                      ★ ${rating.toFixed(1)}
                      ${productItem.total_reviews ? `(${productItem.total_reviews})` : ''}
                    </span>
                  </td>
                  <td>${escapeHtml(productItem.store_name || '-')}</td>
                  <td>${escapeHtml(productItem.province || '-')}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
    }

    // Footer
    htmlContent += `
        <!-- Footer -->
        <div class="footer">
          <p>Dibuat oleh: Admin Marketplace • Platform E-Commerce</p>
          <p>Halaman 1 dari 1 • ${new Date().toLocaleDateString('id-ID')}</p>
        </div>
        
        <script>
          window.onload = function() {
            // Auto print setelah halaman dimuat
            window.print();
            
            // Tutup window setelah 5 detik jika tidak di-print
            setTimeout(function() {
              if (!window.matchMedia('print').matches) {
                window.close();
              }
            }, 5000);
          };
          
          // Event listener untuk afterprint (setelah selesai print)
          window.onafterprint = function() {
            setTimeout(function() {
              window.close();
            }, 1000);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Helper functions
  const escapeHtml = (text: string): string => {
    if (!text) return '-';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  const formatDateForPDF = (dateString: string): string => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('id-ID');
    } catch {
      return dateString;
    }
  };

  const formatCurrencyForPDF = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getDisplayTitle = (): string => {
    switch(selectedReport) {
      case "seller-status":
        return "Laporan Daftar Akun Penjual Berdasarkan Status";
      case "sellers-by-province":
        return "Laporan Daftar Toko Berdasarkan Lokasi Provinsi";
      case "products-rating":
        return "Laporan Daftar Produk Berdasarkan Rating";
      default:
        return "Laporan Marketplace";
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('id-ID');
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) status = "Tidak Aktif";
    
    if (status === "Aktif") {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
          ✓ Aktif
        </span>
      );
    } else if (status === "Menunggu Verifikasi" || status === "Belum Diverifikasi") {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
          ⏳ {status}
        </span>
      );
    } else if (status === "Ditolak") {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
          ✗ Ditolak
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
          ✗ Tidak Aktif
        </span>
      );
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Laporan Platform</h1>
        <p className="text-gray-600 mt-1">Generate laporan untuk manajemen platform (Format PDF)</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button 
                onClick={fetchReportData}
                className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
              >
                Coba lagi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Type Selection */}
      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Pilih Jenis Laporan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { 
              value: 'seller-status', 
              label: 'Laporan Daftar Akun Penjual',
              desc: 'Berdasarkan Status (Aktif/Tidak Aktif)',
              icon: '👤'
            },
            { 
              value: 'sellers-by-province', 
              label: 'Laporan Daftar Toko',
              desc: 'Berdasarkan Lokasi Provinsi',
              icon: '🗺️'
            },
            { 
              value: 'products-rating', 
              label: 'Laporan Daftar Produk',
              desc: 'Berdasarkan Rating',
              icon: '⭐'
            }
          ].map((report) => (
            <button
              key={report.value}
              onClick={() => setSelectedReport(report.value)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedReport === report.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{report.icon}</span>
                <div className="text-left">
                  <div className="font-medium">{report.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{report.desc}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Filters - HANYA PROVINSI untuk laporan tertentu */}
      {selectedReport === "sellers-by-province" && (
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Filter Laporan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter Provinsi
              </label>
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">Semua Provinsi</option>
                {provinces.map((province) => (
                  <option key={province.id} value={province.id}>
                    {province.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchReportData}
                disabled={loading}
                className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Memuat Data...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Terapkan Filter</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate PDF Button */}
      <div className="bg-white rounded-xl shadow p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Generate Laporan PDF</h2>
            <p className="text-sm text-gray-600">
              Klik tombol di bawah untuk membuat laporan dalam format PDF
            </p>
          </div>
          <div>
            <button
              onClick={handleGeneratePDF}
              disabled={loading || data.length === 0}
              className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Memuat Data...</span>
                </>
              ) : (
                <>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Generate PDF</span>
                </>
              )}
            </button>
            {data.length > 0 && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                Akan membuka tab baru untuk print/save PDF
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Report Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
        <h2 className="text-2xl font-bold text-gray-900">{getDisplayTitle()}</h2>
        <div className="flex flex-wrap gap-4 mt-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border">
            <span className="text-gray-500 text-sm">📊</span>
            <span className="text-sm text-gray-700">
              Total Data: <span className="font-semibold">{data.length}</span> records
            </span>
          </div>
          {selectedReport === "sellers-by-province" && selectedProvince && (
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border">
              <span className="text-gray-500 text-sm">📍</span>
              <span className="text-sm text-gray-700">
                Provinsi: {provinces.find(p => p.id === selectedProvince)?.name || selectedProvince}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-16 bg-white rounded-xl shadow">
          <div className="inline-block animate-spin rounded-full h-14 w-14 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-lg text-gray-700 font-medium">Memuat data laporan...</p>
          <p className="mt-2 text-gray-500">Mohon tunggu sebentar</p>
        </div>
      )}

      {/* Data Table Preview */}
      {!loading && data.length > 0 && (
        <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
          <div className="p-4 border-b bg-gray-50">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Preview Data ({data.length} records)</h3>
              <p className="text-sm text-gray-500">
                Semua data akan termasuk dalam file PDF
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {selectedReport === "seller-status" && (
                    <>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">No</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Nama User</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Nama PIC</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Nama Toko</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                    </>
                  )}
                  {selectedReport === "sellers-by-province" && (
                    <>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">No</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Nama Toko</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Nama PIC</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Provinsi</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Kota</th>
                    </>
                  )}
                  {selectedReport === "products-rating" && (
                    <>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">No</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Produk</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Kategori</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Harga</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Rating</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Nama Toko</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Provinsi</th>
                    </>
                  )}
                </tr>
              </thead>
              
              <tbody className="divide-y divide-gray-100">
                {data.slice(0, 10).map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-gray-50">
                    {selectedReport === "seller-status" && (
                      <>
                        <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                        <td className="px-4 py-3 text-gray-700">{(item as SellerData).email || '-'}</td>
                        <td className="px-4 py-3 font-medium">{(item as SellerData).pic_name || (item as SellerData).name || '-'}</td>
                        <td className="px-4 py-3 text-gray-700">{(item as SellerData).store_name || '-'}</td>
                        <td className="px-4 py-3">{getStatusBadge((item as SellerData).status)}</td>
                      </>
                    )}
                    {selectedReport === "sellers-by-province" && (
                      <>
                        <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                        <td className="px-4 py-3 font-medium">{(item as SellerData).store_name || '-'}</td>
                        <td className="px-4 py-3">{(item as SellerData).pic_name || (item as SellerData).name || '-'}</td>
                        <td className="px-4 py-3 text-gray-700">{(item as SellerData).province || '-'}</td>
                        <td className="px-4 py-3 text-gray-700">{(item as SellerData).city || '-'}</td>
                      </>
                    )}
                    {selectedReport === "products-rating" && (
                      <>
                        <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">{(item as ProductData).product_name || '-'}</td>
                        <td className="px-4 py-3">
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                            {(item as ProductData).category || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-800">{formatCurrency((item as ProductData).price || 0)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <div className="flex">
                              {[1,2,3,4,5].map((star) => (
                                <span 
                                  key={star} 
                                  className={`text-sm ${
                                    star <= Math.floor((item as ProductData).rating || 0) 
                                      ? 'text-yellow-500' 
                                      : 'text-gray-300'
                                  }`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            <span className="text-gray-700 font-medium">{(item as ProductData).rating?.toFixed(1) || '0.0'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{(item as ProductData).store_name || '-'}</td>
                        <td className="px-4 py-3 text-gray-700">{(item as ProductData).province || '-'}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && data.length === 0 && !error && (
        <div className="text-center py-16 bg-white rounded-xl shadow border border-gray-200">
          <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada data</h3>
          <p className="text-gray-500 mb-6">
            Tidak ada data yang ditemukan. Pilih jenis laporan lain.
          </p>
        </div>
      )}
    </div>
  );
}