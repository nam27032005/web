const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Otp = sequelize.define('Otp', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING(150), allowNull: false },
  otp: { type: DataTypes.STRING(10), allowNull: false },
  expiresAt: { type: DataTypes.DATE, allowNull: false },
  used: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'otps' });

module.exports = Otp;
