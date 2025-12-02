// app/api/admin/laporan/route.ts - DEBUG VERSION
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase environment variables");
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Data provinsi statis
const PROVINCES = [
  {"id":"11","name":"ACEH"},{"id":"12","name":"SUMATERA UTARA"},
  {"id":"13","name":"SUMATERA BARAT"},{"id":"14","name":"RIAU"},
  {"id":"15","name":"JAMBI"},{"id":"16","name":"SUMATERA SELATAN"},
  {"id":"17","name":"BENGKULU"},{"id":"18","name":"LAMPUNG"},
  {"id":"19","name":"KEPULAUAN BANGKA BELITUNG"},{"id":"21","name":"KEPULAUAN RIAU"},
  {"id":"31","name":"DKI JAKARTA"},{"id":"32","name":"JAWA BARAT"},
  {"id":"33","name":"JAWA TENGAH"},{"id":"34","name":"DI YOGYAKARTA"},
  {"id":"35","name":"JAWA TIMUR"},{"id":"36","name":"BANTEN"},
  {"id":"51","name":"BALI"},{"id":"52","name":"NUSA TENGGARA BARAT"},
  {"id":"53","name":"NUSA TENGGARA TIMUR"},{"id":"61","name":"KALIMANTAN BARAT"},
  {"id":"62","name":"KALIMANTAN TENGAH"},{"id":"63","name":"KALIMANTAN SELATAN"},
  {"id":"64","name":"KALIMANTAN TIMUR"},{"id":"65","name":"KALIMANTAN UTARA"},
  {"id":"71","name":"SULAWESI UTARA"},{"id":"72","name":"SULAWESI TENGAH"},
  {"id":"73","name":"SULAWESI SELATAN"},{"id":"74","name":"SULAWESI TENGGARA"},
  {"id":"75","name":"GORONTALO"},{"id":"76","name":"SULAWESI BARAT"},
  {"id":"81","name":"MALUKU"},{"id":"82","name":"MALUKU UTARA"},
  {"id":"91","name":"PAPUA BARAT"},{"id":"94","name":"PAPUA"}
];

export async function GET(request: Request) {
  console.log("🔍 GET request received for admin laporan");
  
  try {
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type');
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');
    const province = searchParams.get('province');

    console.log("📊 Query params:", { reportType, startDate, endDate, province });

    if (!reportType) {
      console.log("❌ Missing report type");
      return NextResponse.json(
        { 
          success: false, 
          message: "Parameter 'type' diperlukan" 
        },
        { status: 400 }
      );
    }

    // Coba koneksi ke Supabase dulu
    console.log("🔄 Testing Supabase connection...");
    const { data: testData, error: testError } = await supabase
      .from("sellers")
      .select("id")
      .limit(1);

    if (testError) {
      console.error("❌ Supabase connection error:", testError);
      return NextResponse.json(
        { 
          success: false, 
          message: `Database connection error: ${testError.message}` 
        },
        { status: 500 }
      );
    }

    console.log("✅ Supabase connection successful");

    let data;
    let error;

    console.log(`🔄 Processing report type: ${reportType}`);
    
    if (reportType === 'seller-status') {
      ({ data, error } = await getSellerStatusReport(startDate, endDate));
    } else if (reportType === 'sellers-by-province') {
      ({ data, error } = await getSellersByProvinceReport(province, startDate, endDate));
    } else if (reportType === 'products-rating') {
      ({ data, error } = await getProductsRatingReport(startDate, endDate));
    } else {
      console.log(`❌ Invalid report type: ${reportType}`);
      return NextResponse.json(
        { 
          success: false, 
          message: "Jenis laporan tidak valid" 
        },
        { status: 400 }
      );
    }

    if (error) {
      console.error("❌ Query error:", error);
      return NextResponse.json(
        { 
          success: false, 
          message: `Query error: ${error.message}` 
        },
        { status: 500 }
      );
    }

    console.log(`✅ Report generated successfully, ${data?.length || 0} records`);

    return NextResponse.json({
      success: true,
      message: "Data berhasil diambil",
      data: data || [],
      metadata: {
        reportType,
        totalRecords: data?.length || 0,
        filters: { startDate, endDate, province }
      }
    });

  } catch (error: any) {
    console.error("❌ Unexpected error in GET:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: `Internal server error: ${error.message || 'Unknown error'}` 
      },
      { status: 500 }
    );
  }
}

