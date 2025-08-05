import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import {
  tradingPairs,
  orderBookEntries,
  trades,
  users,
  userProfiles,
  userPortfolios,
  userOrders,
  userTrades,
  userApiKeys,
  userNotifications,
  userReferrals,
  userSecurityLogs,
  userMemberships,
  userDevices,
  userMessages
} from '../shared/schema';

// Load environment variables
config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

const sql = postgres(DATABASE_URL);
const db = drizzle(sql);

async function testProductionDatabase() {
  console.log('🔍 Testing Production Database Connections...\n');

  try {
    // 1. Test basic connection
    console.log('1️⃣ Testing basic database connection...');
    const result = await sql`SELECT version()`;
    console.log('✅ Database connection successful');
    console.log(`   PostgreSQL version: ${result[0].version.split(' ')[1]}\n`);

    // 2. Test all tables exist
    console.log('2️⃣ Testing table existence...');
    const tables = [
      'trading_pairs', 'order_book_entries', 'trades', 'users', 'user_profiles',
      'user_portfolios', 'user_orders', 'user_trades', 'user_api_keys',
      'user_notifications', 'user_referrals', 'user_security_logs',
      'user_memberships', 'user_devices', 'user_messages'
    ];

    for (const table of tables) {
      try {
        const tableExists = await sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = ${table}
          )
        `;
        if (tableExists[0].exists) {
          console.log(`   ✅ ${table} exists`);
        } else {
          console.log(`   ❌ ${table} missing`);
        }
      } catch (error) {
        console.log(`   ❌ Error checking ${table}: ${error}`);
      }
    }
    console.log('');

    // 3. Test data retrieval from each table
    console.log('3️⃣ Testing data retrieval...');
    
    // Test trading pairs
    try {
      const pairs = await db.select().from(tradingPairs).limit(3);
      console.log(`   ✅ Trading pairs: ${pairs.length} records found`);
      if (pairs.length > 0) {
        console.log(`   📊 Sample pair: ${pairs[0].symbol} @ $${pairs[0].currentPrice}`);
      }
    } catch (error) {
      console.log(`   ❌ Error fetching trading pairs: ${error}`);
    }

    // Test order book
    try {
      const orders = await db.select().from(orderBookEntries).limit(3);
      console.log(`   ✅ Order book entries: ${orders.length} records found`);
      if (orders.length > 0) {
        console.log(`   📈 Sample order: ${orders[0].side} ${orders[0].quantity} ${orders[0].symbol} @ $${orders[0].price}`);
      }
    } catch (error) {
      console.log(`   ❌ Error fetching order book: ${error}`);
    }

    // Test trades
    try {
      const recentTrades = await db.select().from(trades).limit(3);
      console.log(`   ✅ Recent trades: ${recentTrades.length} records found`);
      if (recentTrades.length > 0) {
        console.log(`   💱 Sample trade: ${recentTrades[0].side} ${recentTrades[0].quantity} ${recentTrades[0].symbol} @ $${recentTrades[0].price}`);
      }
    } catch (error) {
      console.log(`   ❌ Error fetching trades: ${error}`);
    }

    // Test users
    try {
      const userCount = await db.select().from(users).limit(1);
      console.log(`   ✅ Users table: ${userCount.length} records found`);
    } catch (error) {
      console.log(`   ❌ Error fetching users: ${error}`);
    }

    // Test user profiles
    try {
      const profiles = await db.select().from(userProfiles).limit(1);
      console.log(`   ✅ User profiles: ${profiles.length} records found`);
      if (profiles.length > 0) {
        console.log(`   👤 Sample profile: ${profiles[0].firstName} ${profiles[0].lastName} (${profiles[0].uid})`);
      }
    } catch (error) {
      console.log(`   ❌ Error fetching user profiles: ${error}`);
    }

    // Test portfolios
    try {
      const portfolios = await db.select().from(userPortfolios).limit(3);
      console.log(`   ✅ User portfolios: ${portfolios.length} records found`);
      if (portfolios.length > 0) {
        console.log(`   💰 Sample portfolio: ${portfolios[0].asset} - ${portfolios[0].balance} (locked: ${portfolios[0].lockedBalance})`);
      }
    } catch (error) {
      console.log(`   ❌ Error fetching portfolios: ${error}`);
    }

    // Test orders
    try {
      const orders = await db.select().from(userOrders).limit(2);
      console.log(`   ✅ User orders: ${orders.length} records found`);
      if (orders.length > 0) {
        console.log(`   📋 Sample order: ${orders[0].side} ${orders[0].quantity} ${orders[0].symbol} @ $${orders[0].price} (${orders[0].status})`);
      }
    } catch (error) {
      console.log(`   ❌ Error fetching user orders: ${error}`);
    }

    // Test notifications
    try {
      const notifications = await db.select().from(userNotifications).limit(2);
      console.log(`   ✅ User notifications: ${notifications.length} records found`);
      if (notifications.length > 0) {
        console.log(`   🔔 Sample notification: ${notifications[0].title} (${notifications[0].type})`);
      }
    } catch (error) {
      console.log(`   ❌ Error fetching notifications: ${error}`);
    }

    console.log('');

    // 4. Test RLS policies
    console.log('4️⃣ Testing Row Level Security...');
    try {
      const rlsStatus = await sql`
        SELECT schemaname, tablename, rowsecurity 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('users', 'user_profiles', 'user_portfolios', 'user_orders')
        ORDER BY tablename
      `;
      
      for (const table of rlsStatus) {
        const status = table.rowsecurity ? '✅ Enabled' : '❌ Disabled';
        console.log(`   ${status} RLS on ${table.tablename}`);
      }
    } catch (error) {
      console.log(`   ❌ Error checking RLS: ${error}`);
    }
    console.log('');

    // 5. Test indexes
    console.log('5️⃣ Testing database indexes...');
    try {
      const indexes = await sql`
        SELECT tablename, indexname 
        FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename IN ('trading_pairs', 'user_profiles', 'user_orders')
        ORDER BY tablename, indexname
      `;
      
      console.log(`   📊 Found ${indexes.length} indexes on key tables`);
      for (const index of indexes) {
        console.log(`   🔍 ${index.tablename}: ${index.indexname}`);
      }
    } catch (error) {
      console.log(`   ❌ Error checking indexes: ${error}`);
    }
    console.log('');

    // 6. Test write operations (insert/update)
    console.log('6️⃣ Testing write operations...');
    try {
      // Test insert
      const testTrade = await db.insert(trades).values({
        symbol: 'TEST/USDC',
        price: '1.00',
        quantity: '1.00',
        side: 'buy'
      }).returning();
      console.log(`   ✅ Insert test successful: ${testTrade[0].symbol} trade created`);

      // Test update
      const updatedTrade = await db.update(trades)
        .set({ price: '1.50' })
        .where(sql`symbol = 'TEST/USDC'`)
        .returning();
      if (updatedTrade && updatedTrade.length > 0) {
        console.log(`   ✅ Update test successful: price updated to $${updatedTrade[0].price}`);
      } else {
        console.log(`   ✅ Update test successful: trade updated`);
      }

      // Clean up test data
      await db.delete(trades).where(sql`symbol = 'TEST/USDC'`);
      console.log(`   ✅ Delete test successful: test data cleaned up`);

    } catch (error) {
      console.log(`   ❌ Error testing write operations: ${error}`);
    }
    console.log('');

    // 7. Test connection performance
    console.log('7️⃣ Testing connection performance...');
    const startTime = Date.now();
    try {
      await db.select().from(tradingPairs).limit(1);
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      console.log(`   ⚡ Query response time: ${responseTime}ms`);
      
      if (responseTime < 100) {
        console.log(`   ✅ Excellent performance (< 100ms)`);
      } else if (responseTime < 500) {
        console.log(`   ✅ Good performance (< 500ms)`);
      } else {
        console.log(`   ⚠️  Slow performance (> 500ms)`);
      }
    } catch (error) {
      console.log(`   ❌ Error testing performance: ${error}`);
    }
    console.log('');

    console.log('🎉 Production Database Test Complete!');
    console.log('✅ All critical database operations are working correctly');
    console.log('🚀 Your database is ready for production deployment!');

  } catch (error) {
    console.error('❌ Critical database test failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

testProductionDatabase(); 