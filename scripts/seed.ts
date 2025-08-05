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

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    // 1. Insert sample trading pairs
    console.log('📊 Adding trading pairs...');
    const tradingPairsData = [
      {
        symbol: 'SOL/USDC',
        baseAsset: 'SOL',
        quoteAsset: 'USDC',
        currentPrice: '100.50',
        priceChange24h: '5.25',
        priceChangePercent24h: '5.50',
        high24h: '105.75',
        low24h: '95.25',
        volume24h: '1250000.00'
      },
      {
        symbol: 'BTC/USDC',
        baseAsset: 'BTC',
        quoteAsset: 'USDC',
        currentPrice: '45000.00',
        priceChange24h: '1250.00',
        priceChangePercent24h: '2.85',
        high24h: '46500.00',
        low24h: '43750.00',
        volume24h: '85000000.00'
      },
      {
        symbol: 'ETH/USDC',
        baseAsset: 'ETH',
        quoteAsset: 'USDC',
        currentPrice: '3200.00',
        priceChange24h: '85.00',
        priceChangePercent24h: '2.73',
        high24h: '3300.00',
        low24h: '3115.00',
        volume24h: '45000000.00'
      },
      {
        symbol: 'MATIC/USDC',
        baseAsset: 'MATIC',
        quoteAsset: 'USDC',
        currentPrice: '0.85',
        priceChange24h: '0.05',
        priceChangePercent24h: '6.25',
        high24h: '0.90',
        low24h: '0.80',
        volume24h: '8500000.00'
      },
      {
        symbol: 'ADA/USDC',
        baseAsset: 'ADA',
        quoteAsset: 'USDC',
        currentPrice: '0.45',
        priceChange24h: '0.02',
        priceChangePercent24h: '4.65',
        high24h: '0.48',
        low24h: '0.43',
        volume24h: '3200000.00'
      }
    ];

    try {
      await db.insert(tradingPairs).values(tradingPairsData);
      console.log('✅ Trading pairs added');
    } catch (error: any) {
      if (error.code === '23505') {
        console.log('ℹ️  Trading pairs already exist, skipping...');
      } else {
        throw error;
      }
    }

    // 2. Insert sample order book entries
    console.log('📈 Adding order book entries...');
    const orderBookData = [
      // SOL/USDC orders
      { symbol: 'SOL/USDC', side: 'buy', price: '100.00', quantity: '50.00' },
      { symbol: 'SOL/USDC', side: 'buy', price: '99.50', quantity: '75.00' },
      { symbol: 'SOL/USDC', side: 'buy', price: '99.00', quantity: '100.00' },
      { symbol: 'SOL/USDC', side: 'sell', price: '101.00', quantity: '60.00' },
      { symbol: 'SOL/USDC', side: 'sell', price: '101.50', quantity: '80.00' },
      { symbol: 'SOL/USDC', side: 'sell', price: '102.00', quantity: '90.00' },
      
      // BTC/USDC orders
      { symbol: 'BTC/USDC', side: 'buy', price: '44900.00', quantity: '0.5' },
      { symbol: 'BTC/USDC', side: 'buy', price: '44800.00', quantity: '1.0' },
      { symbol: 'BTC/USDC', side: 'buy', price: '44700.00', quantity: '1.5' },
      { symbol: 'BTC/USDC', side: 'sell', price: '45100.00', quantity: '0.8' },
      { symbol: 'BTC/USDC', side: 'sell', price: '45200.00', quantity: '1.2' },
      { symbol: 'BTC/USDC', side: 'sell', price: '45300.00', quantity: '1.0' },
      
      // ETH/USDC orders
      { symbol: 'ETH/USDC', side: 'buy', price: '3190.00', quantity: '5.0' },
      { symbol: 'ETH/USDC', side: 'buy', price: '3180.00', quantity: '8.0' },
      { symbol: 'ETH/USDC', side: 'buy', price: '3170.00', quantity: '10.0' },
      { symbol: 'ETH/USDC', side: 'sell', price: '3210.00', quantity: '6.0' },
      { symbol: 'ETH/USDC', side: 'sell', price: '3220.00', quantity: '9.0' },
      { symbol: 'ETH/USDC', side: 'sell', price: '3230.00', quantity: '12.0' }
    ];

    try {
      await db.insert(orderBookEntries).values(orderBookData);
      console.log('✅ Order book entries added');
    } catch (error: any) {
      if (error.code === '23505') {
        console.log('ℹ️  Order book entries already exist, skipping...');
      } else {
        throw error;
      }
    }

    // 3. Insert sample trades
    console.log('💱 Adding sample trades...');
    const tradesData = [
      { symbol: 'SOL/USDC', price: '100.25', quantity: '25.00', side: 'buy' },
      { symbol: 'SOL/USDC', price: '100.30', quantity: '30.00', side: 'sell' },
      { symbol: 'BTC/USDC', price: '45000.00', quantity: '0.1', side: 'buy' },
      { symbol: 'BTC/USDC', price: '45050.00', quantity: '0.2', side: 'sell' },
      { symbol: 'ETH/USDC', price: '3200.00', quantity: '2.0', side: 'buy' },
      { symbol: 'ETH/USDC', price: '3205.00', quantity: '3.0', side: 'sell' }
    ];

    try {
      await db.insert(trades).values(tradesData);
      console.log('✅ Sample trades added');
    } catch (error: any) {
      if (error.code === '23505') {
        console.log('ℹ️  Sample trades already exist, skipping...');
      } else {
        throw error;
      }
    }

    // 4. Insert sample user (for testing)
    console.log('👤 Adding sample user...');
    const sampleUserId = 'sample-user-123';
    const userData = {
      id: sampleUserId,
      email: 'demo@cryptoexchange.com',
      phone: '+1234567890'
    };

    try {
      await db.insert(users).values(userData);
      console.log('✅ Sample user added');
    } catch (error: any) {
      if (error.code === '23505') {
        console.log('ℹ️  Sample user already exists, skipping...');
      } else {
        throw error;
      }
    }

    // 5. Add sample user profile
    const userProfileData = {
      id: sampleUserId,
      uid: 'EQ123456789',
      firstName: 'Demo',
      lastName: 'User',
      verified: true,
      kycStatus: 'approved',
      securityLevel: 3,
      withdrawalLimit: '5000.00',
      twoFactorEnabled: true,
      phoneVerified: true,
      emailVerified: true,
      apiKeyEnabled: true,
      slippageTolerance: '0.50'
    };

    try {
      await db.insert(userProfiles).values(userProfileData);
      console.log('✅ Sample user profile added');
    } catch (error: any) {
      if (error.code === '23505') {
        console.log('ℹ️  Sample user profile already exists, skipping...');
      } else {
        throw error;
      }
    }

    // 6. Add sample portfolio
    const portfolioData = [
      { userId: sampleUserId, asset: 'SOL', balance: '100.00', lockedBalance: '10.00' },
      { userId: sampleUserId, asset: 'BTC', balance: '0.5', lockedBalance: '0.05' },
      { userId: sampleUserId, asset: 'ETH', balance: '5.0', lockedBalance: '0.5' },
      { userId: sampleUserId, asset: 'USDC', balance: '10000.00', lockedBalance: '500.00' }
    ];

    try {
      await db.insert(userPortfolios).values(portfolioData);
      console.log('✅ Sample portfolio added');
    } catch (error: any) {
      console.log('ℹ️  Sample portfolio entries may already exist, continuing...');
    }

    // 7. Add sample orders
    const ordersData = [
      {
        userId: sampleUserId,
        symbol: 'SOL/USDC',
        side: 'buy',
        type: 'limit',
        quantity: '25.00',
        price: '100.00',
        filledQuantity: '15.00',
        status: 'partial'
      },
      {
        userId: sampleUserId,
        symbol: 'BTC/USDC',
        side: 'sell',
        type: 'limit',
        quantity: '0.1',
        price: '45000.00',
        filledQuantity: '0.1',
        status: 'filled'
      }
    ];

    try {
      await db.insert(userOrders).values(ordersData);
      console.log('✅ Sample orders added');
    } catch (error: any) {
      console.log('ℹ️  Sample orders may already exist, continuing...');
    }

    // 8. Add sample notifications
    const notificationsData = [
      {
        userId: sampleUserId,
        type: 'trade',
        title: 'Order Filled',
        message: 'Your BTC/USDC sell order has been filled at $45,000',
        isRead: false,
        priority: 'normal'
      },
      {
        userId: sampleUserId,
        type: 'security',
        title: 'Login Alert',
        message: 'New login detected from New York, NY',
        isRead: true,
        priority: 'normal'
      }
    ];

    try {
      await db.insert(userNotifications).values(notificationsData);
      console.log('✅ Sample notifications added');
    } catch (error: any) {
      console.log('ℹ️  Sample notifications may already exist, continuing...');
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('📊 Added:');
    console.log('   - 5 trading pairs');
    console.log('   - 18 order book entries');
    console.log('   - 6 sample trades');
    console.log('   - 1 sample user with profile');
    console.log('   - 4 portfolio entries');
    console.log('   - 2 sample orders');
    console.log('   - 2 sample notifications');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

seed();