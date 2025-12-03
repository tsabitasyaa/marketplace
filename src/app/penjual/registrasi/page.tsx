"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface RegionData {
  id: string;
  name: string;
}

interface RegistrationData {
  id: number;
  store_name: string;
  description: string;
  pic_name: string;
  pic_phone: string;
  pic_email: string;
  pic_address: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: string;
  city: string;
  province: string;
  pic_ktp: string;
  pic_photo_url: string;
  pic_ktp_file_url: string;
  verification_status: string;
  created_at: string;
}

export default function RegistrasiPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    storeName: "",
    description: "",
    picName: "",
    picPhone: "",
    picEmail: "",
    picAddress: "",
    rt: "",
    rw: "",
    kelurahan: "",
    kecamatan: "",
    city: "",
    province: "",
    picKtp: "",
    picPhoto: null as File | null,
    picKtpFile: null as File | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessBubble, setShowSuccessBubble] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  // State untuk data dropdown
  const [provinces, setProvinces] = useState<RegionData[]>([]);
  const [cities, setCities] = useState<RegionData[]>([]);
  const [kecamatans, setKecamatans] = useState<RegionData[]>([]);
  const [kelurahans, setKelurahans] = useState<RegionData[]>([]);
  const [isLoadingRegions, setIsLoadingRegions] = useState({
    provinces: false,
    cities: false,
    kecamatans: false,
    kelurahans: false,
  });

  // Fetch data provinsi dari API
  useEffect(() => {
    const fetchProvinces = async () => {
      setIsLoadingRegions(prev => ({ ...prev, provinces: true }));
      try {
        const response = await fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json');
        if (!response.ok) throw new Error('Failed to fetch provinces');
        const data = await response.json();
        setProvinces(data);
      } catch (error) {
        console.error('Error fetching provinces:', error);
        // Fallback data
        setProvinces([
          { id: '11', name: 'ACEH' },
          { id: '12', name: 'SUMATERA UTARA' },
          { id: '13', name: 'SUMATERA BARAT' },
          { id: '14', name: 'RIAU' },
          { id: '15', name: 'JAMBI' },
          { id: '16', name: 'SUMATERA SELATAN' },
          { id: '17', name: 'BENGKULU' },
          { id: '18', name: 'LAMPUNG' },
          { id: '19', name: 'KEPULAUAN BANGKA BELITUNG' },
          { id: '21', name: 'KEPULAUAN RIAU' },
          { id: '31', name: 'DKI JAKARTA' },
          { id: '32', name: 'JAWA BARAT' },
          { id: '33', name: 'JAWA TENGAH' },
          { id: '34', name: 'DI YOGYAKARTA' },
          { id: '35', name: 'JAWA TIMUR' },
          { id: '36', name: 'BANTEN' },
          { id: '51', name: 'BALI' },
          { id: '52', name: 'NUSA TENGGARA BARAT' },
          { id: '53', name: 'NUSA TENGGARA TIMUR' },
          { id: '61', name: 'KALIMANTAN BARAT' },
          { id: '62', name: 'KALIMANTAN TENGAH' },
          { id: '63', name: 'KALIMANTAN SELATAN' },
          { id: '64', name: 'KALIMANTAN TIMUR' },
          { id: '65', name: 'KALIMANTAN UTARA' },
          { id: '71', name: 'SULAWESI UTARA' },
          { id: '72', name: 'SULAWESI TENGAH' },
          { id: '73', name: 'SULAWESI SELATAN' },
          { id: '74', name: 'SULAWESI TENGGARA' },
          { id: '75', name: 'GORONTALO' },
          { id: '76', name: 'SULAWESI BARAT' },
          { id: '81', name: 'MALUKU' },
          { id: '82', name: 'MALUKU UTARA' },
          { id: '91', name: 'PAPUA BARAT' },
          { id: '94', name: 'PAPUA' }
        ]);
      } finally {
        setIsLoadingRegions(prev => ({ ...prev, provinces: false }));
      }
    };

    fetchProvinces();
  }, []);

  // Fetch kota/kabupaten ketika provinsi dipilih
  useEffect(() => {
    const fetchCities = async () => {
      if (!form.province) {
        setCities([]);
        setKecamatans([]);
        setKelurahans([]);
        return;
      }

      setIsLoadingRegions(prev => ({ ...prev, cities: true }));
      try {
        const selectedProvince = provinces.find(p => p.name === form.province);
        if (selectedProvince) {
          const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${selectedProvince.id}.json`);
          if (!response.ok) throw new Error('Failed to fetch cities');
          const data = await response.json();
          setCities(data);
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
        setCities([]);
      } finally {
        setIsLoadingRegions(prev => ({ ...prev, cities: false }));
      }
    };

    fetchCities();
  }, [form.province, provinces]);

  // Fetch kecamatan ketika kota/kabupaten dipilih
  useEffect(() => {
    const fetchKecamatans = async () => {
      if (!form.city) {
        setKecamatans([]);
        setKelurahans([]);
        return;
      }

      setIsLoadingRegions(prev => ({ ...prev, kecamatans: true }));
      try {
        const selectedCity = cities.find(c => c.name === form.city);
        if (selectedCity) {
          const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${selectedCity.id}.json`);
          if (!response.ok) throw new Error('Failed to fetch districts');
          const data = await response.json();
          setKecamatans(data);
        }
      } catch (error) {
        console.error('Error fetching kecamatans:', error);
        setKecamatans([]);
      } finally {
        setIsLoadingRegions(prev => ({ ...prev, kecamatans: false }));
      }
    };

    fetchKecamatans();
  }, [form.city, cities]);

  // Fetch kelurahan ketika kecamatan dipilih
  useEffect(() => {
    const fetchKelurahans = async () => {
      if (!form.kecamatan) {
        setKelurahans([]);
        return;
      }

      setIsLoadingRegions(prev => ({ ...prev, kelurahans: true }));
      try {
        const selectedKecamatan = kecamatans.find(k => k.name === form.kecamatan);
        if (selectedKecamatan) {
          const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${selectedKecamatan.id}.json`);
          if (!response.ok) throw new Error('Failed to fetch villages');
          const data = await response.json();
          setKelurahans(data);
        }
      } catch (error) {
        console.error('Error fetching kelurahans:', error);
        setKelurahans([]);
      } finally {
        setIsLoadingRegions(prev => ({ ...prev, kelurahans: false }));
      }
    };

    fetchKelurahans();
  }, [form.kecamatan, kecamatans]);

  // Validasi file type
  const validateFileType = (file: File, allowedTypes: string[]): boolean => {
    return allowedTypes.includes(file.type);
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedProvince = e.target.value;
    setForm(prev => ({
      ...prev,
      province: selectedProvince,
      city: "",
      kecamatan: "",
      kelurahan: ""
    }));
    setTouched(prev => ({ ...prev, province: true }));
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCity = e.target.value;
    setForm(prev => ({
      ...prev,
      city: selectedCity,
      kecamatan: "",
      kelurahan: ""
    }));
    setTouched(prev => ({ ...prev, city: true }));
  };

  const handleKecamatanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedKecamatan = e.target.value;
    setForm(prev => ({
      ...prev,
      kecamatan: selectedKecamatan,
      kelurahan: ""
    }));
    setTouched(prev => ({ ...prev, kecamatan: true }));
  };

  const handleKelurahanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedKelurahan = e.target.value;
    setForm(prev => ({
      ...prev,
      kelurahan: selectedKelurahan
    }));
    setTouched(prev => ({ ...prev, kelurahan: true }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const value = form[name as keyof typeof form];
    validateField(name, value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    const newValue = files ? files[0] : value;
    
    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }

    if (touched[name]) {
      validateField(name, newValue);
    }
  };

  const validateField = (name: string, value: string | File | null) => {
    const newErrors = { ...errors };

    switch (name) {
      case "storeName":
        if (!value || typeof value !== 'string' || !value.trim()) {
          newErrors.storeName = "Nama toko wajib diisi";
        } else if (value.trim().length < 3) {
          newErrors.storeName = "Nama toko minimal 3 karakter";
        } else if (value.trim().length > 100) {
          newErrors.storeName = "Nama toko maksimal 100 karakter";
        } else {
          delete newErrors.storeName;
        }
        break;

      case "kecamatan":
        if (!value || typeof value !== 'string' || !value.trim()) {
          newErrors.kecamatan = "Kecamatan wajib diisi";
        } else if (value.length > 50) {
          newErrors.kecamatan = "Kecamatan maksimal 50 karakter";
        } else {
          delete newErrors.kecamatan;
        }
        break;

      case "description":
        if (!value || typeof value !== 'string' || !value.trim()) {
          newErrors.description = "Deskripsi toko wajib diisi";
        } else if (value.trim().length < 10) {
          newErrors.description = "Deskripsi minimal 10 karakter";
        } else {
          delete newErrors.description;
        }
        break;

      case "picName":
        if (!value || typeof value !== 'string' || !value.trim()) {
          newErrors.picName = "Nama PIC wajib diisi";
        } else if (value.trim().length < 2) {
          newErrors.picName = "Nama PIC minimal 2 karakter";
        } else if (value.trim().length > 100) {
          newErrors.picName = "Nama PIC maksimal 100 karakter";
        } else {
          delete newErrors.picName;
        }
        break;

      case "picPhone":
        if (!value || typeof value !== 'string' || !value.trim()) {
          newErrors.picPhone = "No HP PIC wajib diisi";
        } else if (!/^[0-9+-\s()]+$/.test(value)) {
          newErrors.picPhone = "Format nomor HP tidak valid";
        } else if (value.replace(/\D/g, '').length < 10) {
          newErrors.picPhone = "Nomor HP minimal 10 digit";
        } else if (value.length > 20) {
          newErrors.picPhone = "Nomor HP maksimal 20 karakter";
        } else {
          delete newErrors.picPhone;
        }
        break;

      case "picEmail":
        if (!value || typeof value !== 'string' || !value.trim()) {
          newErrors.picEmail = "Email PIC wajib diisi";
        } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(value)) {
          newErrors.picEmail = "Format email tidak valid";
        } else if (value.length > 100) {
          newErrors.picEmail = "Email maksimal 100 karakter";
        } else {
          delete newErrors.picEmail;
        }
        break;

      case "picAddress":
        if (!value || typeof value !== 'string' || !value.trim()) {
          newErrors.picAddress = "Alamat wajib diisi";
        } else {
          delete newErrors.picAddress;
        }
        break;

      case "rt":
        if (!value || typeof value !== 'string' || !value.trim()) {
          newErrors.rt = "RT wajib diisi";
        } else if (!/^\d+$/.test(value)) {
          newErrors.rt = "RT harus berupa angka";
        } else if (value.length > 10) {
          newErrors.rt = "RT maksimal 10 karakter";
        } else {
          delete newErrors.rt;
        }
        break;

      case "rw":
        if (!value || typeof value !== 'string' || !value.trim()) {
          newErrors.rw = "RW wajib diisi";
        } else if (!/^\d+$/.test(value)) {
          newErrors.rw = "RW harus berupa angka";
        } else if (value.length > 10) {
          newErrors.rw = "RW maksimal 10 karakter";
        } else {
          delete newErrors.rw;
        }
        break;

      case "kelurahan":
        if (!value || typeof value !== 'string' || !value.trim()) {
          newErrors.kelurahan = "Kelurahan wajib diisi";
        } else if (value.length > 50) {
          newErrors.kelurahan = "Kelurahan maksimal 50 karakter";
        } else {
          delete newErrors.kelurahan;
        }
        break;

      case "kecamatan":
        if (!value || typeof value !== 'string' || !value.trim()) {
          newErrors.kecamatan = "Kecamatan wajib diisi";
        } else if (value.length > 50) {
          newErrors.kecamatan = "Kecamatan maksimal 50 karakter";
        } else {
          delete newErrors.kecamatan;
        }
        break;

      case "city":
        if (!value || typeof value !== 'string' || !value.trim()) {
          newErrors.city = "Kota/Kabupaten wajib diisi";
        } else if (value.length > 50) {
          newErrors.city = "Kota/Kabupaten maksimal 50 karakter";
        } else {
          delete newErrors.city;
        }
        break;

      case "province":
        if (!value || typeof value !== 'string' || !value.trim()) {
          newErrors.province = "Provinsi wajib diisi";
        } else if (value.length > 50) {
          newErrors.province = "Provinsi maksimal 50 karakter";
        } else {
          delete newErrors.province;
        }
        break;

      case "picKtp":
        if (!value || typeof value !== 'string' || !value.trim()) {
          newErrors.picKtp = "No. KTP PIC wajib diisi";
        } else if (!/^\d+$/.test(value)) {
          newErrors.picKtp = "KTP harus berupa angka";
        } else if (value.length !== 16) {
          newErrors.picKtp = "KTP harus 16 digit";
        } else {
          delete newErrors.picKtp;
        }
        break;

      case "picPhoto":
        if (!value) {
          newErrors.picPhoto = "Foto PIC wajib diupload";
        } else if (value instanceof File) {
          if (value.size > 2 * 1024 * 1024) {
            newErrors.picPhoto = "Ukuran file maksimal 2MB";
          } else if (!validateFileType(value, ['image/jpeg', 'image/jpg', 'image/png'])) {
            newErrors.picPhoto = "Format file harus JPG atau PNG";
          } else {
            delete newErrors.picPhoto;
          }
        }
        break;

      case "picKtpFile":
        if (!value) {
          newErrors.picKtpFile = "File KTP wajib diupload";
        } else if (value instanceof File) {
          if (value.size > 5 * 1024 * 1024) {
            newErrors.picKtpFile = "Ukuran file maksimal 5MB";
          } else if (!validateFileType(value, ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'])) {
            newErrors.picKtpFile = "Format file harus JPG, PNG, atau PDF";
          } else {
            delete newErrors.picKtpFile;
          }
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validasi text fields
    if (!form.storeName.trim()) newErrors.storeName = "Nama toko wajib diisi";
    else if (form.storeName.trim().length < 3) newErrors.storeName = "Nama toko minimal 3 karakter";
    else if (form.storeName.trim().length > 100) newErrors.storeName = "Nama toko maksimal 100 karakter";

    if (!form.description.trim()) newErrors.description = "Deskripsi toko wajib diisi";
    else if (form.description.trim().length < 10) newErrors.description = "Deskripsi minimal 10 karakter";

    if (!form.picName.trim()) newErrors.picName = "Nama PIC wajib diisi";
    else if (form.picName.trim().length < 2) newErrors.picName = "Nama PIC minimal 2 karakter";
    else if (form.picName.trim().length > 100) newErrors.picName = "Nama PIC maksimal 100 karakter";

    if (!form.picPhone.trim()) newErrors.picPhone = "No HP PIC wajib diisi";
    else if (!/^[0-9+-\s()]+$/.test(form.picPhone)) newErrors.picPhone = "Format nomor HP tidak valid";
    else if (form.picPhone.replace(/\D/g, '').length < 10) newErrors.picPhone = "Nomor HP minimal 10 digit";
    else if (form.picPhone.length > 20) newErrors.picPhone = "Nomor HP maksimal 20 karakter";

    if (!form.picEmail.trim()) {
      newErrors.picEmail = "Email PIC wajib diisi";
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(form.picEmail)) {
      newErrors.picEmail = "Format email tidak valid";
    }

    if (!form.picAddress.trim()) newErrors.picAddress = "Alamat wajib diisi";
    if (!form.rt.trim()) newErrors.rt = "RT wajib diisi";
    else if (!/^\d+$/.test(form.rt)) newErrors.rt = "RT harus berupa angka";
    
    if (!form.rw.trim()) newErrors.rw = "RW wajib diisi";
    else if (!/^\d+$/.test(form.rw)) newErrors.rw = "RW harus berupa angka";
    
    if (!form.kelurahan.trim()) newErrors.kelurahan = "Kelurahan wajib diisi";
    if (!form.kecamatan.trim()) newErrors.kecamatan = "Kecamatan wajib diisi";
    if (!form.city.trim()) newErrors.city = "Kota/Kabupaten wajib diisi";
    if (!form.province.trim()) newErrors.province = "Provinsi wajib diisi";

    if (!form.picKtp.trim()) newErrors.picKtp = "No. KTP PIC wajib diisi";
    else if (!/^\d+$/.test(form.picKtp)) newErrors.picKtp = "KTP harus berupa angka";
    else if (form.picKtp.length !== 16) newErrors.picKtp = "KTP harus 16 digit";

    // Validasi files
    if (!form.picPhoto) {
      newErrors.picPhoto = "Foto PIC wajib diupload";
    } else if (form.picPhoto.size > 2 * 1024 * 1024) {
      newErrors.picPhoto = "Ukuran file maksimal 2MB";
    } else if (!validateFileType(form.picPhoto, ['image/jpeg', 'image/jpg', 'image/png'])) {
      newErrors.picPhoto = "Format file harus JPG atau PNG";
    }

    if (!form.picKtpFile) {
      newErrors.picKtpFile = "File KTP wajib diupload";
    } else if (form.picKtpFile.size > 5 * 1024 * 1024) {
      newErrors.picKtpFile = "Ukuran file maksimal 5MB";
    } else if (!validateFileType(form.picKtpFile, ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'])) {
      newErrors.picKtpFile = "Format file harus JPG, PNG, atau PDF";
    }

    if (!form.kecamatan.trim()) {
      newErrors.kecamatan = "Kecamatan wajib diisi";
    } else if (form.kecamatan.length > 50) {
      newErrors.kecamatan = "Kecamatan maksimal 50 karakter";
    }

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
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      
      // Append all form data
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Kirim data ke API
      const response = await fetch('/api/penjual/registrasi', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Terjadi kesalahan saat registrasi');
      }

      // Success handling
      setSuccessMessage(result.message);
      setRegistrationData(result.data);
      setShowSuccessBubble(true);

      // Reset form
      setForm({
        storeName: "",
        description: "",
        picName: "",
        picPhone: "",
        picEmail: "",
        picAddress: "",
        rt: "",
        rw: "",
        kelurahan: "",
        kecamatan: "",
        city: "",
        province: "",
        picKtp: "",
        picPhoto: null,
        picKtpFile: null,
      });
      setTouched({});
      
      // Auto hide bubble after 8 seconds
      setTimeout(() => {
        setShowSuccessBubble(false);
      }, 8000);
      
    } catch (error) {
      console.error('Registration error:', error);
      setSuccessMessage(error instanceof Error ? error.message : "Terjadi kesalahan saat registrasi. Silakan coba lagi.");
      setUploadProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Apakah Anda yakin ingin membatalkan pendaftaran? Data yang sudah diisi akan hilang.')) {
      router.push("/penjual/login");
    }
  };

  const handleCloseBubble = () => {
    setShowSuccessBubble(false);
  };

  // CSS Classes menggunakan Tailwind
  const inputClass = "w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--color-teal)] focus:ring-2 focus:ring-[var(--color-sky-blue)] outline-none transition-all";
  const errorInputClass = "w-full px-3 py-2 rounded-lg border border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none";
  const selectClass = "w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--color-teal)] focus:ring-2 focus:ring-[var(--color-sky-blue)] outline-none transition-all bg-white";
  const errorSelectClass = "w-full px-3 py-2 rounded-lg border border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none bg-white";
  const labelClass = "block text-sm font-medium text-[var(--color-navy)] mb-2";
  const errorTextClass = "text-red-500 text-xs mt-1";
  const sectionTitleClass = "text-lg font-semibold text-[var(--color-navy)] mb-4";

  return (
    <div className="min-h-screen bg-[var(--color-beige)] flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Success Bubble Notification */}
        {showSuccessBubble && (
          <div 
            className="fixed top-4 right-4 z-50 animate-fade-in"
            role="alert"
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="bg-green-500 text-white p-4 rounded-lg shadow-lg max-w-sm border border-green-600">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3"
                    aria-hidden="true"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold">Pendaftaran Berhasil!</h4>
                    <p className="text-sm mt-1 text-green-100">
                      Silakan cek email Anda untuk verifikasi akun. Tim kami akan memproses pendaftaran Anda dalam 1x24 jam.
                    </p>
                    <div className="mt-2 text-xs text-green-200">
                      <p>Status: <span className="font-semibold">Menunggu Verifikasi</span></p>
                      {registrationData && (
                        <p className="mt-1">No. Registrasi: {registrationData.id}</p>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleCloseBubble}
                  className="ml-4 text-green-200 hover:text-white transition-colors flex-shrink-0"
                  aria-label="Tutup notifikasi pendaftaran berhasil"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <div className="w-full bg-green-600 bg-opacity-30 rounded-full h-1 mt-3">
                <div className="bg-green-200 h-1 rounded-full animate-progress"></div>
              </div>
            </div>
          </div>
        )}

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
                priority
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--color-navy)]">Form Registrasi Penjual</h1>
              <p className="text-[var(--color-teal)] text-sm mt-1">Daftarkan toko Anda dan mulai berjualan di Luppy Marketplace</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {isLoading && uploadProgress > 0 && (
          <div className="mb-6 bg-white rounded-lg p-4 shadow-lg border border-[var(--color-sky-blue)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[var(--color-navy)]">Mengupload data...</span>
              <span className="text-sm text-[var(--color-teal)]">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`bg-[var(--color-teal)] h-2 rounded-full transition-all duration-300 ${
                  uploadProgress === 0 ? 'w-0' :
                  uploadProgress === 10 ? 'w-1/10' :
                  uploadProgress === 20 ? 'w-2/10' :
                  uploadProgress === 30 ? 'w-3/10' :
                  uploadProgress === 40 ? 'w-4/10' :
                  uploadProgress === 50 ? 'w-5/10' :
                  uploadProgress === 60 ? 'w-6/10' :
                  uploadProgress === 70 ? 'w-7/10' :
                  uploadProgress === 80 ? 'w-8/10' :
                  uploadProgress === 90 ? 'w-9/10' :
                  'w-full'
                }`}
              ></div>
            </div>
          </div>
        )}

        {successMessage && !showSuccessBubble && (
          <div className={`mb-4 p-3 rounded-lg text-center ${
            successMessage.includes("berhasil") 
              ? "bg-green-100 text-green-800 border border-green-200" 
              : "bg-red-100 text-red-800 border border-red-200"
          }`}>
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 border border-[var(--color-teal)]">
          {/* Informasi Toko */}
          <div className="mb-6">
            <h3 className={sectionTitleClass}>Informasi Toko</h3>
            
            <div className="mb-4">
              <label htmlFor="storeName" className={labelClass}>
                Nama Toko <span className="text-red-500">*</span>
              </label>
              <input
                id="storeName"
                name="storeName"
                value={form.storeName}
                className={errors.storeName ? errorInputClass : inputClass}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Masukkan nama toko Anda"
                maxLength={100}
              />
              {errors.storeName && <p className={errorTextClass}>{errors.storeName}</p>}
            </div>

            <div className="mb-4">
              <label htmlFor="description" className={labelClass}>
                Deskripsi Toko <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                rows={3}
                className={errors.description ? errorInputClass : inputClass}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Jelaskan tentang toko Anda, produk yang dijual, dan keunggulan toko"
              />
              {errors.description && <p className={errorTextClass}>{errors.description}</p>}
            </div>
          </div>

          {/* Data PIC */}
          <div className="mb-6">
            <h3 className={sectionTitleClass}>Data Penanggung Jawab (PIC)</h3>
            
            <div className="mb-4">
              <label htmlFor="picName" className={labelClass}>
                Nama Lengkap PIC <span className="text-red-500">*</span>
              </label>
              <input
                id="picName"
                name="picName"
                value={form.picName}
                className={errors.picName ? errorInputClass : inputClass}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Nama lengkap penanggung jawab toko"
                maxLength={100}
              />
              {errors.picName && <p className={errorTextClass}>{errors.picName}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="picPhone" className={labelClass}>
                  Nomor Handphone <span className="text-red-500">*</span>
                </label>
                <input
                  id="picPhone"
                  name="picPhone"
                  value={form.picPhone}
                  className={errors.picPhone ? errorInputClass : inputClass}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Contoh: 081234567890"
                  maxLength={20}
                />
                {errors.picPhone && <p className={errorTextClass}>{errors.picPhone}</p>}
              </div>

              <div>
                <label htmlFor="picEmail" className={labelClass}>
                  Alamat Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="picEmail"
                  type="email"
                  name="picEmail"
                  value={form.picEmail}
                  className={errors.picEmail ? errorInputClass : inputClass}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="email@contoh.com"
                  maxLength={100}
                />
                {errors.picEmail && <p className={errorTextClass}>{errors.picEmail}</p>}
              </div>
            </div>
          </div>

          {/* Alamat PIC */}
          <div className="mb-6">
            <h3 className={sectionTitleClass}>Alamat Lengkap</h3>
            
            <div className="mb-4">
              <label htmlFor="picAddress" className={labelClass}>
                Alamat Jalan <span className="text-red-500">*</span>
              </label>
              <textarea
                id="picAddress"
                name="picAddress"
                value={form.picAddress}
                rows={2}
                className={errors.picAddress ? errorInputClass : inputClass}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Nama jalan, nomor rumah, nama gedung, komplek perumahan"
              />
              {errors.picAddress && <p className={errorTextClass}>{errors.picAddress}</p>}
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
                  maxLength={10}
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
                  maxLength={10}
                />
                {errors.rw && <p className={errorTextClass}>{errors.rw}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="province" className={labelClass}>
                  Provinsi <span className="text-red-500">*</span>
                </label>
                <select
                  id="province"
                  name="province"
                  value={form.province}
                  className={errors.province ? errorSelectClass : selectClass}
                  onChange={handleProvinceChange}
                  onBlur={handleBlur}
                  disabled={isLoadingRegions.provinces}
                >
                  <option value="">Pilih Provinsi</option>
                  {provinces.map((province) => (
                    <option key={province.id} value={province.name}>
                      {province.name}
                    </option>
                  ))}
                </select>
                {errors.province && <p className={errorTextClass}>{errors.province}</p>}
                {isLoadingRegions.provinces && (
                  <p className="text-xs text-gray-500 mt-1">Memuat data provinsi...</p>
                )}
              </div>

              <div>
                <label htmlFor="city" className={labelClass}>
                  Kota/Kabupaten <span className="text-red-500">*</span>
                </label>
                <select
                  id="city"
                  name="city"
                  value={form.city}
                  className={errors.city ? errorSelectClass : selectClass}
                  onChange={handleCityChange}
                  onBlur={handleBlur}
                  disabled={!form.province || isLoadingRegions.cities}
                >
                  <option value="">Pilih Kota/Kabupaten</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
                {errors.city && <p className={errorTextClass}>{errors.city}</p>}
                {isLoadingRegions.cities && (
                  <p className="text-xs text-gray-500 mt-1">Memuat data kota/kabupaten...</p>
                )}
                {form.province && cities.length === 0 && !isLoadingRegions.cities && (
                  <p className="text-xs text-gray-500 mt-1">Tidak ada data kota/kabupaten untuk provinsi ini</p>
                )}
              </div>

              <div>
                <label htmlFor="kecamatan" className={labelClass}>
                  Kecamatan <span className="text-red-500">*</span>
                </label>
                <select
                  id="kecamatan"
                  name="kecamatan"
                  value={form.kecamatan}
                  className={errors.kecamatan ? errorSelectClass : selectClass}
                  onChange={handleKecamatanChange}
                  onBlur={handleBlur}
                  disabled={!form.city || isLoadingRegions.kecamatans}
                >
                  <option value="">Pilih Kecamatan</option>
                  {kecamatans.map((kecamatan) => (
                    <option key={kecamatan.id} value={kecamatan.name}>
                      {kecamatan.name}
                    </option>
                  ))}
                </select>
                {errors.kecamatan && <p className={errorTextClass}>{errors.kecamatan}</p>}
                {isLoadingRegions.kecamatans && (
                  <p className="text-xs text-gray-500 mt-1">Memuat data kecamatan...</p>
                )}
                {form.city && kecamatans.length === 0 && !isLoadingRegions.kecamatans && (
                  <p className="text-xs text-gray-500 mt-1">Tidak ada data kecamatan untuk kota/kabupaten ini</p>
                )}
              </div>

              <div>
                <label htmlFor="kelurahan" className={labelClass}>
                  Kelurahan <span className="text-red-500">*</span>
                </label>
                <select
                  id="kelurahan"
                  name="kelurahan"
                  value={form.kelurahan}
                  className={errors.kelurahan ? errorSelectClass : selectClass}
                  onChange={handleKelurahanChange}
                  onBlur={handleBlur}
                  disabled={!form.kecamatan || isLoadingRegions.kelurahans}
                >
                  <option value="">Pilih Kelurahan</option>
                  {kelurahans.map((kelurahan) => (
                    <option key={kelurahan.id} value={kelurahan.name}>
                      {kelurahan.name}
                    </option>
                  ))}
                </select>
                {errors.kelurahan && <p className={errorTextClass}>{errors.kelurahan}</p>}
                {isLoadingRegions.kelurahans && (
                  <p className="text-xs text-gray-500 mt-1">Memuat data kelurahan...</p>
                )}
                {form.kecamatan && kelurahans.length === 0 && !isLoadingRegions.kelurahans && (
                  <p className="text-xs text-gray-500 mt-1">Tidak ada data kelurahan untuk kecamatan ini</p>
                )}
              </div>
            </div>
          </div>

          {/* Dokumen Identitas PIC */}
          <div className="mb-6">
            <h3 className={sectionTitleClass}>Dokumen Identitas</h3>
            
            <div className="mb-4">
              <label htmlFor="picKtp" className={labelClass}>
                Nomor KTP <span className="text-red-500">*</span>
              </label>
              <input
                id="picKtp"
                name="picKtp"
                value={form.picKtp}
                className={errors.picKtp ? errorInputClass : inputClass}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="16 digit nomor KTP"
                maxLength={16}
              />
              {errors.picKtp && <p className={errorTextClass}>{errors.picKtp}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="picPhoto" className={labelClass}>
                  Foto Diri <span className="text-red-500">*</span>
                </label>
                <input
                  id="picPhoto"
                  type="file"
                  name="picPhoto"
                  accept="image/jpeg,image/jpg,image/png"
                  className={errors.picPhoto ? errorInputClass : inputClass}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.picPhoto && <p className={errorTextClass}>{errors.picPhoto}</p>}
                <p className="text-xs text-gray-500 mt-1">Format: JPG/PNG (Maksimal 2MB)</p>
              </div>

              <div>
                <label htmlFor="picKtpFile" className={labelClass}>
                  Scan KTP <span className="text-red-500">*</span>
                </label>
                <input
                  id="picKtpFile"
                  type="file"
                  name="picKtpFile"
                  accept="image/jpeg,image/jpg,image/png,.pdf"
                  className={errors.picKtpFile ? errorInputClass : inputClass}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.picKtpFile && <p className={errorTextClass}>{errors.picKtpFile}</p>}
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
              disabled={isLoading}
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

      {/* Tambahkan style untuk animasi menggunakan style tag */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-progress {
          animation: progress 8s linear forwards;
        }
      `}</style>
    </div>
  );
}