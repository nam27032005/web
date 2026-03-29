const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, updateUser, deleteUser, verifyOwner } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getAllUsers);
router.get('/:id', protect, getUserById);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);
router.put('/:id/verify', protect, authorize('admin'), verifyOwner);

module.exports = router;
