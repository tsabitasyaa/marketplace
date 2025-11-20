"use client";

import React, { useState } from "react";

export default function Verifikasi() {
  const [selectedSeller, setSelectedSeller] = useState<any>(null);

  const sellers = [
    {
      id: 1,
      name: "Rina",
      shop: "RinaCraft",
      joined: "2025-11-01",
      data: {
        namaToko: "RinaCraft",
        deskripsi: "Kerajinan tangan dari bahan daur ulang",
        namaPIC: "Rina Kusuma",
        noHP: "081234567890",
        email: "rina@gmail.com",
        alamat: "Jl. Melati No. 12",
        rt: "05",
        rw: "03",
        kelurahan: "Tembalang",
        kota: "Semarang",
        provinsi: "Jawa Tengah",
        noktp: "1234567890123456",
        fotoPIC:
          "https://via.placeholder.com/120x140.png?text=Foto+PIC",
        ktpPIC:
          "https://via.placeholder.com/200x120.png?text=KTP+PIC",
      },
    },
    {
      id: 2,
      name: "Alya",
      shop: "AlyaFashion",
      joined: "2025-11-10",
      data: {
        namaToko: "AlyaFashion",
        deskripsi: "Fashion wanita muslimah",
        namaPIC: "Alya Rahma",
        noHP: "089876543210",
        email: "alya@gmail.com",
        alamat: "Jl. Kenanga No. 21",
        rt: "04",
        rw: "02",
        kelurahan: "Pedurungan",
        kota: "Semarang",
        provinsi: "Jawa Tengah",
        noktp: "6543210987654321",
        fotoPIC:
          "https://via.placeholder.com/120x140.png?text=Foto+PIC",
        ktpPIC:
          "https://via.placeholder.com/200x120.png?text=KTP+PIC",
      },
    },
  ];

  return (
    <div>
      <h2
        className="text-xl font-semibold mb-6"
        style={{ color: "var(--color-navy)" }}
      >
        Verifikasi Penjual
      </h2>

      <div className="grid gap-4">
        {sellers.map((s) => (
          <div
            key={s.id}
            className="p-4 rounded-lg shadow border"
            style={{ background: "var(--color-sky-blue)" }}
          >
            <p className="font-bold">{s.name}</p>
            <p className="text-sm">{s.shop}</p>
            <p className="text-xs text-gray-600">Joined {s.joined}</p>

            <button
              onClick={() => setSelectedSeller(s)}
              className="mt-4 px-4 py-2 rounded bg-[var(--color-navy)] text-white"
            >
              View Document
            </button>
          </div>
        ))}
      </div>

      {selectedSeller && (
        <SellerDetailModal
          seller={selectedSeller}
          close={() => setSelectedSeller(null)}
        />
      )}
    </div>
  );
}

/* ---------------------- MODAL --------------------------- */

function SellerDetailModal({
  seller,
  close,
}: {
  seller: any;
  close: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[600px] p-6 max-h-[85vh] overflow-y-auto">

        <h3 className="text-lg font-bold mb-4 text-[var(--color-navy)]">
          Detail Dokumen Penjual
        </h3>

        <div className="space-y-2 text-sm">
          <p><strong>Nama Toko:</strong> {seller.data.namaToko}</p>
          <p><strong>Deskripsi Singkat:</strong> {seller.data.deskripsi}</p>
          <p><strong>Nama PIC:</strong> {seller.data.namaPIC}</p>
          <p><strong>No HP:</strong> {seller.data.noHP}</p>
          <p><strong>Email:</strong> {seller.data.email}</p>
          <p><strong>Alamat:</strong> {seller.data.alamat}</p>
          <p><strong>RT/RW:</strong> {seller.data.rt}/{seller.data.rw}</p>
          <p><strong>Kelurahan:</strong> {seller.data.kelurahan}</p>
          <p><strong>Kota/Kabupaten:</strong> {seller.data.kota}</p>
          <p><strong>Provinsi:</strong> {seller.data.provinsi}</p>
          <p><strong>No. KTP PIC:</strong> {seller.data.noktp}</p>

          <div className="mt-4">
            <p className="font-semibold">Foto PIC:</p>
            <img
              src={seller.data.fotoPIC}
              className="w-32 h-40 rounded-md object-cover border"
            />
          </div>

          <div className="mt-4">
            <p className="font-semibold">Foto KTP PIC:</p>
            <img
              src={seller.data.ktpPIC}
              className="w-52 h-auto rounded-md object-cover border"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            className="px-4 py-2 rounded bg-red-600 text-white"
          >
            Tolak
          </button>
          <button className="px-4 py-2 rounded bg-green-600 text-white">
            Verifikasi
          </button>
          <button
            onClick={close}
            className="px-4 py-2 rounded border border-gray-500"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
