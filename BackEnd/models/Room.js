const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Room = sequelize.define('Room', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ownerId: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT, defaultValue: null },
  price: { type: DataTypes.DECIMAL(12, 0), allowNull: false },
  area: { type: DataTypes.FLOAT, defaultValue: null },
  roomType: {
    type: DataTypes.ENUM('phong_tro', 'chung_cu_mini', 'nha_nguyen_can', 'chung_cu_nguyen_can'),
    defaultValue: 'phong_tro',
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('available', 'rented'),
    defaultValue: 'available',
  },
  postStatus: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'expired'),
    defaultValue: 'pending',
  },
  address_street: { type: DataTypes.STRING(255), defaultValue: null },
  address_ward: { type: DataTypes.STRING(100), defaultValue: null },
  address_district: { type: DataTypes.STRING(100), defaultValue: null },
  address_city: { type: DataTypes.STRING(100), defaultValue: null },
  address_full: { type: DataTypes.STRING(500), defaultValue: null },
  latitude: { type: DataTypes.FLOAT, defaultValue: null },
  longitude: { type: DataTypes.FLOAT, defaultValue: null },
  nearBy: { type: DataTypes.JSON, defaultValue: [] },
  amenities: { type: DataTypes.JSON, defaultValue: [] },
  images: { type: DataTypes.JSON, defaultValue: [] },
  roomCount: { type: DataTypes.INTEGER, defaultValue: 1 },
  priceUnit: {
    type: DataTypes.ENUM('month', 'quarter', 'year'),
    defaultValue: 'month',
  },
  sharedOwner: { type: DataTypes.BOOLEAN, defaultValue: false },
  bathroom_type: {
    type: DataTypes.ENUM('private', 'shared'),
    defaultValue: 'private',
  },
  bathroom_hasHotWater: { type: DataTypes.BOOLEAN, defaultValue: false },
  kitchen: {
    type: DataTypes.ENUM('private', 'shared', 'none'),
    defaultValue: 'private',
  },
  hasAC: { type: DataTypes.BOOLEAN, defaultValue: false },
  hasBalcony: { type: DataTypes.BOOLEAN, defaultValue: false },
  electricityPrice: {
    type: DataTypes.ENUM('standard', 'rental'),
    defaultValue: 'standard',
  },
  electricityRate: { type: DataTypes.DECIMAL(10, 2), defaultValue: null },
  waterRate: { type: DataTypes.DECIMAL(10, 2), defaultValue: null },
  postFee: { type: DataTypes.DECIMAL(12, 0), defaultValue: 0 },
  views: { type: DataTypes.INTEGER, defaultValue: 0 },
  favorites: { type: DataTypes.INTEGER, defaultValue: 0 },
  displayDuration: { type: DataTypes.INTEGER, defaultValue: 1 },
  displayDurationUnit: {
    type: DataTypes.ENUM('day', 'week', 'month'),
    defaultValue: 'month',
  },
  approvedAt: { type: DataTypes.DATE, defaultValue: null },
  expiresAt: { type: DataTypes.DATE, defaultValue: null },
  rejectReason: { type: DataTypes.TEXT, defaultValue: null },
}, {
  tableName: 'rooms',
  timestamps: true,
  indexes: [
    { fields: ['ownerId', 'createdAt'] },
    { fields: ['postStatus'] },
  ],
});

module.exports = Room;
