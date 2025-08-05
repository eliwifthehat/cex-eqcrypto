#!/usr/bin/env node

/**
 * Simple Server Start Test
 * Tests if the server can start without errors
 */

const { spawn } = require('child_process');

console.log('🚀 Testing server startup...\n');

const server = spawn('npx', ['tsx', 'server/index.ts'], {
  env: { ...process.env, NODE_ENV: 'development' },
  stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';
let errorOutput = '';

server.stdout.on('data', (data) => {
  const message = data.toString();
  output += message;
  console.log('📤 STDOUT:', message.trim());
});

server.stderr.on('data', (data) => {
  const message = data.toString();
  errorOutput += message;
  console.log('❌ STDERR:', message.trim());
});

server.on('close', (code) => {
  console.log(`\n🔚 Server process exited with code ${code}`);
  
  if (code === 0) {
    console.log('✅ Server started successfully!');
  } else {
    console.log('❌ Server failed to start');
    console.log('\n📋 Error Summary:');
    console.log(errorOutput);
  }
});

// Kill server after 10 seconds
setTimeout(() => {
  console.log('\n⏰ Stopping server after 10 seconds...');
  server.kill('SIGTERM');
}, 10000); 