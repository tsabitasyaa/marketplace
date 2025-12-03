"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Pertama, cek role user di database
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("email", email)
        .single();

      if (userError || !userData) {
        setError("Email atau password salah");
        setLoading(false);
        return;
      }

      // Pastikan user adalah penjual
      if (userData.role !== "seller" && userData.role !== "penjual") {
        setError("Hanya penjual yang dapat login di sini");
        setLoading(false);
        return;
      }

      // Login dengan Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        // Redirect ke dashboard penjual
        alert("Login berhasil!");
        router.push("/penjual/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-beige flex items-center justify-center px-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md border border-teal">
        <h2 className="text-2xl font-bold text-navy text-center mb-6">
          Login Penjual
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="text-navy font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-sky-blue bg-sky-blue/30 text-navy outline-none focus:border-teal"
              placeholder="Masukkan email Anda"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="text-navy font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-sky-blue bg-sky-blue/30 text-navy outline-none focus:border-teal"
              placeholder="Masukkan password Anda"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full bg-teal text-white py-2 rounded-lg font-semibold hover:bg-navy transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Memproses..." : "Login"}
          </button>
        </form>

        <p className="text-center text-navy mt-4">
          Belum punya akun?{" "}
          <Link 
            href="/penjual/registrasi" 
            className="text-teal font-semibold hover:underline"
          >
            Register dulu
          </Link>
        </p>
      </div>
    </div>
  );
}