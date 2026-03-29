const express = require('express');
const router = express.Router();
const { getReviews, createReview, approveReview, rejectReview, deleteReview } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getReviews);
router.post('/', protect, authorize('renter'), createReview);
router.put('/:id/approve', protect, authorize('admin'), approveReview);
router.put('/:id/reject', protect, authorize('admin'), rejectReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
