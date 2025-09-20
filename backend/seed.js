const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Coupon = require('./models/Coupon');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/coupon-marketplace', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Coupon.deleteMany({});

    console.log('Cleared existing data...');

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@marketplace.local',
      passwordHash: 'AdminPass123', // Will be hashed by pre-save middleware
      role: 'admin',
      isSeller: true
    });
    await adminUser.save();
    console.log('Admin user created:', adminUser.email);

    // Create sample users
    const users = [
      {
        name: 'Rahul Kumar',
        email: 'rahul@example.com',
        passwordHash: 'password123',
        role: 'user',
        isSeller: true
      },
      {
        name: 'Priya Sharma',
        email: 'priya@example.com',
        passwordHash: 'password123',
        role: 'user',
        isSeller: true
      },
      {
        name: 'Amit Singh',
        email: 'amit@example.com',
        passwordHash: 'password123',
        role: 'user',
        isSeller: true
      },
      {
        name: 'Sneha Patel',
        email: 'sneha@example.com',
        passwordHash: 'password123',
        role: 'user',
        isSeller: true
      }
    ];

    const createdUsers = [];
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log('User created:', user.email);
    }

    // Create mock coupons for Indian brands
    const mockCoupons = [
      {
        title: 'Domino\'s Pizza - 50% Off',
        description: 'Get 50% off on your order above ₹500. Valid on all pizzas and sides. Use code at checkout.',
        category: 'Food & Dining',
        redemptionCode: 'DOMINOS50',
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        price: 150,
        quantity: 1,
        sellerId: createdUsers[0]._id,
        status: 'approved',
        images: ['https://via.placeholder.com/300x200/000000/FFFFFF?text=Domino\'s']
      },
      {
        title: 'Amazon Gift Card - ₹1000',
        description: 'Amazon gift card worth ₹1000. Can be used for any purchase on Amazon India.',
        category: 'Shopping',
        redemptionCode: 'AMAZON1000',
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        price: 900,
        quantity: 1,
        sellerId: createdUsers[1]._id,
        status: 'approved',
        images: ['https://via.placeholder.com/300x200/000000/FFFFFF?text=Amazon']
      },
      {
        title: 'Netflix Premium - 1 Month',
        description: 'Netflix Premium subscription for 1 month. Access to all content in HD/4K.',
        category: 'Entertainment',
        redemptionCode: 'NETFLIX1M',
        expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        price: 800,
        quantity: 1,
        sellerId: createdUsers[2]._id,
        status: 'approved',
        images: ['https://via.placeholder.com/300x200/000000/FFFFFF?text=Netflix']
      },
      {
        title: 'Swiggy - ₹200 Off',
        description: 'Get ₹200 off on food delivery orders above ₹500. Valid on all restaurants.',
        category: 'Food & Dining',
        redemptionCode: 'SWIGGY200',
        expiryDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
        price: 100,
        quantity: 1,
        sellerId: createdUsers[3]._id,
        status: 'approved',
        images: ['https://via.placeholder.com/300x200/000000/FFFFFF?text=Swiggy']
      },
      {
        title: 'BigBasket - 30% Off',
        description: 'Get 30% off on grocery orders above ₹1000. Valid on all products.',
        category: 'Shopping',
        redemptionCode: 'BIGBASKET30',
        expiryDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
        price: 200,
        quantity: 1,
        sellerId: createdUsers[0]._id,
        status: 'approved',
        images: ['https://via.placeholder.com/300x200/000000/FFFFFF?text=BigBasket']
      },
      {
        title: 'Zomato Gold - 2 Months',
        description: 'Zomato Gold membership for 2 months. Get 1+1 on food and drinks.',
        category: 'Food & Dining',
        redemptionCode: 'ZOMATOGOLD2M',
        expiryDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000), // 40 days from now
        price: 300,
        quantity: 1,
        sellerId: createdUsers[1]._id,
        status: 'approved',
        images: ['https://via.placeholder.com/300x200/000000/FFFFFF?text=Zomato']
      },
      {
        title: 'Flipkart - ₹500 Off',
        description: 'Get ₹500 off on orders above ₹2000. Valid on all categories.',
        category: 'Shopping',
        redemptionCode: 'FLIPKART500',
        expiryDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 35 days from now
        price: 250,
        quantity: 1,
        sellerId: createdUsers[2]._id,
        status: 'approved',
        images: ['https://via.placeholder.com/300x200/000000/FFFFFF?text=Flipkart']
      },
      {
        title: 'BookMyShow - Buy 1 Get 1',
        description: 'Buy 1 Get 1 free on movie tickets. Valid on all movies and theaters.',
        category: 'Entertainment',
        redemptionCode: 'BMSBOGO',
        expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        price: 150,
        quantity: 1,
        sellerId: createdUsers[3]._id,
        status: 'approved',
        images: ['https://via.placeholder.com/300x200/000000/FFFFFF?text=BookMyShow']
      },
      {
        title: 'Uber - ₹100 Off',
        description: 'Get ₹100 off on your next ride. Valid on all Uber services.',
        category: 'Transportation',
        redemptionCode: 'UBER100',
        expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        price: 50,
        quantity: 1,
        sellerId: createdUsers[0]._id,
        status: 'pending',
        images: ['https://via.placeholder.com/300x200/000000/FFFFFF?text=Uber']
      },
      {
        title: 'Ola - ₹150 Off',
        description: 'Get ₹150 off on your next ride. Valid on all Ola services.',
        category: 'Transportation',
        redemptionCode: 'OLA150',
        expiryDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
        price: 75,
        quantity: 1,
        sellerId: createdUsers[1]._id,
        status: 'pending',
        images: ['https://via.placeholder.com/300x200/000000/FFFFFF?text=Ola']
      },
      {
        title: 'Myntra - 40% Off',
        description: 'Get 40% off on fashion and lifestyle products. Valid on all brands.',
        category: 'Shopping',
        redemptionCode: 'MYNTRA40',
        expiryDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), // 28 days from now
        price: 300,
        quantity: 1,
        sellerId: createdUsers[2]._id,
        status: 'rejected',
        images: ['https://via.placeholder.com/300x200/000000/FFFFFF?text=Myntra']
      },
      {
        title: 'Paytm - ₹50 Cashback',
        description: 'Get ₹50 cashback on your next recharge or bill payment.',
        category: 'Finance',
        redemptionCode: 'PAYTM50',
        expiryDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000), // 18 days from now
        price: 25,
        quantity: 1,
        sellerId: createdUsers[3]._id,
        status: 'approved',
        images: ['https://via.placeholder.com/300x200/000000/FFFFFF?text=Paytm']
      }
    ];

    for (const couponData of mockCoupons) {
      const coupon = new Coupon(couponData);
      await coupon.save();
      console.log('Coupon created:', coupon.title);
    }

    console.log('\n✅ Seed data created successfully!');
    console.log('\nAdmin Login:');
    console.log('Email: admin@marketplace.local');
    console.log('Password: AdminPass123');
    console.log('\nUser Logins (all use password: password123):');
    users.forEach(user => console.log(`Email: ${user.email}`));
    console.log('\n📊 Created:');
    console.log(`- 1 Admin user`);
    console.log(`- ${users.length} Regular users`);
    console.log(`- ${mockCoupons.length} Mock coupons`);
    console.log(`- 8 Approved coupons`);
    console.log(`- 2 Pending coupons`);
    console.log(`- 1 Rejected coupon`);

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedData();
