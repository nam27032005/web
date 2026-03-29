const Report = require('../models/Report');

/**
 * GET /api/reports             – Admin: xem tất cả báo cáo
 * Query: status=pending|resolved
 */
exports.getReports = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const reports = await Report.find(filter)
      .populate('roomId', 'title address')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reports.length, reports });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/reports            – Người dùng gửi báo cáo phòng
 * Body: { roomId, reason, description }
 */
exports.createReport = async (req, res, next) => {
  try {
    const { roomId, reason, description } = req.body;
    const report = await Report.create({
      roomId,
      userId: req.user._id,
      reason,
      description,
      status: 'pending',
    });
    res.status(201).json({ success: true, message: 'Đã gửi báo cáo.', report });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/reports/:id/resolve – Admin đánh dấu đã xử lý
 */
exports.resolveReport = async (req, res, next) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status: 'resolved' },
      { new: true }
    );
    if (!report) return res.status(404).json({ success: false, message: 'Không tìm thấy báo cáo.' });
    res.json({ success: true, message: 'Đã xử lý báo cáo.', report });
  } catch (err) {
    next(err);
  }
};
