const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAdmin() {
  try {
    console.log('Testing admin functionality...');
    
    // Login as admin
    console.log('\n1. Logging in as admin...');
    const adminLoginResponse = await axios.post(`${API_BASE}/auth/admin-login`, {
      email: 'admin@marketplace.local',
      password: 'AdminPass123'
    });
    const adminToken = adminLoginResponse.data.token;
    console.log('✅ Admin login successful');
    
    // Test getting pending submissions
    console.log('\n2. Testing get pending submissions...');
    const submissionsResponse = await axios.get(`${API_BASE}/admin/submissions`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Get pending submissions successful:', submissionsResponse.data.length, 'submissions found');
    
    // Test getting revenue
    console.log('\n3. Testing get revenue...');
    const revenueResponse = await axios.get(`${API_BASE}/admin/revenue`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Get revenue successful');
    console.log('   Total Revenue:', revenueResponse.data.totalRevenue);
    console.log('   Total Sales:', revenueResponse.data.totalSales);
    console.log('   Total Amount:', revenueResponse.data.totalAmount);
    
    console.log('\n🎉 All admin tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAdmin();
