import { NextResponse } from 'next/server';

interface LoginRequestBody {
  email?: string;
  password?: string;
}

export async function POST(request: Request) {
  try {
    const { email, password }: LoginRequestBody = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email dan Kata Sandi wajib diisi.' },
        { status: 400 }
      );
    }

    // --- SIMULASI VERIFIKASI ---
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@loopy.com';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password123'; 

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Login Berhasil
      return NextResponse.json(
        { 
          message: 'Login berhasil!', 
          user: { email: ADMIN_EMAIL, role: 'admin' }
        }, 
        { status: 200 }
      );
    } else {
      // Kredensial tidak cocok
      return NextResponse.json(
        { message: 'Email atau Kata Sandi salah.' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}