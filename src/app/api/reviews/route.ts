import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendThankYouEmail } from "@/lib/review/email-service";

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

    // Validasi email format
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

    // CEK DUPLICATE REVIEW
    const { data: existingReview, error: checkError } = await supabase
      .from("reviews")
      .select("id, user_name, created_at")
      .eq("product_id", product_id)
      .eq("user_email", user_email.trim().toLowerCase())
      .maybeSingle();

    if (existingReview) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Email ${user_email} sudah memberikan review untuk produk ini.` 
        },
        { status: 409 }
      );
    }

    // AMBIL DATA PRODUK UNTUK EMAIL
    let productName = "Produk";
    try {
      const { data: productData } = await supabase
        .from("products")
        .select("name")
        .eq("id", product_id)
        .single();
      
      if (productData) {
        productName = productData.name;
      }
    } catch (error) {
      console.error("❌ Error fetching product data:", error);
    }

    // INSERT REVIEW KE DATABASE
    const { data, error } = await supabase
      .from("reviews")
      .insert([
        {
          product_id: parseInt(product_id),
          user_name: user_name.trim(),
          user_phone: user_phone ? user_phone.trim() : null,
          user_email: user_email.trim().toLowerCase(),
          user_province: user_province ? user_province.trim() : null,
          rating: parseInt(rating),
          comment: comment.trim(),
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error("❌ Supabase insert error:", error);
      
      if (error.code === '23505') {
        return NextResponse.json(
          { 
            success: false, 
            message: `Email ${user_email} sudah memberikan review untuk produk ini.` 
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

    // 🔥 KIRIM EMAIL TERIMA KASIH (Async - tidak blocking)
    try {
      const emailResult = await sendThankYouEmail(
        user_email,
        user_name,
        productName
      );

      if (emailResult.success) {
        console.log('✅ Thank you email sent successfully');
      } else {
        console.log('⚠️ Email sending failed, but review was saved:', emailResult.message);
      }

    } catch (emailError) {
      console.error('⚠️ Email sending error (non-critical):', emailError);
      // Jangan gagalkan review hanya karena email gagal
    }

    return NextResponse.json({
      success: true,
      message: "Review berhasil dikirim! Email ucapan terima kasih telah dikirim ke inbox Anda.",
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