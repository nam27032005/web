const Room = require('../models/Room');
const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * GET /api/rooms
 * Query: city, district, type, status, postStatus, minPrice, maxPrice,
 *        hasAC, hasBalcony, q (text search), page, limit, sort
 */
exports.getRooms = async (req, res, next) => {
  try {
    const {
      city, district, type, status,
      minPrice, maxPrice, hasAC, hasBalcony, q,
      page = 1, limit = 12, sort = '-createdAt',
    } = req.query;

    let { postStatus } = req.query;
    // Admin mặc định thấy tất cả bài đăng nếu không lọc cụ thể, 
    // Người dùng bình thường chỉ thấy bài 'approved'
    if (!postStatus && (!req.user || req.user.role !== 'admin')) {
      postStatus = 'approved';
    }

    const filter = {};
    if (postStatus) filter.postStatus = postStatus;
    if (city) filter['address.city'] = { $regex: city, $options: 'i' };
    if (district) filter['address.district'] = { $regex: district, $options: 'i' };
    if (type) filter.roomType = type;
    if (status) filter.status = status;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (hasAC === 'true') filter.hasAC = true;
    if (hasBalcony === 'true') filter.hasBalcony = true;
    if (q) filter.$text = { $search: q };

    const skip = (Number(page) - 1) * Number(limit);
    const [rooms, total] = await Promise.all([
      Room.find(filter).sort(sort).skip(skip).limit(Number(limit)),
      Room.countDocuments(filter),
    ]);

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      rooms,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/rooms/:id
 */
exports.getRoomById = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate('ownerId', 'name phone avatar verified');
    if (!room) return res.status(404).json({ success: false, message: 'Không tìm thấy phòng.' });
    res.json({ success: true, room });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/rooms           – Chủ nhà tạo bài đăng mới
 */
exports.createRoom = async (req, res, next) => {
  try {
    const owner = req.user;
    if (owner.role !== 'owner') {
      return res.status(403).json({ success: false, message: 'Chỉ chủ nhà mới được đăng bài.' });
    }

    // Tính phí đăng tin
    const feeMap = { week: 50000, month: 200000, quarter: 450000, year: 1500000 };
    const { displayDuration = 1, displayDurationUnit = 'month' } = req.body;
    const postFee = displayDuration * (feeMap[displayDurationUnit] || 200000);

    const room = await Room.create({
      ...req.body,
      ownerId: owner._id,
      ownerName: owner.name,
      ownerPhone: owner.phone,
      postFee,
      postStatus: 'pending',
    });

    // Thông báo cho admin
    const admins = await User.find({ role: 'admin' });
    await Notification.insertMany(
      admins.map((admin) => ({
        userId: admin._id,
        title: 'Bài đăng mới chờ duyệt',
        message: `Chủ nhà ${owner.name} vừa đăng bài "${room.title}". Đang chờ phê duyệt.`,
        type: 'system',
      }))
    );

    res.status(201).json({ success: true, message: 'Đăng bài thành công, đang chờ duyệt.', room });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/rooms/:id        – Chủ nhà cập nhật bài của mình
 */
exports.updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Không tìm thấy phòng.' });

    if (req.user.role !== 'admin' && room.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Không có quyền chỉnh sửa bài này.' });
    }

    // Khi chỉnh sửa nội dung chính → cần duyệt lại
    const needsReview = ['title', 'description', 'price', 'images', 'address'].some(
      (f) => req.body[f] !== undefined
    );
    if (needsReview && req.user.role !== 'admin') {
      req.body.postStatus = 'pending';
    }

    const updated = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, message: 'Cập nhật thành công.', room: updated });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/rooms/:id
 */
exports.deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Không tìm thấy phòng.' });

    if (req.user.role !== 'admin' && room.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Không có quyền xóa bài này.' });
    }

    await room.deleteOne();
    res.json({ success: true, message: 'Đã xóa bài đăng.' });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/rooms/:id/approve   – Admin duyệt bài
 */
exports.approveRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Không tìm thấy phòng.' });

    const now = new Date();
    const expires = new Date(now);
    const { displayDuration = 1, displayDurationUnit = 'month' } = room;
    if (displayDurationUnit === 'week') expires.setDate(expires.getDate() + 7 * displayDuration);
    else if (displayDurationUnit === 'month') expires.setMonth(expires.getMonth() + displayDuration);
    else if (displayDurationUnit === 'quarter') expires.setMonth(expires.getMonth() + 3 * displayDuration);
    else expires.setFullYear(expires.getFullYear() + (displayDuration || 1));

    room.postStatus = 'approved';
    room.approvedAt = now;
    room.expiresAt = expires;
    await room.save();

    await Notification.create({
      userId: room.ownerId,
      title: 'Bài đăng được duyệt',
      message: `Bài đăng "${room.title}" đã được phê duyệt. Thời hạn: ${displayDuration} ${displayDurationUnit}. Phí: ${room.postFee.toLocaleString('vi-VN')}đ.`,
      type: 'approval',
    });

    res.json({ success: true, message: 'Đã duyệt bài đăng.', room });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/rooms/:id/reject    – Admin từ chối bài
 * Body: { reason }
 */
exports.rejectRoom = async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ success: false, message: 'Vui lòng cung cấp lý do từ chối.' });

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { postStatus: 'rejected', rejectedReason: reason },
      { new: true }
    );
    if (!room) return res.status(404).json({ success: false, message: 'Không tìm thấy phòng.' });

    await Notification.create({
      userId: room.ownerId,
      title: 'Bài đăng bị từ chối',
      message: `Bài đăng "${room.title}" bị từ chối. Lý do: ${reason}`,
      type: 'rejection',
    });

    res.json({ success: true, message: 'Đã từ chối bài đăng.', room });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/rooms/:id/status    – Chủ nhà cập nhật trạng thái (available/rented)
 * Body: { status }
 */
exports.updateRoomStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['available', 'rented'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ.' });
    }
    const room = await Room.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!room) return res.status(404).json({ success: false, message: 'Không tìm thấy phòng.' });
    res.json({ success: true, message: 'Cập nhật trạng thái thành công.', room });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/rooms/:id/views     – Tăng lượt xem (gọi khi vào trang chi tiết)
 */
exports.incrementViews = async (req, res, next) => {
  try {
    await Room.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/rooms/:id/favorite – Toggle yêu thích
 * Body: { action: 'add' | 'remove' }
 */
exports.toggleFavorite = async (req, res, next) => {
  try {
    const { action } = req.body; // 'add' or 'remove'
    const roomId = req.params.id;
    const userId = req.user._id;

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ success: false, message: 'Không tìm thấy phòng.' });

    if (action === 'add') {
      // Thêm vào mảng favorites của User (cơ chế $addToSet để không trùng)
      await User.findByIdAndUpdate(userId, { $addToSet: { favorites: roomId } });
      // Tăng counter trong Room
      room.favorites += 1;
    } else {
      // Xóa khỏi mảng favorites của User
      await User.findByIdAndUpdate(userId, { $pull: { favorites: roomId } });
      // Giảm counter trong Room (không để âm)
      room.favorites = Math.max(0, room.favorites - 1);
    }

    await room.save();
    res.json({ success: true, favorites: room.favorites });
  } catch (err) {
    next(err);
  }
};
