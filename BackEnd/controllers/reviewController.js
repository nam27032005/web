const Review = require('../models/Review');

/**
 * GET /api/reviews?roomId=xxx   – Lấy reviews của phòng (approved)
 * GET /api/reviews?status=pending – Admin xem review chờ duyệt
 */
exports.getReviews = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.roomId) filter.roomId = req.query.roomId;
    if (req.query.status) filter.status = req.query.status;
    else filter.status = 'approved'; // mặc định chỉ trả approved

    const reviews = await Review.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, reviews });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/reviews             – Người thuê gửi đánh giá
 * Body: { roomId, rating, comment }
 */
exports.createReview = async (req, res, next) => {
  try {
    const { roomId, rating, comment } = req.body;
    const review = await Review.create({
      roomId,
      userId: req.user._id,
      userName: req.user.name,
      userAvatar: req.user.avatar,
      rating,
      comment,
      status: 'pending',
    });
    res.status(201).json({ success: true, message: 'Đánh giá đã gửi, đang chờ duyệt.', review });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/reviews/:id/approve  – Admin duyệt review
 */
exports.approveReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
    if (!review) return res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá.' });
    res.json({ success: true, message: 'Đã duyệt đánh giá.', review });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/reviews/:id/reject   – Admin từ chối review
 */
exports.rejectReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    if (!review) return res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá.' });
    res.json({ success: true, message: 'Đã từ chối đánh giá.', review });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/reviews/:id       – Xóa review (admin hoặc người tạo)
 */
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá.' });

    if (req.user.role !== 'admin' && review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Không có quyền xóa đánh giá này.' });
    }

    await review.deleteOne();
    res.json({ success: true, message: 'Đã xóa đánh giá.' });
  } catch (err) {
    next(err);
  }
};
