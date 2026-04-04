const { Op } = require('sequelize');
const { sequelize } = require('../config/db');
const { Room, User } = require('../models');

// Transform flat address fields → nested address object for FrontEnd
const transformRoom = (room) => {
  if (!room) return null;
  const r = room.toJSON ? room.toJSON() : { ...room };
  r.id = r.id || r._id;
  r._id = r.id; 
  r.address = {
    street: r.address_street || '',
    ward: r.address_ward || '',
    district: r.address_district || '',
    city: r.address_city || '',
    full: r.address_full || '',
  };
  r.bathroom = {
    type: r.bathroom_type || 'private',
    hasHotWater: !!r.bathroom_hasHotWater,
  };
  // Ensure images, amenities, nearBy are arrays
  const ensureArray = (val) => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      try { return JSON.parse(val || '[]'); } catch { return []; }
    }
    return [];
  };
  r.images = ensureArray(r.images);
  r.amenities = ensureArray(r.amenities);
  r.nearBy = ensureArray(r.nearBy);
  // Ensure owner object exists and has name/phone
  if (!r.owner || Object.keys(r.owner).length === 0) {
    r.owner = { name: r.ownerName || 'Chủ nhà', phone: r.ownerPhone || '' };
  }
  return r;
};

// GET /api/rooms
const getRooms = async (req, res) => {
  try {
    const {
      page = 1, limit = 10, search, minPrice, maxPrice,
      roomType, city, district, status, allStatus
    } = req.query;
    
    const where = {};
    
    // Nếu muốn hiển thị tất cả status (chỉ dành cho admin)
    if (allStatus === 'true' && req.user && req.user.role === 'admin') {
      // Bỏ qua lọc postStatus
    } else {
      where.postStatus = 'approved'; // Mặc định chỉ hiển thị đã duyệt
    }

    if (search) where.title = { [Op.like]: `%${search}%` };
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = minPrice;
      if (maxPrice) where.price[Op.lte] = maxPrice;
    }
    if (roomType) where.roomType = roomType;
    if (city) where.address_city = { [Op.like]: `%${city}%` };
    if (district) where.address_district = { [Op.like]: `%${district}%` };
    if (status) where.status = status;

    const { count, rows } = await Room.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email', 'phone', 'avatar', 'gender'],
        },
      ],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, total: count, page: +page, rooms: rows.map(transformRoom) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/rooms/:id
