#!/usr/bin/env node

/**
 * Extract Supabase Environment Variables
 * Helps convert DATABASE_URL to Supabase-specific environment variables
 */

import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

console.log('🔍 Analyzing DATABASE_URL...\n');

// Parse the DATABASE_URL to extract Supabase information
// Format: postgresql://postgres:[password]@[host]:[port]/postgres
const urlMatch = databaseUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);

if (!urlMatch) {
  console.error('❌ Invalid DATABASE_URL format');
  console.log('Expected format: postgresql://postgres:[password]@[host]:[port]/postgres');
  process.exit(1);
}

const [, username, password, host, port, database] = urlMatch;

// Extract Supabase URL from host (corrected)
// Host format: db.heldzockilbftitlcbac.supabase.co
const projectId = host.split('.')[1]; // heldzockilbftitlcbac
const supabaseUrl = `https://${projectId}.supabase.co`;

console.log('📋 Extracted Information:');
console.log(`   Username: ${username}`);
console.log(`   Host: ${host}`);
console.log(`   Port: ${port}`);
console.log(`   Database: ${database}`);
console.log(`   Project ID: ${projectId}`);
console.log(`   Supabase URL: ${supabaseUrl}`);

console.log('\n📝 Required Environment Variables:');
console.log('\n# Add these to your .env file:');
console.log(`SUPABASE_URL=${supabaseUrl}`);
console.log(`SUPABASE_ANON_KEY=your_anon_key_here`);
console.log(`SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here`);
console.log(`DATABASE_URL=${databaseUrl}`);

console.log('\n🔑 How to get the missing keys:');
console.log('1. Go to your Supabase Dashboard');
console.log(`2. Navigate to: ${supabaseUrl}/settings/api`);
console.log('3. Copy the following values:');
console.log('   - Project URL (already extracted above)');
console.log('   - anon/public key');
console.log('   - service_role key (keep this secret!)');

console.log('\n⚠️  Important Notes:');
console.log('- The service_role key has admin privileges');
console.log('- Never commit the service_role key to version control');
console.log('- The anon key is safe to use in client-side code');

console.log('\n🎯 Next Steps:');
console.log('1. Add the missing keys to your .env file');
console.log('2. Test with: npm run monitor-db');
console.log('3. Set up backups with: npm run setup-backups'); 