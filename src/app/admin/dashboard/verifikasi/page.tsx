"use client";

import React, { useEffect, useState } from "react";

interface Seller {
  id: string;
  user_id: string;
  store_name: string;
  description: string | null;
  pic_name: string;
  pic_phone: string;
  pic_email: string;
  pic_address: string | null;
  rt: string | null;
  rw: string | null;
  kelurahan: string | null;
  kecamatan: string | null;
  city: string | null;
  province: string | null;
  pic_ktp: string;
  pic_photo_url: string | null;
  pic_ktp_file_url: string | null;
  verified: boolean;
  verification_status: string;
  created_at: string;
}

export default function VerifikasiPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [processing, setProcessing] = useState(false);

  const getDisplayValue = (value: any) => value || "-";

  // Fetch data dari API admin
  async function fetchSellers() {
    setLoading(true);
    setErrorMsg("");
    
    try {
      console.log("🔄 [FRONTEND] Mengambil data dari /api/admin/pending");
      
      const response = await fetch('/api/admin/pending', {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log(`📡 Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        // Coba baca error message dari response
        const errorText = await response.text();
        console.error(`❌ Response error: ${errorText}`);
        
        // Coba parse sebagai JSON jika bisa
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(`HTTP ${response.status}: ${errorData.message || errorData.error || 'Gagal mengambil data'}`);
        } catch {
          throw new Error(`HTTP ${response.status}: ${response.statusText || 'Gagal mengambil data'}`);
        }
      }
      
      const result = await response.json();
      console.log("📦 Response data:", result);
      
      if (!result.success) {
        throw new Error(result.message || "Response API tidak valid");
      }
      
      setSellers(result.data || []);
      console.log(`✅ [FRONTEND] Loaded ${result.data?.length || 0} sellers`);
      
    } catch (error) {
      console.error("❌ [FRONTEND] Error fetching sellers:", error);
      
      setSellers([]);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setErrorMsg(`Gagal mengambil data: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSellers();
  }, []);

  // Handler verifikasi dengan API admin
  async function handleVerify(status: "accepted" | "rejected") {
    if (!selectedSeller) return;

    setProcessing(true);
    
    let rejection_reason: string | undefined;
    if (status === 'rejected') {
      const reason = prompt("Masukkan alasan penolakan (kosongkan jika tidak perlu):");
      if (reason !== null) {
        rejection_reason = reason || undefined;
      } else {
        setProcessing(false);
        return;
      }
    }

    try {
      console.log(`🔄 [FRONTEND] Mengirim verifikasi untuk seller ${selectedSeller.id} dengan status ${status}`);
      
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          seller_id: selectedSeller.id,
          status,
          rejection_reason
        }),
      });

      console.log(`📡 Verify response: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Verify error: ${errorText}`);
        
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || `HTTP ${response.status}`);
        } catch {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }

      const result = await response.json();
      console.log("📦 Verify result:", result);
      
      if (!result.success) {
        throw new Error(result.message || "Verifikasi gagal");
      }

      const action = status === "accepted" ? "Verifikasi" : "Penolakan";
      const sellerEmail = selectedSeller.pic_email;

      alert(
        `🎉 ${action} berhasil diproses!\n\n` +
        `Toko: ${selectedSeller.store_name}\n` +
        `Pemilik: ${selectedSeller.pic_name}\n` +
        `Status: ${status}\n` +
        `Email notifikasi: ${sellerEmail}\n\n` +
        `${rejection_reason ? `Alasan penolakan: ${rejection_reason}\n\n` : ''}` +
        `Detail telah dikirim ke: ${sellerEmail}`
      );

      // Hapus seller yang sudah diproses dari list
      setSellers(prev => prev.filter(seller => seller.id !== selectedSeller.id));
      setSelectedSeller(null);
      
    } catch (error: any) {
      console.error("❌ [FRONTEND] Error in verification:", error);
      alert(`❌ ${error.message || "Terjadi error saat memproses verifikasi. Silakan coba lagi."}`);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 className="text-[var(--navy)] font-bold text-2xl">Verifikasi Penjual</h2>
              <p className="text-gray-600 mt-1">
                {sellers.length} penjual menunggu verifikasi
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchSellers}
                className="bg-[var(--teal)] hover:bg-[var(--navy)] text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {loading ? "Memuat..." : "Refresh"}
              </button>
              
              {/* Debug button */}
              <button
                onClick={() => {
                  console.log("🔍 Debug info:");
                  console.log("Current sellers:", sellers);
                  console.log("Selected seller:", selectedSeller);
                  console.log("Loading:", loading);
                  console.log("Error:", errorMsg);
                  console.log("API endpoint:", "/api/admin/pending");
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm"
              >
                Debug
              </button>
            </div>
          </div>

          {/* ERROR MESSAGE */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <strong>Error:</strong> {errorMsg}
                  <div className="text-sm mt-1">
                    <button 
                      onClick={fetchSellers} 
                      className="text-red-700 hover:text-red-900 underline"
                    >
                      Coba lagi
                    </button>
                    • 
                    <button 
                      onClick={() => window.open('/api/admin/pending', '_blank')}
                      className="text-red-700 hover:text-red-900 underline ml-2"
                    >
                      Cek API
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LOADING */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--teal)] mb-4"></div>
              <span className="text-gray-600">Memuat data penjual...</span>
            </div>
          )}

          {/* LIST SELLER */}
          <div className="space-y-4">
            {!loading && sellers.length === 0 && !errorMsg && (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-2 text-lg font-medium text-gray-900">Tidak ada penjual menunggu verifikasi</p>
                <p className="text-gray-500">Semua penjual telah diverifikasi atau belum ada yang mendaftar</p>
                <button
                  onClick={fetchSellers}
                  className="mt-4 bg-[var(--teal)] hover:bg-[var(--navy)] text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Refresh Data
                </button>
              </div>
            )}

            {!loading && sellers.length > 0 && sellers.map((seller) => (
              <div
                key={seller.id}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:border-[var(--teal)]/30"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-[var(--navy)] mb-2">
                      {seller.store_name}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        {seller.pic_name}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        {seller.pic_phone}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        {seller.pic_email}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedSeller(seller)}
                    className="bg-[var(--teal)] hover:bg-[var(--navy)] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 min-w-[140px] justify-center"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Lihat Dokumen
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL DETAIL */}
      {selectedSeller && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--navy)]">Detail Dokumen Penjual</h2>
                  <p className="text-gray-600 mt-1">{selectedSeller.store_name}</p>
                </div>
                <button
                  onClick={() => setSelectedSeller(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Kolom 1: Informasi Toko */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2 text-[var(--teal)] flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                    </svg>
                    Informasi Toko
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="font-medium text-gray-700">Nama Toko:</label>
                      <p className="mt-1 text-gray-900">{getDisplayValue(selectedSeller.store_name)}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Deskripsi Singkat:</label>
                      <p className="mt-1 text-gray-900">{getDisplayValue(selectedSeller.description)}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Tanggal Daftar:</label>
                      <p className="mt-1 text-gray-900">
                        {new Date(selectedSeller.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Kolom 2: Informasi PIC */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2 text-[var(--teal)] flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    Informasi PIC
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="font-medium text-gray-700">Nama PIC:</label>
                      <p className="mt-1 text-gray-900">{getDisplayValue(selectedSeller.pic_name)}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">No Handphone PIC:</label>
                      <p className="mt-1 text-gray-900">{getDisplayValue(selectedSeller.pic_phone)}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Email PIC:</label>
                      <p className="mt-1 text-gray-900">{selectedSeller.pic_email}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">No. KTP PIC:</label>
                      <p className="mt-1 text-gray-900 font-mono">{getDisplayValue(selectedSeller.pic_ktp)}</p>
                    </div>
                  </div>
                </div>
                
                {/* Kolom 3: Alamat Lengkap PIC */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2 text-[var(--teal)] flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    Alamat Lengkap PIC
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="font-medium text-gray-700">Alamat (Nama Jalan):</label>
                      <p className="mt-1 text-gray-900">{getDisplayValue(selectedSeller.pic_address)}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-medium text-gray-700">RT:</label>
                        <p className="mt-1 text-gray-900">{getDisplayValue(selectedSeller.rt)}</p>
                      </div>
                      <div>
                        <label className="font-medium text-gray-700">RW:</label>
                        <p className="mt-1 text-gray-900">{getDisplayValue(selectedSeller.rw)}</p>
                      </div>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Kelurahan:</label>
                      <p className="mt-1 text-gray-900">{getDisplayValue(selectedSeller.kelurahan)}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Kecamatan:</label>
                      <p className="mt-1 text-gray-900">{getDisplayValue(selectedSeller.kecamatan)}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Kabupaten/Kota:</label>
                      <p className="mt-1 text-gray-900">{getDisplayValue(selectedSeller.city)}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Provinsi:</label>
                      <p className="mt-1 text-gray-900">{getDisplayValue(selectedSeller.province)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* DOKUMEN FOTO & FILE */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6 pt-6 border-t">
                <div className="text-center">
                  <h3 className="font-semibold text-lg mb-4 flex items-center justify-center gap-2 text-[var(--teal)]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Foto PIC
                  </h3>
                  <div className="relative">
                    <img
                      onClick={() => setZoomImage(selectedSeller.pic_photo_url)}
                      src={selectedSeller.pic_photo_url || "https://placehold.co/400x300/a8dadc/1d3557?text=Foto+Tidak+Tersedia"}
                      onError={(e) => { e.currentTarget.src = "https://placehold.co/400x300/a8dadc/1d3557?text=Foto+Gagal+Dimuat"; }}
                      className="w-full max-w-md h-64 object-cover border-2 border-gray-300 rounded-lg cursor-pointer hover:border-[var(--teal)] transition-all duration-200 mx-auto aspect-[4/3]"
                      alt="Foto PIC"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                        Klik untuk memperbesar
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="font-semibold text-lg mb-4 flex items-center justify-center gap-2 text-[var(--teal)]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    File Upload KTP PIC
                  </h3>
                  <div className="relative">
                    <img
                      onClick={() => setZoomImage(selectedSeller.pic_ktp_file_url)}
                      src={selectedSeller.pic_ktp_file_url || "https://placehold.co/400x300/a8dadc/1d3557?text=KTP+Tidak+Tersedia"}
                      onError={(e) => { e.currentTarget.src = "https://placehold.co/400x300/a8dadc/1d3557?text=KTP+Gagal+Dimuat"; }}
                      className="w-full max-w-md h-64 object-cover border-2 border-gray-300 rounded-lg cursor-pointer hover:border-[var(--teal)] transition-all duration-200 mx-auto aspect-[4/3]"
                      alt="Foto KTP"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                        Klik untuk memperbesar
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
                <button
                  onClick={() => setSelectedSeller(null)}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
                  disabled={processing}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Tutup
                </button>
                <button
                  onClick={() => handleVerify("rejected")}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={processing}
                >
                  {processing ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Tolak
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleVerify("accepted")}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={processing}
                >
                  {processing ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Verifikasi
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ZOOM IMAGE MODAL */}
      {zoomImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setZoomImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setZoomImage(null)}
              className="absolute -top-12 right-0 text-white text-2xl hover:text-gray-300 bg-black/50 rounded-full p-2 transition-colors"
            >
              × Tutup
            </button>
            <img
              src={zoomImage}
              className="max-w-full max-h-full rounded-lg shadow-2xl"
              alt="Dokumen diperbesar"
              onError={(e) => { e.currentTarget.src = "https://placehold.co/800x600/a8dadc/1d3557?text=Gambar+Tidak+Tersedia"; }}
            />
          </div>
        </div>
      )}
    </div>
  );
}