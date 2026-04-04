const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// Cuộc trò chuyện giữa 2 user (tenant <-> owner), liên kết 1 phòng
const Chat = sequelize.define('Chat', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  // Người thuê (tenant)
  tenantId: { type: DataTypes.INTEGER, allowNull: false },
  // Chủ nhà (owner)
  ownerId: { type: DataTypes.INTEGER, allowNull: false },
  // Phòng liên quan
  roomId: { type: DataTypes.INTEGER, allowNull: true },
  // Tin nhắn cuối (để hiển thị preview)
  lastMessage: { type: DataTypes.TEXT, defaultValue: null },
  lastMessageAt: { type: DataTypes.DATE, defaultValue: null },
}, {
  tableName: 'chats',
  timestamps: true,
  indexes: [
    // Mỗi cặp (tenant, owner, room) chỉ có 1 conversation
    { unique: true, fields: ['tenantId', 'ownerId', 'roomId'] },
  ],
});

module.exports = Chat;
