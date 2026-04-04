const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Report = sequelize.define('Report', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  roomId: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  reason: { type: DataTypes.STRING(255) },
  description: { type: DataTypes.TEXT },
  status: {
    type: DataTypes.ENUM('pending', 'resolved', 'rejected'),
    defaultValue: 'pending',
  },
}, { tableName: 'reports' });

module.exports = Report;
