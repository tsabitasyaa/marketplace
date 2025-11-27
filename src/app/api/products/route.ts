import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Validasi environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
}

// Gunakan service role key untuk akses lebih luas
const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

export async function GET() {
  try {
    console.log("API: Fetching products from Supabase...");

    const { data, error } = await supabase
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
          store_name
        ),
        reviews (
          rating
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("API: Supabase error:", error);
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      console.log("API: No products found");
      return NextResponse.json([]);
    }

    console.log(`API: Found ${data.length} products`);

    // Format data
    const formatted = data.map((p: any) => {
      const seller = Array.isArray(p.sellers) ? p.sellers[0] : p.sellers;
      
      const reviews = Array.isArray(p.reviews) ? p.reviews : [];
      const ratings = reviews.map((r: any) => r.rating);
      const avgRating = ratings.length > 0
        ? (ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1)
        : "0.0";

      return {
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        stock: p.stock,
        description: p.description,
        condition: p.condition,
        province: p.province,
        city: p.city,
        image: p.image_url,
        createdAt: p.created_at,
        storeName: seller?.store_name || "Unknown Store",
        rating: avgRating,
        reviewCount: ratings.length,
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("API: Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}