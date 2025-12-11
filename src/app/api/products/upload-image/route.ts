// src/app/api/products/upload-image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const sellerId = formData.get('seller_id') as string;

    if (!file || !sellerId) {
      return NextResponse.json(
        { error: 'File dan seller_id diperlukan' },
        { status: 400 }
      );
    }

    // Validasi ukuran file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Ukuran file maksimal 5MB' },
        { status: 400 }
      );
    }

    // Validasi tipe file
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WebP' },
        { status: 400 }
      );
    }

    // Upload ke Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${sellerId}/${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (error) {
      console.error('Error upload storage:', error);
      return NextResponse.json(
        { error: 'Gagal mengupload gambar' },
        { status: 500 }
      );
    }

    // Dapatkan URL publik
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return NextResponse.json({
      url: urlData.publicUrl,
      path: filePath,
      success: true
    });
  } catch (error) {
    console.error('Error upload image:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}