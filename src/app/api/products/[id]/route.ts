import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // UNWRAP PARAMS DENGAN await
    const { id } = await params;
    const productId = id;

    console.log(`🔄 Fetching product details for ID: ${productId}`);

    if (!productId || isNaN(Number(productId))) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Product ID tidak valid" 
        },
        { status: 400 }
      );
    }

    // CEK STRUKTUR TABEL TERLEBIH DAHULU
    console.log("🔍 Checking database structure...");

    // Query yang lebih aman - hanya ambil kolom yang pasti ada
    const { data: product, error } = await supabase
      .from("products")
      .select(`
        id,
        name,
        category,
        price,
        stock,
        description,
        condition,
        province,
        city,
        image_url,
        created_at,
        sellers (
          id,
          store_name,
          city,
          province
        )
      `)
      .eq("id", productId)
      .single();

    if (error) {
      console.error("❌ Supabase error:", error);
      
      if (error.code === 'PGRST116') { // Record not found
        return NextResponse.json(
          { 
            success: false, 
            message: "Produk tidak ditemukan" 
          },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { 
          success: false, 
          message: `Database error: ${error.message}` 
        },
        { status: 500 }
      );
    }

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    console.log(`✅ Found product: ${product.name}`);

    // AMBIL REVIEWS TERPISAH - lebih aman
    let reviews: any[] = [];
    try {
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select(`
          id,
          rating,
          comment,
          created_at,
          user_name,
          user_email,
          user_phone,
          user_province
        `)
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (!reviewsError) {
        reviews = reviewsData || [];
        console.log(`✅ Found ${reviews.length} reviews`);
      } else {
        console.error("❌ Error fetching reviews:", reviewsError);
        // Lanjut tanpa reviews, jangan throw error
      }
    } catch (reviewsErr) {
      console.error("❌ Error in reviews query:", reviewsErr);
      // Lanjut tanpa reviews
    }

    // Format data
    const seller = Array.isArray(product.sellers) ? product.sellers[0] : product.sellers;

    // Hitung rating rata-rata
    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length).toFixed(1)
      : "0.0";

    const formattedProduct = {
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      description: product.description,
      condition: product.condition,
      province: product.province,
      city: product.city,
      image: product.image_url,
      storeName: seller?.store_name || "Unknown Store",
      storeLocation: `${seller?.city || product.city}, ${seller?.province || product.province}`,
      rating: avgRating,
      reviewCount: reviews.length,
      reviews: reviews.map((review: any) => ({
        id: review.id,
        name: review.user_name || "Anonymous", // Fallback jika user_name null
        rating: review.rating,
        comment: review.comment,
        province: review.user_province || "Unknown", // Fallback
        createdAt: review.created_at
      }))
    };

    return NextResponse.json({
      success: true,
      data: formattedProduct
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