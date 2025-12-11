// app/api/seller/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get sellerId from query parameters
    const url = new URL(request.url);
    const sellerId = url.searchParams.get('sellerId');
    
    if (!sellerId) {
      return NextResponse.json(
        { error: 'Seller ID is required' },
        { status: 400 }
      );
    }

    console.log(`API: Fetching products for seller: ${sellerId}`);

    // Query products berdasarkan seller_id
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { 
          products: [], 
          message: 'Error fetching products',
          error: error.message 
        },
        { status: 200 }
      );
    }

    console.log(`Found ${products?.length || 0} products for seller ${sellerId}`);

    return NextResponse.json({ 
      products: products || [],
      count: products?.length || 0
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message 
      },
      { status: 500 }
    );
  }
}