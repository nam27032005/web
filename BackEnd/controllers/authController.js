const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Otp = require('../models/Otp');
const sendEmail = require('../utils/sendEmail');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

/**
 * POST /api/auth/send-register-otp
 * Body: { email, name }
 */
exports.sendRegisterOtp = async (req, res, next) => {
  try {
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Vui lòng cung cấp email.' });
    
    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: 'Email đã được sử dụng.' });

    // Generate 6 digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save to DB
    await Otp.deleteMany({ email }); // xoa cac OTP cu
    await Otp.create({ email, otp: otpCode });

    // Send email (chạy ngầm để không làm treo giao diện)
    sendEmail({
      email,
      subject: 'Mã xác nhận đăng ký tài khoản 7 Trọ',
      html: `<h2>Xin chào ${name || 'bạn'},</h2><p>Mã xác nhận đăng ký của bạn là: <strong>${otpCode}</strong></p><p>Mã này sẽ hết hạn sau 5 phút.</p>`
    }).catch(err => {
      console.error(`❌ Lỗi gửi email OTP cho ${email}:`, err.message);
    });

    res.json({ success: true, message: 'Đã gửi mã xác nhận đến email của bạn.' });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/register
 * Body: { name, email, password, phone, role?, address?, cccd?, otp }
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, address, cccd, otp, gender } = req.body;

    if (!otp) return res.status(400).json({ success: false, message: 'Vui lòng nhập mã OTP.' });

    // Xác nhận OTP
    const validOtp = await Otp.findOne({ email, otp });
    if (!validOtp) {
      return res.status(400).json({ success: false, message: 'Mã xác nhận không đúng hoặc đã hết hạn.' });
    }

    const assignedRole = role === 'admin' ? 'renter' : (role || 'renter');
    
    // Gán avatar xám đen mặc định tùy vào giới tính (style Facebook)
    let avatarUrl = 'https://cdn-icons-png.flaticon.com/512/149/149071.png'; // Nam / Khác mặc định
    if (gender === 'nữ') {
      avatarUrl = 'https://cdn-icons-png.flaticon.com/512/1144/1144709.png'; // Nữ
    }

    const user = await User.create({ 
      name, email, password, phone, role: assignedRole, address, cccd, 
      gender: gender || 'khác', 
      avatar: avatarUrl 
    });
    
    // Xoá OTP sau khi dùng
    await Otp.deleteMany({ email });

    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công!',
      token,
      user,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng.' });
    }

    const token = signToken(user._id);
    user.password = undefined; // không trả password

    res.json({
      success: true,
      message: 'Đăng nhập thành công!',
      token,
      user,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 * Header: Authorization: Bearer <token>
 */
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

/**
 * POST /api/auth/change-password
 * Body: { oldPassword, newPassword }
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
    }

    // Lấy lại user cùng password hash
    const user = await User.findById(req.user._id).select('+password');
    if (!user || !(await user.comparePassword(oldPassword))) {
      return res.status(401).json({ success: false, message: 'Mật khẩu hiện tại không đúng.' });
    }

    user.password = newPassword; // Model sẽ tự hash trước khi lưu
    await user.save();

    res.json({ success: true, message: 'Đổi mật khẩu thành công.' });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/forgot-password
 * Body: { email }
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng với email này.' });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

    // Gửi email
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    const message = `<h2>Bạn đã yêu cầu đặt lại mật khẩu</h2><p>Vui lòng click vào đường link dưới đây để đặt lại mật khẩu:</p><a href="${resetUrl}" target="_blank">${resetUrl}</a><p>Link này chỉ có hiệu lực trong vòng 10 phút. Nếu bạn không yêu cầu đổi mật khẩu, vui lòng bỏ qua email này.</p>`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Đặt lại mật khẩu - 7 Trọ',
        html: message,
      });
      res.json({ success: true, message: 'Link đặt lại mật khẩu đã được gửi đến email của bạn.' });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, message: 'Có lỗi xảy ra khi gửi email. Vui lòng thử lại.' });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/reset-password
 * Body: { token, password }
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.body.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn.' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay bây giờ.' });
  } catch (err) {
    next(err);
  }
};
