"use client";

import React, { useEffect, useState } from "react";

export default function VerifikasiPage() {
  const [sellers, setSellers] = useState<any[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<any>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // ======================
  // FETCH DATA PENJUAL
  // ======================
  async function fetchSellers() {
    try {
      setLoading(true);
      setErrorMsg("");

      const res = await fetch("/api/penjual/pending");
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json = await res.json();
      console.log("API /penjual/pending =>", json);

      if (!json.success) {
        setErrorMsg(json.message || "Gagal memuat data");
        setSellers([]);
      } else {
        setSellers(json.data || []);
      }

    } catch (err: any) {
      console.error("Fetch error:", err);
      setErrorMsg(err.message || "Terjadi kesalahan koneksi ke server");
      setSellers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSellers();
  }, []);

  // ======================
  // HANDLER VERIFIKASI
  // ======================
  async function handleVerify(status: "accepted" | "rejected") {
    if (!selectedSeller) return;

    try {
      const res = await fetch("/api/sellers/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seller_id: selectedSeller.id,
          status,
        }),
      });

      const json = await res.json();
      console.log("API /verify =>", json);

      if (!json.success) {
        alert(json.message || "Gagal memproses verifikasi");
        return;
      }

      alert(`Penjual berhasil di${status === 'accepted' ? 'verifikasi' : 'tolak'}`);
      await fetchSellers();
      setSelectedSeller(null);

    } catch (err) {
      console.error(err);
      alert("Terjadi error saat memproses verifikasi");
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-[var(--navy)] font-bold text-2xl mb-6">
        Verifikasi Penjual
      </h2>

      {/* ERROR MESSAGE */}
      {errorMsg && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errorMsg}
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--teal)]"></div>
          <span className="ml-2">Memuat data...</span>
        </div>
      )}

      {/* LIST SELLER */}
      <div className="grid gap-4">
        {!loading && sellers.length === 0 && !errorMsg && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg">Tidak ada penjual menunggu verifikasi.</p>
          </div>
        )}

        {sellers.map((seller) => (
          <div
            key={seller.id}
            className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <h3 className="font-bold text-xl text-[var(--navy)] mb-2">
                  {seller.store_name}
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <p><strong>PIC:</strong> {seller.pic_name}</p>
                  <p><strong>Telepon:</strong> {seller.pic_phone}</p>
                  <p><strong>Email:</strong> {seller.pic_email}</p>
                  <p><strong>Lokasi:</strong> {seller.city}, {seller.province}</p>
                </div>
                {seller.description && (
                  <p className="mt-2 text-gray-700"><strong>Deskripsi:</strong> {seller.description}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Didaftarkan pada: {new Date(seller.created_at).toLocaleDateString('id-ID')}
                </p>
              </div>

              <button
                onClick={() => setSelectedSeller(seller)}
                className="bg-[var(--teal)] hover:bg-[var(--navy)] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Lihat Dokumen
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DETAIL */}
      {selectedSeller && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[var(--navy)]">
                  Detail Dokumen Penjual
                </h2>
                <button
                  onClick={() => setSelectedSeller(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* INFO PENJUAL */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg border-b pb-2">Informasi Toko</h3>
                  <p><strong>Nama Toko:</strong> {selectedSeller.store_name}</p>
                  <p><strong>Deskripsi:</strong> {selectedSeller.description || "-"}</p>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg border-b pb-2">Informasi PIC</h3>
                  <p><strong>Nama PIC:</strong> {selectedSeller.pic_name}</p>
                  <p><strong>No HP:</strong> {selectedSeller.pic_phone}</p>
                  <p><strong>Email:</strong> {selectedSeller.pic_email}</p>
                  <p><strong>Alamat:</strong> {selectedSeller.pic_address || "-"}</p>
                  <p><strong>KTP:</strong> {selectedSeller.pic_ktp || "-"}</p>
                </div>
              </div>

              {/* DOKUMEN */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="text-center">
                  <h3 className="font-semibold mb-3">Foto PIC</h3>
                  <img
                    onClick={() => setZoomImage(selectedSeller.pic_photo_url)}
                    src={selectedSeller.pic_photo_url}
                    className="w-48 h-48 object-cover border-2 border-gray-300 rounded-lg cursor-pointer hover:border-[var(--teal)] transition-colors mx-auto"
                    alt="Foto PIC"
                  />
                  <p className="text-sm text-gray-500 mt-2">Klik untuk zoom</p>
                </div>

                <div className="text-center">
                  <h3 className="font-semibold mb-3">Foto KTP</h3>
                  <img
                    onClick={() => setZoomImage(selectedSeller.pic_ktp_file_url)}
                    src={selectedSeller.pic_ktp_file_url}
                    className="w-48 h-48 object-cover border-2 border-gray-300 rounded-lg cursor-pointer hover:border-[var(--teal)] transition-colors mx-auto"
                    alt="Foto KTP"
                  />
                  <p className="text-sm text-gray-500 mt-2">Klik untuk zoom</p>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => setSelectedSeller(null)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Tutup
                </button>
                <button
                  onClick={() => handleVerify("rejected")}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Tolak
                </button>
                <button
                  onClick={() => handleVerify("accepted")}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Verifikasi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ZOOM IMAGE */}
      {zoomImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setZoomImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setZoomImage(null)}
              className="absolute -top-12 right-0 text-white text-2xl hover:text-gray-300"
            >
              × Tutup
            </button>
            <img
              src={zoomImage}
              className="max-w-full max-h-full rounded-lg"
              alt="Zoom"
            />
          </div>
        </div>
      )}
    </div>
  );
}