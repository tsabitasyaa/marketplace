"use client";

import React, { useEffect, useState } from "react";

interface Seller {
  id: number; // int4 di database
  user_id: number; // int4
  store_name: string;
  description: string | null;
  pic_name: string;
  pic_phone: string;
  pic_email: string;
  pic_address: string | null;
  rt: string | null;
  rw: string | null;
  kelurahan: string | null; // nama field sesuai schema (kelurahan, bukan kelunihan)
  city: string | null;
  province: string | null;
  pic_ktp: string; // nama field sesuai schema (ktp, bukan kip)
  pic_photo_url: string | null;
  pic_ktp_file_url: string | null; // nama field sesuai schema
  verification_status: string; // field utama untuk status
  created_at: string;
  is_active: boolean; // box1 di schema = boolean
}

export default function VerifikasiPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successDetails, setSuccessDetails] = useState<{
    storeName: string;
    sellerEmail: string;
    status: 'accepted' | 'rejected';
    emailSent: boolean;
    message?: string;
  } | null>(null);

  // Fetch data penjual yang pending verifikasi
  const fetchPendingSellers = async (retryCount = 0) => {
    setLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/admin/pending', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          const errorText = await response.text();
          errorMessage = `${errorMessage}: ${errorText.substring(0, 100)}`;
        }
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Validasi dan mapping data sesuai interface
        const validatedData = (result.data || []).map((seller: any) => ({
          ...seller,
          id: Number(seller.id) || 0,
          user_id: Number(seller.user_id) || 0,
          verification_status: seller.verification_status || 'pending',
          is_active: seller.is_active !== undefined ? Boolean(seller.is_active) : true
        }));
        
        setSellers(validatedData);
        
        if (result.count === 0) {
          setMessage({
            type: 'success',
            text: 'Tidak ada penjual yang menunggu verifikasi.'
          });
        }
      } else {
        throw new Error(result.message || 'Gagal mengambil data');
      }
    } catch (error: any) {
      console.error('Error fetching sellers:', error);
      
      let userMessage = 'Gagal memuat data penjual. ';
      if (error.message.includes('Failed to fetch')) {
        userMessage += 'Periksa koneksi internet.';
      } else if (error.message.includes('HTTP 500')) {
        userMessage += 'Server error. Silakan coba lagi nanti.';
      } else {
        userMessage += `Error: ${error.message}`;
      }
      
      setMessage({
        type: 'error',
        text: userMessage
      });
      
      if (retryCount < 2) {
        setTimeout(() => fetchPendingSellers(retryCount + 1), 2000);
        return;
      }
      
      setSellers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingSellers();
  }, []);

  // Handler verifikasi
  const handleVerification = async (status: "accepted" | "rejected") => {
    if (!selectedSeller) {
      setMessage({
        type: 'error',
        text: 'Tidak ada penjual yang dipilih'
      });
      return;
    }
    
    setProcessing(true);
    setMessage(null);
    setShowSuccessModal(false);
    setSuccessDetails(null);
    
    let rejectionReason = '';
    if (status === 'rejected') {
      const reason = window.prompt("Alasan penolakan (wajib diisi):");
      if (!reason || reason.trim() === '') {
        alert("Alasan penolakan harus diisi!");
        setProcessing(false);
        return;
      }
      rejectionReason = reason.trim();
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const requestBody = {
        seller_id: selectedSeller.id, // number sesuai database
        user_id: selectedSeller.user_id, // tambahkan user_id untuk email
        status,
        rejection_reason: rejectionReason,
        seller_email: selectedSeller.pic_email, // kirim email untuk notifikasi
        store_name: selectedSeller.store_name
      };
      
      const response = await fetch('/api/admin/verify', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        // SUCCESS
        setSellers(prev => prev.filter(s => s.id !== selectedSeller.id));
        
        setSuccessDetails({
          storeName: selectedSeller.store_name,
          sellerEmail: selectedSeller.pic_email,
          status,
          emailSent: result.data?.email_sent || false,
          message: result.message
        });
        setShowSuccessModal(true);
        
        setSelectedSeller(null);
        
        setTimeout(() => fetchPendingSellers(), 1500);
        
      } else {
        // API ERROR
        setMessage({
          type: 'error',
          text: result.message || 'Gagal memproses verifikasi'
        });
      }
      
    } catch (error: any) {
      console.error('Verification error:', error);
      
      let userErrorMessage = 'Verifikasi gagal: ';
      if (error.name === 'AbortError') {
        userErrorMessage += 'Request timeout. Silakan coba lagi.';
      } else if (error.message.includes('Failed to fetch')) {
        userErrorMessage += 'Koneksi jaringan bermasalah.';
      } else {
        userErrorMessage += error.message;
      }
      
      setMessage({
        type: 'error',
        text: userErrorMessage
      });
    } finally {
      setProcessing(false);
    }
  };

  // Helper untuk format display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Tanggal tidak valid';
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return 'Tanggal tidak valid';
    }
  };

  // Format ID yang aman
  const formatId = (id: number) => {
    return `SELL-${id.toString().padStart(6, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Verifikasi Penjual
              </h1>
              <p className="text-gray-600 mt-2">
                Kelola verifikasi akun penjual baru
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => fetchPendingSellers()}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                <svg 
                  className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                  />
                </svg>
                {loading ? 'Memuat...' : 'Refresh Data'}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-700">{sellers.length}</div>
              <div className="text-sm text-blue-600">Menunggu Verifikasi</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-700">Total</div>
              <div className="text-sm text-gray-600">Penjual</div>
            </div>
          </div>

          {/* Messages */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg animate-fadeIn ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <div className="flex items-center">
                {message.type === 'success' ? (
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                <div className="flex-1">
                  <span className="whitespace-pre-line">{message.text}</span>
                </div>
                <button
                  onClick={() => setMessage(null)}
                  className="ml-2 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600">Memuat data penjual...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && sellers.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Tidak ada verifikasi tertunda</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                Semua penjual baru telah diproses.
              </p>
              <button
                onClick={() => fetchPendingSellers()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Cek Ulang Data
              </button>
            </div>
          )}

          {/* Seller List */}
          {!loading && sellers.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Daftar Penjual Menunggu Verifikasi
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    Total: {sellers.length} penjual
                  </span>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                </div>
              </div>
              
              <div className="space-y-3">
                {sellers.map((seller) => (
                  <div
                    key={seller.id}
                    className="border border-gray-200 rounded-lg hover:border-blue-300 transition-all duration-200 bg-white hover:shadow-sm"
                  >
                    <div className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {seller.store_name || 'Tidak ada nama toko'}
                                </h3>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1 animate-pulse"></span>
                                  {seller.verification_status}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <svg className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                  </svg>
                                  <span className="truncate">{seller.pic_name || 'Tidak ada nama'}</span>
                                </div>
                                <div className="flex items-center">
                                  <svg className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                  </svg>
                                  <span className="truncate">{seller.pic_email || 'tidak-ada@email.com'}</span>
                                </div>
                                <div className="flex items-center">
                                  <svg className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {formatDate(seller.created_at)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedSeller(seller)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors text-sm flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Detail
                          </button>
                          <button
                            onClick={() => setSelectedSeller(seller)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors text-sm flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Proses
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Detail */}
      {selectedSeller && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Verifikasi Penjual</h2>
                  <p className="text-gray-600">{selectedSeller.store_name || 'Tidak ada nama toko'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-500">ID: {formatId(selectedSeller.id)}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSeller(null)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  disabled={processing}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Processing Overlay */}
              {processing && (
                <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10 rounded-xl">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-700 font-medium text-lg">Memproses verifikasi...</p>
                    <p className="text-sm text-gray-500 mt-2">Mohon tunggu, jangan tutup halaman ini</p>
                  </div>
                </div>
              )}

              {/* Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Informasi Toko */}
                  <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                    <h3 className="font-semibold text-gray-900 mb-4 text-lg border-b pb-2 border-blue-200">
                      Informasi Toko
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">Nama Toko</label>
                        <p className="font-medium text-gray-900 text-lg">{selectedSeller.store_name || 'Tidak ada nama'}</p>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">Deskripsi</label>
                        <p className="text-gray-700 bg-white p-3 rounded-lg border">
                          {selectedSeller.description || <span className="text-gray-400 italic">Tidak ada deskripsi</span>}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Data Pemilik */}
                  <div className="bg-green-50 rounded-xl p-5 border border-green-100">
                    <h3 className="font-semibold text-gray-900 mb-4 text-lg border-b pb-2 border-green-200">
                      Data Pemilik (PIC)
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">Nama PIC</label>
                        <p className="font-medium text-gray-900">{selectedSeller.pic_name || 'Tidak ada nama'}</p>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">No Handphone</label>
                        <p className="font-medium text-gray-900">{selectedSeller.pic_phone || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">Email</label>
                        <p className="font-medium text-gray-900 break-all">{selectedSeller.pic_email || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">No. KTP</label>
                        <div className="font-mono text-gray-900 bg-white p-2 rounded border">
                          {selectedSeller.pic_ktp || '-'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Alamat */}
                  <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
                    <h3 className="font-semibold text-gray-900 mb-4 text-lg border-b pb-2 border-purple-200">
                      Alamat
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">Alamat Lengkap</label>
                        <p className="text-gray-700 bg-white p-3 rounded-lg border">
                          {selectedSeller.pic_address || <span className="text-gray-400 italic">-</span>}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-500 mb-1">RT</label>
                          <div className="text-gray-700 bg-white p-2 rounded border text-center">
                            {selectedSeller.rt || <span className="text-gray-400">-</span>}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-500 mb-1">RW</label>
                          <div className="text-gray-700 bg-white p-2 rounded border text-center">
                            {selectedSeller.rw || <span className="text-gray-400">-</span>}
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">Kelurahan</label>
                        <p className="text-gray-700">
                          {selectedSeller.kelurahan || <span className="text-gray-400">-</span>}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">Kota</label>
                        <p className="text-gray-700">
                          {selectedSeller.city || <span className="text-gray-400">-</span>}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">Provinsi</label>
                        <p className="text-gray-700">
                          {selectedSeller.province || <span className="text-gray-400">-</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Dokumen */}
                  <div className="bg-orange-50 rounded-xl p-5 border border-orange-100">
                    <h3 className="font-semibold text-gray-900 mb-4 text-lg border-b pb-2 border-orange-200">
                      Dokumen Pendukung
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm text-gray-500 mb-3 font-medium">
                          Foto PIC
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-white">
                          <img
                            src={selectedSeller.pic_photo_url || 'https://placehold.co/600x400?text=Foto+PIC+Tidak+Tersedia'}
                            alt="Foto Pemilik"
                            className="w-full h-64 object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'https://placehold.co/600x400?text=Foto+Tidak+Tersedia';
                            }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-500 mb-3 font-medium">
                          File KTP
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-white">
                          <img
                            src={selectedSeller.pic_ktp_file_url || 'https://placehold.co/600x400?text=KTP+Tidak+Tersedia'}
                            alt="Foto KTP"
                            className="w-full h-64 object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'https://placehold.co/600x400?text=KTP+Tidak+Tersedia';
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-100">
                    <h3 className="font-semibold text-gray-900 mb-4 text-lg border-b pb-2 border-yellow-200">
                      Status Verifikasi
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                        <span className="text-sm text-gray-600">Status Saat Ini</span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                          <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                          {selectedSeller.verification_status}
                        </span>
                      </div>
                      <div className="p-3 bg-white rounded-lg border">
                        <label className="block text-sm text-gray-500 mb-1">Tanggal Pendaftaran</label>
                        <p className="text-gray-700 font-medium">{formatDate(selectedSeller.created_at)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t">
                <div className="text-sm text-gray-500">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Pastikan semua data sudah dicek sebelum memutuskan
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setSelectedSeller(null)}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
                    disabled={processing}
                  >
                    Batal
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleVerification("rejected")}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 transition-colors flex items-center justify-center min-w-[120px]"
                      disabled={processing}
                    >
                      {processing ? (
                        <>
                          <svg className="animate-spin h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Memproses...
                        </>
                      ) : (
                        'Tolak'
                      )}
                    </button>
                    <button
                      onClick={() => handleVerification("accepted")}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 transition-colors flex items-center justify-center min-w-[120px]"
                      disabled={processing}
                    >
                      {processing ? (
                        <>
                          <svg className="animate-spin h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Memproses...
                        </>
                      ) : (
                        'Terima'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Success */}
      {showSuccessModal && successDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60] animate-fadeIn">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                  successDetails.status === 'accepted' 
                    ? 'bg-green-100 text-green-600'
                    : 'bg-red-100 text-red-600'
                }`}>
                  {successDetails.status === 'accepted' ? (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {successDetails.status === 'accepted' 
                    ? 'Verifikasi Diterima!'
                    : 'Verifikasi Ditolak'}
                </h3>

                <p className="text-gray-600 mb-4">
                  {successDetails.status === 'accepted'
                    ? `Toko "${successDetails.storeName}" telah berhasil diverifikasi.`
                    : `Toko "${successDetails.storeName}" telah ditolak verifikasinya.`
                  }
                </p>

                {successDetails.emailSent && (
                  <div className="bg-green-50 rounded-lg p-4 w-full mb-6">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">Email notifikasi telah dikirim</p>
                        <p className="text-sm text-gray-600">ke {successDetails.sellerEmail}</p>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    setSuccessDetails(null);
                  }}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    successDetails.status === 'accepted'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}