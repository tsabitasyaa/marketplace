// app/api/admin/verify/route.js
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Konfigurasi email transporter untuk Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // tsasya16@gmail.com
    pass: process.env.GMAIL_APP_PASSWORD // lzvkeilzkfzakqoq
  }
});

// Fungsi untuk mengirim email notifikasi
async function sendVerificationEmail(sellerEmail, storeName, status, rejectionReason = '') {
  try {
    const subject = status === 'accepted' 
      ? `🎉 Verifikasi Toko "${storeName}" Diterima!`
      : `❌ Verifikasi Toko "${storeName}" Ditolak`;

    const html = status === 'accepted'
      ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; background-color: #059669; padding: 20px; border-radius: 10px 10px 0 0; color: white;">
            <h1 style="margin: 0;">🎉 VERIFIKASI DITERIMA</h1>
          </div>
          <div style="padding: 30px;">
            <p>Halo Seller,</p>
            <p>Selamat! <strong>${storeName}</strong> Anda telah <strong style="color: #059669;">berhasil diverifikasi</strong>.</p>
            
            <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #059669; margin-top: 0;">🎯 Apa yang bisa Anda lakukan sekarang:</h3>
              <ul style="padding-left: 20px;">
                <li>🎁 Mulai menjual produk di marketplace</li>
                <li>📦 Mengelola katalog produk Anda</li>
                <li>💰 Menerima pesanan dari pembeli</li>
                <li>📊 Melihat dashboard penjualan</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="[URL_LOGIN_TOKO]" style="background-color: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                🚀 Login ke Dashboard Toko
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              Jika Anda mengalami kesulitan, hubungi tim support kami.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #999;">
              Email ini dikirim otomatis, mohon tidak membalas email ini.<br>
              &copy; ${new Date().getFullYear()} Marketplace - All rights reserved.
            </p>
          </div>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; background-color: #dc2626; padding: 20px; border-radius: 10px 10px 0 0; color: white;">
            <h1 style="margin: 0;">❌ VERIFIKASI DITOLAK</h1>
          </div>
          <div style="padding: 30px;">
            <p>Halo Seller,</p>
            <p>Maaf, verifikasi toko <strong>${storeName}</strong> Anda <strong style="color: #dc2626;">tidak dapat disetujui</strong>.</p>
            
            ${rejectionReason ? `
              <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                <h4 style="color: #dc2626; margin-top: 0;">📝 Alasan Penolakan:</h4>
                <p style="color: #666;">${rejectionReason}</p>
              </div>
            ` : ''}
            
            <div style="background-color: #fffbeb; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #d97706; margin-top: 0;">🔄 Langkah Selanjutnya:</h3>
              <ul style="padding-left: 20px;">
                <li>📋 Perbaiki data yang kurang sesuai</li>
                <li>📸 Pastikan foto dan dokumen jelas terbaca</li>
                <li>✅ Ajukan verifikasi ulang setelah perbaikan</li>
                <li>📞 Hubungi support jika ada pertanyaan</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="[URL_AJUAN_ULANG]" style="background-color: #d97706; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                🔄 Ajukan Verifikasi Ulang
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              <strong>📞 Hubungi Support:</strong><br>
              Email: support@marketplace.id<br>
              Telepon: 0812-3456-7890
            </p>
            
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #999;">
              Email ini dikirim otomatis, mohon tidak membalas email ini.<br>
              &copy; ${new Date().getFullYear()} Marketplace - All rights reserved.
            </p>
          </div>
        </div>
      `;

    const mailOptions = {
      from: `"Marketplace Admin" <${process.env.GMAIL_USER}>`,
      to: sellerEmail,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { seller_id, user_id, status, rejection_reason, seller_email, store_name } = body;

    // Validasi input
    if (!seller_id || !status || !seller_email) {
      return NextResponse.json(
        { success: false, message: 'Data tidak lengkap' },
        { status: 400 }
      );
    }

    if (!['accepted', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Status tidak valid' },
        { status: 400 }
      );
    }

    // Koneksi ke Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update status verifikasi di tabel sellers
    const updateData = {
      verification_status: status,
      ...(status === 'rejected' && rejection_reason ? { 
        verification_notes: rejection_reason 
      } : {})
    };

    const { data, error } = await supabase
      .from('sellers')
      .update(updateData)
      .eq('id', seller_id)
      .select()
      .single();

    if (error) {
      console.error('Database update error:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Gagal memperbarui status penjual di database',
          error: error.message 
        },
        { status: 500 }
      );
    }

    // Kirim email notifikasi
    let emailSent = false;
    try {
      emailSent = await sendVerificationEmail(
        seller_email, 
        store_name || data.store_name, 
        status, 
        rejection_reason
      );
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Lanjutkan meskipun email gagal
    }

    // Jika status diterima, update juga is_active
    if (status === 'accepted') {
      await supabase
        .from('sellers')
        .update({ 
          is_active: true,
          verification_status: 'verified' // Bisa juga set ke 'verified'
        })
        .eq('id', seller_id);
    }

    return NextResponse.json({
      success: true,
      message: status === 'accepted' 
        ? 'Penjual berhasil diverifikasi dan email notifikasi dikirim' 
        : 'Penjual ditolak dan email notifikasi dikirim',
      data: {
        seller_id,
        verification_status: status,
        email_sent: emailSent,
        seller_email
      }
    });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: error.message 
      },
      { status: 500 }
    );
  }
}