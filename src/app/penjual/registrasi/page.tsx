"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function RegistrasiPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    namaToko: "",
    deskripsi: "",
    namaPIC: "",
    noHPPIC: "",
    emailPIC: "",
    jalan: "",
    rt: "",
    rw: "",
    kelurahan: "",
    kota: "",
    provinsi: "",
    ktpPIC: "",
    fotoPIC: null as File | null,
    fileKTP: null as File | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const value = form[name as keyof typeof form];
    validateField(name, value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    const newValue = files ? files[0] : value;
    
    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }

    // Validate field in real-time if it's been touched
    if (touched[name]) {
      validateField(name, newValue);
    }
  };

  const validateField = (name: string, value: string | File | null) => {
    const newErrors = { ...errors };

    switch (name) {
      case "namaToko":
        if (!value || typeof value !== 'string' || !value.trim()) {
          newErrors.namaToko = "Nama toko wajib diisi";
        } else if (value.trim().length < 3) {
          newErrors.namaToko = "Nama toko minimal 3 karakter";
        } else {
          delete newErrors.namaToko;
        }
        break;

      case "deskripsi":
        if (!value || typeof value !== 'string' || !value.trim()) {
          newErrors.deskripsi = "Deskripsi toko wajib diisi";
        } else if (value.trim().length < 10) {
          newErrors.deskripsi = "Deskripsi minimal 10 karakter";
        } else {
          delete newErrors.deskripsi;
        }
        break;

      case "namaPIC":
        if (!value || typeof value !== 'string' || !value.trim()) {
          newErrors.namaPIC = "Nama PIC wajib diisi";
        } else if (value.trim().length < 2) {
          newErrors.namaPIC = "Nama PIC minimal 2 karakter";
        } else {
          delete newErrors.namaPIC;
        }
        break;

      case "noHPPIC":
        if (!value || typeof value !== 'string' || !value.trim()) {
          newErrors.noHPPIC = "No HP PIC wajib diisi";
        } else if (!/^[0-9+-\s()]+$/.test(value)) {
          newErrors.noHPPIC = "Format nomor HP tidak valid";
        } else if (value.replace(/\D/g, '').length < 10) {
          newErrors.noHPPIC = "Nomor HP minimal 10 digit";
        } else {
          delete newErrors.noHPPIC;
        }
        break;

      case "emailPIC":
        if (!value || typeof value !== 'string' || !value.trim()) {
          newErrors.emailPIC = "Email PIC wajib diisi";
        } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(value)) {
          newErrors.emailPIC = "Format email tidak valid";
        } else {
          delete newErrors.emailPIC;
        }
        break;

      case "jalan":
        if (!value || typeof value !== 'string' || !value.trim()) {
          newErrors.jalan = "Jalan wajib diisi";
        } else {
          delete newErrors.jalan;
        }
        break;

      case "rt":
        if (!value || typeof value !== 'string' || !value.trim()) {
          newErrors.rt = "RT wajib diisi";
        } else if (!/^\d+$/.test(value)) {
          newErrors.rt = "RT harus berupa angka";
        } else {
          delete newErrors.rt;
        }
        break;

      case "rw":
        if (!value || typeof value !== 'string' || !value.trim()) {
          newErrors.rw = "RW wajib diisi";
        } else if (!/^\d+$/.test(value)) {
          newErrors.rw = "RW harus berupa angka";
        } else {
          delete newErrors.rw;
        }
        break;

      case "kelurahan":
        if (!value || typeof value !== 'string' || !value.trim()) {
          newErrors.kelurahan = "Kelurahan wajib diisi";
        } else {
          delete newErrors.kelurahan;
        }
        break;

      case "kota":
        if (!value || typeof value !== 'string' || !value.trim()) {
          newErrors.kota = "Kota/Kabupaten wajib diisi";
        } else {
          delete newErrors.kota;
        }
        break;

      case "provinsi":
        if (!value || typeof value !== 'string' || !value.trim()) {
          newErrors.provinsi = "Provinsi wajib diisi";
        } else {
          delete newErrors.provinsi;
        }
        break;

      case "ktpPIC":
        if (!value || typeof value !== 'string' || !value.trim()) {
          newErrors.ktpPIC = "No. KTP PIC wajib diisi";
        } else if (!/^\d+$/.test(value)) {
          newErrors.ktpPIC = "KTP harus berupa angka";
        } else if (value.length !== 16) {
          newErrors.ktpPIC = "KTP harus 16 digit";
        } else {
          delete newErrors.ktpPIC;
        }
        break;

      case "fotoPIC":
        if (!value) {
          newErrors.fotoPIC = "Foto PIC wajib diupload";
        } else if (value instanceof File && value.size > 2 * 1024 * 1024) {
          newErrors.fotoPIC = "Ukuran file maksimal 2MB";
        } else {
          delete newErrors.fotoPIC;
        }
        break;

      case "fileKTP":
        if (!value) {
          newErrors.fileKTP = "File KTP wajib diupload";
        } else if (value instanceof File && value.size > 5 * 1024 * 1024) {
          newErrors.fileKTP = "Ukuran file maksimal 5MB";
        } else {
          delete newErrors.fileKTP;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.namaToko.trim()) newErrors.namaToko = "Nama toko wajib diisi";
    else if (form.namaToko.trim().length < 3) newErrors.namaToko = "Nama toko minimal 3 karakter";

    if (!form.deskripsi.trim()) newErrors.deskripsi = "Deskripsi toko wajib diisi";
    else if (form.deskripsi.trim().length < 10) newErrors.deskripsi = "Deskripsi minimal 10 karakter";

    if (!form.namaPIC.trim()) newErrors.namaPIC = "Nama PIC wajib diisi";
    else if (form.namaPIC.trim().length < 2) newErrors.namaPIC = "Nama PIC minimal 2 karakter";

    if (!form.noHPPIC.trim()) newErrors.noHPPIC = "No HP PIC wajib diisi";
    else if (!/^[0-9+-\s()]+$/.test(form.noHPPIC)) newErrors.noHPPIC = "Format nomor HP tidak valid";
    else if (form.noHPPIC.replace(/\D/g, '').length < 10) newErrors.noHPPIC = "Nomor HP minimal 10 digit";

    if (!form.emailPIC.trim()) {
      newErrors.emailPIC = "Email PIC wajib diisi";
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(form.emailPIC)) {
      newErrors.emailPIC = "Format email tidak valid";
    }

    if (!form.jalan.trim()) newErrors.jalan = "Jalan wajib diisi";
    if (!form.rt.trim()) newErrors.rt = "RT wajib diisi";
    else if (!/^\d+$/.test(form.rt)) newErrors.rt = "RT harus berupa angka";
    
    if (!form.rw.trim()) newErrors.rw = "RW wajib diisi";
    else if (!/^\d+$/.test(form.rw)) newErrors.rw = "RW harus berupa angka";
    
    if (!form.kelurahan.trim()) newErrors.kelurahan = "Kelurahan wajib diisi";
    if (!form.kota.trim()) newErrors.kota = "Kota/Kabupaten wajib diisi";
    if (!form.provinsi.trim()) newErrors.provinsi = "Provinsi wajib diisi";

    if (!form.ktpPIC.trim()) newErrors.ktpPIC = "No. KTP PIC wajib diisi";
    else if (!/^\d+$/.test(form.ktpPIC)) newErrors.ktpPIC = "KTP harus berupa angka";
    else if (form.ktpPIC.length !== 16) newErrors.ktpPIC = "KTP harus 16 digit";

    if (!form.fotoPIC) newErrors.fotoPIC = "Foto PIC wajib diupload";
    else if (form.fotoPIC.size > 2 * 1024 * 1024) newErrors.fotoPIC = "Ukuran file maksimal 2MB";

    if (!form.fileKTP) newErrors.fileKTP = "File KTP wajib diupload";
    else if (form.fileKTP.size > 5 * 1024 * 1024) newErrors.fileKTP = "Ukuran file maksimal 5MB";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(form).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccessMessage("Registrasi berhasil! Data toko Anda sedang diverifikasi.");
      
      setForm({
        namaToko: "",
        deskripsi: "",
        namaPIC: "",
        noHPPIC: "",
        emailPIC: "",
        jalan: "",
        rt: "",
        rw: "",
        kelurahan: "",
        kota: "",
        provinsi: "",
        ktpPIC: "",
        fotoPIC: null,
        fileKTP: null,
      });
      setTouched({});
    } catch {
      setSuccessMessage("Terjadi kesalahan saat registrasi. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    router.push("/penjual/login");
  };

  const inputClass = "w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--color-teal)] focus:ring-2 focus:ring-[var(--color-sky-blue)] outline-none transition-all";
  const errorInputClass = "w-full px-3 py-2 rounded-lg border border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none";
  const labelClass = "block text-sm font-medium text-[var(--color-navy)] mb-2";
  const errorTextClass = "text-red-500 text-xs mt-1";
  const sectionTitleClass = "text-lg font-semibold text-[var(--color-navy)] mb-4";

  return (
    <div className="min-h-screen bg-[var(--color-beige)] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 text-center border border-[var(--color-teal)]">
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 relative mb-3">
              <Image
                src="/Loopy Logo.jpg"
                alt="Luppy Logo"
                width={64}
                height={64}
                className="rounded-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--color-navy)]">Form Registrasi Penjual</h1>
              <p className="text-[var(--color-teal)] text-sm mt-1">Daftarkan toko Anda dan mulai berjualan di Luppy Marketplace</p>
            </div>
          </div>
        </div>

        {successMessage && (
          <div className={`mb-4 p-3 rounded-lg text-center ${
            successMessage.includes("berhasil") 
              ? "bg-green-100 text-green-800 border border-green-200" 
              : "bg-red-100 text-red-800 border border-red-200"
          }`}>
            {successMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-lg p-6 border border-[var(--color-teal)]"
        >
          {/* Informasi Toko */}
          <div className="mb-6">
            <h3 className={sectionTitleClass}>Informasi Toko</h3>
            
            <div className="mb-4">
              <label htmlFor="namaToko" className={labelClass}>
                Nama Toko <span className="text-red-500">*</span>
              </label>
              <input
                id="namaToko"
                name="namaToko"
                value={form.namaToko}
                className={errors.namaToko ? errorInputClass : inputClass}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Masukkan nama toko Anda"
              />
              {errors.namaToko && <p className={errorTextClass}>{errors.namaToko}</p>}
            </div>

            <div className="mb-4">
              <label htmlFor="deskripsi" className={labelClass}>
                Deskripsi Toko <span className="text-red-500">*</span>
              </label>
              <textarea
                id="deskripsi"
                name="deskripsi"
                value={form.deskripsi}
                rows={3}
                className={errors.deskripsi ? errorInputClass : inputClass}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Jelaskan tentang toko Anda, produk yang dijual, dan keunggulan toko"
              />
              {errors.deskripsi && <p className={errorTextClass}>{errors.deskripsi}</p>}
            </div>
          </div>

          {/* Data PIC */}
          <div className="mb-6">
            <h3 className={sectionTitleClass}>Data Penanggung Jawab (PIC)</h3>
            
            <div className="mb-4">
              <label htmlFor="namaPIC" className={labelClass}>
                Nama Lengkap PIC <span className="text-red-500">*</span>
              </label>
              <input
                id="namaPIC"
                name="namaPIC"
                value={form.namaPIC}
                className={errors.namaPIC ? errorInputClass : inputClass}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Nama lengkap penanggung jawab toko"
              />
              {errors.namaPIC && <p className={errorTextClass}>{errors.namaPIC}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="noHPPIC" className={labelClass}>
                  Nomor Handphone <span className="text-red-500">*</span>
                </label>
                <input
                  id="noHPPIC"
                  name="noHPPIC"
                  value={form.noHPPIC}
                  className={errors.noHPPIC ? errorInputClass : inputClass}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Contoh: 081234567890"
                />
                {errors.noHPPIC && <p className={errorTextClass}>{errors.noHPPIC}</p>}
              </div>

              <div>
                <label htmlFor="emailPIC" className={labelClass}>
                  Alamat Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="emailPIC"
                  type="email"
                  name="emailPIC"
                  value={form.emailPIC}
                  className={errors.emailPIC ? errorInputClass : inputClass}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="email@contoh.com"
                />
                {errors.emailPIC && <p className={errorTextClass}>{errors.emailPIC}</p>}
              </div>
            </div>
          </div>

          {/* Alamat PIC */}
          <div className="mb-6">
            <h3 className={sectionTitleClass}>Alamat Lengkap</h3>
            
            <div className="mb-4">
              <label htmlFor="jalan" className={labelClass}>
                Alamat Jalan <span className="text-red-500">*</span>
              </label>
              <textarea
                id="jalan"
                name="jalan"
                value={form.jalan}
                rows={2}
                className={errors.jalan ? errorInputClass : inputClass}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Nama jalan, nomor rumah, nama gedung, komplek perumahan"
              />
              {errors.jalan && <p className={errorTextClass}>{errors.jalan}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="rt" className={labelClass}>
                  RT <span className="text-red-500">*</span>
                </label>
                <input
                  id="rt"
                  name="rt"
                  value={form.rt}
                  className={errors.rt ? errorInputClass : inputClass}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="000"
                />
                {errors.rt && <p className={errorTextClass}>{errors.rt}</p>}
              </div>
              <div>
                <label htmlFor="rw" className={labelClass}>
                  RW <span className="text-red-500">*</span>
                </label>
                <input
                  id="rw"
                  name="rw"
                  value={form.rw}
                  className={errors.rw ? errorInputClass : inputClass}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="000"
                />
                {errors.rw && <p className={errorTextClass}>{errors.rw}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="kelurahan" className={labelClass}>
                  Kelurahan <span className="text-red-500">*</span>
                </label>
                <input
                  id="kelurahan"
                  name="kelurahan"
                  value={form.kelurahan}
                  className={errors.kelurahan ? errorInputClass : inputClass}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Nama kelurahan"
                />
                {errors.kelurahan && <p className={errorTextClass}>{errors.kelurahan}</p>}
              </div>
              <div>
                <label htmlFor="kota" className={labelClass}>
                  Kabupaten/Kota <span className="text-red-500">*</span>
                </label>
                <input
                  id="kota"
                  name="kota"
                  value={form.kota}
                  className={errors.kota ? errorInputClass : inputClass}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Nama kota/kabupaten"
                />
                {errors.kota && <p className={errorTextClass}>{errors.kota}</p>}
              </div>
              <div>
                <label htmlFor="provinsi" className={labelClass}>
                  Provinsi <span className="text-red-500">*</span>
                </label>
                <input
                  id="provinsi"
                  name="provinsi"
                  value={form.provinsi}
                  className={errors.provinsi ? errorInputClass : inputClass}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Nama provinsi"
                />
                {errors.provinsi && <p className={errorTextClass}>{errors.provinsi}</p>}
              </div>
            </div>
          </div>

          {/* Dokumen Identitas PIC */}
          <div className="mb-6">
            <h3 className={sectionTitleClass}>Dokumen Identitas</h3>
            
            <div className="mb-4">
              <label htmlFor="ktpPIC" className={labelClass}>
                Nomor KTP <span className="text-red-500">*</span>
              </label>
              <input
                id="ktpPIC"
                name="ktpPIC"
                value={form.ktpPIC}
                className={errors.ktpPIC ? errorInputClass : inputClass}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="16 digit nomor KTP"
                maxLength={16}
              />
              {errors.ktpPIC && <p className={errorTextClass}>{errors.ktpPIC}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fotoPIC" className={labelClass}>
                  Foto Diri <span className="text-red-500">*</span>
                </label>
                <input
                  id="fotoPIC"
                  type="file"
                  name="fotoPIC"
                  accept="image/*"
                  className={errors.fotoPIC ? errorInputClass : inputClass}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.fotoPIC && <p className={errorTextClass}>{errors.fotoPIC}</p>}
                <p className="text-xs text-gray-500 mt-1">Format: JPG/PNG (Maksimal 2MB)</p>
              </div>

              <div>
                <label htmlFor="fileKTP" className={labelClass}>
                  Scan KTP <span className="text-red-500">*</span>
                </label>
                <input
                  id="fileKTP"
                  type="file"
                  name="fileKTP"
                  accept="image/*,.pdf"
                  className={errors.fileKTP ? errorInputClass : inputClass}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.fileKTP && <p className={errorTextClass}>{errors.fileKTP}</p>}
                <p className="text-xs text-gray-500 mt-1">Format: JPG/PNG/PDF (Maksimal 5MB)</p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-[var(--color-sky-blue)]">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-[var(--color-teal)] text-white rounded-lg hover:bg-[var(--color-navy)] disabled:bg-gray-400 transition-all duration-200 font-medium shadow hover:shadow-lg"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                  Memproses...
                </span>
              ) : (
                "Daftarkan Toko"
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-4 text-gray-600 text-sm">
          <p>© 2024 Luppy Marketplace. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}