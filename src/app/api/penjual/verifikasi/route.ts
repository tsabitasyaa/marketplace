import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { seller_id, status } = body;

    console.log("🔄 Processing verification:", { seller_id, status });

    // Validasi input
    if (!seller_id || !status) {
      return NextResponse.json(
        { 
          success: false, 
          message: "seller_id dan status diperlukan" 
        },
        { status: 400 }
      );
    }

    if (!["accepted", "rejected"].includes(status)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Status harus 'accepted' atau 'rejected'" 
        },
        { status: 400 }
      );
    }

    // Update status verifikasi
    const { data, error } = await supabase
      .from("sellers")
      .update({
        verification_status: status,
        verified: status === "accepted"
      })
      .eq("id", seller_id)
      .select();

    if (error) {
      console.error("❌ Supabase update error:", error);
      return NextResponse.json(
        { 
          success: false, 
          message: `Gagal update status: ${error.message}` 
        },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Penjual tidak ditemukan" 
        },
        { status: 404 }
      );
    }

    console.log(`✅ Seller ${seller_id} ${status} successfully`);

    return NextResponse.json({
      success: true,
      message: `Penjual berhasil di${status === 'accepted' ? 'verifikasi' : 'tolak'}`,
      data: data[0]
    });

  } catch (error) {
    console.error("❌ Unexpected error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Internal server error" 
      },
      { status: 500 }
    );
  }
}