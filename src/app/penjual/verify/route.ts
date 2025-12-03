import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sellerId, status, rejectionReason } = body;

    console.log('Verification request:', { sellerId, status, rejectionReason });

    if (!sellerId || !status) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Data sellerId dan status diperlukan' 
        },
        { status: 400 }
      );
    }

    if (!['accepted', 'rejected'].includes(status)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Status harus "accepted" atau "rejected"' 
        },
        { status: 400 }
      );
    }

    const { data: existingSeller, error: fetchError } = await supabase
      .from('sellers')
      .select(`
        *,
        users (
          email,
          full_name
        )
      `)
      .eq('id', sellerId)
      .eq('status', 'pending')
      .single();

    if (fetchError) {
      console.error('Error fetching seller:', fetchError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Penjual tidak ditemukan atau sudah diproses' 
        },
        { status: 404 }
      );
    }

    const updateData: any = { 
      status,
      verified_at: status === 'accepted' ? new Date().toISOString() : null
    };

    if (status === 'rejected' && rejectionReason) {
      updateData.rejection_reason = rejectionReason;
    }

    const { data: updatedSeller, error: updateError } = await supabase
      .from('sellers')
      .update(updateData)
      .eq('id', sellerId)
      .select(`
        *,
        users (
          email,
          full_name
        )
      `)
      .single();

    if (updateError) {
      console.error('Error updating seller:', updateError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Gagal mengupdate status penjual: ' + updateError.message 
        },
        { status: 500 }
      );
    }

    if (status === 'accepted') {
      const { error: roleError } = await supabase
        .from('users')
        .update({ role: 'seller' })
        .eq('id', existingSeller.user_id);

      if (roleError) {
        console.error('Error updating user role:', roleError);
      }
    }

    const sellerEmail = updatedSeller.users?.email || updatedSeller.pic_email;
    await sendVerificationEmail(sellerEmail, updatedSeller, status, rejectionReason);

    console.log(`Seller ${sellerId} successfully ${status}`);

    return NextResponse.json({
      success: true,
      message: `Verifikasi berhasil diproses dengan status: ${status}`,
      seller_email: sellerEmail,
      data: updatedSeller
    });

  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Terjadi kesalahan server: ' + error.message 
      },
      { status: 500 }
    );
  }
}

async function sendVerificationEmail(
  email: string, 
  seller: any, 
  status: string, 
  rejectionReason?: string
) {
  try {
    console.log('=== EMAIL NOTIFICATION ===');
    console.log('To:', email);
    console.log('Subject:', `Status Verifikasi Toko ${seller.store_name}`);
    
    if (status === 'accepted') {
      console.log('Body:', `
        Selamat! Toko ${seller.store_name} Anda telah berhasil diverifikasi.
        Sekarang Anda dapat mulai menjual produk di platform kami.
      `);
    } else {
      console.log('Body:', `
        Maaf, verifikasi toko ${seller.store_name} Anda tidak dapat disetujui.
        ${rejectionReason ? `Alasan: ${rejectionReason}` : ''}
        Silakan perbaiki data dan ajukan ulang verifikasi.
      `);
    }
    console.log('=== END EMAIL ===');

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}