// app/admin/dashboard/laporan/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";

interface SellerData {
  id: string;
  email?: string;
  name?: string;
  pic_name?: string;
  store_name?: string;
  status?: string;
  verified?: boolean;
  verification_status?: string;
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
  seller_name?: string;
  created_at: string;
}

type ReportData = SellerData | ProductData;

export default function LaporanPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedReport, setSelectedReport] = useState("seller-status");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [provinces, setProvinces] = useState<any[]>([]);
  const [data, setData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfNotification, setPdfNotification] = useState<{
    show: boolean;
    fileName: string;
    downloadPath: string;
  }>({ show: false, fileName: "", downloadPath: "" });
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  
  // Fetch provinces on mount
  useEffect(() => {
    fetchProvinces();
  }, []);

  // Fetch report data when filters change
  useEffect(() => {
    if (selectedReport) {
      fetchReportData();
    }
  }, [selectedReport, startDate, endDate, selectedProvince]);

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
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Loaded ${result.data.length} provinces`);
        setProvinces(result.data);
      } else {
        console.warn("⚠️ Using static provinces due to API error");
        // Fallback to static provinces
        const staticProvinces = [
          {"id":"11","name":"ACEH"},{"id":"12","name":"SUMATERA UTARA"},
          {"id":"13","name":"SUMATERA BARAT"},{"id":"14","name":"RIAU"},
          {"id":"15","name":"JAMBI"},{"id":"16","name":"SUMATERA SELATAN"},
          {"id":"17","name":"BENGKULU"},{"id":"18","name":"LAMPUNG"},
          {"id":"19","name":"KEPULAUAN BANGKA BELITUNG"},{"id":"21","name":"KEPULAUAN RIAU"},
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
      // Build query params
      const params = new URLSearchParams({
        type: selectedReport,
        ...(startDate && { start: startDate }),
        ...(endDate && { end: endDate }),
        ...(selectedProvince && selectedReport === 'sellers-by-province' && { province: selectedProvince })
      });

      const apiUrl = `/api/admin/laporan?${params.toString()}`;
      console.log(`🔄 Fetching report data from: ${apiUrl}`);
      
      const response = await fetch(apiUrl);
      
      console.log(`📊 Response status: ${response.status} ${response.statusText}`);
      
      // First check if response is ok
      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorText = await response.text();
          if (errorText) {
            try {
              const errorJson = JSON.parse(errorText);
              errorMessage = errorJson.message || errorJson.error || errorMessage;
            } catch {
              errorMessage = errorText;
            }
          }
        } catch {
          // Ignore error in parsing error response
        }
        
        throw new Error(errorMessage);
      }
      
      // Try to parse response as JSON
      const result = await response.json();
      console.log(`📦 API Response:`, result);
      
      if (result.success) {
        setData(result.data || []);
        console.log(`✅ Loaded ${result.data?.length || 0} records`);
        
        // Show warning if using dummy data
        if (result.metadata?.note?.includes('dummy')) {
          setError(`⚠️ ${result.message || 'Menggunakan data dummy'}`);
        }
      } else {
        throw new Error(result.message || "Gagal mengambil data laporan");
      }
    } catch (err: any) {
      console.error('❌ Error fetching report data:', err);
      
      // User-friendly error messages
      let userErrorMessage = err.message || "Gagal mengambil data";
      
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        userErrorMessage = "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
      } else if (err.message.includes('500') || err.message.includes('Internal Server Error')) {
        userErrorMessage = "Server sedang mengalami masalah. Silakan coba lagi nanti.";
      } else if (err.message.includes('404')) {
        userErrorMessage = "API endpoint tidak ditemukan. Periksa konfigurasi server.";
      }
      
      setError(userErrorMessage);
      setData([]);
      
      // Fallback to dummy data for development
      if (process.env.NODE_ENV === 'development') {
        console.log("⚠️ Using fallback dummy data for development");
        const dummyData = generateDummyData(selectedReport);
        setData(dummyData);
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to generate dummy data
  const generateDummyData = (reportType: string): ReportData[] => {
    console.log(`📋 Generating dummy data for: ${reportType}`);
    
    if (reportType === 'seller-status') {
      return [
        {
          id: "1",
          email: "penjual1@email.com",
          name: "John Doe",
          pic_name: "John Doe",
          store_name: "Toko Elektronik Jaya",
          status: "Aktif",
          verified: true,
          province: "DKI Jakarta",
          city: "Jakarta Pusat",
          created_at: "2025-11-20T08:30:00Z"
        },
        {
          id: "2",
          email: "penjual2@email.com",
          name: "Jane Smith",
          pic_name: "Jane Smith",
          store_name: "Fashion Store",
          status: "Aktif",
          verified: true,
          province: "Jawa Barat",
          city: "Bandung",
          created_at: "2025-11-20T09:15:00Z"
        },
        {
          id: "3",
          email: "penjual3@email.com",
          name: "Budi Santoso",
          pic_name: "Budi Santoso",
          store_name: "Toko Makanan Sehat",
          status: "Tidak Aktif",
          verified: false,
          province: "Jawa Timur",
          city: "Surabaya",
          created_at: "2025-11-21T10:20:00Z"
        },
        {
          id: "4",
          email: "penjual4@email.com",
          name: "Siti Rahayu",
          pic_name: "Siti Rahayu",
          store_name: "Toko Kerajinan",
          status: "Aktif",
          verified: true,
          province: "DI Yogyakarta",
          city: "Yogyakarta",
          created_at: "2025-11-22T14:45:00Z"
        },
        {
          id: "5",
          email: "penjual5@email.com",
          name: "Andi Wijaya",
          pic_name: "Andi Wijaya",
          store_name: "Toko Olahraga",
          status: "Tidak Aktif",
          verified: false,
          province: "Banten",
          city: "Tangerang",
          created_at: "2025-11-23T11:10:00Z"
        }
      ];
    } else if (reportType === 'sellers-by-province') {
      return [
        {
          id: "1",
          store_name: "Nadia Decor",
          name: "Nadia",
          pic_name: "Nadia",
          province: "Sumatera Selatan",
          city: "Palembang",
          email: "nadia@decor.com",
          created_at: "2025-11-20T08:30:00Z"
        },
        {
          id: "2",
          store_name: "Yoga Gadget",
          name: "Yoga",
          pic_name: "Yoga",
          province: "Sulawesi Selatan",
          city: "Makassar",
          email: "yoga@gadget.com",
          created_at: "2025-11-20T09:15:00Z"
        },
        {
          id: "3",
          store_name: "Toko Rina Fashion",
          name: "Rina",
          pic_name: "Rina",
          province: "DKI Jakarta",
          city: "Jakarta Selatan",
          email: "rina@fashion.com",
          created_at: "2025-11-20T10:20:00Z"
        },
        {
          id: "4",
          store_name: "Budi Elektronik",
          name: "Budi",
          pic_name: "Budi",
          province: "Jawa Barat",
          city: "Bekasi",
          email: "budi@elektronik.com",
          created_at: "2025-11-21T11:30:00Z"
        },
        {
          id: "5",
          store_name: "Siti Craft",
          name: "Siti",
          pic_name: "Siti",
          province: "Jawa Timur",
          city: "Malang",
          email: "siti@craft.com",
          created_at: "2025-11-22T14:45:00Z"
        }
      ];
    } else if (reportType === 'products-rating') {
      return [
        {
          id: "1",
          product_name: "Laptop Gaming RTX 4060",
          category: "Elektronik",
          price: 15000000,
          rating: 4.8,
          total_reviews: 128,
          store_name: "Toko Elektronik Jaya",
          province: "DKI Jakarta",
          seller_name: "John Doe",
          created_at: "2025-11-20T08:30:00Z"
        },
        {
          id: "2",
          product_name: "Sepatu Running Premium",
          category: "Olahraga",
          price: 850000,
          rating: 4.6,
          total_reviews: 89,
          store_name: "Toko Olahraga",
          province: "Banten",
          seller_name: "Andi Wijaya",
          created_at: "2025-11-21T10:15:00Z"
        },
        {
          id: "3",
          product_name: "Dress Casual Modern",
          category: "Fashion",
          price: 350000,
          rating: 4.5,
          total_reviews: 67,
          store_name: "Fashion Store",
          province: "Jawa Barat",
          seller_name: "Jane Smith",
          created_at: "2025-11-22T13:20:00Z"
        },
        {
          id: "4",
          product_name: "Panci Stainless Steel",
          category: "Dapur",
          price: 250000,
          rating: 4.3,
          total_reviews: 45,
          store_name: "Toko Makanan Sehat",
          province: "Jawa Timur",
          seller_name: "Budi Santoso",
          created_at: "2025-11-23T09:40:00Z"
        },
        {
          id: "5",
          product_name: "Kursi Gaming Ergonomis",
          category: "Furniture",
          price: 1200000,
          rating: 4.2,
          total_reviews: 32,
          store_name: "Nadia Decor",
          province: "Sumatera Selatan",
          seller_name: "Nadia",
          created_at: "2025-11-24T16:10:00Z"
        }
      ];
    }
    
    return [];
  };

  const handleGeneratePDF = () => {
    if (data.length === 0) {
      alert("⚠️ Tidak ada data untuk di-generate PDF");
      return;
    }

    setIsGeneratingPDF(true);

    // Nama file
    const reportType = getDisplayTitle().replace(/\s+/g, '_');
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const fileName = `Laporan_${reportType}_${dateStr}.pdf`;
    
    // Path download
    const getDownloadPath = () => {
      if (typeof navigator !== 'undefined') {
        const userAgent = navigator.userAgent;
        
        if (userAgent.includes('Windows')) {
          return "C:/Users/User/Downloads";
        } else if (userAgent.includes('Mac')) {
          return "~/Downloads";
        } else if (userAgent.includes('Linux')) {
          return "~/Downloads";
        }
      }
      return "folder Downloads Anda";
    };

    const downloadPath = getDownloadPath();

    // Tampilkan notifikasi
    setPdfNotification({
      show: true,
      fileName,
      downloadPath
    });

    // Buat window untuk PDF
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("⚠️ Pop-up diblokir. Izinkan pop-up untuk generate PDF.");
      setIsGeneratingPDF(false);
      setPdfNotification({ show: false, fileName: "", downloadPath: "" });
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
            text-align: center;
            margin: 20px 0;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 6px;
            border: 1px dashed #3498db;
          }
          
          .btn-print {
            background: #2c3e50;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            font-weight: bold;
          }
          
          .download-info {
            background: #e3f2fd;
            border: 1px solid #bbdefb;
            border-radius: 6px;
            padding: 12px;
            margin: 10px 0;
            font-size: 10px;
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
            
            .print-controls,
            .download-info,
            .btn-print {
              display: none !important;
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
          ${startDate || endDate ? `<p><strong>Periode:</strong> ${startDate || 'Semua'} s/d ${endDate || 'Semua'}</p>` : ''}
          ${selectedReport === "sellers-by-province" && selectedProvince ? 
            `<p><strong>Provinsi:</strong> ${provinces.find(p => p.id === selectedProvince)?.name || selectedProvince}</p>` : ''}
          <p><strong>Total Data:</strong> ${data.length} records</p>
        </div>
        
        <!-- Download Info -->
        <div class="download-info">
          <h3>📋 Informasi File PDF</h3>
          <p><strong>📄 Nama File:</strong> ${fileName}</p>
          <p><strong>📁 Lokasi Penyimpanan:</strong> ${downloadPath}</p>
          <p style="color: #e74c3c; font-weight: bold; margin-top: 5px;">
            ⚠️ Pilih "Save as PDF" atau "Microsoft Print to PDF" di dialog print
          </p>
        </div>
    `;

    // Tabel berdasarkan jenis laporan
    if (selectedReport === "seller-status") {
      // Laporan Daftar Akun Penjual Berdasarkan Status
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
              const status = sellerItem.status || (sellerItem.verified ? 'Aktif' : 'Tidak Aktif');
              
              return `
                <tr>
                  <td class="text-center">${index + 1}</td>
                  <td>${escapeHtml(sellerItem.email || '-')}</td>
                  <td>${escapeHtml(sellerItem.name || sellerItem.pic_name || '-')}</td>
                  <td>${escapeHtml(sellerItem.store_name || '-')}</td>
                  <td class="text-center">
                    <span class="status-badge ${status === 'Aktif' ? 'status-aktif' : 'status-tidak-aktif'}">
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
      // Laporan Daftar Toko Berdasarkan Lokasi Provinsi
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
                  <td>${escapeHtml(sellerItem.name || sellerItem.pic_name || '-')}</td>
                  <td>${escapeHtml(sellerItem.province || '-')}</td>
                  <td>${escapeHtml(sellerItem.city || '-')}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
    } else if (selectedReport === "products-rating") {
      // Laporan Daftar Produk Berdasarkan Rating
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

    // Footer dan controls
    htmlContent += `
        <!-- Footer -->
        <div class="footer">
          <p>Dibuat oleh: Admin Marketplace • Platform E-Commerce</p>
          <p>Halaman 1 dari 1 • ${new Date().toLocaleDateString('id-ID')}</p>
        </div>
        
        <!-- Print Controls -->
        <div class="print-controls">
          <button class="btn-print" onclick="window.print()">
            🖨️ Cetak / Save as PDF
          </button>
          <p style="margin-top: 10px; color: #666; font-size: 10px;">
            Klik tombol di atas untuk membuka dialog print
          </p>
        </div>
        
        <script>
          // Auto print setelah halaman load
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 1000);
          };
        </script>
      </body>
      </html>
    `;

    // Buka window dan tulis HTML
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Timer untuk reset state
    setTimeout(() => {
      setIsGeneratingPDF(false);
      setPdfNotification({ show: false, fileName: "", downloadPath: "" });
    }, 10000);
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

  const getStatusBadge = (status?: string, verified?: boolean) => {
    const actualStatus = status || (verified ? 'Aktif' : 'Tidak Aktif');
    
    if (actualStatus === 'Aktif') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
          ✓ Aktif
        </span>
      );
    }
    
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
        ✗ Tidak Aktif
      </span>
    );
  };

  // Debug info component
  const DebugInfo = () => {
    if (!showDebugInfo) return null;
    
    return (
      <div className="mt-4 p-4 bg-gray-900 text-gray-100 rounded-lg text-sm font-mono">
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold">Debug Information</span>
          <button 
            onClick={() => setShowDebugInfo(false)}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        <div className="space-y-1">
          <div>Report Type: <span className="text-yellow-300">{selectedReport}</span></div>
          <div>Data Count: <span className="text-yellow-300">{data.length}</span></div>
          <div>Loading: <span className="text-yellow-300">{loading.toString()}</span></div>
          <div>Error: <span className="text-red-300">{error || 'None'}</span></div>
          <div>API Endpoint: <span className="text-blue-300">/api/admin/laporan</span></div>
          <div className="pt-2 border-t border-gray-700">
            <button
              onClick={fetchReportData}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
            >
              Test API Call
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Laporan Platform</h1>
          <p className="text-gray-600 mt-1">Generate laporan untuk manajemen platform (Format PDF)</p>
        </div>
        <button
          onClick={() => setShowDebugInfo(!showDebugInfo)}
          className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 rounded"
        >
          {showDebugInfo ? 'Hide Debug' : 'Show Debug'}
        </button>
      </div>

      {/* Debug Info */}
      <DebugInfo />

      {/* PDF Notification Modal */}
      {pdfNotification.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Mempersiapkan PDF</h3>
              <p className="text-sm text-gray-600 mb-4">
                PDF sedang dipersiapkan...
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded">
                    <span className="text-blue-600">📄</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Nama File</p>
                    <p className="text-sm font-semibold text-gray-800 truncate">{pdfNotification.fileName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded">
                    <span className="text-blue-600">📁</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Lokasi Penyimpanan</p>
                    <p className="text-sm font-semibold text-gray-800 truncate">{pdfNotification.downloadPath}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-3 text-sm text-gray-500">Membuka dialog print...</p>
              <p className="mt-2 text-xs text-gray-400">
                Pilih "Save as PDF" di dialog print yang muncul
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className={`p-4 rounded-lg border-l-4 ${
          error.includes('dummy') || error.includes('⚠️') 
            ? 'bg-yellow-50 border-yellow-500 text-yellow-800' 
            : 'bg-red-50 border-red-500 text-red-800'
        }`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {error.includes('dummy') || error.includes('⚠️') ? (
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm">{error}</p>
              {!error.includes('dummy') && !error.includes('⚠️') && (
                <div className="mt-2">
                  <button 
                    onClick={fetchReportData}
                    className={`text-sm ${
                      error.includes('dummy') || error.includes('⚠️') 
                        ? 'text-yellow-600 hover:text-yellow-500' 
                        : 'text-red-600 hover:text-red-500'
                    } underline`}
                  >
                    Coba lagi
                  </button>
                </div>
              )}
            </div>
            <button 
              onClick={() => setError("")}
              className="ml-3 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
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
                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
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

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Filter Laporan</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Akhir
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Province Filter */}
          {selectedReport === "sellers-by-province" && (
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
          )}

          {/* PDF Button */}
          <div className="flex items-end">
            <button
              onClick={handleGeneratePDF}
              disabled={loading || data.length === 0 || isGeneratingPDF}
              className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-3"
            >
              {isGeneratingPDF ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Menyiapkan PDF...</span>
                </>
              ) : loading ? (
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
          {(startDate || endDate) && (
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border">
              <span className="text-gray-500 text-sm">📅</span>
              <span className="text-sm text-gray-700">
                Periode: {startDate || 'Semua'} s/d {endDate || 'Semua'}
              </span>
            </div>
          )}
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
              <h3 className="font-semibold text-gray-800">Preview Data</h3>
              <span className="text-sm text-gray-500">
                Menampilkan {Math.min(data.length, 10)} dari {data.length} records
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Semua data akan termasuk dalam file PDF
            </p>
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
                        <td className="px-4 py-3 font-medium">{(item as SellerData).name || (item as SellerData).pic_name || '-'}</td>
                        <td className="px-4 py-3 text-gray-700">{(item as SellerData).store_name || '-'}</td>
                        <td className="px-4 py-3">{getStatusBadge((item as SellerData).status, (item as SellerData).verified)}</td>
                      </>
                    )}
                    {selectedReport === "sellers-by-province" && (
                      <>
                        <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                        <td className="px-4 py-3 font-medium">{(item as SellerData).store_name || '-'}</td>
                        <td className="px-4 py-3">{(item as SellerData).name || (item as SellerData).pic_name || '-'}</td>
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
            Tidak ada data yang ditemukan untuk filter yang dipilih.
          </p>
        </div>
      )}
    </div>
  );
}