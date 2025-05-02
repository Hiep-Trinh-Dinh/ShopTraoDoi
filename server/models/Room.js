// server/models/Room.js
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  sellerId: {
    type: String,
    default: null
  },
  buyerId: {
    type: String,
    default: null
  },
  productDetails: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'info_provided', 'deposited', 'buyer_verified', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  productInfo: {
    type: String,
    default: ''
  },
  depositAmount: {
    type: Number,
    default: 0
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  refundTimer: Date,
  buyerVerified: {
    type: Boolean,
    default: false
  },
  sellerConfirmed: {
    type: Boolean,
    default: false
  }
});

// Add index for faster queries
roomSchema.index({ id: 1 });

// Add logging middleware
roomSchema.pre('save', function(next) {
    console.log('Saving room:', this.toObject());
    next();
});

module.exports = mongoose.model('Room', roomSchema); 