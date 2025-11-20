"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Statistic() {
  // ----- Dummy data pendapatan -----
  const revenueData = [
    { month: "Jan", revenue: 3200000 },
    { month: "Feb", revenue: 4100000 },
    { month: "Mar", revenue: 3800000 },
    { month: "Apr", revenue: 5200000 },
    { month: "May", revenue: 6100000 },
    { month: "Jun", revenue: 7500000 },
  ];

  // ----- Dummy data kategori -----
  const categoryData = [
    { name: "Makanan", value: 45 },
    { name: "Minuman", value: 25 },
    { name: "Kerajinan", value: 15 },
    { name: "Fashion", value: 15 },
  ];

  const COLORS = ["#1d4ed8", "#9333ea", "#15803d", "#dc2626"];

  // ----- Dummy data transaksi -----
  const recentTransactions = [
    {
      id: 1,
      buyer: "Aulia",
      product: "Boba Brown Sugar",
      amount: "Rp 23.000",
      date: "20 Nov 2025",
    },
    {
      id: 2,
      buyer: "Rizky",
      product: "Keripik Pedas Level 5",
      amount: "Rp 18.000",
      date: "20 Nov 2025",
    },
    {
      id: 3,
      buyer: "Nadia",
      product: "Es Matcha Latte",
      amount: "Rp 25.000",
      date: "19 Nov 2025",
    },
    {
      id: 4,
      buyer: "Dimas",
      product: "Tas Rajut Handmade",
      amount: "Rp 80.000",
      date: "19 Nov 2025",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* ====================== TOP STATS CARD ====================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Penjual</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">3 Penjual</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Produk</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">28 Produk</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Order</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">142 Order</CardContent>
        </Card>
      </div>

      {/* ====================== CHART SECTION ====================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LINE CHART */}
        <Card>
          <CardHeader>
            <CardTitle>Grafik Pendapatan (6 Bulan)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1d4ed8"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* PIE CHART */}
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Kategori Produk</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={110}
                  label
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ====================== TABLE TRANSAKSI ====================== */}
      <Card>
        <CardHeader>
          <CardTitle>Transaksi Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Pembeli</th>
                <th>Produk</th>
                <th>Nominal</th>
                <th>Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((trx) => (
                <tr key={trx.id} className="border-b">
                  <td className="py-2">{trx.buyer}</td>
                  <td>{trx.product}</td>
                  <td>{trx.amount}</td>
                  <td>{trx.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
