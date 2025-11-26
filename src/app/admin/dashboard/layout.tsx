"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menu = [
    { label: "Verifikasi Penjual", href: "/admin/dashboard/verifikasi" },
    { label: "Statistik", href: "/admin/dashboard/statistics" },
    { label: "Laporan", href: "/admin/dashboard/laporan" },
];


  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        "--navy": "#2F4156",
        "--teal": "#567C8D",
        "--sky": "#C8D9E6",
        "--beige": "#F5EFEB",
        "--white": "#FFFFFF",
      } as React.CSSProperties}
    >
      {/* HEADER */}
      <header className="bg-[var(--teal)] p-4 flex items-center gap-4">
        <img src="/Loopy Logo.jpg" alt="Loopy Logo" className="w-12 h-12 object-cover" />
        <h1 className="text-xl font-bold text-white">Loopy Admin Dashboard</h1>
      </header>

      <div className="flex flex-1">
        {/* SIDEBAR */}
        <aside className="w-60 bg-[var(--beige)] p-6 flex flex-col gap-6 border-r border-[var(--navy)] text-[var(--navy)] font-semibold">
          {menu.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-full transition ${
                  active
                    ? "bg-[var(--teal)] text-white"
                    : "hover:bg-[var(--sky)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-8 bg-white">{children}</main>
      </div>
    </div>
  );
}
