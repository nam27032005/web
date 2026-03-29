const express = require('express');
const router = express.Router();
const { getNotifications, markRead, markAllRead, createNotification, deleteNotification } = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getNotifications);
router.put('/read-all', protect, markAllRead);
router.put('/:id/read', protect, markRead);
router.delete('/:id', protect, deleteNotification);
router.post('/', protect, authorize('admin'), createNotification);

module.exports = router;
