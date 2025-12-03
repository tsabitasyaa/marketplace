import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Define interface for the request body
interface RegistrasiRequest {
  namaToko: string;
  deskripsi: string;
  namaPIC: string;
  noHPPIC: string;
  emailPIC: string;
  jalan: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kota: string;
  provinsi: string;
  ktpPIC: string;
}

// Type untuk data registration
interface RegistrationData {
  store_name: string
  description: string | null
  pic_name: string
  pic_phone: string
  pic_email: string
  pic_address: string | null
  rt: string | null
  rw: string | null
  kelurahan: string | null
  kecamatan: string | null
  city: string | null
  province: string | null
  pic_ktp: string | null
  pic_photo_url: string
  pic_ktp_file_url: string
  verification_status: string
  verified: boolean
  is_active: boolean
  created_at: string
}

// Gunakan service role key untuk upload file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    console.log('=== START REGISTRATION API ===')
    
    const formData = await request.formData()
    
    // Debug: Log semua field yang diterima
    console.log('Received form fields:')
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: File - ${value.name} (${value.size} bytes)`)
      } else {
        console.log(`${key}: ${value}`)
      }
    }

    // Ambil data dari form
    const storeName = formData.get('storeName') as string
    const description = formData.get('description') as string
    const picName = formData.get('picName') as string
    const picPhone = formData.get('picPhone') as string
    const picEmail = formData.get('picEmail') as string
    const picAddress = formData.get('picAddress') as string
    const rt = formData.get('rt') as string
    const rw = formData.get('rw') as string
    const kelurahan = formData.get('kelurahan') as string
    const kecamatan = formData.get('kecamatan') as string
    const city = formData.get('city') as string
    const province = formData.get('province') as string
    const picKtp = formData.get('picKtp') as string
    const picPhoto = formData.get('picPhoto') as File
    const picKtpFile = formData.get('picKtpFile') as File

    console.log('Processing registration for:', { storeName, picName, picEmail })

    // Validasi data wajib
    if (!storeName?.trim()) {
      return NextResponse.json<RegistrationResponse>(
        { success: false, error: 'Nama toko wajib diisi' },
        { status: 400 }
      )
    }

    if (!picEmail?.trim()) {
      return NextResponse.json<RegistrationResponse>(
        { success: false, error: 'Email PIC wajib diisi' },
        { status: 400 }
      )
    }

    // Validasi file
    if (!picPhoto || picPhoto.size === 0) {
      return NextResponse.json<RegistrationResponse>(
        { success: false, error: 'Foto PIC wajib diupload' },
        { status: 400 }
      )
    }

    if (!picKtpFile || picKtpFile.size === 0) {
      return NextResponse.json<RegistrationResponse>(
        { success: false, error: 'File KTP wajib diupload' },
        { status: 400 }
      )
    }

    // Validasi ukuran file
    if (picPhoto.size > 2 * 1024 * 1024) { // 2MB
      return NextResponse.json<RegistrationResponse>(
        { success: false, error: 'Ukuran foto PIC maksimal 2MB' },
        { status: 400 }
      )
    }

    if (picKtpFile.size > 5 * 1024 * 1024) { // 5MB
      return NextResponse.json<RegistrationResponse>(
        { success: false, error: 'Ukuran file KTP maksimal 5MB' },
        { status: 400 }
      )
    }

    // Validasi tipe file
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!allowedImageTypes.includes(picPhoto.type)) {
      return NextResponse.json<RegistrationResponse>(
        { success: false, error: 'Foto PIC harus format JPG, JPEG, atau PNG' },
        { status: 400 }
      )
    }

    const allowedKtpTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    if (!allowedKtpTypes.includes(picKtpFile.type)) {
      return NextResponse.json<RegistrationResponse>(
        { success: false, error: 'File KTP harus format JPG, JPEG, PNG, atau PDF' },
        { status: 400 }
      )
    }

    // Buat client Supabase dengan service role untuk upload
    console.log('Creating Supabase admin client...')
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Cek apakah bucket registrations ada
    const { data: buckets } = await supabaseAdmin.storage.listBuckets()
    if (buckets) {
      console.log('Available buckets:', buckets.map(b => b.name))
    }

    // Generate nama file unik
    const timestamp = Date.now()
    const sanitizedName = picName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50)
    const photoExt = picPhoto.name.split('.').pop()?.toLowerCase() || 'jpg'
    const ktpExt = picKtpFile.name.split('.').pop()?.toLowerCase() || (picKtpFile.type === 'application/pdf' ? 'pdf' : 'jpg')
    
    const photoFileName = `registrations/${timestamp}_${sanitizedName}_photo.${photoExt}`
    const ktpFileName = `registrations/${timestamp}_${sanitizedName}_ktp.${ktpExt}`

    console.log('Uploading files to storage...')
    console.log('Photo file:', photoFileName)
    console.log('KTP file:', ktpFileName)

    // Upload foto profil
    console.log('Uploading photo...')
    const { data: photoData, error: photoError } = await supabaseAdmin.storage
      .from('registrations')
      .upload(photoFileName, picPhoto, {
        cacheControl: '3600',
        upsert: false,
        contentType: picPhoto.type
      })

    if (photoError) {
      console.error('Photo upload error:', photoError)
      return NextResponse.json<RegistrationResponse>(
        { 
          success: false, 
          error: `Gagal upload foto: ${photoError.message}`,
          details: 'Pastikan bucket "registrations" sudah dibuat di Supabase Storage'
        },
        { status: 500 }
      )
    }
    console.log('Photo uploaded successfully:', photoData)

    // Upload KTP
    console.log('Uploading KTP file...')
    const { data: ktpData, error: ktpError } = await supabaseAdmin.storage
      .from('registrations')
      .upload(ktpFileName, picKtpFile, {
        cacheControl: '3600',
        upsert: false,
        contentType: picKtpFile.type
      })

    if (ktpError) {
      console.error('KTP upload error:', ktpError)
      // Hapus foto yang sudah diupload jika KTP gagal
      if (photoData?.path) {
        await supabaseAdmin.storage.from('registrations').remove([photoData.path])
        console.log('Cleaned up photo file after KTP upload failure')
      }
      
      return NextResponse.json<RegistrationResponse>(
        { success: false, error: `Gagal upload KTP: ${ktpError.message}` },
        { status: 500 }
      )
    }
    console.log('KTP uploaded successfully:', ktpData)

    // Dapatkan URL file publik
    console.log('Getting public URLs...')
    const { data: photoUrlData } = supabaseAdmin.storage
      .from('registrations')
      .getPublicUrl(photoData.path)

    const { data: ktpUrlData } = supabaseAdmin.storage
      .from('registrations')
      .getPublicUrl(ktpData.path)

    const photoUrl = photoUrlData.publicUrl
    const ktpUrl = ktpUrlData.publicUrl

    console.log('Photo URL:', photoUrl)
    console.log('KTP URL:', ktpUrl)

    // Simpan data ke tabel sellers
    console.log('Saving to database table "sellers"...')
    
    const registrationData: RegistrationData = {
      store_name: storeName,
      description: description || null,
      pic_name: picName,
      pic_phone: picPhone,
      pic_email: picEmail,
      pic_address: picAddress || null,
      rt: rt || null,
      rw: rw || null,
      kelurahan: kelurahan || null,
      kecamatan: kecamatan || null,
      city: city || null,
      province: province || null,
      pic_ktp: picKtp || null,
      pic_photo_url: photoUrl,
      pic_ktp_file_url: ktpUrl,
      verification_status: 'pending',
      verified: false,
      is_active: true,
      created_at: new Date().toISOString()
    }

    console.log('Registration data to insert:', registrationData)

    const { data: dbData, error: dbError } = await supabaseAdmin
      .from('sellers')
      .insert(registrationData)
      .select()
      .single()

    if (dbError) {
      console.error('Database insert error:', dbError)
      console.error('Error details:', {
        code: dbError.code,
        details: dbError.details,
        hint: dbError.hint
      })
      
      // Hapus file yang sudah diupload jika insert gagal
      if (photoData?.path && ktpData?.path) {
        await supabaseAdmin.storage.from('registrations').remove([photoData.path, ktpData.path])
        console.log('Cleaned up uploaded files after database error')
      }
      
      // Cek jika error karena RLS (Row Level Security)
      if (dbError.code === '42501') {
        return NextResponse.json<RegistrationResponse>(
          { 
            success: false, 
            error: 'Akses database ditolak. Periksa RLS policies di Supabase.',
            hint: 'Buat policy INSERT untuk tabel sellers'
          },
          { status: 403 }
        )
      }
      
      return NextResponse.json<RegistrationResponse>(
        { 
          success: false, 
          error: `Gagal menyimpan data: ${dbError.message}`,
          details: dbError.details
        },
        { status: 500 }
      )
    }

    console.log('Database insert successful:', dbData)

    // Kirim email notifikasi (simulasi)
    console.log('Sending email notification...')
    // TODO: Implementasi email service di sini

    console.log('=== REGISTRATION COMPLETE ===')

    return NextResponse.json<RegistrationResponse>({
      success: true,
      message: 'Registrasi berhasil! Data Anda sedang dalam proses verifikasi.',
      data: {
        id: dbData.id,
        store_name: dbData.store_name,
        pic_name: dbData.pic_name,
        pic_email: dbData.pic_email,
        verification_status: dbData.verification_status,
        created_at: dbData.created_at,
        registration_number: `REG-${String(dbData.id).padStart(6, '0')}`
      }
    }, { status: 201 })

  } catch (error: unknown) {
    console.error('=== REGISTRATION API ERROR ===')
    
    let errorMessage = 'Terjadi kesalahan internal saat registrasi'
    
    if (error instanceof Error) {
      console.error('Error type:', error.constructor.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
      errorMessage = error.message
    } else {
      console.error('Unknown error:', error)
    }
    
    return NextResponse.json<RegistrationResponse>(
      { 
        success: false, 
        error: errorMessage
      },
      { status: 500 }
    )
  }
}

// Handler untuk method GET
export async function GET() {
  return NextResponse.json<RegistrationResponse>(
    { 
      success: false, 
      error: 'Method tidak diizinkan. Gunakan POST untuk registrasi.' 
    },
    { status: 405 }
  )
}

// Handler untuk method PUT
export async function PUT() {
  return NextResponse.json<RegistrationResponse>(
    { 
      success: false, 
      error: 'Method tidak diizinkan. Gunakan POST untuk registrasi.' 
    },
    { status: 405 }
  )
}

// Handler untuk method DELETE
export async function DELETE() {
  return NextResponse.json<RegistrationResponse>(
    { 
      success: false, 
      error: 'Method tidak diizinkan. Gunakan POST untuk registrasi.' 
    },
    { status: 405 }
  )
}

// Handler untuk method PATCH
export async function PATCH() {
  return NextResponse.json<RegistrationResponse>(
    { 
      success: false, 
      error: 'Method tidak diizinkan. Gunakan POST untuk registrasi.' 
    },
    { status: 405 }
  )
}

// Konfigurasi untuk upload file besar
export const config = {
  api: {
    bodyParser: false,
  },
}