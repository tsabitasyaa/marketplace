import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({
      message: "Logout berhasil",
      success: true
    });

    // Hapus cookie adminToken
    response.cookies.delete("adminToken");
    
    console.log("✅ Admin logged out");
    return response;

  } catch (error) {
    console.error("❌ Logout error:", error);
    return NextResponse.json(
      { message: "Logout gagal" },
      { status: 500 }
    );
  }
}