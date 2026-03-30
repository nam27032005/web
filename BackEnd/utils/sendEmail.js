require('dotenv').config();
const nodemailer = require('nodemailer');

/**
 * Gửi email sử dụng Gmail SMTP (Nodemailer)
 * @param {Object} options - { email, subject, html }
 */
const sendEmail = async (options) => {
  // Lấy từ env (đã được force load bằng dotenv.config() ở dòng 1)
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (user && pass) {
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Đơn giản hóa, Nodemailer sẽ tự chọn host và port tối ưu cho Gmail
      auth: {
        user: user,
        pass: pass,
      },
      // Các cấu hình bổ sung để chạy mượt trên Render/Cloud
      dnsFamily: 4, 
      connectionTimeout: 15000, 
      greetingTimeout: 5000,
      socketTimeout: 20000,
    });

    try {
      const mailOptions = {
        from: '"7 Trọ" <noreply@7tro.vn>',
        to: options.email,
        subject: options.subject,
        html: options.html,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('📧 Email sent successfully:', info.messageId);
      return info;
    } catch (err) {
      console.error(`❌ Lỗi thực tế từ Nodemailer cho ${options.email}:`, err.message);
    }
  } else {
    // Fallback nếu vẫn không thấy biến môi trường
    console.log('⚠️ GMAIL_USER hoặc GMAIL_APP_PASSWORD vẫn trống. Hãy kiểm tra file .env');
    console.log('--- Email Mock Content ---');
    console.log('To:', options.email);
    console.log('Subject:', options.subject);
    console.log('Body (HTML):', options.html);
    console.log('--------------------------');
  }
};

module.exports = sendEmail;
