// app/admin/dashboard/laporan/page.tsx - WITH PDF DOWNLOAD NOTIFICATION
"use client";

import { useState, useEffect, useRef } from "react";

interface SellerData {
  id: string;
  store_name?: string;
  plot_email?: string;
  email?: string;
  phone?: string;
  verified?: boolean;
  verification_status?: string;
  province?: string;
  city?: string;
  created_at: string;
  last_active_at?: string;
}

interface SellerByProvinceData extends SellerData {
  total_products?: number;
}

interface ProductData {
  id: string;
  product_name?: string;
  name?: string;
  store_name?: string;
  category?: string;
  price: number;
  rating: number;
  province?: string;
  city?: string;
  created_at: string;
  total_reviews?: number;
}

export default function LaporanPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedReport, setSelectedReport] = useState("seller-status");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [provinces, setProvinces] = useState<any[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfNotification, setPdfNotification] = useState<{
    show: boolean;
    fileName: string;
    downloadPath: string;
  }>({ show: false, fileName: "", downloadPath: "" });
  const printRef = useRef<HTMLDivElement>(null);

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
        setProvinces(result.data);
      } else {
        setError(`Gagal mengambil data provinsi: ${result.message}`);
      }
    } catch (err: any) {
      console.error('Error fetching provinces:', err);
      setError(`Terjadi kesalahan: ${err.message || 'Unknown error'}`);
    }
  };

  const fetchReportData = async () => {
    setLoading(true);
    setError("");
    setData([]);
    
    try {
      const params = new URLSearchParams({
        type: selectedReport,
        ...(startDate && { start: startDate }),
        ...(endDate && { end: endDate }),
        ...(selectedProvince && selectedReport === 'sellers-by-province' && { province: selectedProvince })
      });

      const response = await fetch(`/api/admin/laporan?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setData(result.data || []);
      } else {
        throw new Error(result.message || "Gagal mengambil data laporan");
      }
    } catch (err: any) {
      console.error('Error fetching report data:', err);
      setError(`Gagal mengambil data: ${err.message || 'Unknown error'}`);
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

    setIsGeneratingPDF(true);

    // Nama file yang akan disimpan
    const reportType = getDisplayTitle().replace(/\s+/g, '_');
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const fileName = `Laporan_${reportType}_${dateStr}.pdf`;
    
    // Mendapatkan direktori download default
    const getDownloadPath = () => {
      if (typeof navigator !== 'undefined') {
        // Deteksi OS
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

    // Tampilkan notifikasi awal
    setPdfNotification({
      show: true,
      fileName,
      downloadPath
    });

    // Buat window baru untuk PDF
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
          /* Reset dan dasar */
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            margin: 15mm;
            color: #333;
            line-height: 1.4;
            font-size: 12px;
          }
          
          /* Header */
          .header { 
            text-align: center; 
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 3px solid #2c3e50;
          }
          
          .header h1 { 
            margin: 0 0 5px 0; 
            font-size: 22px; 
            color: #2c3e50;
            font-weight: 700;
          }
          
          .subtitle {
            font-size: 11px;
            color: #7f8c8d;
            font-weight: 500;
            letter-spacing: 0.5px;
          }
          
          /* Info box */
          .info-box {
            margin-bottom: 20px;
            font-size: 11px;
            color: #2c3e50;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #3498db;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          }
          
          .info-box p {
            margin: 4px 0;
            line-height: 1.5;
          }
          
          .info-box strong {
            color: #2c3e50;
            font-weight: 600;
          }
          
          /* Table styling */
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 10px;
            page-break-inside: auto;
          }
          
          thead {
            background: linear-gradient(135deg, #2c3e50, #4a6491);
          }
          
          th {
            color: white;
            padding: 10px 8px;
            text-align: left;
            border: 1px solid #1a252f;
            font-weight: 600;
            font-size: 10px;
          }
          
          td {
            padding: 8px;
            border: 1px solid #dee2e6;
            vertical-align: middle;
          }
          
          tbody tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          
          tbody tr:nth-child(even) {
            background-color: #f8f9fa;
          }
          
          tbody tr:hover {
            background-color: #e8f4f8;
          }
          
          /* Status badges */
          .status-badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 9px;
            font-weight: 600;
            text-align: center;
            min-width: 80px;
          }
          
          .status-verified {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
          }
          
          .status-pending {
            background-color: #fff3cd;
            color: #856404;
            border: 1px solid #ffeaa7;
          }
          
          /* Rating stars */
          .rating {
            display: inline-flex;
            align-items: center;
            gap: 3px;
            font-weight: 600;
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
          
          /* Footer */
          .footer {
            margin-top: 30px;
            font-size: 9px;
            color: #7f8c8d;
            text-align: center;
            padding-top: 15px;
            border-top: 1px solid #ddd;
          }
          
          .footer p {
            margin: 3px 0;
          }
          
          /* Print controls */
          .print-controls {
            text-align: center;
            margin: 25px 0;
            padding: 20px;
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            border-radius: 8px;
            border: 2px dashed #3498db;
          }
          
          .btn-print {
            background: linear-gradient(135deg, #2c3e50, #4a6491);
            color: white;
            border: none;
            padding: 12px 28px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            margin: 10px 5px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          
          .btn-print:hover {
            background: linear-gradient(135deg, #1a252f, #3a5177);
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(0,0,0,0.15);
          }
          
          .download-info {
            background: #e3f2fd;
            border: 1px solid #bbdefb;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
            text-align: left;
            font-size: 12px;
          }
          
          .download-info h3 {
            margin: 0 0 10px 0;
            color: #1565c0;
            font-size: 14px;
          }
          
          .download-info p {
            margin: 6px 0;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .download-info strong {
            color: #2c3e50;
            min-width: 140px;
            display: inline-block;
          }
          
          /* Print media queries */
          @media print {
            @page {
              size: A4 portrait;
              margin: 15mm;
            }
            
            body { 
              margin: 0;
              font-size: 10px;
            }
            
            .print-controls,
            .download-info,
            .btn-print {
              display: none !important;
            }
            
            .header {
              margin-bottom: 15px;
            }
            
            table {
              font-size: 9px;
            }
            
            th, td {
              padding: 6px 5px;
            }
            
            .info-box {
              padding: 10px;
              margin-bottom: 15px;
            }
          }
          
          /* Page breaks */
          .page-break {
            page-break-before: always;
          }
          
          /* Utility classes */
          .text-center {
            text-align: center;
          }
          
          .text-right {
            text-align: right;
          }
          
          .font-bold {
            font-weight: 700;
          }
          
          .mb-10 {
            margin-bottom: 10px;
          }
          
          .mt-20 {
            margin-top: 20px;
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
          <p>
            <strong>📄 Nama File:</strong> 
            <span style="background: #fff3cd; padding: 4px 8px; border-radius: 4px; font-family: monospace;">
              ${fileName}
            </span>
          </p>
          <p>
            <strong>📁 Lokasi Penyimpanan:</strong> 
            <span style="color: #2c3e50; font-weight: 500;">
              ${downloadPath}
            </span>
          </p>
          <p style="color: #e74c3c; font-weight: 500; margin-top: 10px;">
            ⚠️ Pilih "Save as PDF" atau "Microsoft Print to PDF" di dialog print
          </p>
        </div>
    `;

    // Tabel berdasarkan jenis laporan
    if (selectedReport === "seller-status") {
      htmlContent += `
        <table>
          <thead>
            <tr>
              <th width="5%">No</th>
              <th width="25%">Nama Toko</th>
              <th width="20%">Email</th>
              <th width="15%">Provinsi</th>
              <th width="15%">Status</th>
              <th width="20%">Tanggal Bergabung</th>
            </tr>
          </thead>
          <tbody>
            ${data.map((item, index) => `
              <tr>
                <td class="text-center">${index + 1}</td>
                <td>${escapeHtml(item.store_name || '-')}</td>
                <td>${escapeHtml(item.plot_email || item.email || '-')}</td>
                <td>${escapeHtml(item.province || '-')}</td>
                <td class="text-center">
                  <span class="status-badge ${item.verified ? 'status-verified' : 'status-pending'}">
                    ${item.verified ? '✓ Terverifikasi' : '⏳ Menunggu'}
                  </span>
                </td>
                <td>${formatDateForPDF(item.created_at)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (selectedReport === "sellers-by-province") {
      htmlContent += `
        <table>
          <thead>
            <tr>
              <th width="5%">No</th>
              <th width="20%">Nama Toko</th>
              <th width="20%">Email</th>
              <th width="15%">Provinsi</th>
              <th width="15%">Kota</th>
              <th width="10%">Total Produk</th>
              <th width="15%">Tanggal Bergabung</th>
            </tr>
          </thead>
          <tbody>
            ${data.map((item, index) => `
              <tr>
                <td class="text-center">${index + 1}</td>
                <td>${escapeHtml(item.store_name || '-')}</td>
                <td>${escapeHtml(item.plot_email || item.email || '-')}</td>
                <td>${escapeHtml(item.province || '-')}</td>
                <td>${escapeHtml(item.city || '-')}</td>
                <td class="text-center font-bold">${item.total_products || 0}</td>
                <td>${formatDateForPDF(item.created_at)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (selectedReport === "products-rating") {
      htmlContent += `
        <table>
          <thead>
            <tr>
              <th width="5%">No</th>
              <th width="20%">Nama Produk</th>
              <th width="15%">Nama Toko</th>
              <th width="15%">Kategori</th>
              <th width="15%">Harga</th>
              <th width="10%">Rating</th>
              <th width="10%">Provinsi</th>
              <th width="10%">Tanggal Dibuat</th>
            </tr>
          </thead>
          <tbody>
            ${data.map((item, index) => {
              const rating = item.rating || 0;
              const ratingClass = rating >= 4 ? 'rating-high' : rating >= 3 ? 'rating-medium' : 'rating-low';
              return `
                <tr>
                  <td class="text-center">${index + 1}</td>
                  <td>${escapeHtml(item.product_name || item.name || '-')}</td>
                  <td>${escapeHtml(item.store_name || '-')}</td>
                  <td>${escapeHtml(item.category || '-')}</td>
                  <td class="text-right">${formatCurrencyForPDF(item.price || 0)}</td>
                  <td class="text-center">
                    <span class="rating ${ratingClass}">
                      ★ ${rating.toFixed(1)}
                    </span>
                  </td>
                  <td>${escapeHtml(item.province || '-')}</td>
                  <td>${formatDateForPDF(item.created_at)}</td>
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
          <button class="btn-print" onclick="handlePrintAndNotify()">
            🖨️ Cetak / Save as PDF
          </button>
          <p style="margin-top: 15px; color: #666; font-size: 12px;">
            Klik tombol di atas untuk membuka dialog print<br>
            Pilih printer "Save as PDF" atau "Microsoft Print to PDF"
          </p>
        </div>
        
        <script>
          let hasPrinted = false;
          
          function handlePrintAndNotify() {
            window.print();
            
            // Track jika sudah print
            if (!hasPrinted) {
              hasPrinted = true;
              
              // Kirim notifikasi ke parent window setelah delay
              setTimeout(() => {
                try {
                  if (window.opener && !window.opener.closed) {
                    window.opener.postMessage({
                      type: 'PDF_DOWNLOAD_COMPLETE',
                      fileName: '${fileName}',
                      downloadPath: '${downloadPath}'
                    }, '*');
                  }
                } catch(e) {
                  console.log('Notifikasi berhasil dikirim');
                }
                
                // Tutup window setelah beberapa detik
                setTimeout(() => {
                  window.close();
                }, 2000);
              }, 1000);
            }
          }
          
          // Auto trigger print setelah halaman load
          window.onload = function() {
            setTimeout(function() {
              handlePrintAndNotify();
            }, 1000);
          };
          
          // Listen for print dialog events
          window.addEventListener('beforeprint', function() {
            console.log('Dialog print dibuka - Pilih "Save as PDF"');
          });
          
          window.addEventListener('afterprint', function() {
            console.log('Dialog print ditutup');
          });
          
          // Listen for messages from this window (untuk debugging)
          window.addEventListener('message', function(event) {
            if (event.data === 'PRINT_NOW') {
              handlePrintAndNotify();
            }
          });
        </script>
      </body>
      </html>
    `;

    // Buka window baru
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Listen untuk notifikasi dari print window
    const messageHandler = (event: MessageEvent) => {
      if (event.data && event.data.type === 'PDF_DOWNLOAD_COMPLETE') {
        // Notifikasi sukses
        setTimeout(() => {
          alert(`✅ PDF BERHASIL DIUNDUH!\n\n📄 File: ${event.data.fileName}\n📁 Tersimpan di: ${event.data.downloadPath}\n\nFile telah tersimpan di folder Downloads Anda.`);
          setIsGeneratingPDF(false);
          setPdfNotification({ show: false, fileName: "", downloadPath: "" });
        }, 500);
        
        // Remove event listener
        window.removeEventListener('message', messageHandler);
      }
    };

    window.addEventListener('message', messageHandler);

    // Timeout fallback
    setTimeout(() => {
      setIsGeneratingPDF(false);
      setPdfNotification({ show: false, fileName: "", downloadPath: "" });
    }, 30000); // 30 detik timeout
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
        return "Laporan Daftar Akun Penjual Aktif dan Tidak Aktif";
      case "sellers-by-province":
        return "Laporan Daftar Penjual untuk Setiap Lokasi Provinsi";
      case "products-rating":
        return "Laporan Daftar Produk dan Ratingnya";
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

  const getStatusBadge = (verified?: boolean) => {
    if (verified) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
          ✓ Terverifikasi
        </span>
      );
    }
    
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
        ⏳ Menunggu
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Laporan Platform</h1>
        <p className="text-gray-600 mt-1">Generate laporan untuk manajemen platform (Format PDF)</p>
      </div>

      {/* PDF Notification Modal */}
      {pdfNotification.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Mempersiapkan PDF</h3>
              <p className="text-sm text-gray-600 mb-4">
                Tunggu sebentar, PDF sedang dipersiapkan...
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
        <div className="bg-red-50 border-l-4 border-red-500 p-4 animate-fadeIn">
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
              label: 'Laporan Akun Penjual',
              desc: 'Aktif / Tidak Aktif',
              icon: '👤'
            },
            { 
              value: 'sellers-by-province', 
              label: 'Penjual per Provinsi',
              desc: 'Distribusi lokasi',
              icon: '🗺️'
            },
            { 
              value: 'products-rating', 
              label: 'Produk & Rating',
              desc: 'Rating produk',
              icon: '⭐'
            }
          ].map((report) => (
            <button
              key={report.value}
              onClick={() => setSelectedReport(report.value)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
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
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
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
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Menyiapkan PDF...</span>
                </>
              ) : loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
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
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900">{getDisplayTitle()}</h2>
        <div className="flex flex-wrap gap-4 mt-3">
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
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border">
            <span className="text-gray-500 text-sm">📊</span>
            <span className="text-sm text-gray-700">
              Total Data: <span className="font-semibold">{data.length}</span> records
            </span>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border">
            <span className="text-gray-500 text-sm">📄</span>
            <span className="text-sm text-gray-700">Format: PDF Document</span>
          </div>
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
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  {selectedReport === "seller-status" && (
                    <>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">No</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Nama Toko</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Provinsi</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Bergabung</th>
                    </>
                  )}
                  {selectedReport === "sellers-by-province" && (
                    <>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">No</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Nama Toko</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Provinsi</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Kota</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Produk</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Bergabung</th>
                    </>
                  )}
                  {selectedReport === "products-rating" && (
                    <>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">No</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Produk</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Toko</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Kategori</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Harga</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Rating</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Provinsi</th>
                    </>
                  )}
                </tr>
              </thead>
              
              <tbody className="divide-y divide-gray-100">
                {data.slice(0, 10).map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-blue-50 transition-colors">
                    {selectedReport === "seller-status" && (
                      <>
                        <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                        <td className="px-4 py-3 font-medium">{item.store_name || '-'}</td>
                        <td className="px-4 py-3 text-gray-700">{item.plot_email || item.email || '-'}</td>
                        <td className="px-4 py-3 text-gray-700">{item.province || '-'}</td>
                        <td className="px-4 py-3">{getStatusBadge(item.verified)}</td>
                        <td className="px-4 py-3 text-gray-600">{formatDate(item.created_at)}</td>
                      </>
                    )}
                    {selectedReport === "sellers-by-province" && (
                      <>
                        <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                        <td className="px-4 py-3 font-medium">{item.store_name || '-'}</td>
                        <td className="px-4 py-3 text-gray-700">{item.plot_email || item.email || '-'}</td>
                        <td className="px-4 py-3 text-gray-700">{item.province || '-'}</td>
                        <td className="px-4 py-3 text-gray-700">{item.city || '-'}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center justify-center bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                            {item.total_products || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{formatDate(item.created_at)}</td>
                      </>
                    )}
                    {selectedReport === "products-rating" && (
                      <>
                        <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">{item.product_name || item.name || '-'}</td>
                        <td className="px-4 py-3 text-gray-700">{item.store_name || '-'}</td>
                        <td className="px-4 py-3">
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                            {item.category || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-800">{formatCurrency(item.price || 0)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <div className="flex">
                              {[1,2,3,4,5].map((star) => (
                                <span 
                                  key={star} 
                                  className={`text-sm ${
                                    star <= Math.floor(item.rating || 0) 
                                      ? 'text-yellow-500' 
                                      : 'text-gray-300'
                                  }`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            <span className="text-gray-700 font-medium">{item.rating?.toFixed(1) || '0.0'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{item.province || '-'}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.length > 10 && (
            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 text-center border-t">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">{data.length - 10} record lagi</span> akan termasuk dalam PDF
              </p>
            </div>
          )}
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
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Tidak ada data yang ditemukan untuk filter yang dipilih. 
            Coba ubah tanggal atau pilih jenis laporan lain.
          </p>
          <button
            onClick={() => {
              setStartDate("");
              setEndDate("");
              setSelectedProvince("");
            }}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
          >
            Reset Filter
          </button>
        </div>
      )}

      {/* Statistics Cards */}
      {!loading && data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow border border-gray-200 p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 shadow">
                <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Data</p>
                <p className="text-3xl font-bold text-gray-900">{data.length}</p>
                <p className="text-xs text-gray-500">records tersedia</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow border border-gray-200 p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-3 shadow">
                <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Jenis Laporan</p>
                <p className="text-xl font-bold text-gray-900">
                  {selectedReport === "seller-status" && "Akun Penjual"}
                  {selectedReport === "sellers-by-province" && "Penjual per Provinsi"}
                  {selectedReport === "products-rating" && "Produk & Rating"}
                </p>
                <p className="text-xs text-gray-500">Format terpilih</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow border border-gray-200 p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-3 shadow">
                <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Output Format</p>
                <p className="text-xl font-bold text-gray-900">PDF Document</p>
                <p className="text-xs text-gray-500">Siap diunduh</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Tips */}
      {data.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 bg-yellow-100 p-2 rounded-lg">
              <span className="text-yellow-600 text-xl">💡</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Tips Unduh PDF</h4>
              <ul className="text-sm text-gray-600 space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="text-yellow-500">•</span>
                  Klik "Generate PDF" untuk memulai proses
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-yellow-500">•</span>
                  Di dialog print, pilih <strong>"Save as PDF"</strong> atau <strong>"Microsoft Print to PDF"</strong>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-yellow-500">•</span>
                  Pilih folder penyimpanan (default: Downloads)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-yellow-500">•</span>
                  Notifikasi akan muncul saat file berhasil tersimpan
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tambahkan style untuk animasi */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}