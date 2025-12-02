import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching pending sellers...');

    const { data: sellers, error } = await supabase
      .from('sellers')
      .select(`
        *,
        users (
          email,
          full_name
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Gagal mengambil data penjual: ' + error.message 
        },
        { status: 500 }
      );
    }

    console.log(`Found ${sellers?.length || 0} pending sellers`);

    return NextResponse.json({
      success: true,
      sellers: sellers || []
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