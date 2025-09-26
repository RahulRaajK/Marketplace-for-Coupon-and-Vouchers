const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAuth() {
  try {
    console.log('Testing authentication...');
    
    // Test user registration
    console.log('\n1. Testing user registration...');
    const registerResponse = await axios.post(`${API_BASE}/auth/register`, {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('✅ Registration successful:', registerResponse.data.user.email);
    
    // Test user login
    console.log('\n2. Testing user login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('✅ Login successful:', loginResponse.data.user.email);
    
    // Test admin login
    console.log('\n3. Testing admin login...');
    const adminLoginResponse = await axios.post(`${API_BASE}/auth/admin-login`, {
      email: 'admin@marketplace.local',
      password: 'AdminPass123'
    });
    console.log('✅ Admin login successful:', adminLoginResponse.data.user.email);
    
    // Test protected route
    console.log('\n4. Testing protected route...');
    const token = loginResponse.data.token;
    const meResponse = await axios.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Protected route successful:', meResponse.data.user.email);
    
    console.log('\n🎉 All authentication tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAuth();