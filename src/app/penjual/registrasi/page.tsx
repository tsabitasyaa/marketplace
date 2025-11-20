"use client";

import { useState } from "react";

export default function RegistrasiPage() {
  const [form, setForm] = useState({
    namaToko: "",
    deskripsi: "",
    namaPengguna: "",
    noHP: "",
    email: "",
    alamat: "",
    rt: "",
    rw: "",
    kelurahan: "",
    kota: "",
    provinsi: "",
    nik: "",
    fotoPIC: null as File | null,
    ktpPIC: null as File | null,
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Registrasi berhasil (dummy)");
  };

  const inputClass =
    "w-full px-4 py-2 rounded-lg bg-white text-navy border border-white outline-none";

  return (
    <div className="min-h-screen bg-sky-blue flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-sky-blue p-8 rounded-3xl shadow-xl w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <h2 className="col-span-2 text-center text-2xl font-bold text-navy mb-2">
          Register
        </h2>

        {/* KIRI */}
        <div className="space-y-4">
          <div>
            <label className="text-navy">Nama toko:</label>
            <input
              name="namaToko"
              className={inputClass}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="text-navy">Deskripsi:</label>
            <input
              name="deskripsi"
              className={inputClass}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="text-navy">Nama Pengguna:</label>
            <input
              name="namaPengguna"
              className={inputClass}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="text-navy">No Handphone:</label>
            <input
              name="noHP"
              className={inputClass}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="text-navy">Email:</label>
            <input
              type="email"
              name="email"
              className={inputClass}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="text-navy">Alamat:</label>
            <input
              name="alamat"
              className={inputClass}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="text-navy">RT:</label>
            <input name="rt" className={inputClass} onChange={handleChange} />
          </div>

          <div>
            <label className="text-navy">RW:</label>
            <input name="rw" className={inputClass} onChange={handleChange} />
          </div>
        </div>

        {/* KANAN */}
        <div className="space-y-4">
          <div>
            <label className="text-navy">Nama Kelurahan:</label>
            <input
              name="kelurahan"
              className={inputClass}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="text-navy">Kabupaten/Kota:</label>
            <input name="kota" className={inputClass} onChange={handleChange} />
          </div>

          <div>
            <label className="text-navy">Provinsi:</label>
            <input
              name="provinsi"
              className={inputClass}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="text-navy">NIK:</label>
            <input name="nik" className={inputClass} onChange={handleChange} />
          </div>

          <div>
            <label className="text-navy">Foto PIC:</label>
            <input
              type="file"
              name="fotoPIC"
              accept="image/*"
              className={inputClass}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="text-navy">KTP PIC:</label>
            <input
              type="file"
              name="ktpPIC"
              accept="image/*"
              className={inputClass}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="text-navy">Buat password:</label>
            <input
              type="password"
              name="password"
              className={inputClass}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="text-navy">Konfirmasi password:</label>
            <input
              type="password"
              name="confirmPassword"
              className={inputClass}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="col-span-2 flex justify-end">
          <button
            type="submit"
            className="bg-teal px-6 py-3 text-white font-semibold rounded-full shadow hover:bg-navy transition"
          >
            SUBMIT
          </button>
        </div>
      </form>
    </div>
  );
}