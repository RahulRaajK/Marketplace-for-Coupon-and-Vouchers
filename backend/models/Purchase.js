const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  couponId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
    required: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amountPaid: {
    type: Number,
    required: true,
    min: 0
  },
  platformFee: {
    type: Number,
    required: true,
    min: 0
  },
  sellerEarnings: {
    type: Number,
    required: true,
    min: 0
  },
  purchasedAt: {
    type: Date,
    default: Date.now
  },
  redemptionCodeRevealed: {
    type: Boolean,
    default: false
  },
  redemptionCode: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'paid', 'completed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Index for efficient queries
purchaseSchema.index({ buyerId: 1 });
purchaseSchema.index({ sellerId: 1 });
purchaseSchema.index({ couponId: 1 });

module.exports = mongoose.model('Purchase', purchaseSchema);
