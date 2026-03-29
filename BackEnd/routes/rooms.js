const express = require('express');
const router = express.Router();
const {
  getRooms, getRoomById, createRoom, updateRoom, deleteRoom,
  approveRoom, rejectRoom, updateRoomStatus, incrementViews, toggleFavorite,
} = require('../controllers/roomController');
const { protect, authorize, protectOptional } = require('../middleware/auth');

// Public (with optional auth)
router.get('/', protectOptional, getRooms);
router.get('/:id', protectOptional, getRoomById);
router.put('/:id/views', incrementViews);

// Authenticated
router.post('/', protect, authorize('owner'), createRoom);
router.put('/:id', protect, updateRoom);
router.delete('/:id', protect, deleteRoom);
router.put('/:id/status', protect, authorize('owner'), updateRoomStatus);
router.post('/:id/favorite', protect, toggleFavorite);

// Admin only
router.put('/:id/approve', protect, authorize('admin'), approveRoom);
router.put('/:id/reject', protect, authorize('admin'), rejectRoom);

module.exports = router;
