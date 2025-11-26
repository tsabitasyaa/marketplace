"use client";

import React, { useState } from "react";

export default function VerifikasiPage() {
  const [selectedSeller, setSelectedSeller] = useState<any>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // === 3 TOKO ===
  const sellers = [
    {
      id: 1,
      namaToko: "RinaCraft",
      deskripsi: "Kerajinan eco-friendly",
      picName: "Rina Kusuma",
      hp: "081234567890",
      email: "rina@example.com",
      alamat: "Jl. Melati No. 10",
      rt_rw: "05/03",
      kelurahan: "Tembalang",
      kota: "Semarang",
      provinsi: "Jawa Tengah",
      ktp: "1234567890123456",
      fotoPIC: "/pic-rina.jpg",
      fotoKTP: "/ktp-rina.jpg",
    },
    {
      id: 2,
      namaToko: "BatikLestari",
      deskripsi: "Produk batik handmade",
      picName: "Siti Marlina",
      hp: "082233445566",
      email: "marlina@example.com",
      alamat: "Jl. Kenanga No. 22",
      rt_rw: "03/02",
      kelurahan: "Pedurungan",
      kota: "Semarang",
      provinsi: "Jawa Tengah",
      ktp: "9876543210123456",
      fotoPIC: "/pic-siti.jpg",
      fotoKTP: "/ktp-siti.jpg",
    },
    {
      id: 3,
      namaToko: "KopiNusantara",
      deskripsi: "Kopi asli Nusantara",
      picName: "Agus Pratama",
      hp: "081998877665",
      email: "agus@example.com",
      alamat: "Jl. Anggrek No. 8",
      rt_rw: "07/04",
      kelurahan: "Gajahmungkur",
      kota: "Semarang",
      provinsi: "Jawa Tengah",
      ktp: "1122334455667788",
      fotoPIC: "/pic-agus.jpg",
      fotoKTP: "/ktp-agus.jpg",
    },
  ];

  return (
    <>
      <h2 className="text-[var(--navy)] font-bold text-xl mb-4">
        Verifikasi Penjual
      </h2>

      {/* LIST SELLER */}
      <div className="flex flex-col gap-6">
        {sellers.map((seller) => (
          <div
            key={seller.id}
            className="bg-[var(--sky)] p-6 rounded-xl shadow flex justify-between items-center"
          >
            <div>
              <h3 className="font-bold text-lg">{seller.namaToko}</h3>
              <p className="text-sm">{seller.picName}</p>
            </div>

            <button
              onClick={() => setSelectedSeller(seller)}
              className="bg-[var(--teal)] hover:bg-[var(--navy)] text-white px-4 py-2 rounded-full"
            >
              View Document
            </button>
          </div>
        ))}
      </div>

      {/* MODAL DETAIL */}
      {selectedSeller && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-xl w-full max-w-3xl p-8 shadow-lg overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold mb-4 text-[var(--navy)]">
              Detail Dokumen Penjual
            </h2>

            <div className="space-y-2 text-[var(--navy)]">
              <p><strong>Nama Toko:</strong> {selectedSeller.namaToko}</p>
              <p><strong>Deskripsi:</strong> {selectedSeller.deskripsi}</p>
              <p><strong>Nama PIC:</strong> {selectedSeller.picName}</p>
              <p><strong>No HP:</strong> {selectedSeller.hp}</p>
              <p><strong>Email:</strong> {selectedSeller.email}</p>

              <p><strong>Alamat:</strong> {selectedSeller.alamat}</p>
              <p><strong>RT/RW:</strong> {selectedSeller.rt_rw}</p>
              <p><strong>Kelurahan:</strong> {selectedSeller.kelurahan}</p>
              <p><strong>Kota:</strong> {selectedSeller.kota}</p>
              <p><strong>Provinsi:</strong> {selectedSeller.provinsi}</p>

              <p><strong>No KTP:</strong> {selectedSeller.ktp}</p>

              {/* FOTO-FOTO */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="font-semibold">Foto PIC</p>
                  <img
                    onClick={() => setZoomImage(selectedSeller.fotoPIC)}
                    src={selectedSeller.fotoPIC}
                    className="w-40 h-40 object-cover border rounded cursor-pointer hover:scale-105 transition"
                  />
                </div>

                <div>
                  <p className="font-semibold">Foto KTP</p>
                  <img
                    onClick={() => setZoomImage(selectedSeller.fotoKTP)}
                    src={selectedSeller.fotoKTP}
                    className="w-40 h-40 object-cover border rounded cursor-pointer hover:scale-105 transition"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button className="bg-red-500 text-white px-6 py-2 rounded-lg">
                Tolak
              </button>
              <button className="bg-green-600 text-white px-6 py-2 rounded-lg">
                Verifikasi
              </button>
              <button
                onClick={() => setSelectedSeller(null)}
                className="border border-[var(--navy)] px-6 py-2 rounded-lg"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ZOOM MODAL */}
      {zoomImage && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          onClick={() => setZoomImage(null)}
        >
          <img
            src={zoomImage}
            className="max-w-[90%] max-h-[90%] rounded-lg border-4 border-white"
          />
        </div>
      )}
    </>
  );
}
