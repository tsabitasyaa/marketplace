import nodemailer from 'nodemailer';

// Config transporter
const createTransporter = () => {
  // Jika ada Gmail config, pakai Gmail
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  // Jika tidak, pakai Ethereal (testing)
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: process.env.ETHEREAL_USER || 'test@ethereal.email',
      pass: process.env.ETHEREAL_PASS || 'test123',
    },
  });
};

// Template email
export const createThankYouEmail = (
  userName: string,
  productName: string,
  userEmail: string
) => {
  return {
    from: {
      name: 'Loopy Marketplace',
      address: process.env.GMAIL_USER || 'noreply@loopymarketplace.com'
    },
    to: userEmail,
    subject: `Terima Kasih atas Review Anda untuk ${productName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Terima Kasih atas Review Anda</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .container {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #567C8D 0%, #2F4156 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .content {
            padding: 30px;
          }
          .greeting {
            font-size: 24px;
            color: #2F4156;
            margin-bottom: 20px;
            font-weight: 600;
          }
          .highlight {
            background: #F5EFEB;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #567C8D;
            margin: 20px 0;
          }
          .product-name {
            color: #567C8D;
            font-weight: 600;
          }
          .footer {
            text-align: center;
            padding: 20px;
            background: #f8f9fa;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #eee;
          }
          .thank-you {
            font-size: 48px;
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🛍️ Loopy Marketplace</div>
            <p>Marketplace Terpercaya Indonesia</p>
          </div>
          
          <div class="content">
            <div class="thank-you">🙏</div>
            <div class="greeting">Terima Kasih, ${userName}!</div>
            
            <p>Kami sangat menghargai waktu dan usaha Anda untuk memberikan review pada produk:</p>
            
            <div class="highlight">
              <strong class="product-name">${productName}</strong>
            </div>
            
            <p>Review Anda sangat berharga bagi kami karena:</p>
            <ul>
              <li>Membantu kami meningkatkan kualitas produk dan layanan</li>
              <li>Membantu pembeli lain dalam membuat keputusan yang tepat</li>
              <li>Membangun komunitas marketplace yang transparan</li>
            </ul>
            
            <p>Kami berkomitmen untuk terus memberikan pengalaman berbelanja terbaik untuk Anda.</p>
            
            <p style="margin-top: 30px;">
              Salam hangat,<br>
              <strong>Tim Loopy Marketplace</strong><br>
              <small style="color: #567C8D;">Belanja Aman, Nyaman, Terpercaya</small>
            </p>
          </div>
          
          <div class="footer">
            <p>Email ini dikirim secara otomatis. Mohon tidak membalas email ini.</p>
            <p>© 2025 Loopy Marketplace. All rights reserved.</p>
            <p style="font-size: 10px; margin-top: 10px; color: #999;">
              Jika Anda tidak memberikan review, abaikan email ini atau hubungi support@loopymarketplace.com
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Terima Kasih ${userName}!

Kami sangat menghargai waktu Anda untuk memberikan review pada produk:
${productName}

Review Anda membantu kami meningkatkan kualitas layanan dan membantu pembeli lain dalam membuat keputusan.

Salam hangat,
Tim Loopy Marketplace
Belanja Aman, Nyaman, Terpercaya

© 2025 Loopy Marketplace. All rights reserved.`
  };
};

// Fungsi utama untuk send email
export const sendThankYouEmail = async (
  userEmail: string,
  userName: string,
  productName: string
): Promise<{ success: boolean; message?: string; info?: any }> => {
  try {
    console.log(`📧 Preparing to send thank you email to: ${userEmail}`);

    // Validasi email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      console.error('❌ Invalid email format:', userEmail);
      return { success: false, message: 'Format email tidak valid' };
    }

    const transporter = createTransporter();
    const mailOptions = createThankYouEmail(userName, productName, userEmail);

    console.log('📤 Sending email...');
    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Email sent successfully to:', userEmail);
    console.log('📫 Message ID:', info.messageId);

    return {
      success: true,
      message: 'Email terima kasih berhasil dikirim',
      info
    };

  } catch (error: any) {
    console.error('❌ Error sending email:', error);
    
    // Error handling spesifik
    let errorMessage = 'Gagal mengirim email';
    if (error.code === 'EAUTH') {
      errorMessage = 'Gagal autentikasi email. Periksa Gmail App Password.';
    } else if (error.code === 'EENVELOPE') {
      errorMessage = 'Alamat email tidak valid';
    }

    return {
      success: false,
      message: `${errorMessage}: ${error.message}`
    };
  }
};