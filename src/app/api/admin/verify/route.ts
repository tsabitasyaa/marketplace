import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { seller_id, status, rejection_reason } = body;

    // VALIDASI KETAT
    if (!seller_id || !status) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Data tidak lengkap: seller_id dan status diperlukan" 
        },
        { status: 400 }
      );
    }

    if (!["accepted", "rejected"].includes(status)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Status tidak valid. Gunakan 'accepted' atau 'rejected'" 
        },
        { status: 400 }
      );
    }

    // 1. CEK SELLER MASIH PENDING/TIDAK
    const { data: existingSeller, error: checkError } = await supabase
      .from("sellers")
      .select("*")
      .eq("id", seller_id)
      .eq("verified", false)
      .single();

    if (checkError || !existingSeller) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Penjual tidak ditemukan atau sudah diverifikasi" 
        },
        { status: 404 }
      );
    }

    // 2. UPDATE STATUS
    const updateData: any = {
      verification_status: status,
      verified: status === "accepted",
      updated_at: new Date().toISOString()
    };

    if (status === "accepted") {
      updateData.is_active = true;
      updateData.verified_at = new Date().toISOString();
    }
    
    if (status === "rejected" && rejection_reason) {
      updateData.rejection_reason = rejection_reason;
      updateData.rejected_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("sellers")
      .update(updateData)
      .eq("id", seller_id)
      .select()
      .single();

    if (error) {
      console.error("❌ Update error:", error);
      return NextResponse.json(
        { 
          success: false, 
          message: "Gagal memperbarui status penjual" 
        },
        { status: 500 }
      );
    }

    // 3. JIKA DITERIMA, BUAT NOTIFIKASI/USER ROLE DLL
    if (status === "accepted") {
      // Update user role ke 'seller' (jika perlu)
      await supabase
        .from("users")
        .update({ role: "seller" })
        .eq("id", existingSeller.user_id);
      
      // TODO: Kirim email notifikasi
      // await sendVerificationEmail(existingSeller, 'accepted');
    }

    return NextResponse.json({
      success: true,
      message: `Penjual berhasil ${status === 'accepted' ? 'diverifikasi' : 'ditolak'}`,
      data,
      next_step: status === 'accepted' ? 'Penjual sekarang dapat login dan menjual produk' : 'Silakan beri tahu penjual alasan penolakan'
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