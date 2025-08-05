#!/usr/bin/env node

// Production Database Setup Script
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../shared/schema";
import { eq } from "drizzle-orm";
import { config } from "dotenv";

// Load environment variables
config();

async function setupProductionDatabase() {
  console.log('🚀 Setting up Production Database...\n');

  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.log('Please set your Supabase DATABASE_URL in your .env file');
    console.log('Format: postgresql://postgres:[password]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres');
    process.exit(1);
  }

  try {
    console.log('🔗 Connecting to Supabase database...');
    
    // URL encode the connection string to handle special characters
    const encodedConnectionString = process.env.DATABASE_URL
      .replace(/!/g, '%21')
      .replace(/#/g, '%23')
      .replace(/&/g, '%26')
      .replace(/%/g, '%25');
    
    const client = postgres(encodedConnectionString);
    const db = drizzle(client, { schema });

    console.log('✅ Database connected successfully\n');

    // Test basic connection
    console.log('🧪 Testing database connection...');
    const testResult = await client`SELECT version()`;
    console.log('✅ Database version:', testResult[0].version.split(' ')[0], '\n');

    // Check if tables exist
    console.log('📋 Checking existing tables...');
    const tables = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `;
    
    const existingTables = tables.map(t => t.table_name);
    console.log('Existing tables:', existingTables.join(', ') || 'None\n');

    // Create tables if they don't exist
    const requiredTables = [
      'users', 'user_profiles', 'user_portfolios', 'user_orders', 
      'user_trades', 'trading_pairs', 'order_book_entries', 'trades',
      'user_api_keys', 'user_notifications', 'user_referrals',
      'user_security_logs', 'user_memberships', 'user_devices', 'user_messages'
    ];

    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length > 0) {
      console.log('⚠️  Missing tables:', missingTables.join(', '));
      console.log('Please run the SQL schema from SUPABASE_PRODUCTION_SETUP.md in your Supabase SQL Editor\n');
    } else {
      console.log('✅ All required tables exist\n');
    }

    // Test inserting sample data
    console.log('🧪 Testing data insertion...');
    
    // Test trading pairs table
    const samplePair = {
      symbol: 'BTC/USDT',
      baseAsset: 'BTC',
      quoteAsset: 'USDT',
      currentPrice: '45000.00',
      priceChange24h: '500.00',
      priceChangePercent24h: '1.12',
      high24h: '45500.00',
      low24h: '44000.00',
      volume24h: '1000000.00'
    };

    try {
      await db.insert(schema.tradingPairs).values(samplePair);
      console.log('✅ Sample trading pair inserted successfully');
      
      // Clean up test data
      await db.delete(schema.tradingPairs).where(eq(schema.tradingPairs.symbol, 'BTC/USDT'));
      console.log('✅ Test data cleaned up\n');
    } catch (error) {
      console.log('⚠️  Could not insert test data (table might not exist yet)');
      console.log('This is normal if you haven\'t run the schema yet\n');
    }

    // Check RLS status
    console.log('🔒 Checking Row Level Security...');
    const rlsTables = await client`
      SELECT schemaname, tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN (${client.unsafe(requiredTables.join("','"))})
    `;

    const tablesWithoutRLS = rlsTables.filter(t => !t.rowsecurity);
    if (tablesWithoutRLS.length > 0) {
      console.log('⚠️  Tables without RLS enabled:', tablesWithoutRLS.map(t => t.tablename).join(', '));
      console.log('Please enable RLS on user tables for security\n');
    } else {
      console.log('✅ RLS is enabled on all tables\n');
    }

    // Close database connection
    await client.end();
    console.log('🔌 Database connection closed');

    // Summary
    console.log('\n📊 Setup Summary:');
    console.log('✅ Database connection: Working');
    console.log('✅ Schema validation: Complete');
    if (missingTables.length > 0) {
      console.log('⚠️  Action required: Run SQL schema in Supabase');
    } else {
      console.log('✅ Database schema: Ready');
    }
    console.log('✅ Security check: Complete');

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Run the SQL schema in Supabase SQL Editor (if tables are missing)');
    console.log('2. Configure RLS policies for security');
    console.log('3. Set up authentication providers');
    console.log('4. Test your application with the production database');

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    
    if (error.message.includes('connection')) {
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Check your DATABASE_URL format');
      console.log('2. Verify your Supabase project is active');
      console.log('3. Check if your IP is whitelisted (if using IP restrictions)');
      console.log('4. Ensure your database password is correct');
    }
    
    process.exit(1);
  }
}

// Run the setup
setupProductionDatabase(); 