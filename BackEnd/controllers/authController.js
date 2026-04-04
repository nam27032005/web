const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Otp = require('../models/Otp');
const { Op } = require('sequelize');

const generateToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const sendOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  });
  await transporter.sendMail({
    from: `"EasyAccomod" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Mã xác thực OTP - EasyAccomod',
    html: `<p>Mã OTP của bạn là: <b>${otp}</b>. Có hiệu lực trong 10 phút.</p>`,
  });
};

const sendResetEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  });
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: `"EasyAccomod" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Đặt lại mật khẩu - EasyAccomod',
    html: `
      <h3>Yêu cầu đặt lại mật khẩu</h3>
      <p>Bạn nhận được email này vì chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
      <p>Vui lòng nhấn vào nút bên dưới để đặt lại mật khẩu của bạn:</p>
      <a href="${resetUrl}" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Đặt lại mật khẩu</a>
      <p>Hoặc sao chép và dán liên kết này vào trình duyệt của bạn:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>Liên kết này sẽ hết hạn sau 1 giờ.</p>
      <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
    `,
  });
};

// POST /api/auth/register — tạo user sau khi đã verify OTP
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, gender, address, role, otp } = req.body;

    // Verify OTP
    if (!otp) return res.status(400).json({ success: false, message: 'Vui lòng nhập mã OTP.' });
    const otpRecord = await Otp.findOne({
      where: { email, otp, expiresAt: { [Op.gt]: new Date() } },
      order: [['createdAt', 'DESC']],
    });
    if (!otpRecord) return res.status(400).json({ success: false, message: 'OTP không hợp lệ hoặc đã hết hạn.' });

    // Kiểm tra email đã verified chưa
    const verifiedUser = await User.findOne({ where: { email, verified: true } });
    if (verifiedUser) return res.status(400).json({ success: false, message: 'Email này đã có tài khoản. Vui lòng đăng nhập.' });

    // Xóa user chưa verified cũ (nếu có)
    await User.destroy({ where: { email, verified: false } });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, email, password: hashed, phone, gender, address,
      role: role === 'owner' ? 'owner' : 'renter',
      verified: true,
      active: true,
    });

    await otpRecord.destroy();

    const token = generateToken(user);
    res.status(201).json({ success: true, message: 'Đăng ký thành công!', token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/send-register-otp — gửi OTP trước khi tạo user
exports.sendRegisterOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email là bắt buộc.' });

    // Kiểm tra email đã được dùng bởi user đã verified chưa
    const existing = await User.findOne({ where: { email, verified: true } });
    if (existing) return res.status(400).json({ success: false, message: 'Email đã được sử dụng.' });

    const otp = crypto.randomInt(100000, 999999).toString();
    await Otp.create({ email, otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) });
    await sendOtpEmail(email, otp);

    res.json({ success: true, message: 'Đã gửi OTP.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/verify-otp
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = await Otp.findOne({
      where: { email, otp, used: false, expiresAt: { [Op.gt]: new Date() } },
      order: [['createdAt', 'DESC']],
    });
    if (!record) return res.status(400).json({ success: false, message: 'OTP không hợp lệ hoặc đã hết hạn.' });

    await record.update({ used: true });
    await User.update({ verified: true }, { where: { email } });
    const user = await User.findOne({ where: { email } });
    const token = generateToken(user);

    res.json({ success: true, message: 'Xác thực thành công!', token, user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/resend-otp
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ success: false, message: 'Email không tồn tại.' });
    if (user.verified) return res.status(400).json({ success: false, message: 'Email đã được xác thực.' });

    const otp = crypto.randomInt(100000, 999999).toString();
    await Otp.create({ email, otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) });
    await sendOtpEmail(email, otp);

    res.json({ success: true, message: 'Đã gửi lại OTP.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng.' });
    if (!user.active) return res.status(403).json({ success: false, message: 'Tài khoản đã bị khóa.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng.' });
    if (!user.verified) return res.status(403).json({ success: false, message: 'Vui lòng xác thực email.', needVerify: true, email });

    const token = generateToken(user);
    res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, phone: user.phone } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ success: false, message: 'Email không tồn tại.' });

    // Generate token
    const token = crypto.randomBytes(20).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    await user.update({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: new Date(Date.now() + 3600000), // 1 hour
    });

    await sendResetEmail(email, token);

    res.json({ success: true, message: 'Đã gửi liên kết đặt lại mật khẩu qua email.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/verify-reset-token
exports.verifyResetToken = async (req, res) => {
  try {
    const { token } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Đường dẫn đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.' });
    }

    res.json({ success: true, message: 'Token hợp lệ.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Đường dẫn đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await user.update({
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    res.json({ success: true, message: 'Đặt lại mật khẩu thành công!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/auth/change-password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không đúng.' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.update({ password: hashed }, { where: { id: req.user.id } });
    res.json({ success: true, message: 'Đổi mật khẩu thành công!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/auth/update-profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, gender, address, avatar } = req.body;
    await User.update({ name, phone, gender, address, avatar }, { where: { id: req.user.id } });
    const updated = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
