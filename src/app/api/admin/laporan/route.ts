// app/api/admin/laporan/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Inisialisasi Supabase client
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

    // Test connection
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
          message: `Database connection error: ${testError.message}`,
          error: testError.message
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
  console.log("📋 Getting seller status report - SESUAI SCHEMA DATABASE");
  
  try {
    // Query sellers dengan join ke users untuk mendapatkan email user
    let query = supabase
      .from("sellers")
      .select(`
        id,
        store_name,
        pic_name,
        pic_email,
        pic_phone,
        province,
        city,
        verified,
        verification_status,
        created_at,
        is_active,
        users!inner (
          email,
          name
        )
      `);

    if (startDate) {
      console.log(`📅 Filter start date: ${startDate}`);
      query = query.gte("created_at", startDate);
    }
    if (endDate) {
      console.log(`📅 Filter end date: ${endDate}`);
      query = query.lte("created_at", endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error("❌ Query error (sellers):", error);
      return { data: [], error };
    }

    console.log(`✅ Found ${data?.length || 0} sellers`);

    // Format data sesuai kebutuhan laporan
    const formattedData = data?.map(seller => {
      // Tentukan status berdasarkan verified, verification_status, dan is_active
      let status = "Tidak Aktif";
      
      if (seller.is_active && seller.verified && seller.verification_status === 'accepted') {
        status = "Aktif";
      } else if (!seller.is_active) {
        status = "Non-Aktif";
      } else if (!seller.verified) {
        status = "Belum Diverifikasi";
      } else if (seller.verification_status === 'pending') {
        status = "Menunggu Verifikasi";
      } else if (seller.verification_status === 'rejected') {
        status = "Ditolak";
      }
      
      return {
        id: seller.id,
        email: seller.users?.email || seller.pic_email || '-',
        name: seller.users?.name || seller.pic_name || '-',
        pic_name: seller.pic_name || '-',
        store_name: seller.store_name || '-',
        status: status,
        verified: seller.verified,
        verification_status: seller.verification_status,
        is_active: seller.is_active,
        province: seller.province,
        city: seller.city,
        created_at: seller.created_at,
        // Untuk sorting: Aktif dulu, baru status lainnya
        status_order: status === "Aktif" ? 1 : 
                     status === "Menunggu Verifikasi" ? 2 :
                     status === "Belum Diverifikasi" ? 3 :
                     status === "Ditolak" ? 4 : 5
      };
    }) || [];

    // Urutkan: Aktif dulu, kemudian berdasarkan status_order
    formattedData.sort((a, b) => a.status_order - b.status_order);

    return { data: formattedData, error: null };
    
  } catch (error: any) {
    console.error("❌ Error in getSellerStatusReport:", error);
    return { data: [], error };
  }
}

async function getSellersByProvinceReport(provinceId?: string | null, startDate?: string | null, endDate?: string | null) {
  console.log("📋 Getting sellers by province report - SESUAI SCHEMA DATABASE");
  
  try {
    let provinceName;
    if (provinceId) {
      const prov = PROVINCES.find(p => p.id === provinceId);
      provinceName = prov ? prov.name : provinceId;
      console.log(`📍 Province filter: ${provinceName} (ID: ${provinceId})`);
    }

    // Query sellers berdasarkan provinsi
    let query = supabase
      .from("sellers")
      .select(`
        id,
        store_name,
        pic_name,
        pic_email,
        pic_phone,
        province,
        city,
        verified,
        created_at,
        users!inner (
          name
        )
      `)
      .order('province', { ascending: true });

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
      return { data: [], error };
    }

    console.log(`✅ Found ${data?.length || 0} sellers by province`);
    
    // Format data sesuai kebutuhan laporan
    const formattedData = data?.map(seller => {
      return {
        id: seller.id,
        store_name: seller.store_name || '-',
        name: seller.users?.name || seller.pic_name || '-',
        pic_name: seller.pic_name || '-',
        email: seller.pic_email || '-',
        phone: seller.pic_phone || '-',
        province: seller.province || '-',
        city: seller.city || '-',
        verified: seller.verified,
        created_at: seller.created_at,
        province_name: seller.province || 'ZZZ' // Untuk sorting
      };
    }) || [];

    // Sort by province
    formattedData.sort((a, b) => a.province_name.localeCompare(b.province_name));

    return { data: formattedData, error: null };
    
  } catch (error: any) {
    console.error("❌ Error in getSellersByProvinceReport:", error);
    return { data: [], error };
  }
}

async function getProductsRatingReport(startDate?: string | null, endDate?: string | null) {
  console.log("📋 Getting products rating report - SESUAI SCHEMA DATABASE");
  
  try {
    // Query products dengan join ke sellers dan reviews untuk rating
    let query = supabase
      .from("products")
      .select(`
        id,
        name,
        category,
        price,
        stock,
        condition,
        province,
        city,
        created_at,
        sellers!inner (
          store_name,
          province,
          city
        ),
        reviews (
          rating,
          user_province,
          created_at
        )
      `)
      .order('created_at', { ascending: false });

    if (startDate) {
      query = query.gte("products.created_at", startDate);
    }
    if (endDate) {
      query = query.lte("products.created_at", endDate);
    }

    const { data: products, error: productsError } = await query;
    
    if (productsError) {
      console.error("❌ Products query error:", productsError);
      return { data: [], error: productsError };
    }

    console.log(`✅ Found ${products?.length || 0} products`);
    
    // Format data dengan menghitung rating dari reviews
    const productsWithRating = products?.map(product => {
      // Hitung rating rata-rata dari reviews
      let averageRating = 0;
      let totalReviews = 0;
      let reviewProvince = product.province || product.sellers?.province || 'Tidak diketahui';
      
      if (product.reviews && product.reviews.length > 0) {
        const totalRating = product.reviews.reduce((sum: number, review: any) => {
          if (review.rating) {
            // Ambil provinsi dari review pertama untuk laporan
            if (totalReviews === 0 && review.user_province) {
              reviewProvince = review.user_province;
            }
            totalReviews++;
            return sum + review.rating;
          }
          return sum;
        }, 0);
        
        averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;
      } else {
        // Jika tidak ada review, beri rating default
        averageRating = 3.5;
        totalReviews = 0;
      }
      
      return {
        id: product.id,
        product_name: product.name || 'Produk tanpa nama',
        category: product.category || 'Tidak ada kategori',
        price: product.price || 0,
        rating: parseFloat(averageRating.toFixed(1)),
        total_reviews: totalReviews,
        store_name: product.sellers?.store_name || 'Toko tidak diketahui',
        province: reviewProvince, // Provinsi dari pemberi rating (sesuai SRS)
        seller_province: product.sellers?.province || product.province || 'Tidak diketahui',
        condition: product.condition || '-',
        stock: product.stock || 0,
        created_at: product.created_at
      };
    }) || [];

    // Sort by rating descending
    productsWithRating.sort((a, b) => b.rating - a.rating);
    
    console.log(`✅ Processed ${productsWithRating.length} products with ratings`);
    
    return { data: productsWithRating, error: null };
    
  } catch (error: any) {
    console.error("❌ Error in getProductsRatingReport:", error);
    return { data: [], error };
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
      { 
        success: false, 
        message: `Gagal memproses permintaan: ${error.message}` 
      },
      { status: 500 }
    );
  }
}