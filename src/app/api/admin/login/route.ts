import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    console.log(`🔐 Login attempt: ${email}`);

    // Validasi input
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email dan password diperlukan" },
        { status: 400 }
      );
    }

    // Contoh validasi credentials
    // Di production, simpan di environment variables atau database
    const ADMIN_EMAIL = "admin@example.com";
    const ADMIN_PASSWORD = "admin123";

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      console.log('❌ Invalid credentials');
      return NextResponse.json(
        { message: "Email atau password salah" },
        { status: 401 }
      );
    }

    // Buat response sukses
    const res = NextResponse.json({ 
      message: "Login berhasil",
      success: true 
    });

    // Set cookie adminToken
    const token = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    res.cookies.set("adminToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 hari (86400 detik)
    });

    console.log('✅ Login successful, token set');
    return res;

  } catch (error) {
    console.error("❌ Login error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}