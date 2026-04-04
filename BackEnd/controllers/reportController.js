const { Report, Room, User } = require('../models');

// GET /api/reports (admin)
exports.getReports = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Không có quyền.' });
    const where = {};
    if (req.query.status) where.status = req.query.status;

    const reports = await Report.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    // Manual join để giả lập populate
    const enriched = await Promise.all(reports.map(async (r) => {
      const room = await Room.findByPk(r.roomId, { attributes: ['id', 'title', 'address_full'] });
      const user = await User.findByPk(r.userId, { attributes: ['id', 'name', 'email'] });
      return { ...r.toJSON(), room, user };
    }));

    res.json({ success: true, count: reports.length, reports: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/reports
exports.createReport = async (req, res) => {
  try {
    const { roomId, reason, description } = req.body;
    const report = await Report.create({
      roomId,
      userId: req.user.id,
      reason,
      description,
      status: 'pending',
    });
    res.status(201).json({ success: true, message: 'Đã gửi báo cáo.', report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/reports/:id/resolve (admin)
exports.resolveReport = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Không có quyền.' });
    const report = await Report.findByPk(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Không tìm thấy báo cáo.' });
    await report.update({ status: 'resolved' });
    res.json({ success: true, message: 'Đã xử lý.', report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
