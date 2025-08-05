#!/usr/bin/env node

/**
 * HTTPS Testing Script
 * Tests HTTPS configuration and security headers
 */

import https from 'https';
import http from 'http';
import { URL } from 'url';

const testUrls = [
  'https://cex.eqadvertise.com',
  'https://www.cex.eqadvertise.com',
  'http://cex.eqadvertise.com', // Should redirect to HTTPS
  'http://www.cex.eqadvertise.com', // Should redirect to HTTPS
];

const securityHeaders = [
  'Strict-Transport-Security',
  'X-Content-Type-Options',
  'X-Frame-Options',
  'X-XSS-Protection',
  'Referrer-Policy',
  'Permissions-Policy',
  'Cross-Origin-Embedder-Policy',
  'Cross-Origin-Opener-Policy',
  'Cross-Origin-Resource-Policy',
];

function testHTTPSRedirect(url) {
  return new Promise((resolve) => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname,
      method: 'GET',
      followRedirect: false,
      timeout: 10000,
    };

    const req = client.request(options, (res) => {
      const result = {
        url,
        statusCode: res.statusCode,
        location: res.headers.location,
        headers: res.headers,
        isRedirect: res.statusCode >= 300 && res.statusCode < 400,
        isHTTPS: res.headers.location?.startsWith('https://') || false,
      };

      resolve(result);
    });

    req.on('error', (error) => {
      resolve({
        url,
        error: error.message,
        statusCode: null,
        location: null,
        headers: {},
        isRedirect: false,
        isHTTPS: false,
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        url,
        error: 'Timeout',
        statusCode: null,
        location: null,
        headers: {},
        isRedirect: false,
        isHTTPS: false,
      });
    });

    req.end();
  });
}

function checkSecurityHeaders(headers) {
  const results = {};
  
  securityHeaders.forEach(header => {
    results[header] = {
      present: !!headers[header.toLowerCase()],
      value: headers[header.toLowerCase()] || null,
    };
  });

  return results;
}

function analyzeResults(results) {
  console.log('🔒 HTTPS Security Analysis\n');

  let allTestsPassed = true;
  let redirectTestsPassed = 0;
  let securityTestsPassed = 0;

  results.forEach(result => {
    console.log(`📋 Testing: ${result.url}`);
    
    if (result.error) {
      console.log(`   ❌ Error: ${result.error}`);
      allTestsPassed = false;
      return;
    }

    // Check redirect behavior
    if (result.url.startsWith('http://')) {
      if (result.isRedirect && result.isHTTPS) {
        console.log(`   ✅ Redirect: HTTP → HTTPS (${result.statusCode})`);
        redirectTestsPassed++;
      } else {
        console.log(`   ❌ Redirect: Failed to redirect to HTTPS`);
        console.log(`      Status: ${result.statusCode}, Location: ${result.location}`);
        allTestsPassed = false;
      }
    } else {
      if (result.statusCode === 200) {
        console.log(`   ✅ Direct HTTPS: Accessible (${result.statusCode})`);
        redirectTestsPassed++;
      } else {
        console.log(`   ❌ Direct HTTPS: Failed (${result.statusCode})`);
        allTestsPassed = false;
      }
    }

    // Check security headers (only for successful HTTPS requests)
    if (result.url.startsWith('https://') && result.statusCode === 200) {
      const securityCheck = checkSecurityHeaders(result.headers);
      console.log('   🔐 Security Headers:');
      
      let headersPassed = 0;
      Object.entries(securityCheck).forEach(([header, check]) => {
        if (check.present) {
          console.log(`      ✅ ${header}: ${check.value}`);
          headersPassed++;
        } else {
          console.log(`      ❌ ${header}: Missing`);
        }
      });

      if (headersPassed >= 6) { // At least 6 security headers should be present
        securityTestsPassed++;
        console.log(`   ✅ Security Headers: ${headersPassed}/9 present`);
      } else {
        console.log(`   ⚠️  Security Headers: Only ${headersPassed}/9 present`);
        allTestsPassed = false;
      }
    }

    console.log('');
  });

  // Summary
  console.log('📊 Test Summary:');
  console.log(`   Redirect Tests: ${redirectTestsPassed}/${results.length} passed`);
  console.log(`   Security Tests: ${securityTestsPassed}/${results.filter(r => r.url.startsWith('https://')).length} passed`);
  console.log(`   Overall: ${allTestsPassed ? '✅ PASSED' : '❌ FAILED'}`);

  return allTestsPassed;
}

async function main() {
  console.log('🔒 HTTPS Configuration Test\n');
  console.log('Testing URLs:');
  testUrls.forEach(url => console.log(`   ${url}`));
  console.log('');

  const results = [];
  
  for (const url of testUrls) {
    const result = await testHTTPSRedirect(url);
    results.push(result);
  }

  const passed = analyzeResults(results);

  if (!passed) {
    console.log('\n⚠️  Issues Found:');
    console.log('   - Check your HTTPS redirect configuration');
    console.log('   - Verify SSL certificate is properly installed');
    console.log('   - Ensure security headers are configured');
    console.log('   - Test with: curl -I http://yourdomain.com');
    process.exit(1);
  } else {
    console.log('\n🎉 All HTTPS tests passed!');
    console.log('   Your application is properly configured for HTTPS.');
  }
}

main().catch(console.error); 