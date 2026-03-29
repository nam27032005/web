const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    fromId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fromName: { type: String, required: true },
    toId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

chatMessageSchema.index({ fromId: 1, toId: 1, createdAt: 1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
