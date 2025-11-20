"use client";

import React, { useState } from "react";

export default function AdminPage() {
  const [tab, setTab] = useState<"verifikasi" | "statistik" | "laporan">(
    "verifikasi"
  );

  return (
    <div className="min-h-screen flex flex-col">

      {/* HEADER (warna navy) */}
      <header
        className="w-full py-4 px-6 shadow flex items-center justify-between"
        style={{ background: "var(--color-teal)", color: "var(--color-white)" }}
      >
        <div className="flex items-center gap-3">
          <img
            src="/Loopy Logo.jpg"
            alt="Loopy"
            className="h-10 w-10 object-cover rounded-md"
          />
          <h1 className="text-xl font-semibold">Loopy Admin Dashboard</h1>
        </div>

        <button
          className="px-4 py-2 rounded-md"
          style={{
            background: "var(--color-white)",
            color: "var(--color-navy)",
          }}
        >
          Settings
        </button>
      </header>

      {/* BODY */}
      <div className="flex flex-1">

        {/* SIDEBAR (warna beige) */}
        <aside
          className="w-60 p-6 space-y-4 shadow-md"
          style={{ background: "var(--color-beige)", color: "var(--color-navy)" }}
        >
          <h2 className="font-bold text-lg mb-4">Menu</h2>

          <SidebarItem
            label="Verifikasi Penjual"
            active={tab === "verifikasi"}
            onClick={() => setTab("verifikasi")}
          />

          <SidebarItem
            label="Statistik"
            active={tab === "statistik"}
            onClick={() => setTab("statistik")}
          />

          <SidebarItem
            label="Laporan"
            active={tab === "laporan"}
            onClick={() => setTab("laporan")}
          />
        </aside>

        {/* CONTENT */}
        <main className="flex-1 p-8 bg-[var(--color-white)] overflow-y-auto custom-scrollbar">
          {tab === "verifikasi" && <Verifikasi />}
          {tab === "statistik" && <Statistik />}
          {tab === "laporan" && <Laporan />}
        </main>

      </div>
    </div>
  );
}

/* --------------------------------------------------------------
   Sidebar Component
-------------------------------------------------------------- */

function SidebarItem({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-2 rounded-md font-medium transition"
      style={{
        background: active ? "var(--color-teal)" : "transparent",
        color: active ? "white" : "var(--color-navy)",
      }}
    >
      {label}
    </button>
  );
}

/* --------------------------------------------------------------
   CONTENT SECTION
-------------------------------------------------------------- */

// ---------------- Verifikasi ----------------

function Verifikasi() {
  const sellers = [
    { id: 1, name: "Rina", shop: "RinaCraft", joined: "2025-11-01" },
    { id: 2, name: "Alya", shop: "AlyaFashion", joined: "2025-11-10" },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6" style={{ color: "var(--color-navy)" }}>
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

            <div className="flex gap-2 mt-3">
              <button
                className="px-3 py-1 rounded bg-[var(--color-navy)] text-white"
              >
                Verifikasi
              </button>
              <button className="px-3 py-1 rounded border border-[var(--color-navy)] text-[var(--color-navy)]">
                Tolak
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------- Statistik ----------------

function Statistik() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--color-navy)" }}>
        Statistik
      </h2>

      <p className="text-gray-700">📊 Grafik dan data statistik akan ditambahkan di sini.</p>
    </div>
  );
}

// ---------------- Laporan ----------------

function Laporan() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--color-navy)" }}>
        Laporan
      </h2>

      <p className="text-gray-700">📝 Data laporan masuk dan tombol aksi.</p>
    </div>
  );
}
