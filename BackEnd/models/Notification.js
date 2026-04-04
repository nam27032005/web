const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING(255), allowNull: false },
  message: { type: DataTypes.TEXT },
  read: { type: DataTypes.BOOLEAN, defaultValue: false },
  type: { type: DataTypes.STRING(50) },
}, { tableName: 'notifications' });

module.exports = Notification;
