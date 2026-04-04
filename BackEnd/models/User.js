const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: 'users_email_unique' },
  password: { type: DataTypes.STRING(255), allowNull: false },
  phone: { type: DataTypes.STRING(20), defaultValue: null },
  gender: { type: DataTypes.ENUM('nam', 'nữ', 'khác'), defaultValue: null },
  address: { type: DataTypes.STRING(255), defaultValue: null },
  avatar: { type: DataTypes.TEXT('long'), defaultValue: null },
  role: { type: DataTypes.ENUM('admin', 'owner', 'renter'), defaultValue: 'renter' },
  verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  ownerVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  active: { type: DataTypes.BOOLEAN, defaultValue: true },
  favorites: { type: DataTypes.JSON, defaultValue: [] },
  resetPasswordToken: { type: DataTypes.STRING(255), defaultValue: null },
  resetPasswordExpires: { type: DataTypes.DATE, defaultValue: null },
}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = User;