const getRoomById = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email', 'phone', 'avatar', 'gender'],
        },
      ],
    });
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    // Không expose phòng pending/rejected trừ admin/chủ phòng
    const isOwner = req.user && req.user.id === room.ownerId;
    const isAdmin = req.user && req.user.role === 'admin';
    if (room.postStatus !== 'approved' && !isOwner && !isAdmin) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    res.json({ success: true, room: transformRoom(room) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/rooms
const createRoom = async (req, res) => {
  try {
    const room = await Room.create({ ...req.body, ownerId: req.user.id });
    res.status(201).json({ success: true, room: transformRoom(room) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/rooms/:id
const updateRoom = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    if (room.ownerId !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Forbidden' });
    await room.update(req.body);
    res.json({ success: true, room: transformRoom(room) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/rooms/:id
const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    if (room.ownerId !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Forbidden' });
    await room.destroy();
    res.json({ success: true, message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/rooms/owner — rooms của owner đang login (legacy, kept for compat)
const getOwnerRooms = async (req, res) => {
  try {
    // Increase sort buffer size for session to handle large Base64 data
    await sequelize.query('SET SESSION sort_buffer_size = 1048576 * 16;'); 
    const rooms = await Room.findAll({
      where: { ownerId: req.user.id },
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email', 'phone', 'avatar', 'gender'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, rooms: rooms.map(transformRoom) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/rooms/my-rooms — alias chuẩn theo spec
const getMyRooms = async (req, res) => {
  try {
    // Increase sort buffer size for session to handle large Base64 data
    await sequelize.query('SET SESSION sort_buffer_size = 1048576 * 16;');
    const rooms = await Room.findAll({
      where: { ownerId: req.user.id },
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email', 'phone', 'avatar', 'gender'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, rooms: rooms.map(transformRoom).filter(Boolean) });
  } catch (err) {
    console.error('getMyRooms Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/rooms/pending
const getPendingRooms = async (req, res) => {
  try {
    const rooms = await Room.findAll({
      where: { postStatus: 'pending' },
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email', 'phone', 'avatar'],
        },
      ],
      order: [['createdAt', 'ASC']],
    });
    res.json({ success: true, rooms: rooms.map(transformRoom) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/rooms/:id/approve
const approveRoom = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    await room.update({ postStatus: 'approved' });
    res.json({ success: true, room: transformRoom(room) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/rooms/:id/reject
const rejectRoom = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    await room.update({ postStatus: 'rejected', rejectReason: req.body.reason || '' });
    res.json({ success: true, room: transformRoom(room) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/rooms/:id/views
const incrementViews = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    await room.increment('views');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/rooms/:id/status
const updateRoomStatus = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    if (room.ownerId !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Forbidden' });
    await room.update({ status: req.body.status });
    res.json({ success: true, room: transformRoom(room) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/rooms/:id/favorite  { action: "add" | "remove" }
const toggleFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const roomId = parseInt(req.params.id);
    const { action } = req.body; // "add" | "remove" | undefined (toggle)

    // Kiểm tra phòng tồn tại
    const room = await Room.findByPk(roomId);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    // Kiểm tra đã favorite chưa (dùng bảng user_favorites)
    const [existing] = await sequelize.query(
      'SELECT id FROM user_favorites WHERE userId = ? AND roomId = ?',
      { replacements: [userId, roomId], type: sequelize.QueryTypes.SELECT }
    );

    const isCurrentlyFav = !!existing;
    const shouldAdd = action === 'add' ? true : action === 'remove' ? false : !isCurrentlyFav;

    if (shouldAdd && !isCurrentlyFav) {
      await sequelize.query(
        'INSERT INTO user_favorites (userId, roomId, createdAt) VALUES (?, ?, NOW())',
        { replacements: [userId, roomId] }
      );
    } else if (!shouldAdd && isCurrentlyFav) {
      await sequelize.query(
        'DELETE FROM user_favorites WHERE userId = ? AND roomId = ?',
        { replacements: [userId, roomId] }
      );
    }

    // Lấy danh sách mới nhất các IDs mà user đã thích
    const favs = await sequelize.query(
      'SELECT roomId FROM user_favorites WHERE userId = ?',
      { replacements: [userId], type: sequelize.QueryTypes.SELECT }
    );

    // Lấy số lượng yêu thích mới của phòng này
    const [countRes] = await sequelize.query(
      'SELECT COUNT(*) as count FROM user_favorites WHERE roomId = ?',
      { replacements: [roomId], type: sequelize.QueryTypes.SELECT }
    );

    res.json({
      success: true,
      isFavorite: shouldAdd,
      favorites: favs.map(f => String(f.roomId)),
      favoriteCount: countRes.count || 0
    });
  } catch (err) {
    console.error('toggleFavorite:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/users/me/favorites  — trả về danh sách phòng yêu thích
const getFavoriteRooms = async (req, res) => {
  try {
    const userId = req.user.id;
    const favs = await sequelize.query(
      `SELECT r.* FROM rooms r
       INNER JOIN user_favorites uf ON uf.roomId = r.id
       WHERE uf.userId = ?
       ORDER BY uf.createdAt DESC`,
      { replacements: [userId], type: sequelize.QueryTypes.SELECT }
    );
    res.json({ success: true, rooms: favs.map(transformRoom) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/rooms/my-favorite-ids
const getFavoriteIds = async (req, res) => {
  try {
    const userId = req.user.id;
    const favs = await sequelize.query(
      'SELECT roomId FROM user_favorites WHERE userId = ?',
      { replacements: [userId], type: sequelize.QueryTypes.SELECT }
    );
    res.json({ success: true, favorites: favs.map(f => f.roomId) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  getOwnerRooms,
  getPendingRooms,
  approveRoom,
  rejectRoom,
  incrementViews,
  updateRoomStatus,
  toggleFavorite,
  getMyRooms,
  getFavoriteRooms,
  getFavoriteIds,
};
