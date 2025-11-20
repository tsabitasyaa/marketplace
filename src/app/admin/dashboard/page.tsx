"use client";

import React, { useState } from "react";
import Statistik from "./statistics";

// Import halaman lain
import Verifikasi from "./verifikasi";
import Laporan from "./laporan";

/* ======================================================================
   MAIN PAGE
====================================================================== */
export default function AdminPage() {
  const [tab, setTab] = useState<"verifikasi" | "statistik" | "laporan">(
    "verifikasi"
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* HEADER */}
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
          style={{ background: "var(--color-white)", color: "var(--color-navy)" }}
        >
          Settings
        </button>
      </header>

      {/* BODY */}
      <div className="flex flex-1">
        {/* SIDEBAR */}
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
        <main className="flex-1 p-8 bg-[var(--color-white)] overflow-y-auto">
          {tab === "verifikasi" && <Verifikasi />}
          {tab === "statistik" && <Statistik />}
          {tab === "laporan" && <Laporan />}
        </main>
      </div>
    </div>
  );
}

/* ======================================================================
   SIDEBAR ITEM
====================================================================== */
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
      className={`w-full text-left px-4 py-2 rounded-md ${
        active ? "bg-[var(--color-navy)] text-white" : "hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );
}
