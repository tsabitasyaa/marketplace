"use client";

import { useState } from "react";
import Link from "next/link";

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Login berhasil (dummy)");
  };

  return (
    <div className="min-h-screen bg-beige flex items-center justify-center px-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md border border-teal">
        <h2 className="text-2xl font-bold text-navy text-center mb-6">
          Login Penjual
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-navy font-medium">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-sky-blue bg-sky-blue/30 text-navy outline-none focus:border-teal"
            />
          </div>

          <div>
            <label className="text-navy font-medium">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-sky-blue bg-sky-blue/30 text-navy outline-none focus:border-teal"
            />
          </div>

          <button
            type="submit"
            className="mt-4 w-full bg-teal text-white py-2 rounded-lg font-semibold hover:bg-navy transition"
          >
            Login
          </button>
        </form>

        <p className="text-center text-navy mt-4">
          Belum punya akun?{" "}
          <Link href="/penjual/registrasi" className="text-teal font-semibold hover:underline">
            Register dulu
          </Link>
        </p>
      </div>
    </div>
  );
}