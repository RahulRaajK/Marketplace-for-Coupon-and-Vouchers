const express = require('express');
const Coupon = require('../models/Coupon');
const Purchase = require('../models/Purchase');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/purchases/request
// @desc    Request purchase of a coupon
// @access  Private
router.post('/request', auth, async (req, res) => {
  try {
    const { couponId } = req.body;

    if (!couponId) {
      return res.status(400).json({ message: 'Coupon ID is required' });
    }

    const coupon = await Coupon.findById(couponId);

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    if (coupon.status !== 'approved') {
      return res.status(400).json({ message: 'Coupon is not available for purchase' });
    }

    if (coupon.sellerId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot purchase your own coupon' });
    }

    // Check if already purchased
    const existingPurchase = await Purchase.findOne({
      couponId,
      buyerId: req.user._id,
      status: { $in: ['pending', 'accepted', 'paid', 'completed'] }
    });

    if (existingPurchase) {
      return res.status(400).json({ message: 'Purchase request already exists' });
    }

    const purchase = new Purchase({
      couponId,
      buyerId: req.user._id,
      sellerId: coupon.sellerId,
      amountPaid: coupon.price,
      platformFee: coupon.price * 0.2, // 20% platform fee
      sellerEarnings: coupon.price * 0.8, // 80% to seller
      redemptionCode: coupon.redemptionCode,
      status: 'pending'
    });

    await purchase.save();

    res.status(201).json({
      message: 'Purchase request sent to seller',
      purchase: {
        id: purchase._id,
        couponTitle: coupon.title,
        amountPaid: purchase.amountPaid,
        platformFee: purchase.platformFee,
        sellerEarnings: purchase.sellerEarnings,
        status: purchase.status,
        createdAt: purchase.createdAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/purchases/:purchaseId/accept
// @desc    Seller accepts purchase request
// @access  Private
router.put('/:purchaseId/accept', auth, async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.purchaseId)
      .populate('couponId', 'title status');

    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    if (purchase.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to accept this purchase' });
    }

    if (purchase.status !== 'pending') {
      return res.status(400).json({ message: 'Purchase request is not pending' });
    }

    if (purchase.couponId.status !== 'approved') {
      return res.status(400).json({ message: 'Coupon is no longer available' });
    }

    purchase.status = 'accepted';
    await purchase.save();

    res.json({
      message: 'Purchase request accepted',
      purchase: {
        id: purchase._id,
        couponTitle: purchase.couponId.title,
        amountPaid: purchase.amountPaid,
        status: purchase.status
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/purchases/:purchaseId/pay
// @desc    Simulate payment and finalize purchase
// @access  Private
router.post('/:purchaseId/pay', auth, async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.purchaseId)
      .populate('couponId', 'title status');

    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    if (purchase.buyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to pay for this purchase' });
    }

    if (purchase.status !== 'accepted') {
      return res.status(400).json({ message: 'Purchase request must be accepted by seller first' });
    }

    if (purchase.couponId.status !== 'approved') {
      return res.status(400).json({ message: 'Coupon is no longer available' });
    }

    // Finalize purchase
    purchase.status = 'completed';
    purchase.redemptionCodeRevealed = true;
    await purchase.save();

    // Mark coupon as sold
    const coupon = await Coupon.findById(purchase.couponId._id);
    coupon.status = 'sold';
    await coupon.save();

    res.json({
      message: 'Payment successful! Purchase completed.',
      purchase: {
        id: purchase._id,
        couponTitle: purchase.couponId.title,
        amountPaid: purchase.amountPaid,
        platformFee: purchase.platformFee,
        sellerEarnings: purchase.sellerEarnings,
        redemptionCode: purchase.redemptionCode,
        status: purchase.status,
        purchasedAt: purchase.purchasedAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/purchases/user
// @desc    Get user's purchase history
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const purchases = await Purchase.find({ buyerId: req.user._id })
      .populate('couponId', 'title category images')
      .populate('sellerId', 'name email')
      .sort({ purchasedAt: -1 });

    res.json(purchases.map(purchase => ({
      id: purchase._id,
      coupon: {
        title: purchase.couponId.title,
        category: purchase.couponId.category,
        images: purchase.couponId.images
      },
      seller: {
        name: purchase.sellerId.name,
        email: purchase.sellerId.email
      },
      amountPaid: purchase.amountPaid,
      platformFee: purchase.platformFee,
      sellerEarnings: purchase.sellerEarnings,
      redemptionCode: purchase.redemptionCodeRevealed ? purchase.redemptionCode : null,
      status: purchase.status,
      purchasedAt: purchase.purchasedAt
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/purchases/seller
// @desc    Get seller's sales history
// @access  Private
router.get('/seller', auth, async (req, res) => {
  try {
    const purchases = await Purchase.find({ sellerId: req.user._id })
      .populate('couponId', 'title category')
      .populate('buyerId', 'name email')
      .sort({ purchasedAt: -1 });

    res.json(purchases.map(purchase => ({
      id: purchase._id,
      coupon: {
        title: purchase.couponId.title,
        category: purchase.couponId.category
      },
      buyer: {
        name: purchase.buyerId.name,
        email: purchase.buyerId.email
      },
      amountPaid: purchase.amountPaid,
      platformFee: purchase.platformFee,
      sellerEarnings: purchase.sellerEarnings,
      status: purchase.status,
      purchasedAt: purchase.purchasedAt
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/purchases/pending
// @desc    Get seller's pending purchase requests
// @access  Private
router.get('/pending', auth, async (req, res) => {
  try {
    const purchases = await Purchase.find({ 
      sellerId: req.user._id,
      status: 'pending'
    })
      .populate('couponId', 'title category price')
      .populate('buyerId', 'name email')
      .sort({ createdAt: -1 });

    res.json(purchases.map(purchase => ({
      id: purchase._id,
      coupon: {
        title: purchase.couponId.title,
        category: purchase.couponId.category,
        price: purchase.couponId.price
      },
      buyer: {
        name: purchase.buyerId.name,
        email: purchase.buyerId.email
      },
      amountPaid: purchase.amountPaid,
      platformFee: purchase.platformFee,
      sellerEarnings: purchase.sellerEarnings,
      status: purchase.status,
      createdAt: purchase.createdAt
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
