import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    console.log("🔄 Fetching pending sellers...");

    // Ambil data sellers dengan status 'pending'
    const { data: sellers, error } = await supabase
      .from("sellers")
      .select(`
        id,
        user_id,
        store_name,
        description,
        pic_name,
        pic_phone,
        pic_email,
        pic_address,
        rt,
        rw,
        kelurahan,
        city,
        province,
        pic_ktp,
        pic_photo_url,
        pic_ktp_file_url,
        verified,
        verification_status,
        created_at
      `)
      .eq("verification_status", "pending")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("❌ Supabase error:", error);
      return NextResponse.json(
        { 
          success: false, 
          message: `Database error: ${error.message}`,
          data: [] 
        },
        { status: 500 }
      );
    }

    console.log(`✅ Found ${sellers?.length || 0} pending sellers`);

    return NextResponse.json({
      success: true,
      message: "Data penjual pending berhasil diambil",
      data: sellers || []
    });

  } catch (error) {
    console.error("❌ Unexpected error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Internal server error",
        data: [] 
      },
      { status: 500 }
    );
  }
}