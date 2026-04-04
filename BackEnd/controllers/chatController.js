const Chat = require('../models/Chat');
const ChatMessage = require('../models/ChatMessage');
const { sequelize } = require('../config/db');
const { Op } = require('sequelize');

// ── Helpers ──────────────────────────────────────────────────────────────────

// Lấy thông tin user tối giản (tránh lộ password)
const userFields = ['id', 'name', 'email', 'phone', 'avatar', 'role'];

// ── GET /api/chat/conversations ───────────────────────────────────────────────
const getConversations = async (req, res) => {
  try {
    const uid = req.user.id;
    const conversations = await Chat.findAll({
      where: {
        [Op.or]: [{ tenantId: uid }, { ownerId: uid }],
      },
      order: [['lastMessageAt', 'DESC']],
    });

    // Lấy thêm thông tin partner & unread count
    const { default: User } = await import('../models/User.js').catch(() => ({ default: require('../models/User') }));
    const result = await Promise.all(conversations.map(async (c) => {
      const partnerId = c.tenantId === uid ? c.ownerId : c.tenantId;
      const partner = await User.findByPk(partnerId, { attributes: userFields });
      const unread = await ChatMessage.count({
        where: { conversationId: c.id, senderId: { [Op.ne]: uid }, read: false },
      });
      return { ...c.toJSON(), partner, unreadCount: unread };
    }));

    res.json({ success: true, conversations: result });
  } catch (err) {
    console.error('getConversations:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/chat/conversations ─────────────────────────────────────────────
// Tạo mới hoặc lấy conversation đã có giữa 2 user
const getOrCreateConversation = async (req, res) => {
  try {
    const { ownerId, roomId } = req.body;
    const tenantId = req.user.id;

    if (!ownerId) return res.status(400).json({ success: false, message: 'ownerId is required' });
    if (tenantId === ownerId) return res.status(400).json({ success: false, message: 'Không thể chat với chính mình' });

    const [conversation, created] = await Chat.findOrCreate({
      where: { tenantId, ownerId, roomId: roomId || null },
      defaults: { tenantId, ownerId, roomId: roomId || null },
    });

    res.status(created ? 201 : 200).json({ success: true, conversation, created });
  } catch (err) {
    console.error('getOrCreateConversation:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/chat/conversations/:id/messages ──────────────────────────────────
const getMessages = async (req, res) => {
  try {
    const uid = req.user.id;
    const conv = await Chat.findByPk(req.params.id);
    if (!conv) return res.status(404).json({ success: false, message: 'Conversation not found' });
    if (conv.tenantId !== uid && conv.ownerId !== uid)
      return res.status(403).json({ success: false, message: 'Forbidden' });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const messages = await ChatMessage.findAll({
      where: { conversationId: req.params.id },
      order: [['createdAt', 'ASC']],
      limit,
      offset: (page - 1) * limit,
    });

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/chat/conversations/:id/messages ─────────────────────────────────
const sendMessage = async (req, res) => {
  try {
    const uid = req.user.id;
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ success: false, message: 'content is required' });

    const conv = await Chat.findByPk(req.params.id);
    if (!conv) return res.status(404).json({ success: false, message: 'Conversation not found' });
    if (conv.tenantId !== uid && conv.ownerId !== uid)
      return res.status(403).json({ success: false, message: 'Forbidden' });

    const message = await ChatMessage.create({
      conversationId: conv.id,
      senderId: uid,
      content: content.trim(),
    });

    // Cập nhật lastMessage trong conversation
    await conv.update({ lastMessage: content.trim(), lastMessageAt: new Date() });

    res.status(201).json({ success: true, message });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/chat/conversations/:id/read ─────────────────────────────────────
const markRead = async (req, res) => {
  try {
    const uid = Number(req.user.id);
    const conv = await Chat.findByPk(req.params.id);
    if (!conv) return res.status(404).json({ success: false, message: 'Conversation not found' });
    if (Number(conv.tenantId) !== uid && Number(conv.ownerId) !== uid)
      return res.status(403).json({ success: false, message: 'Forbidden' });

    await ChatMessage.update(
      { read: true },
      { where: { conversationId: conv.id, senderId: { [Op.ne]: uid }, read: false } }
    );

    res.json({ success: true, message: 'Marked as read' });
  } catch (err) {
    console.error('markRead Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getConversations, getOrCreateConversation, getMessages, sendMessage, markRead };
