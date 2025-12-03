import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { seller_id, status, rejection_reason } = body;

    console.log("🔄 [API ADMIN VERIFY] Processing verification:", { seller_id, status });

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

    console.log(`✅ [API ADMIN VERIFY] Seller ${seller_id} ${status} successfully`);

    return NextResponse.json({
      success: true,
      message: `Penjual berhasil di${status === 'accepted' ? 'verifikasi' : 'tolak'}`,
      data: {
        id: seller_id,
        status,
        rejection_reason,
        verified_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("❌ [API ADMIN VERIFY] Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Internal server error" 
      },
      { status: 500 }
    );
  }
}