"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

export default function StatisticsPage() {
  const salesData = [
    { month: "Jan", total: 120 },
    { month: "Feb", total: 200 },
    { month: "Mar", total: 150 },
    { month: "Apr", total: 220 },
    { month: "May", total: 300 },
  ];

  const verificationData = [
    { name: "Diterima", value: 80 },
    { name: "Ditolak", value: 15 },
    { name: "Pending", value: 30 },
  ];

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-[var(--color-navy)]">Statistik</h1>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 border rounded-xl bg-[var(--color-beige)]">
          <p className="text-gray-500 text-sm">Total Seller</p>
          <p className="text-2xl font-bold">125</p>
        </div>

        <div className="p-5 border rounded-xl bg-[var(--color-beige)]">
          <p className="text-gray-500 text-sm">Menunggu Verifikasi</p>
          <p className="text-2xl font-bold">12</p>
        </div>

        <div className="p-5 border rounded-xl bg-[var(--color-beige)]">
          <p className="text-gray-500 text-sm">Ditolak</p>
          <p className="text-2xl font-bold">5</p>
        </div>
      </div>

      {/* Grafik Line */}
      <div className="p-5 border rounded-xl bg-white h-80">
        <h2 className="text-lg font-semibold mb-4">Pertumbuhan Seller</h2>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#567C8D" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Grafik Bar */}
      <div className="p-5 border rounded-xl bg-white h-80">
        <h2 className="text-lg font-semibold mb-4">Status Verifikasi</h2>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={verificationData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#2F4156" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
