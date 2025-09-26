const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testPurchases() {
  try {
    console.log('Testing purchase functionality...');
    
    // Login as a user
    console.log('\n1. Logging in as user...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    const token = loginResponse.data.token;
    console.log('✅ User login successful');
    
    // Get an approved coupon
    console.log('\n2. Getting approved coupons...');
    const couponsResponse = await axios.get(`${API_BASE}/coupons?status=approved`);
    const approvedCoupons = couponsResponse.data;
    if (approvedCoupons.length === 0) {
      console.log('❌ No approved coupons found');
      return;
    }
    const coupon = approvedCoupons[0];
    console.log('✅ Found approved coupon:', coupon.title);
    
    // Test purchase request
    console.log('\n3. Testing purchase request...');
    const purchaseRequestResponse = await axios.post(`${API_BASE}/purchases/request`, {
      couponId: coupon.id
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Purchase request successful');
    console.log('   Original Price:', purchaseRequestResponse.data.purchase.originalPrice);
    console.log('   Buyer Fee:', purchaseRequestResponse.data.purchase.buyerFee);
    console.log('   Amount Paid:', purchaseRequestResponse.data.purchase.amountPaid);
    console.log('   Seller Fee:', purchaseRequestResponse.data.purchase.sellerFee);
    console.log('   Seller Earnings:', purchaseRequestResponse.data.purchase.sellerEarnings);
    console.log('   Total Platform Fee:', purchaseRequestResponse.data.purchase.totalPlatformFee);
    
    // Test getting purchase history
    console.log('\n4. Testing purchase history...');
    const purchaseHistoryResponse = await axios.get(`${API_BASE}/purchases/user`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Purchase history successful:', purchaseHistoryResponse.data.length, 'purchases found');
    
    console.log('\n🎉 All purchase tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testPurchases();
