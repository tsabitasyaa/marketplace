// /app/api/admin/pending/route.ts - PERBAIKAN
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    console.log("🔄 [FIXED API] Fetching pending sellers...");
    
    // PERBAIKAN: Hapus filter is_active = false, karena data punya is_active = true
    const { data: sellers, error } = await supabase
      .from("sellers")
      .select("*")
      .or('verified.is.false,verification_status.eq.pending,verification_status.is.null')
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Database error:", error);
      return NextResponse.json(
        { 
          success: false, 
          message: "Gagal mengambil data dari database" 
        },
        { status: 500 }
      );
    }

    console.log(`✅ Found ${sellers?.length || 0} pending sellers`);
    
    // Log untuk debugging
    if (sellers && sellers.length > 0) {
      sellers.forEach(seller => {
        console.log(`📝 ${seller.store_name}: verified=${seller.verified}, status=${seller.verification_status}, active=${seller.is_active}`);
      });
    }

    return NextResponse.json({
      success: true,
      data: sellers || [],
      count: sellers?.length || 0,
      note: "Filter: verified=false OR verification_status=pending OR verification_status IS NULL"
    });

  } catch (error: any) {
    console.error("❌ System error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Terjadi kesalahan sistem" 
      },
      { status: 500 }
    );
  }
}