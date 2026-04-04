const { Review, User, Room } = require('../models');

// GET /api/reviews (All reviews for admin or global state)
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/reviews/room/:roomId
exports.getReviewsByRoom = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { roomId: req.params.roomId, status: 'approved' },
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/reviews
exports.createReview = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const review = await Review.create({
      ...req.body,
      userId: req.user.id,
      userName: user.name,
      userAvatar: user.avatar,
      userGender: user.gender,
      status: 'pending',
    });
    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/reviews/:id/approve (admin)
exports.approveReview = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Không có quyền.' });
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Không tìm thấy.' });
    await review.update({ status: 'approved' });
    res.json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/reviews/:id
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Không tìm thấy.' });
    if (review.userId !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Không có quyền.' });
    await review.destroy();
    res.json({ success: true, message: 'Đã xóa.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/reviews/:id/reject (admin)
exports.rejectReview = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Không có quyền.' });
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Không tìm thấy.' });
    await review.update({ status: 'rejected' });
    res.json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
