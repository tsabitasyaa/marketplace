"use client";

import { useState } from "react";
import { FiSettings } from "react-icons/fi";

export default function DashboardPage() {
  const [menu, setMenu] = useState("verifikasi");
  const [selectedSeller, setSelectedSeller] = useState<any>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const sellers = [
    {
      id: 1,
      name: "Rina Kusuma",
      toko: "RinaCraft",
      joined: "2025-11-01",
      hp: "081234567890",
      email: "rina@example.com",
      alamat: "Jl. Melati No. 10",
      rt: "05",
      rw: "03",
      kecamatan: "Tembalang",
      kota: "Semarang",
      provinsi: "Jawa Tengah",
      ktp: "1234567890123456",
      fotoPIC: "/dummy-pic.jpg",
      fotoKTP: "/dummy-ktp.jpg",
    },
    {
      id: 2,
      name: "Dewi Anggraini",
      toko: "Batik Lestari",
      joined: "2025-10-20",
      hp: "081299887755",
      email: "dewi@example.com",
      alamat: "Jl. Kenanga No. 22",
      rt: "02",
      rw: "01",
      kecamatan: "Banyumanik",
      kota: "Semarang",
      provinsi: "Jawa Tengah",
      ktp: "9876543210123456",
      fotoPIC: "/dummy-pic2.jpg",
      fotoKTP: "/dummy-ktp2.jpg",
    },
    {
      id: 3,
      name: "Budi Prasetyo",
      toko: "Kopi Nusantara",
      joined: "2025-09-15",
      hp: "082134567890",
      email: "budi@example.com",
      alamat: "Jl. Pandan No. 7",
      rt: "03",
      rw: "02",
      kecamatan: "Gunungpati",
      kota: "Semarang",
      provinsi: "Jawa Tengah",
      ktp: "5566778899001122",
      fotoPIC: "/dummy-pic3.jpg",
      fotoKTP: "/dummy-ktp3.jpg",
    },
  ];

  const renderContent = () => {
    // -----------------------------------------------------
    // VERIFIKASI PENJUAL
    // -----------------------------------------------------
    if (menu === "verifikasi") {
      return (
        <div>
          <h2 className="text-xl font-semibold mb-6">Verifikasi Penjual</h2>

          {!selectedSeller && (
            <div className="grid gap-4">
              {sellers.map((s) => (
                <div
                  key={s.id}
                  className="p-4 rounded-lg shadow border bg-[var(--color-sky-blue)]"
                >
                  <p className="font-bold">{s.toko}</p>
                  <p>{s.name}</p>
                  <p className="text-xs text-gray-600">Joined {s.joined}</p>
                  <button
                    className="mt-3 px-3 py-1 rounded bg-[var(--color-navy)] text-white"
                    onClick={() => setSelectedSeller(s)}
                  >
                    View Document
                  </button>
                </div>
              ))}
            </div>
          )}

          {selectedSeller && (
            <div className="p-6 mt-4 border rounded-xl bg-white shadow-lg">
              <h2 className="text-xl font-bold mb-4">Detail Dokumen Penjual</h2>

              <div className="space-y-1">
                <p><b>Nama Toko:</b> {selectedSeller.toko}</p>
                <p><b>Nama PIC:</b> {selectedSeller.name}</p>
                <p><b>No HP:</b> {selectedSeller.hp}</p>
                <p><b>Email:</b> {selectedSeller.email}</p>
                <p><b>Alamat:</b> {selectedSeller.alamat}</p>
                <p><b>RT/RW:</b> {selectedSeller.rt}/{selectedSeller.rw}</p>
                <p><b>Kecamatan:</b> {selectedSeller.kecamatan}</p>
                <p><b>Kota:</b> {selectedSeller.kota}</p>
                <p><b>Provinsi:</b> {selectedSeller.provinsi}</p>
                <p><b>No KTP:</b> {selectedSeller.ktp}</p>
              </div>

              <p className="font-semibold mt-4">Foto PIC:</p>
              <img
                src={selectedSeller.fotoPIC}
                className="w-full max-w-sm rounded-md shadow cursor-pointer"
                onClick={() => setPreview(selectedSeller.fotoPIC)}
              />

              <p className="font-semibold mt-6">Foto KTP:</p>
              <img
                src={selectedSeller.fotoKTP}
                className="w-full max-w-sm rounded-md shadow cursor-pointer"
                onClick={() => setPreview(selectedSeller.fotoKTP)}
              />

              <div className="flex justify-end gap-3 mt-6">
                <button className="px-4 py-2 bg-red-600 text-white rounded-md">Tolak</button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-md">Verifikasi</button>
                <button
                  className="px-4 py-2 border rounded-md"
                  onClick={() => setSelectedSeller(null)}
                >
                  Kembali
                </button>
              </div>
            </div>
          )}

          {preview && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
              <img
                src={preview}
                className="max-w-[90%] max-h-[90%] rounded-lg shadow-xl"
              />
              <button
                className="absolute top-5 right-5 text-white text-xl px-3 py-1 bg-black bg-opacity-40 rounded-full"
                onClick={() => setPreview(null)}
              >
                ✕
              </button>
            </div>
          )}
        </div>
      );
    }

    // -----------------------------------------------------
    // STATISTICS
    // -----------------------------------------------------
    if (menu === "statistics") {
      return (
        <div>
          <h2 className="text-xl font-semibold mb-3">Statistics</h2>
          <p className="text-gray-600">Grafik dan data statistik akan ditambahkan di sini.</p>
        </div>
      );
    }

    // -----------------------------------------------------
    // LAPORAN
    // -----------------------------------------------------
    if (menu === "laporan") {
      return (
        <div>
          <h2 className="text-xl font-semibold mb-3">Laporan</h2>
          <p className="text-gray-600">Halaman untuk laporan penjual.</p>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col min-h-screen">

      {/* -------------------------------------------------- */}
      {/* HEADER */}
      {/* -------------------------------------------------- */}
      <header className="w-full bg-teal-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <img
            src="/Loopy Logo.jpg"
            className="w-10 h-10 object-contain rounded"
            alt="Logo"
          />
          <span className="font-semibold text-lg">Loopy Logo.jpg</span>
        </div>

        <FiSettings size={26} className="cursor-pointer hover:opacity-80" />
      </header>

      <div className="flex flex-1">

        {/* -------------------------------------------------- */}
        {/* SIDEBAR */}
        {/* -------------------------------------------------- */}
        <aside className="w-64 bg-[#f5f5dc] p-4 border-r space-y-2">

          <button
            onClick={() => setMenu("verifikasi")}
            className={`w-full text-left p-2 rounded ${
              menu === "verifikasi" ? "bg-gray-300" : ""
            }`}
          >
            Verifikasi Penjual
          </button>

          <button
            onClick={() => setMenu("statistics")}
            className={`w-full text-left p-2 rounded ${
              menu === "statistics" ? "bg-gray-300" : ""
            }`}
          >
            Statistik
          </button>

          <button
            onClick={() => setMenu("laporan")}
            className={`w-full text-left p-2 rounded ${
              menu === "laporan" ? "bg-gray-300" : ""
            }`}
          >
            Laporan
          </button>
        </aside>

        {/* -------------------------------------------------- */}
        {/* CONTENT */}
        {/* -------------------------------------------------- */}
        <main className="flex-1 p-6">{renderContent()}</main>
      </div>
    </div>
  );
}
