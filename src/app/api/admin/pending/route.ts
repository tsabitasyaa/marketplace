// app/api/admin/pending/route.js
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET() {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { success: false, message: 'Database configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Query untuk mengambil penjual dengan status 'pending'
    const { data: sellers, error } = await supabase
      .from('sellers')
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
        verification_status,
        created_at,
        is_active
      `)
      .eq('verification_status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, message: 'Gagal mengambil data penjual', error: error.message },
        { status: 500 }
      );
    }

    // Filter hanya yang belum diverifikasi
    const pendingSellers = (sellers || []).filter(seller => 
      seller.verification_status === 'pending'
    );

    return NextResponse.json({
      success: true,
      data: pendingSellers,
      count: pendingSellers.length
    });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}