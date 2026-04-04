const express = require('express');
const router = express.Router();
const {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  markRead,
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

// Tất cả chat routes đều yêu cầu đăng nhập
router.use(protect);

// GET  /api/chat/conversations        — danh sách cuộc trò chuyện
router.get('/conversations', getConversations);

// POST /api/chat/conversations        — tạo/lấy conversation
router.post('/conversations', getOrCreateConversation);

// GET  /api/chat/conversations/:id/messages — lấy tin nhắn
router.get('/conversations/:id/messages', getMessages);

// POST /api/chat/conversations/:id/messages — gửi tin nhắn
router.post('/conversations/:id/messages', sendMessage);

// PUT  /api/chat/conversations/:id/read    — đánh dấu đã đọc
router.put('/conversations/:id/read', markRead);

module.exports = router;
