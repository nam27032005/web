const express = require('express');
const router = express.Router();
const { getChat, getConversations, sendMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.get('/conversations', protect, getConversations);
router.get('/', protect, getChat);
router.post('/', protect, sendMessage);

module.exports = router;
