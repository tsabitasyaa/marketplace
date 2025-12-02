import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      product_id, 
      user_name, 
      user_phone, 
      user_email, 
      user_province, 
      rating, 
      comment 
    } = body;

    console.log("🔄 Submitting review:", { product_id, user_email });

    // Validasi input
    if (!product_id || !user_name || !rating || !comment || !user_email) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Data tidak lengkap. Nama, email, rating, dan komentar wajib diisi." 
        },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Rating harus antara 1-5" 
        },
        { status: 400 }
      );
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user_email)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Format email tidak valid" 
        },
        { status: 400 }
      );
    }

    // CEK DUPLICATE DENGAN QUERY YANG LEBIH ROBUST
    console.log(`🔍 Checking duplicate review for product ${product_id} and email ${user_email}`);
    
    const { data: existingReview, error: checkError } = await supabase
      .from("reviews")
      .select("id, user_name, created_at")
      .eq("product_id", product_id)
      .eq("user_email", user_email.trim().toLowerCase()) // Normalize email
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error("❌ Error checking existing review:", checkError);
    }

    if (existingReview) {
      console.log(`❌ Duplicate found: User ${existingReview.user_name} already reviewed on ${existingReview.created_at}`);
      return NextResponse.json(
        { 
          success: false, 
          message: `Email ${user_email} sudah memberikan review untuk produk ini. Setiap email hanya boleh memberikan satu review per produk.` 
        },
        { status: 409 } // Conflict
      );
    }

    console.log("✅ No duplicate found, proceeding with insert...");

    // Insert review ke database
    const { data, error } = await supabase
      .from("reviews")
      .insert([
        {
          product_id: parseInt(product_id),
          user_name: user_name.trim(),
          user_phone: user_phone ? user_phone.trim() : null,
          user_email: user_email.trim().toLowerCase(), // Normalize email
          user_province: user_province ? user_province.trim() : null,
          rating: parseInt(rating),
          comment: comment.trim(),
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error("❌ Supabase insert error:", error);
      
      // Handle unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { 
            success: false, 
            message: `Email ${user_email} sudah memberikan review untuk produk ini. Silakan gunakan email lain.` 
          },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { 
          success: false, 
          message: `Gagal menyimpan review: ${error.message}` 
        },
        { status: 500 }
      );
    }

    console.log(`✅ Review submitted successfully for product ${product_id}`);

    return NextResponse.json({
      success: true,
      message: "Review berhasil dikirim! Terima kasih atas feedback Anda.",
      data: data[0]
    });

  } catch (error) {
    console.error("❌ Unexpected error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Internal server error" 
      },
      { status: 500 }
    );
  }
}