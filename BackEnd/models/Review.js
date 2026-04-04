const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Review = sequelize.define('Review', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  roomId: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  userName: { type: DataTypes.STRING(100) },
  userAvatar: { type: DataTypes.TEXT },
  userGender: { type: DataTypes.ENUM('nam', 'nữ', 'khác'), defaultValue: 'khác' },
  rating: { type: DataTypes.INTEGER, allowNull: false },
  comment: { type: DataTypes.TEXT },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
}, { tableName: 'reviews' });

module.exports = Review;