async function getSellerStatusReport(startDate?: string | null, endDate?: string | null) {
  console.log("📋 Getting seller status report");
  
  try {
    let query = supabase
      .from("sellers")
      .select("*")
      .order("created_at", { ascending: false });

    if (startDate) {
      console.log(`📅 Filter start date: ${startDate}`);
      query = query.gte("created_at", startDate);
    }
    if (endDate) {
      console.log(`📅 Filter end date: ${endDate}`);
      query = query.lte("created_at", endDate);
    }

    const result = await query;
    console.log(`✅ Found ${result.data?.length || 0} sellers`);
    
    return result;
  } catch (error: any) {
    console.error("❌ Error in getSellerStatusReport:", error);
    throw error;
  }
}

async function getSellersByProvinceReport(provinceId?: string | null, startDate?: string | null, endDate?: string | null) {
  console.log("📋 Getting sellers by province report");
  
  try {
    let provinceName;
    if (provinceId) {
      const prov = PROVINCES.find(p => p.id === provinceId);
      provinceName = prov ? prov.name : provinceId;
      console.log(`📍 Province filter: ${provinceName} (ID: ${provinceId})`);
    }

    let query = supabase
      .from("sellers")
      .select("*")
      .order("created_at", { ascending: false });

    if (provinceName) {
      query = query.eq("province", provinceName);
    }
    if (startDate) {
      query = query.gte("created_at", startDate);
    }
    if (endDate) {
      query = query.lte("created_at", endDate);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error("❌ Query error:", error);
      return { data, error };
    }

    console.log(`✅ Found ${data?.length || 0} sellers by province`);
    
    // Count products for each seller
    if (data && data.length > 0) {
      console.log("🔄 Counting products for each seller...");
      const sellersWithCounts = await Promise.all(
        data.map(async (seller) => {
          try {
            const { count } = await supabase
              .from("products")
              .select("*", { count: 'exact', head: true })
              .eq("seller_id", seller.id);
            
            return {
              ...seller,
              total_products: count || 0
            };
          } catch (countError) {
            console.error(`❌ Error counting products for seller ${seller.id}:`, countError);
            return {
              ...seller,
              total_products: 0
            };
          }
        })
      );
      
      return { data: sellersWithCounts, error: null };
    }
    
    return { data, error };
    
  } catch (error: any) {
    console.error("❌ Error in getSellersByProvinceReport:", error);
    throw error;
  }
}

async function getProductsRatingReport(startDate?: string | null, endDate?: string | null) {
  console.log("📋 Getting products rating report");
  
  try {
    let query = supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (startDate) {
      query = query.gte("created_at", startDate);
    }
    if (endDate) {
      query = query.lte("created_at", endDate);
    }

    const { data: products, error: productsError } = await query;
    
    if (productsError) {
      console.error("❌ Products query error:", productsError);
      return { data: [], error: productsError };
    }

    console.log(`✅ Found ${products?.length || 0} products`);
    
    // Add rating data (simulated for now)
    const productsWithRating = products?.map(product => {
      // Simulate random rating between 3.0 and 5.0
      const randomRating = 3.0 + Math.random() * 2.0;
      
      return {
        id: product.id,
        product_name: product.name,
        store_name: "Store Name", // Placeholder - adjust based on your schema
        category: product.category,
        price: product.price || 0,
        rating: parseFloat(randomRating.toFixed(1)),
        province: product.province || "Unknown",
        city: product.city || "Unknown",
        created_at: product.created_at,
        total_reviews: Math.floor(Math.random() * 100) // Simulated review count
      };
    }) || [];

    // Sort by rating descending
    productsWithRating.sort((a, b) => b.rating - a.rating);
    
    console.log(`✅ Processed ${productsWithRating.length} products with ratings`);
    
    return { data: productsWithRating, error: null };
    
  } catch (error: any) {
    console.error("❌ Error in getProductsRatingReport:", error);
    throw error;
  }
}

export async function POST(request: Request) {
  console.log("🔍 POST request received for admin laporan");
  
  try {
    const body = await request.json();
    const { action } = body;
    
    console.log(`📝 POST action: ${action}`);

    if (action === 'get-provinces') {
      console.log("✅ Returning provinces data");
      return NextResponse.json({
        success: true,
        data: PROVINCES
      });
    }

    console.log(`❌ Invalid action: ${action}`);
    return NextResponse.json(
      { success: false, message: "Aksi tidak valid" },
      { status: 400 }
    );

  } catch (error: any) {
    console.error("❌ Error in POST:", error);
    return NextResponse.json(
      { success: false, message: `Gagal memproses permintaan: ${error.message}` },
      { status: 500 }
    );
  }
}