"use client";

import React, { useEffect, useState } from "react";

interface Seller {
  id: string;
  store_name: string;
  description: string | null;
  pic_name: string;
  pic_phone: string;
  pic_email: string;
  pic_address: string | null;
  province: string | null;
  city: string | null;
  pic_ktp: string;
  pic_photo_url: string | null;
  pic_ktp_file_url: string | null;
  verification_status: string;
  created_at: string;
}

export default function VerifikasiPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Fetch data real dari API
  const fetchPendingSellers = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/admin/pending');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setSellers(result.data || []);
        
        if (result.count === 0) {
          setMessage({
            type: 'success',
            text: 'Tidak ada penjual yang menunggu verifikasi. Semua sudah diproses!'
          });
        }
      } else {
        throw new Error(result.message || 'Gagal mengambil data');
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: `Gagal memuat data: ${error.message}`
      });
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
    if (!selectedSeller) return;
    
    setProcessing(true);
    
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
      const response = await fetch('/api/admin/verify', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seller_id: selectedSeller.id,
          status,
          rejection_reason: rejectionReason
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Update UI: hapus dari list
        setSellers(prev => prev.filter(s => s.id !== selectedSeller.id));
        setSelectedSeller(null);
        
        // Tampilkan pesan sukses
        setMessage({
          type: 'success',
          text: result.message
        });
        
        // Auto-hide message setelah 3 detik
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: `Verifikasi gagal: ${error.message}`
      });
    } finally {
      setProcessing(false);
    }
  };

  // Helper untuk format display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
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
            <button
              onClick={fetchPendingSellers}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading ? 'Memuat...' : 'Refresh'}
            </button>
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
            <div className={`mb-6 p-4 rounded-lg ${
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
                <span>{message.text}</span>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Empty State */}
          {!loading && sellers.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Tidak ada verifikasi tertunda</h3>
              <p className="mt-2 text-gray-500">Semua penjual baru telah diverifikasi.</p>
            </div>
          )}

          {/* Seller List */}
          {!loading && sellers.length > 0 && (
            <div className="space-y-4">
              {sellers.map((seller) => (
                <div
                  key={seller.id}
                  className="border border-gray-200 rounded-lg hover:border-blue-300 transition-colors bg-white"
                >
                  <div className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {seller.store_name}
                            </h3>
                            <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                              <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                                {seller.pic_name}
                              </span>
                              <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                </svg>
                                {seller.pic_email}
                              </span>
                            </div>
                            <div className="mt-3">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Daftar: {formatDate(seller.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedSeller(seller)}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                        >
                          Detail
                        </button>
                        <button
                          onClick={() => setSelectedSeller(seller)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                        >
                          Proses
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Detail */}
      {selectedSeller && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Verifikasi Penjual</h2>
                  <p className="text-gray-600">{selectedSeller.store_name}</p>
                </div>
                <button
                  onClick={() => setSelectedSeller(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Informasi Toko</h3>
                    <div className="space-y-2">
                      <div>
                        <label className="text-sm text-gray-500">Nama Toko</label>
                        <p className="font-medium">{selectedSeller.store_name}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Deskripsi</label>
                        <p className="text-gray-700">{selectedSeller.description || '-'}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Data Pemilik</h3>
                    <div className="space-y-2">
                      <div>
                        <label className="text-sm text-gray-500">Nama Lengkap</label>
                        <p className="font-medium">{selectedSeller.pic_name}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">No. Telepon</label>
                        <p className="font-medium">{selectedSeller.pic_phone}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Email</label>
                        <p className="font-medium">{selectedSeller.pic_email}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">No. KTP</label>
                        <p className="font-mono">{selectedSeller.pic_ktp}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Dokumen</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="text-sm text-gray-500 block mb-2">Foto Pemilik</label>
                        <img
                          src={selectedSeller.pic_photo_url || '/placeholder-avatar.jpg'}
                          alt="Foto Pemilik"
                          className="w-full h-48 object-cover rounded-lg border"
                          onError={(e) => {
                            e.currentTarget.src = 'https://placehold.co/400x300?text=Foto+Tidak+Tersedia';
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-500 block mb-2">Foto KTP</label>
                        <img
                          src={selectedSeller.pic_ktp_file_url || '/placeholder-ktp.jpg'}
                          alt="Foto KTP"
                          className="w-full h-48 object-cover rounded-lg border"
                          onError={(e) => {
                            e.currentTarget.src = 'https://placehold.co/400x300?text=KTP+Tidak+Tersedia';
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
                <button
                  onClick={() => setSelectedSeller(null)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                  disabled={processing}
                >
                  Batal
                </button>
                <button
                  onClick={() => handleVerification("rejected")}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
                  disabled={processing}
                >
                  {processing ? 'Memproses...' : 'Tolak'}
                </button>
                <button
                  onClick={() => handleVerification("accepted")}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
                  disabled={processing}
                >
                  {processing ? 'Memproses...' : 'Terima'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}