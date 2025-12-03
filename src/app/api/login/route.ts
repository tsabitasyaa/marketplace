import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password diperlukan" },
        { status: 400 }
      );
    }

    // Langsung login dengan Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    // Cek role user di database
    const { data: userData } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("email", email)
      .single();

    if (!userData || (userData.role !== "seller" && userData.role !== "penjual")) {
      // Logout jika bukan penjual
      await supabaseAdmin.auth.signOut();
      return NextResponse.json(
        { error: "Hanya penjual yang dapat login" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: userData.role,
      },
    });

  } catch (error: unknown) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal" },
      { status: 500 }
    );
  }
}