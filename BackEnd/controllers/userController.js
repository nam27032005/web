const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { sequelize } = require('../config/db');
const { User, Room } = require('../models');

// GET /api/users/me  (alias for profile)
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/users/:id
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, { attributes: { exclude: ['password'] } });
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/users/:id  (user update own profile, or admin update any)
exports.updateUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    if (req.user.role !== 'admin' && String(req.user.id) !== String(targetId)) {
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập.' });
    }
    const { name, phone, gender, address, avatar } = req.body;
    await User.update({ name, phone, gender, address, avatar }, { where: { id: targetId } });
    const updated = await User.findByPk(targetId, { attributes: { exclude: ['password'] } });
    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/users (own profile update)
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

// DELETE /api/users/:id  (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Không thể xoá tài khoản admin.' });
    await user.destroy();
    res.json({ success: true, message: 'Xoá người dùng thành công.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/users/:id/verify  (admin verify owner)
exports.verifyOwner = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    if (user.role !== 'owner') return res.status(400).json({ success: false, message: 'Chỉ có thể xác minh tài khoản chủ nhà.' });
    await user.update({ ownerVerified: true });
    res.json({ success: true, message: 'Xác minh chủ nhà thành công.', user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/change-password  (also exported from here for auth route)
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);
    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không đúng.' });
    const hashed = await bcrypt.hash(newPassword, 10);
    await User.update({ password: hashed }, { where: { id: req.user.id } });
    res.json({ success: true, message: 'Đổi mật khẩu thành công!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/users  (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, active, search, page = 1, limit = 20 } = req.query;
    const where = {};
    if (role) where.role = role;
    if (active !== undefined) where.active = active === 'true';
    if (search) where.name = { [Op.like]: `%${search}%` };
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { rows: users, count } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, users, total: count, page: parseInt(page), totalPages: Math.ceil(count / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/users/:id/toggle-active  (admin only)
exports.toggleActive = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    await user.update({ active: !user.active });
    res.json({ success: true, message: user.active ? 'Mở khoá tài khoản.' : 'Khoá tài khoản.', active: user.active });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/users/me/favorites
exports.getMyFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const rooms = await sequelize.query(
      `SELECT r.*, 
              u.id as owner_id, u.name as owner_name, u.email as owner_email, 
              u.phone as owner_phone, u.avatar as owner_avatar, u.gender as owner_gender
       FROM rooms r
       INNER JOIN user_favorites uf ON uf.roomId = r.id
       LEFT JOIN users u ON u.id = r.ownerId
       WHERE uf.userId = ?
       ORDER BY uf.createdAt DESC`,
      { replacements: [userId], type: sequelize.QueryTypes.SELECT }
    );

    const { transformRoom } = require('./roomController');
    
    const transformedRooms = rooms.map(row => {
      const roomData = { ...row };
      if (row.owner_id) {
        roomData.owner = {
          id: row.owner_id,
          name: row.owner_name,
          email: row.owner_email,
          phone: row.owner_phone,
          avatar: row.owner_avatar,
          gender: row.owner_gender
        };
      }
      return transformRoom(roomData);
    });

    res.json({ success: true, rooms: transformedRooms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/users/me/favorite-ids
exports.getMyFavoriteIds = async (req, res) => {
  try {
    const userId = req.user.id;
    const favs = await sequelize.query(
      'SELECT roomId FROM user_favorites WHERE userId = ?',
      { replacements: [userId], type: sequelize.QueryTypes.SELECT }
    );
    res.json({ success: true, favorites: favs.map(f => String(f.roomId)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
