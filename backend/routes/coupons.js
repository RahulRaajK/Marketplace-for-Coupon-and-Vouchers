const express = require('express');
const { body, validationResult } = require('express-validator');
const Coupon = require('../models/Coupon');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/coupons
// @desc    Create coupon (seller submission)
// @access  Private
router.post('/', auth, [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('redemptionCode').trim().notEmpty().withMessage('Redemption code is required'),
  body('expiryDate').isISO8601().withMessage('Valid expiry date is required'),
  body('price').isNumeric().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, category, redemptionCode, expiryDate, price, quantity = 1, images = [] } = req.body;

    // Check if expiry date is in the future
    if (new Date(expiryDate) <= new Date()) {
      return res.status(400).json({ message: 'Expiry date must be in the future' });
    }

    const coupon = new Coupon({
      title,
      description,
      category,
      redemptionCode,
      expiryDate: new Date(expiryDate),
      price,
      quantity,
      images,
      sellerId: req.user._id,
      status: 'pending'
    });

    await coupon.save();

    res.status(201).json({
      message: 'Coupon submitted for approval',
      coupon: {
        id: coupon._id,
        title: coupon.title,
        description: coupon.description,
        category: coupon.category,
        price: coupon.price,
        quantity: coupon.quantity,
        status: coupon.status,
        expiryDate: coupon.expiryDate,
        createdAt: coupon.createdAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/coupons
// @desc    Get coupons with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, status = 'approved' } = req.query;
    
    let query = { status };
    
    if (category) {
      query.category = new RegExp(category, 'i');
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Only show non-expired coupons for approved status
    if (status === 'approved') {
      query.expiryDate = { $gt: new Date() };
    }

    const coupons = await Coupon.find(query)
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
        name: coupon.sellerId.name
      },
      createdAt: coupon.createdAt
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/coupons/:id
// @desc    Get coupon by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id)
      .populate('sellerId', 'name email');

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    res.json({
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
        name: coupon.sellerId.name
      },
      createdAt: coupon.createdAt
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/coupons/:id
// @desc    Update coupon (only if pending or approved and not sold)
// @access  Private
router.put('/:id', auth, [
  body('title').optional().trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').optional().trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('category').optional().trim().notEmpty().withMessage('Category is required'),
  body('expiryDate').optional().isISO8601().withMessage('Valid expiry date is required'),
  body('price').optional().isNumeric().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    // Check if user is the seller
    if (coupon.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this coupon' });
    }

    // Check if coupon can be updated
    if (coupon.status === 'sold') {
      return res.status(400).json({ message: 'Cannot update sold coupon' });
    }

    const { title, description, category, expiryDate, price, quantity, images } = req.body;

    if (title) coupon.title = title;
    if (description) coupon.description = description;
    if (category) coupon.category = category;
    if (expiryDate) {
      if (new Date(expiryDate) <= new Date()) {
        return res.status(400).json({ message: 'Expiry date must be in the future' });
      }
      coupon.expiryDate = new Date(expiryDate);
    }
    if (price !== undefined) coupon.price = price;
    if (quantity !== undefined) coupon.quantity = quantity;
    if (images) coupon.images = images;

    // Reset status to pending if it was approved
    if (coupon.status === 'approved') {
      coupon.status = 'pending';
    }

    await coupon.save();

    res.json({
      message: 'Coupon updated successfully',
      coupon: {
        id: coupon._id,
        title: coupon.title,
        description: coupon.description,
        category: coupon.category,
        price: coupon.price,
        quantity: coupon.quantity,
        status: coupon.status,
        expiryDate: coupon.expiryDate,
        updatedAt: coupon.updatedAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/coupons/:id
// @desc    Delete coupon
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    // Check if user is the seller
    if (coupon.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this coupon' });
    }

    // Check if coupon can be deleted
    if (coupon.status === 'sold') {
      return res.status(400).json({ message: 'Cannot delete sold coupon' });
    }

    await Coupon.findByIdAndDelete(req.params.id);

    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/coupons/seller/my-coupons
// @desc    Get seller's coupons
// @access  Private
router.get('/seller/my-coupons', auth, async (req, res) => {
  try {
    const coupons = await Coupon.find({ sellerId: req.user._id })
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
      createdAt: coupon.createdAt,
      updatedAt: coupon.updatedAt
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
