const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, updateUser, deleteUser, verifyOwner, getMyFavorites, getMyFavoriteIds } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), getAllUsers);
router.get('/me/favorites', protect, getMyFavorites);
router.get('/me/favorite-ids', protect, getMyFavoriteIds);
router.get('/:id', protect, getUserById);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);
router.put('/:id/verify', protect, authorize('admin'), verifyOwner);

module.exports = router;
