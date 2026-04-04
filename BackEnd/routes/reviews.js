const express = require('express');
const router = express.Router();
const { getReviewsByRoom, getAllReviews, createReview, approveReview, rejectReview, deleteReview } = require('../controllers/reviewController');
const { protect, authorize, protectOptional } = require('../middleware/auth');

router.get('/', protectOptional, getAllReviews);
router.get('/room/:roomId', getReviewsByRoom);
router.post('/', protect, authorize('renter'), createReview);
router.put('/:id/approve', protect, authorize('admin'), approveReview);
router.put('/:id/reject', protect, authorize('admin'), rejectReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
