import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

function generateRandomPassword() {
  return crypto.randomBytes(6).toString('base64');
}

async function sendVerificationEmail(
  sellerEmail,
  storeName,
  status,
  rejectionReason = '',
  generatedPassword = null
) {
  try {
    let extraInfoHtml = '';

    if (status === 'accepted' && generatedPassword) {
      extraInfoHtml = `
        <div style="background:#e0f7ff;padding:15px;border-radius:6px;margin:20px 0;">
          <h3 style="margin:0;color:#0369a1;">🔑 Akun Anda Telah Dibuat</h3>
          <p>Email: <strong>${sellerEmail}</strong></p>
          <p>Password: <strong>${generatedPassword}</strong></p>
        </div>
      `;
    }

    const subject =
      status === 'accepted'
        ? `🎉 Verifikasi Toko "${storeName}" Diterima!`
        : `❌ Verifikasi Toko "${storeName}" Ditolak`;

    const html =
      status === 'accepted'
        ? `
        <div style="font-family: Arial; padding:20px;">
          <h2 style="color:#059669;">🎉 Verifikasi Diterima</h2>
          <p>Toko <strong>${storeName}</strong> Anda telah berhasil diverifikasi.</p>
          ${extraInfoHtml}
          <p>Silakan login ke dashboard toko.</p>
        </div>
      `
        : `
        <div style="font-family: Arial; padding:20px;">
          <h2 style="color:#dc2626;">❌ Verifikasi Ditolak</h2>
          <p>Toko <strong>${storeName}</strong> tidak dapat diverifikasi.</p>
          <p><strong>Alasan:</strong> ${rejectionReason}</p>
        </div>
      `;

    await transporter.sendMail({
      from: `"Marketplace Admin" <${process.env.GMAIL_USER}>`,
      to: sellerEmail,
      subject,
      html
    });

    return true;
  } catch (err) {
    console.error("Email error:", err);
    return false;
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { seller_id, status, rejection_reason, seller_email, store_name } = body;

    if (!seller_id || !status || !seller_email) {
      return NextResponse.json(
        { success: false, message: 'Data tidak lengkap' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update status awal
    const updateData = {
      verification_status: status,
      ...(status === 'rejected' && rejection_reason
        ? { verification_notes: rejection_reason }
        : {})
    };

    const { data: sellerData, error } = await supabase
      .from('sellers')
      .update(updateData)
      .eq('id', seller_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, message: 'DB update error', error: error.message },
        { status: 500 }
      );
    }

    let generatedPassword = null;
    let authUserId = null;

    if (status === 'accepted') {
      // 1️⃣ Generate password
      generatedPassword = generateRandomPassword();

      // 2️⃣ Buat user Supabase Auth
      const { data: createdUser, error: authError } =
        await supabase.auth.admin.createUser({
          email: seller_email,
          password: generatedPassword,
          email_confirm: true
        });

      if (authError) {
        console.error("Auth user creation failed:", authError);
        return NextResponse.json(
          { success: false, message: 'Gagal membuat auth user' },
          { status: 500 }
        );
      }

      authUserId = createdUser.user.id;

      // 3️⃣ Insert ke public.users
      const { error: profileError } = await supabase
        .from("users")
        .insert({
          id: authUserId,
          email: seller_email,
          role: "seller"
        });

      if (profileError) {
        console.error("Insert public.users failed:", profileError);
      }

      // 4️⃣ Update sellers.user_id sebagai foreign key ke public.users
      await supabase
        .from("sellers")
        .update({
          user_id: authUserId,
          verified: true,
          is_active: true,
          verification_status: "verified"
        })
        .eq("id", seller_id);
    }

    // 5️⃣ Kirim email password
    await sendVerificationEmail(
      seller_email,
      store_name || sellerData.store_name,
      status,
      rejection_reason,
      generatedPassword
    );

    return NextResponse.json({
      success: true,
      message:
        status === 'accepted'
          ? 'Seller diverifikasi, akun dibuat, user ditautkan, dan email terkirim'
          : 'Seller ditolak dan email dikirim',
      data: {
        seller_id,
        user_id: authUserId,
        auth_password: generatedPassword ? "(sent via email)" : null
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
