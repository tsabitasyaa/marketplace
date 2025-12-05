// app/api/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password diperlukan" },
        { status: 400 }
      );
    }

    // Menggunakan ANON KEY untuk auth login, bukan service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Login Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    const user = authData.user;

    // Ambil role dari metadata
    const role = user.user_metadata?.role;

    // Validasi: hanya seller yang boleh login
    if (role !== "seller" && role !== "penjual") {
      return NextResponse.json(
        { error: "Hanya penjual yang dapat login" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role,
        seller_id: user.user_metadata?.seller_id,
      },
      session: authData.session, // jika ingin simpan access token
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal" },
      { status: 500 }
    );
  }
}
