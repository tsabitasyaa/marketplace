"use client";

import { useState } from "react";

export default function LaporanPage() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const data = [
    { id: 1, seller: "Toko A", status: "Aktif", tanggal: "2025-11-20" },
    { id: 2, seller: "Toko B", status: "Tidak Aktif", tanggal: "2025-11-18" },
    { id: 3, seller: "Toko C", status: "Aktif", tanggal: "2025-11-19" },
  ];

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-[var(--color-navy)]">Laporan</h1>

      {/* Filters */}
      <div className="flex gap-4 items-end">
        <div>
          <p className="text-sm">Tanggal Mulai</p>
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="border p-2 rounded-lg"
          />
        </div>

        <div>
          <p className="text-sm">Tanggal Akhir</p>
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="border p-2 rounded-lg"
          />
        </div>

        <button className="px-4 py-2 bg-[var(--color-teal)] text-white font-semibold rounded-lg hover:opacity-80">
          Generate PDF
        </button>
      </div>

      {/* Table */}
      <table className="w-full border rounded-xl overflow-hidden">
        <thead className="bg-[var(--color-sky-blue)] text-[var(--color-navy)]">
          <tr>
            <th className="p-3 text-left">Seller</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Tanggal</th>
          </tr>
        </thead>

        <tbody>
          {data.map((d) => (
            <tr key={d.id} className="border-b">
              <td className="p-3">{d.seller}</td>
              <td className="p-3">{d.status}</td>
              <td className="p-3">{d.tanggal}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
