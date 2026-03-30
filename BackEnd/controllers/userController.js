const User = require('../models/User');

/**
 * GET /api/users           – Admin: lấy tất cả users
 * GET /api/users?role=owner  – lọc theo role
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;

    let users;
    if (req.user.role === 'admin') {
      users = await User.find(filter).sort({ createdAt: -1 });
    } else {
      // Non-admin can only see basic info for searching (like admin)
      users = await User.find(filter).select('name avatar role').sort({ createdAt: -1 });
    }

    res.json({ success: true, count: users.length, users });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/users/:id
 */
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/users/:id       – User tự cập nhật, hoặc admin cập nhật bất kỳ
 * Body: { name, phone, avatar, address, cccd }
 */
exports.updateUser = async (req, res, next) => {
  try {
    // User thường chỉ được sửa chính mình
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Không có quyền.' });
    }

    const allowed = ['name', 'phone', 'avatar', 'address', 'cccd'];
    const updates = {};
    allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    // Admin có thể đổi verified
    if (req.user.role === 'admin' && req.body.verified !== undefined) {
      updates.verified = req.body.verified;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });

    res.json({ success: true, message: 'Cập nhật thành công.', user });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/users/:id    – Chỉ admin
 */
exports.deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xóa người dùng.' });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/users/:id/verify  – Admin xác nhận chủ nhà
 */
exports.verifyOwner = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { verified: true },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    res.json({ success: true, message: 'Đã xác nhận chủ nhà.', user });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/users/me/favorites – Lấy danh sách ID phòng yêu thích của tôi
 */
exports.getMyFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('favorites');
    res.json({ success: true, favorites: user ? user.favorites : [] });
  } catch (err) {
    next(err);
  }
};
