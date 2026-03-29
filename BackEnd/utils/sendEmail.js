const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Đọc từ biến môi trường, mặc định dùng mốc để test nếu không có email thật
  let transporter;

  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    // Dùng Gmail thật
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  } else {
    // Dùng Ethereal Mail (Email giả lập để lấy URL view thư trên terminal)
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  const mailOptions = {
    from: '"7 Trọ" <noreply@7tro.vn>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  const info = await transporter.sendMail(mailOptions);

  if (!process.env.GMAIL_USER) {
    console.log('📧 Message sent: %s', info.messageId);
    console.log('🔗 Preview URL: %s', nodemailer.getTestMessageUrl(info));
  }
};

module.exports = sendEmail;
