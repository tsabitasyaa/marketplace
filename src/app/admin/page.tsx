// src/app/admin/page.tsx
"use client";

import React, { useState } from "react";

export default function AdminLoginPage() {
  const colorPalette = {
    "--navy": "#2F4156",
    "--teal": "#567C8D",
    "--sky": "#C8D9E6",
    "--beige": "#F5EFEB",
    "--white": "#FFFFFF",
  } as React.CSSProperties;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Email dan Kata Sandi wajib diisi.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Format Email tidak valid.");
      return;
    }

    if (password.length < 6) {
      setError("Kata Sandi minimal 6 karakter.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // ⭐ WAJIB untuk menerima cookie adminToken
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login Success:", data.message);

        // Redirect ke dashboard sesuai permintaan
        window.location.href = "/admin/dashboard";

      } else {
        setError(data.message || "Login gagal. Silakan coba lagi.");
      }
    } catch (err) {
      console.error("Network or Server Error:", err);
      setError("Terjadi kesalahan jaringan atau server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: colorPalette["--beige"] }}
    >
      <div
        className="bg-white p-8 rounded-lg shadow-xl w-80 border-t-4 border-[var(--teal)]"
        style={{ ...colorPalette, borderTopColor: colorPalette["--teal"] }}
      >
        <h1
          className="text-2xl font-extrabold mb-6 text-center"
          style={{ color: colorPalette["--navy"] }}
        >
          Loopy Admin Login
        </h1>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm text-center font-medium">
              {error}
            </div>
          )}

          <input
            type="email"
            placeholder="Email Admin"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="border p-3 rounded-md focus:outline-none focus:ring-2 transition duration-200"
            style={{
              borderColor: colorPalette["--sky"],
              "--tw-ring-color": colorPalette["--teal"],
            } as React.CSSProperties}
          />

          <input
            type="password"
            placeholder="Kata Sandi"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="border p-3 rounded-md focus:outline-none focus:ring-2 transition duration-200"
            style={{
              borderColor: colorPalette["--sky"],
              "--tw-ring-color": colorPalette["--teal"],
            } as React.CSSProperties}
          />

          <button
            type="submit"
            disabled={loading}
            className={`py-3 rounded-md font-semibold transition duration-200 mt-2 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "hover:opacity-90 active:scale-[0.98]"
            }`}
            style={{
              backgroundColor: loading
                ? "#ccc"
                : colorPalette["--teal"],
              color: colorPalette["--white"],
            }}
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="text-xs text-center mt-6 text-gray-500">
          <span style={{ color: colorPalette["--navy"] }}>
            &copy; Loopy 2025
          </span>
        </p>
      </div>
    </div>
  );
}
