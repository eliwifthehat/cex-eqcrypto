#!/usr/bin/env node

// Quick Production Setup Script
import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { config } from 'dotenv';

// Load environment variables
config();

console.log('🚀 Quick Production Database Setup\n');

// Check if .env exists
if (!existsSync('.env')) {
  console.log('📝 Creating .env file...');
  const envTemplate = `# Database Configuration
DATABASE_URL=postgresql://postgres:[password]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres

# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Server Configuration
NODE_ENV=development
PORT=5002

# Session Configuration
SESSION_SECRET=your-session-secret-key-here

# Optional: External APIs
# MORALIS_API_KEY=your-moralis-api-key
# PYTH_NETWORK_ENDPOINT=your-pyth-endpoint
# JUPITER_API_KEY=your-jupiter-api-key
`;
  
  writeFileSync('.env', envTemplate);
  console.log('✅ .env file created');
  console.log('⚠️  Please update the DATABASE_URL with your Supabase credentials\n');
} else {
  console.log('✅ .env file already exists\n');
}

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('xxxxxxxxxxxxx')) {
  console.log('⚠️  DATABASE_URL not configured');
  console.log('Please update your .env file with your Supabase DATABASE_URL');
  console.log('Format: postgresql://postgres:[password]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres\n');
  console.log('Steps to get your DATABASE_URL:');
  console.log('1. Go to https://supabase.com/dashboard');
  console.log('2. Create a new project or select existing');
  console.log('3. Go to Settings → Database');
  console.log('4. Copy the connection string\n');
  process.exit(1);
}

console.log('🔧 Running production database setup...\n');

try {
  // Run the production setup script
  execSync('node scripts/setup-production-db.js', { stdio: 'inherit' });
  
  console.log('\n🎉 Quick setup completed!');
  console.log('\nNext steps:');
  console.log('1. Go to your Supabase dashboard');
  console.log('2. Run the SQL schema from SUPABASE_PRODUCTION_SETUP.md');
  console.log('3. Configure authentication providers');
  console.log('4. Test your application');
  
} catch (error) {
  console.error('\n❌ Setup failed:', error.message);
  console.log('\nPlease check:');
  console.log('1. Your DATABASE_URL is correct');
  console.log('2. Your Supabase project is active');
  console.log('3. Your database password is correct');
} 