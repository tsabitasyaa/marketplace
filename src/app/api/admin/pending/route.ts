import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("🔄 [API ADMIN PENDING] Fetching pending sellers...");
    
    // Untuk testing, kembalikan data dummy dulu
    const dummyData = [
      {
        id: "1",
        user_id: "101",
        store_name: "Yelisa Fashion Boutique",
        description: "Toko fashion modern untuk wanita",
        pic_name: "Yelisa Lorian",
        pic_phone: "081234567890",
        pic_email: "yelisa@example.com",
        pic_address: "Jl. Kemanggisan No. 123",
        rt: "001",
        rw: "002",
        kelurahan: "Kemanggisan",
        kecamatan: "Palmerah",
        city: "Jakarta Barat",
        province: "DKI Jakarta",
        pic_ktp: "3171234567890001",
        pic_photo_url: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=300&fit=crop",
        pic_ktp_file_url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=300&fit=crop",
        verified: false,
        verification_status: "pending",
        created_at: "2025-11-28T10:00:00.000Z"
      }
    ];

    console.log(`✅ [API ADMIN PENDING] Returning ${dummyData.length} dummy sellers`);
    
    return NextResponse.json({
      success: true,
      message: "Data berhasil diambil",
      data: dummyData
    });

  } catch (error) {
    console.error("❌ [API ADMIN PENDING] Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}