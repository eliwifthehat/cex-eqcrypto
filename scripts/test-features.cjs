#!/usr/bin/env node

/**
 * Feature Testing Script for Crypto Exchange
 * Tests all key functionality on localhost:5002
 */

const http = require('http');

const BASE_URL = 'http://localhost:5002';

// Test configuration
const tests = [
  {
    name: 'Home Page',
    path: '/',
    expectedStatus: 200,
    description: 'Main application page loads'
  },
  {
    name: 'Markets Page',
    path: '/markets',
    expectedStatus: 200,
    description: 'Markets page loads'
  },
  {
    name: 'Exchange Page',
    path: '/exchange',
    expectedStatus: 200,
    description: 'Trading exchange page loads'
  },
  {
    name: 'Dashboard Page',
    path: '/dashboard',
    expectedStatus: 200,
    description: 'User dashboard loads'
  },
  {
    name: 'Auth Page',
    path: '/auth',
    expectedStatus: 200,
    description: 'Authentication page loads'
  },
  {
    name: 'API Health Check',
    path: '/api/health',
    expectedStatus: 200,
    description: 'API health endpoint responds'
  },
  {
    name: 'Trading Pairs API',
    path: '/api/trading-pairs',
    expectedStatus: 200,
    description: 'Trading pairs data loads'
  },
  {
    name: 'Order Book API',
    path: '/api/order-book/BTC-USDT',
    expectedStatus: 200,
    description: 'Order book data loads'
  },
  {
    name: 'Price Data API',
    path: '/api/prices',
    expectedStatus: 200,
    description: 'Price data loads'
  }
];

// Helper function to make HTTP requests
function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${path}`;
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Run tests
async function runTests() {
  console.log('🧪 Testing Crypto Exchange Features\n');
  console.log(`📍 Testing on: ${BASE_URL}\n`);
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      console.log(`🔍 Testing: ${test.name}`);
      console.log(`   Path: ${test.path}`);
      console.log(`   Expected: ${test.expectedStatus}`);
      
      const result = await makeRequest(test.path);
      
      if (result.status === test.expectedStatus) {
        console.log(`   ✅ PASSED - Status: ${result.status}`);
        passed++;
      } else {
        console.log(`   ❌ FAILED - Expected: ${test.expectedStatus}, Got: ${result.status}`);
        failed++;
      }
      
      console.log(`   📝 ${test.description}\n`);
      
    } catch (error) {
      console.log(`   ❌ ERROR - ${error.message}\n`);
      failed++;
    }
  }
  
  console.log('📊 Test Results:');
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%\n`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed! Your crypto exchange is working perfectly!');
  } else {
    console.log('⚠️  Some tests failed. Check the server logs for more details.');
  }
}

// Check if server is running first
async function checkServer() {
  try {
    console.log('🔍 Checking if server is running...');
    await makeRequest('/');
    console.log('✅ Server is running!\n');
    await runTests();
  } catch (error) {
    console.log('❌ Server is not running or not accessible');
    console.log('💡 Please start the server with: npm run dev');
    console.log('💡 Then run this test script again');
  }
}

// Run the test
checkServer(); 