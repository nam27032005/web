const Notification = require('../models/Notification');

/**
 * GET /api/notifications        – Lấy thông báo của user đang đăng nhập
 * Query: read=true|false, page, limit
 */
exports.getNotifications = async (req, res, next) => {
  try {
    const filter = { userId: req.user._id };
    if (req.query.read !== undefined) filter.read = req.query.read === 'true';

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const [notifications, total, unread] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Notification.countDocuments(filter),
      Notification.countDocuments({ userId: req.user._id, read: false }),
    ]);

    res.json({ success: true, total, unread, notifications });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/notifications/:id/read   – Đánh dấu một thông báo đã đọc
 */
exports.markRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true }
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/notifications/read-all  – Đánh dấu tất cả đã đọc
 */
exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
    res.json({ success: true, message: 'Đã đánh dấu tất cả thông báo đã đọc.' });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/notifications          – Tạo thông báo (internal / admin)
 * Body: { userId, title, message, type }
 */
exports.createNotification = async (req, res, next) => {
  try {
    const { userId, title, message, type } = req.body;
    const notif = await Notification.create({ userId, title, message, type });
    res.status(201).json({ success: true, notification: notif });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/notifications/:id    – Xóa một thông báo
 */
exports.deleteNotification = async (req, res, next) => {
  try {
    const notif = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!notif) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông báo hoặc bạn không có quyền xóa.' });
    }
    res.json({ success: true, message: 'Đã xóa thông báo.' });
  } catch (err) {
    next(err);
  }
};
