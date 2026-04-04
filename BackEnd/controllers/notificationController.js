const Notification = require('../models/Notification');

// GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/notifications/:id/read
exports.markRead = async (req, res) => {
  try {
    const notif = await Notification.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!notif) return res.status(404).json({ success: false, message: 'Không tìm thấy.' });
    await notif.update({ read: true });
    res.json({ success: true, notification: notif });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/notifications/read-all
exports.markAllRead = async (req, res) => {
  try {
    await Notification.update({ read: true }, { where: { userId: req.user.id } });
    res.json({ success: true, message: 'Đã đánh dấu tất cả là đã đọc.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/notifications/:id
exports.deleteNotification = async (req, res) => {
  try {
    await Notification.destroy({ where: { id: req.params.id, userId: req.user.id } });
    res.json({ success: true, message: 'Đã xóa.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/notifications (internal/admin create)
exports.createNotification = async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    const { userId, title, content, type, relatedId, relatedModel } = req.body;
    const notif = await Notification.create({ userId, title, content, type, relatedId, relatedModel });
    res.status(201).json({ success: true, notification: notif });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
