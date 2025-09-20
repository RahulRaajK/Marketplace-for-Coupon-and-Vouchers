const express = require('express');
const Coupon = require('../models/Coupon');
const Purchase = require('../models/Purchase');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/submissions
// @desc    Get pending submissions
// @access  Private (Admin)
router.get('/submissions', adminAuth, async (req, res) => {
  try {
    const { status = 'pending' } = req.query;
    
    const coupons = await Coupon.find({ status })
      .populate('sellerId', 'name email')
      .sort({ createdAt: -1 });

    res.json(coupons.map(coupon => ({
      id: coupon._id,
      title: coupon.title,
      description: coupon.description,
      category: coupon.category,
      price: coupon.price,
      quantity: coupon.quantity,
      status: coupon.status,
      expiryDate: coupon.expiryDate,
      images: coupon.images,
      seller: {
        id: coupon.sellerId._id,
        name: coupon.sellerId.name,
        email: coupon.sellerId.email
      },
      createdAt: coupon.createdAt
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/submissions/:id/approve
// @desc    Approve coupon submission
// @access  Private (Admin)
router.put('/submissions/:id/approve', adminAuth, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    if (coupon.status !== 'pending') {
      return res.status(400).json({ message: 'Coupon is not pending approval' });
    }

    coupon.status = 'approved';
    await coupon.save();

    res.json({
      message: 'Coupon approved successfully',
      coupon: {
        id: coupon._id,
        title: coupon.title,
        status: coupon.status
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/submissions/:id/reject
// @desc    Reject coupon submission
// @access  Private (Admin)
router.put('/submissions/:id/reject', adminAuth, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    if (coupon.status !== 'pending') {
      return res.status(400).json({ message: 'Coupon is not pending approval' });
    }

    coupon.status = 'rejected';
    await coupon.save();

    res.json({
      message: 'Coupon rejected successfully',
      coupon: {
        id: coupon._id,
        title: coupon.title,
        status: coupon.status
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/revenue
// @desc    Get revenue summary
// @access  Private (Admin)
router.get('/revenue', adminAuth, async (req, res) => {
  try {
    const purchases = await Purchase.find({ status: 'completed' })
      .populate('couponId', 'title')
      .populate('buyerId', 'name email')
      .populate('sellerId', 'name email')
      .sort({ purchasedAt: -1 });

    const totalRevenue = purchases.reduce((sum, purchase) => sum + purchase.platformFee, 0);
    const totalSales = purchases.length;
    const totalAmount = purchases.reduce((sum, purchase) => sum + purchase.amountPaid, 0);

    // Revenue by month (last 12 months)
    const monthlyRevenue = {};
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = date.toISOString().substring(0, 7); // YYYY-MM
      monthlyRevenue[monthKey] = 0;
    }

    purchases.forEach(purchase => {
      const monthKey = purchase.purchasedAt.toISOString().substring(0, 7);
      if (monthlyRevenue.hasOwnProperty(monthKey)) {
        monthlyRevenue[monthKey] += purchase.platformFee;
      }
    });

    res.json({
      totalRevenue,
      totalSales,
      totalAmount,
      monthlyRevenue,
      recentPurchases: purchases.slice(0, 10).map(purchase => ({
        id: purchase._id,
        couponTitle: purchase.couponId.title,
        buyer: {
          name: purchase.buyerId.name,
          email: purchase.buyerId.email
        },
        seller: {
          name: purchase.sellerId.name,
          email: purchase.sellerId.email
        },
        amountPaid: purchase.amountPaid,
        platformFee: purchase.platformFee,
        sellerEarnings: purchase.sellerEarnings,
        purchasedAt: purchase.purchasedAt
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private (Admin)
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const [
      pendingCount,
      approvedCount,
      rejectedCount,
      soldCount,
      totalRevenue,
      recentSubmissions
    ] = await Promise.all([
      Coupon.countDocuments({ status: 'pending' }),
      Coupon.countDocuments({ status: 'approved' }),
      Coupon.countDocuments({ status: 'rejected' }),
      Coupon.countDocuments({ status: 'sold' }),
      Purchase.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$platformFee' } } }
      ]),
      Coupon.find({ status: 'pending' })
        .populate('sellerId', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    res.json({
      stats: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        sold: soldCount,
        totalRevenue: totalRevenue[0]?.total || 0
      },
      recentSubmissions: recentSubmissions.map(coupon => ({
        id: coupon._id,
        title: coupon.title,
        category: coupon.category,
        price: coupon.price,
        seller: {
          name: coupon.sellerId.name,
          email: coupon.sellerId.email
        },
        createdAt: coupon.createdAt
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
