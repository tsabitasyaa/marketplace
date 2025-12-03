import nodemailer from 'nodemailer';

// Email template for accepted verification
const getAcceptedEmailTemplate = (
  sellerName: string,
  storeName: string
): string => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verifikasi Diterima</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9fafb;
        }
        .container {
            background-color: #ffffff;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border: 1px solid #e5e7eb;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .success-icon {
            color: #10B981;
            font-size: 48px;
            margin-bottom: 20px;
        }
        h1 {
            color: #059669;
            margin: 0;
            font-size: 28px;
        }
        .subtitle {
            color: #6B7280;
            font-size: 16px;
            margin-top: 8px;
        }
        .content {
            margin: 30px 0;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
        }
        .info-box {
            background-color: #F0F9FF;
            border-left: 4px solid #3B82F6;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .steps {
            background-color: #FEF3C7;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
        }
        .steps h3 {
            color: #D97706;
            margin-top: 0;
        }
        ol {
            margin: 10px 0;
            padding-left: 20px;
        }
        li {
            margin-bottom: 8px;
        }
        .cta-button {
            display: inline-block;
            background-color: #10B981;
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6B7280;
            font-size: 14px;
        }
        .highlight {
            background-color: #FFFBEB;
            padding: 10px;
            border-radius: 6px;
            border: 1px solid #FDE68A;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="success-icon">✅</div>
            <h1>Verifikasi Toko Diterima!</h1>
            <p class="subtitle">Selamat, Anda sekarang dapat mulai berjualan</p>
        </div>
        
        <div class="content">
            <p class="greeting">Halo <strong>${sellerName}</strong>,</p>
            
            <p>Kami dengan senang hati memberitahukan bahwa verifikasi toko Anda <strong>"${storeName}"</strong> telah <strong>diterima</strong> oleh tim verifikasi kami.</p>
            
            <div class="info-box">
                <p>🎉 <strong>Selamat!</strong> Anda sekarang resmi menjadi penjual di platform kami.</p>
            </div>
            
            <div class="steps">
                <h3>📋 Langkah Selanjutnya:</h3>
                <ol>
                    <li><strong>Login ke dashboard penjual</strong> untuk mengelola toko Anda</li>
                    <li><strong>Lengkapi profil toko</strong> dengan informasi yang menarik</li>
                    <li><strong>Upload produk pertama</strong> Anda dan mulai berjualan</li>
                    <li><strong>Atur metode pengiriman</strong> dan pembayaran</li>
                </ol>
            </div>
            
            <div class="highlight">
                <p>💡 <strong>Tips:</strong> Lengkapi semua informasi toko untuk meningkatkan kepercayaan pembeli dan meningkatkan penjualan!</p>
            </div>
            
            <a href="https://yourwebsite.com/seller/dashboard" class="cta-button">🚀 Masuk ke Dashboard Penjual</a>
            
            <p>Jika Anda memiliki pertanyaan atau membutuhkan bantuan, jangan ragu untuk menghubungi tim support kami.</p>
        </div>
        
        <div class="footer">
            <p>Salam hangat,<br><strong>Tim Verifikasi</strong><br>Platform E-Commerce</p>
            <p style="margin-top: 15px; font-size: 12px; color: #9CA3AF;">
                Email ini dikirim secara otomatis. Mohon tidak membalas email ini.
            </p>
        </div>
    </div>
</body>
</html>
`;

// Email template for rejected verification
const getRejectedEmailTemplate = (
  sellerName: string,
  storeName: string,
  rejectionReason: string
): string => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verifikasi Ditolak</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9fafb;
        }
        .container {
            background-color: #ffffff;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border: 1px solid #e5e7eb;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .warning-icon {
            color: #EF4444;
            font-size: 48px;
            margin-bottom: 20px;
        }
        h1 {
            color: #DC2626;
            margin: 0;
            font-size: 28px;
        }
        .subtitle {
            color: #6B7280;
            font-size: 16px;
            margin-top: 8px;
        }
        .content {
            margin: 30px 0;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
        }
        .rejection-box {
            background-color: #FEF2F2;
            border-left: 4px solid #DC2626;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .rejection-box h3 {
            color: #DC2626;
            margin-top: 0;
        }
        .rejection-reason {
            background-color: #FEE2E2;
            padding: 15px;
            border-radius: 6px;
            margin: 15px 0;
            font-style: italic;
            border: 1px solid #FCA5A5;
        }
        .steps {
            background-color: #FFFBEB;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            border: 1px solid #FDE68A;
        }
        .steps h3 {
            color: #D97706;
            margin-top: 0;
        }
        ol {
            margin: 10px 0;
            padding-left: 20px;
        }
        li {
            margin-bottom: 10px;
        }
        .action-button {
            display: inline-block;
            background-color: #3B82F6;
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
        }
        .support-box {
            background-color: #EFF6FF;
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
            border: 1px solid #BFDBFE;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6B7280;
            font-size: 14px;
        }
        .note {
            background-color: #F3F4F6;
            padding: 12px;
            border-radius: 6px;
            font-size: 14px;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="warning-icon">⚠️</div>
            <h1>Verifikasi Toko Ditolak</h1>
            <p class="subtitle">Perlu perbaikan data untuk dapat diverifikasi</p>
        </div>
        
        <div class="content">
            <p class="greeting">Halo <strong>${sellerName}</strong>,</p>
            
            <p>Kami memberitahukan bahwa verifikasi toko Anda <strong>"${storeName}"</strong> telah <strong>ditolak</strong> oleh tim verifikasi kami.</p>
            
            <div class="rejection-box">
                <h3>📝 Alasan Penolakan:</h3>
                <div class="rejection-reason">
                    "${rejectionReason}"
                </div>
            </div>
            
            <div class="steps">
                <h3>🔧 Langkah Perbaikan:</h3>
                <ol>
                    <li><strong>Periksa kembali data yang Anda submit</strong> sesuai dengan alasan penolakan di atas</li>
                    <li><strong>Pastikan dokumen (KTP dan foto)</strong> jelas, valid, dan terbaca dengan baik</li>
                    <li><strong>Perbaiki informasi yang tidak sesuai</strong> atau tidak lengkap</li>
                    <li><strong>Pastikan semua data sesuai</strong> dengan identitas asli Anda</li>
                </ol>
            </div>
            
            <div class="note">
                <p>💡 <strong>Catatan:</strong> Anda dapat mengajukan ulang verifikasi setelah memperbaiki data yang diminta.</p>
            </div>
            
            <div class="support-box">
                <h3>📞 Butuh Bantuan?</h3>
                <p>Jika Anda memiliki pertanyaan atau kesulitan dalam proses perbaikan data, jangan ragu untuk menghubungi tim support kami:</p>
                <ul>
                    <li>Email: support@yourwebsite.com</li>
                    <li>WhatsApp: +62 812-3456-7890</li>
                    <li>Jam Operasional: Senin - Jumat, 09:00 - 17:00 WIB</li>
                </ul>
            </div>
            
            <a href="https://yourwebsite.com/seller/verification/resubmit" class="action-button">✏️ Ajukan Ulang Verifikasi</a>
        </div>
        
        <div class="footer">
            <p>Salam,<br><strong>Tim Verifikasi</strong><br>Platform E-Commerce</p>
            <p style="margin-top: 15px; font-size: 12px; color: #9CA3AF;">
                Email ini dikirim secara otomatis. Mohon tidak membalas email ini.
            </p>
        </div>
    </div>
</body>
</html>
`;

// Create email transporter
const createTransporter = () => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error('Gmail configuration not found in environment variables');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

// Interface for email parameters
export interface VerificationEmailParams {
  sellerEmail: string;
  sellerName: string;
  storeName: string;
  status: 'accepted' | 'rejected';
  rejectionReason?: string;
}

// Main function to send verification email
export async function sendVerificationEmail(params: VerificationEmailParams): Promise<{ success: boolean; message?: string }> {
  const { sellerEmail, sellerName, storeName, status, rejectionReason } = params;
  
  // Validate required parameters
  if (!sellerEmail || !sellerName || !storeName) {
    return {
      success: false,
      message: 'Email, nama penjual, dan nama toko diperlukan'
    };
  }
  
  if (status === 'rejected' && !rejectionReason) {
    return {
      success: false,
      message: 'Alasan penolakan diperlukan untuk status rejected'
    };
  }
  
  try {
    const transporter = createTransporter();
    
    const emailTemplate = status === 'accepted'
      ? getAcceptedEmailTemplate(sellerName, storeName)
      : getRejectedEmailTemplate(sellerName, storeName, rejectionReason!);
    
    const subject = status === 'accepted'
      ? `🎉 Verifikasi Toko "${storeName}" Diterima!`
      : `❌ Perlu Perbaikan: Verifikasi Toko "${storeName}" Ditolak`;
    
    const textVersion = status === 'accepted'
      ? `Halo ${sellerName},\n\nVerifikasi toko Anda "${storeName}" telah DITERIMA oleh tim verifikasi kami.\n\nSelamat! Anda sekarang dapat mulai berjualan di platform kami. Login ke dashboard penjual untuk mengelola toko dan menambahkan produk pertama Anda.\n\nSalam,\nTim Verifikasi\nPlatform E-Commerce`
      : `Halo ${sellerName},\n\nVerifikasi toko Anda "${storeName}" telah DITOLAK oleh tim verifikasi kami.\n\nAlasan penolakan: ${rejectionReason}\n\nSilakan perbaiki data sesuai dengan alasan di atas dan ajukan ulang verifikasi. Jika Anda membutuhkan bantuan, hubungi tim support kami di support@yourwebsite.com\n\nSalam,\nTim Verifikasi\nPlatform E-Commerce`;
    
    const mailOptions = {
      from: {
        name: 'Tim Verifikasi Platform E-Commerce',
        address: process.env.GMAIL_USER!
      },
      to: sellerEmail,
      subject,
      text: textVersion,
      html: emailTemplate,
      replyTo: 'no-reply@yourwebsite.com'
    };
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully:', info.messageId);
    
    return {
      success: true,
      message: 'Email verifikasi berhasil dikirim'
    };
    
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    
    return {
      success: false,
      message: `Gagal mengirim email: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}