const jwt = require('jsonwebtoken');
const User = require('../models/User');

/** Xác thực JWT – đính kèm user vào req.user */
exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'Bạn chưa đăng nhập.' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Tài khoản không tồn tại.' });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn.' });
  }
};

/** Chỉ cho phép các roles cụ thể */
exports.authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Vai trò '${req.user?.role || 'khách'}' không có quyền thực hiện hành động này.`,
    });
  }
  next();
};

/** Xác thực JWT tùy chọn – đính kèm user vào req.user nếu có token hợp lệ */
exports.protectOptional = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user) req.user = user;
    }
    next();
  } catch {
    // Nếu token lỗi thì coi như không đăng nhập, vẫn cho đi tiếp
    next();
  }
};
