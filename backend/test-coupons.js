const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testCoupons() {
  try {
    console.log('Testing coupon functionality...');
    
    // Login as a user
    console.log('\n1. Logging in as user...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    const token = loginResponse.data.token;
    console.log('✅ User login successful');
    
    // Test getting coupons
    console.log('\n2. Testing get coupons...');
    const couponsResponse = await axios.get(`${API_BASE}/coupons?status=approved`);
    console.log('✅ Get coupons successful:', couponsResponse.data.length, 'coupons found');
    
    // Test creating a coupon
    console.log('\n3. Testing create coupon...');
    const createCouponResponse = await axios.post(`${API_BASE}/coupons`, {
      title: 'Test Coupon',
      description: 'This is a test coupon',
      category: 'Test',
      redemptionCode: 'TEST123',
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      price: 100,
      quantity: 1
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Create coupon successful:', createCouponResponse.data.coupon.title);
    
    // Test getting coupon details
    console.log('\n4. Testing get coupon details...');
    const couponId = createCouponResponse.data.coupon.id;
    const couponDetailResponse = await axios.get(`${API_BASE}/coupons/${couponId}`);
    console.log('✅ Get coupon details successful:', couponDetailResponse.data.title);
    
    console.log('\n🎉 All coupon tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testCoupons();
