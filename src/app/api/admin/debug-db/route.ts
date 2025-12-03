import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        message: "Environment variables not set"
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log("🔍 Debug: Checking sellers table structure...");
    
    // Cek apakah tabel sellers ada
    const { data, error } = await supabase
      .from('sellers')
      .select('*')
      .limit(1);

    if (error) {
      return NextResponse.json({
        success: false,
        message: "Error accessing sellers table",
        error: error.message,
        suggestion: "Table might not exist or have different name"
      });
    }

    // Ambil semua kolom yang ada
    const sampleRow = data?.[0];
    const columns = sampleRow ? Object.keys(sampleRow) : [];
    
    // Cek kolom khusus verifikasi
    const verificationColumns = columns.filter(col => 
      col.includes('verif') || 
      col.includes('status') || 
      col.includes('verify')
    );
    
    // Cek kolom alamat
    const addressColumns = columns.filter(col => 
      col.includes('address') || 
      col.includes('city') || 
      col.includes('province') ||
      col.includes('kelurahan') || 
      col.includes('kecamatan') ||
      col.includes('rt') || 
      col.includes('rw')
    );

    // Cek data pending
    const { count: pendingCount, error: countError } = await supabase
      .from('sellers')
      .select('*', { count: 'exact', head: true })
      .or('verification_status.eq.pending,status.eq.pending,verified.eq.false');

    return NextResponse.json({
      success: true,
      message: "Database structure checked",
      table: 'sellers',
      totalColumns: columns.length,
      allColumns: columns,
      verificationColumns,
      addressColumns,
      pendingCount: pendingCount || 0,
      sampleRow: sampleRow
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Debug failed",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}