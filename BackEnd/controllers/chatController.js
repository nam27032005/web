const ChatMessage = require('../models/ChatMessage');

/**
 * GET /api/chat?withUserId=<id>   – Lấy lịch sử chat giữa user hiện tại và withUserId
 */
exports.getChat = async (req, res, next) => {
  try {
    const { withUserId } = req.query;
    if (!withUserId) {
      return res.status(400).json({ success: false, message: 'Thiếu withUserId.' });
    }

    const messages = await ChatMessage.find({
      $or: [
        { fromId: req.user._id, toId: withUserId },
        { fromId: withUserId, toId: req.user._id },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('fromId', 'name avatar')
      .populate('toId', 'name avatar');

    res.json({ success: true, count: messages.length, messages });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/chat/conversations      – Admin: danh sách các cuộc hội thoại
 */
exports.getConversations = async (req, res, next) => {
  try {
    // Lấy tin nhắn mới nhất của mỗi cặp user
    const conversations = await ChatMessage.aggregate([
      {
        $match: {
          $or: [{ fromId: req.user._id }, { toId: req.user._id }],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $lt: ['$fromId', '$toId'] },
              { a: '$fromId', b: '$toId' },
              { a: '$toId', b: '$fromId' },
            ],
          },
          lastMessage: { $first: '$$ROOT' },
        },
      },
      { $replaceRoot: { newRoot: '$lastMessage' } },
      { $sort: { createdAt: -1 } },
    ]);

    res.json({ success: true, conversations });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/chat                   – Gửi tin nhắn
 * Body: { toId, message }
 */
exports.sendMessage = async (req, res, next) => {
  try {
    const { toId, message } = req.body;
    if (!toId || !message) {
      return res.status(400).json({ success: false, message: 'Thiếu toId hoặc message.' });
    }

    const msg = await ChatMessage.create({
      fromId: req.user._id,
      fromName: req.user.name,
      toId,
      message,
    });

    res.status(201).json({ success: true, message: msg });
  } catch (err) {
    next(err);
  }
};
