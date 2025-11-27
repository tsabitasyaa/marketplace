// app/api/penjual/registrasi/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// Define interface for the request body
interface RegistrasiRequest {
  namaToko: string;
  deskripsi: string;
  namaPIC: string;
  noHPPIC: string;
  emailPIC: string;
  jalan: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kota: string;
  provinsi: string;
  ktpPIC: string;
}
// Helper function to generate unique ID
function generateUniqueId(): string {
  return crypto.randomUUID();
}

// Helper function to get file extension
function getFileExtension(mimeType: string): string {
  const extensions: { [key: string]: string } = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'application/pdf': 'pdf'
  };
  return extensions[mimeType] || 'file';
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract text fields
    const registrasiData: RegistrasiRequest = {
      namaToko: formData.get('namaToko') as string,
      deskripsi: formData.get('deskripsi') as string,
      namaPIC: formData.get('namaPIC') as string,
      noHPPIC: formData.get('noHPPIC') as string,
      emailPIC: formData.get('emailPIC') as string,
      jalan: formData.get('jalan') as string,
      rt: formData.get('rt') as string,
      rw: formData.get('rw') as string,
      kelurahan: formData.get('kelurahan') as string,
      kota: formData.get('kota') as string,
      provinsi: formData.get('provinsi') as string,
      ktpPIC: formData.get('ktpPIC') as string,
    };

    // Validate required fields
    const requiredFields = [
      'namaToko', 'deskripsi', 'namaPIC', 'noHPPIC', 'emailPIC', 
      'jalan', 'rt', 'rw', 'kelurahan', 'kota', 'provinsi', 'ktpPIC'
    ];

    for (const field of requiredFields) {
      const value = registrasiData[field as keyof RegistrasiRequest];
      if (!value || !value.toString().trim()) {
        return NextResponse.json(
          { error: `Field ${field} harus diisi` },
          { status: 400 }
        );
      }
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
    if (!emailRegex.test(registrasiData.emailPIC)) {
      return NextResponse.json(
        { error: 'Format email tidak valid' },
        { status: 400 }
      );
    }

    // Validate phone number (min 10 digits)
    const phoneDigits = registrasiData.noHPPIC.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      return NextResponse.json(
        { error: 'Nomor HP harus minimal 10 digit' },
        { status: 400 }
      );
    }

    // Validate KTP (must be 16 digits)
    if (!/^\d{16}$/.test(registrasiData.ktpPIC)) {
      return NextResponse.json(
        { error: 'KTP harus 16 digit angka' },
        { status: 400 }
      );
    }

    // Handle file uploads
    const fotoPIC = formData.get('fotoPIC') as File;
    const fileKTP = formData.get('fileKTP') as File;

    if (!fotoPIC || fotoPIC.size === 0) {
      return NextResponse.json(
        { error: 'Foto PIC wajib diupload' },
        { status: 400 }
      );
    }

    if (!fileKTP || fileKTP.size === 0) {
      return NextResponse.json(
        { error: 'File KTP wajib diupload' },
        { status: 400 }
      );
    }

    // Validate file sizes
    if (fotoPIC.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Ukuran foto PIC maksimal 2MB' },
        { status: 400 }
      );
    }

    if (fileKTP.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Ukuran file KTP maksimal 5MB' },
        { status: 400 }
      );
    }

    // Validate file types
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const allowedKTPTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

    if (!allowedImageTypes.includes(fotoPIC.type)) {
      return NextResponse.json(
        { error: 'Format foto PIC harus JPG, JPEG, atau PNG' },
        { status: 400 }
      );
    }

    if (!allowedKTPTypes.includes(fileKTP.type)) {
      return NextResponse.json(
        { error: 'Format file KTP harus JPG, JPEG, PNG, atau PDF' },
        { status: 400 }
      );
    }

    // Generate unique IDs for files
    const uniqueId = generateUniqueId();
    const fotoPICExtension = getFileExtension(fotoPIC.type);
    const fileKTPExtension = getFileExtension(fileKTP.type);
    
    const fotoPICName = `foto-pic-${uniqueId}.${fotoPICExtension}`;
    const fileKTPName = `ktp-${uniqueId}.${fileKTPExtension}`;

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      console.error('Error creating uploads directory:', error);
    }

    // Save files
    const fotoPICBuffer = Buffer.from(await fotoPIC.arrayBuffer());
    const fileKTPBuffer = Buffer.from(await fileKTP.arrayBuffer());

    const fotoPICPath = join(uploadsDir, fotoPICName);
    const fileKTPPath = join(uploadsDir, fileKTPName);

    await writeFile(fotoPICPath, fotoPICBuffer);
    await writeFile(fileKTPPath, fileKTPBuffer);

    // Simulate database save
    const savedData = {
      ...registrasiData,
      fotoPIC: `/uploads/${fotoPICName}`,
      fileKTP: `/uploads/${fileKTPName}`,
      id: uniqueId,
      tanggalDaftar: new Date().toISOString(),
      status: 'pending' // pending, approved, rejected
    };

    console.log('Data registrasi berhasil disimpan:', {
      id: savedData.id,
      namaToko: savedData.namaToko,
      email: savedData.emailPIC
    });

    return NextResponse.json(
      { 
        message: 'Registrasi berhasil! Data toko sedang diverifikasi.',
        data: {
          id: savedData.id,
          namaToko: savedData.namaToko,
          status: savedData.status
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error dalam registrasi:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method tidak diizinkan' },
    { status: 405 }
  );
}