const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ownerName: { type: String, required: true },
    ownerPhone: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    address: {
      street: String,
      ward: String,
      district: String,
      city: String,
      full: String,
    },
    nearBy: [String],
    roomType: {
      type: String,
      enum: ['phong_tro', 'chung_cu_mini', 'nha_nguyen_can', 'chung_cu_nguyen_can'],
      required: true,
    },
    roomCount: { type: Number, default: 1 },
    price: { type: Number, required: true },
    priceUnit: { type: String, enum: ['month', 'quarter', 'year'], default: 'month' },
    area: { type: Number, required: true },
    sharedOwner: { type: Boolean, default: false },
    bathroom: {
      type: { type: String, enum: ['private', 'shared'], default: 'private' },
      hasHotWater: { type: Boolean, default: false },
    },
    kitchen: { type: String, enum: ['private', 'shared', 'none'], default: 'shared' },
    hasAC: { type: Boolean, default: false },
    hasBalcony: { type: Boolean, default: false },
    electricityPrice: { type: String, enum: ['standard', 'rental'], default: 'standard' },
    electricityRate: Number,
    waterRate: Number,
    amenities: [String],
    images: [String],
    status: { type: String, enum: ['available', 'rented'], default: 'available' },
    postStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'expired'],
      default: 'pending',
    },
    displayDuration: { type: Number, default: 1 },
    displayDurationUnit: {
      type: String,
      enum: ['week', 'month', 'quarter', 'year'],
      default: 'month',
    },
    postFee: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    favorites: { type: Number, default: 0 },
    approvedAt: Date,
    expiresAt: Date,
    rejectedReason: String,
  },
  { timestamps: true }
);

// Index để tìm kiếm nhanh
roomSchema.index({ 'address.city': 1, 'address.district': 1 });
roomSchema.index({ roomType: 1, postStatus: 1, status: 1 });
roomSchema.index({ price: 1 });
roomSchema.index({ title: 'text', 'address.full': 'text' });

module.exports = mongoose.model('Room', roomSchema);
