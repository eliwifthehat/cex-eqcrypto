# Production Supabase Database Setup Guide

## 🚀 Overview
This guide will help you set up a production-ready Supabase database for your crypto exchange application.

## 📋 Prerequisites
- Supabase account (free tier available)
- Your crypto exchange project ready for deployment

## 🔧 Step-by-Step Setup

### **1. Create Supabase Project**

1. **Go to [Supabase Dashboard](https://supabase.com/dashboard)**
2. **Click "New Project"**
3. **Fill in project details:**
   - **Organization**: Select your org (or create one)
   - **Name**: `crypto-exchange-prod` (or your preferred name)
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users (e.g., `us-east-1` for US)
   - **Pricing Plan**: Start with Free tier (upgrade later if needed)

4. **Click "Create new project"**
5. **Wait for setup to complete** (2-3 minutes)

### **2. Get Database Connection Details**

1. **Go to Project Settings** → **Database**
2. **Copy the connection details:**
   ```
   Host: db.xxxxxxxxxxxxx.supabase.co
   Database name: postgres
   Port: 5432
   User: postgres
   Password: [your-database-password]
   ```

3. **Create DATABASE_URL:**
   ```
   DATABASE_URL=postgresql://postgres:[password]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
   ```

### **3. Set Up Database Schema**

#### **Option A: Using Drizzle Migrations (Recommended)**

1. **Update your `.env` file:**
   ```bash
   DATABASE_URL=postgresql://postgres:[password]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
   ```

2. **Generate new migration:**
   ```bash
   npx drizzle-kit generate
   ```

3. **Apply migration to Supabase:**
   ```bash
   npx drizzle-kit push
   ```

#### **Option B: Manual SQL Setup**

1. **Go to Supabase Dashboard** → **SQL Editor**
2. **Run the complete schema:**

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  uid TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  avatar TEXT,
  verified BOOLEAN DEFAULT FALSE,
  kyc_status TEXT DEFAULT 'pending',
  security_level INTEGER DEFAULT 1,
  withdrawal_limit DECIMAL(20,2) DEFAULT 1000.00,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  api_key_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  slippage_tolerance DECIMAL(5,2) DEFAULT 0.50
);

-- User portfolios table
CREATE TABLE user_portfolios (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  asset TEXT NOT NULL,
  balance DECIMAL(20,8) DEFAULT 0,
  locked_balance DECIMAL(20,8) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User orders table
CREATE TABLE user_orders (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL,
  type TEXT NOT NULL,
  quantity DECIMAL(20,8) NOT NULL,
  price DECIMAL(20,8),
  filled_quantity DECIMAL(20,8) DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User trades table
CREATE TABLE user_trades (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  order_id INTEGER REFERENCES user_orders(id),
  symbol TEXT NOT NULL,
  side TEXT NOT NULL,
  quantity DECIMAL(20,8) NOT NULL,
  price DECIMAL(20,8) NOT NULL,
  fee DECIMAL(20,8) DEFAULT 0,
  fee_asset TEXT DEFAULT 'USDT',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Trading pairs table
CREATE TABLE trading_pairs (
  id SERIAL PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  base_asset TEXT NOT NULL,
  quote_asset TEXT NOT NULL,
  current_price DECIMAL(18,8) NOT NULL,
  price_change_24h DECIMAL(18,8) NOT NULL,
  price_change_percent_24h DECIMAL(5,2) NOT NULL,
  high_24h DECIMAL(18,8) NOT NULL,
  low_24h DECIMAL(18,8) NOT NULL,
  volume_24h DECIMAL(18,8) NOT NULL
);

-- Order book entries table
CREATE TABLE order_book_entries (
  id SERIAL PRIMARY KEY,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL,
  price DECIMAL(18,8) NOT NULL,
  quantity DECIMAL(18,8) NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Trades table
CREATE TABLE trades (
  id SERIAL PRIMARY KEY,
  symbol TEXT NOT NULL,
  price DECIMAL(18,8) NOT NULL,
  quantity DECIMAL(18,8) NOT NULL,
  side TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW() NOT NULL
);

-- User API keys table
CREATE TABLE user_api_keys (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  api_key TEXT UNIQUE NOT NULL,
  secret_key TEXT NOT NULL,
  permissions TEXT[] DEFAULT ARRAY['read'],
  ip_whitelist TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  last_used TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

-- User notifications table
CREATE TABLE user_notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'normal',
  metadata TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User referrals table
CREATE TABLE user_referrals (
  id SERIAL PRIMARY KEY,
  referrer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  referred_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  referral_code TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  reward_amount DECIMAL(20,8) DEFAULT 0,
  reward_currency TEXT DEFAULT 'USDT',
  created_at TIMESTAMP DEFAULT NOW()
);

-- User security logs table
CREATE TABLE user_security_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN DEFAULT TRUE,
  details TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User memberships table
CREATE TABLE user_memberships (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  level TEXT DEFAULT 'basic',
  perks TEXT[] DEFAULT ARRAY[]::TEXT[],
  expiry_date TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User devices table
CREATE TABLE user_devices (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  device_id TEXT NOT NULL,
  device_name TEXT,
  last_seen TIMESTAMP DEFAULT NOW(),
  user_agent TEXT,
  ip_address TEXT,
  location TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User messages table
CREATE TABLE user_messages (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'general',
  is_read BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'normal',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_portfolios_user_id ON user_portfolios(user_id);
CREATE INDEX idx_user_orders_user_id ON user_orders(user_id);
CREATE INDEX idx_user_trades_user_id ON user_trades(user_id);
CREATE INDEX idx_trading_pairs_symbol ON trading_pairs(symbol);
CREATE INDEX idx_order_book_entries_symbol ON order_book_entries(symbol);
CREATE INDEX idx_trades_symbol ON trades(symbol);
CREATE INDEX idx_user_api_keys_user_id ON user_api_keys(user_id);
CREATE INDEX idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX idx_user_referrals_referrer_id ON user_referrals(referrer_id);
CREATE INDEX idx_user_security_logs_user_id ON user_security_logs(user_id);
CREATE INDEX idx_user_memberships_user_id ON user_memberships(user_id);
CREATE INDEX idx_user_devices_user_id ON user_devices(user_id);
CREATE INDEX idx_user_messages_user_id ON user_messages(user_id);
```

### **4. Configure Row Level Security (RLS)**

1. **Enable RLS on all tables:**
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_messages ENABLE ROW LEVEL SECURITY;
```

2. **Create RLS policies (example for user_profiles):**
```sql
-- Users can only access their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid()::uuid = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid()::uuid = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid()::uuid = id);
```

### **5. Set Up Authentication**

1. **Go to Authentication** → **Settings**
2. **Configure providers:**
   - **Email**: Enable email/password
   - **Google**: Add Google OAuth (optional)
   - **GitHub**: Add GitHub OAuth (optional)

3. **Configure email templates** (optional)

### **6. Environment Variables Setup**

Create `.env.production` file:
```bash
# Database Configuration
DATABASE_URL=postgresql://postgres:[password]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres

# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Server Configuration
NODE_ENV=production
PORT=5002

# Session Configuration
SESSION_SECRET=your-production-session-secret-key-here

# Optional: External APIs
MORALIS_API_KEY=your-moralis-api-key
PYTH_NETWORK_ENDPOINT=your-pyth-endpoint
JUPITER_API_KEY=your-jupiter-api-key
```

### **7. Test Database Connection**

1. **Test with your app:**
```bash
NODE_ENV=production npm run start
```

2. **Or create a test script:**
```javascript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./shared/schema";

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client, { schema });

// Test query
const result = await db.query.tradingPairs.findMany();
console.log('Database connection successful:', result.length, 'trading pairs found');
```

## 🔒 Security Best Practices

### **1. Database Security**
- ✅ Use strong database passwords
- ✅ Enable RLS on all user tables
- ✅ Create proper RLS policies
- ✅ Use connection pooling in production

### **2. API Security**
- ✅ Use environment variables for secrets
- ✅ Enable CORS properly
- ✅ Implement rate limiting
- ✅ Use HTTPS in production

### **3. Authentication Security**
- ✅ Enable email verification
- ✅ Implement 2FA
- ✅ Use secure session management
- ✅ Log security events

## 📊 Monitoring & Analytics

### **1. Supabase Dashboard**
- Monitor database performance
- Check authentication logs
- View real-time logs
- Monitor API usage

### **2. Set Up Alerts**
- Database connection issues
- High error rates
- Authentication failures
- Performance degradation

## 🚀 Deployment Checklist

- [ ] Supabase project created
- [ ] Database schema applied
- [ ] RLS policies configured
- [ ] Authentication providers set up
- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] Security policies implemented
- [ ] Monitoring configured

## 💰 Cost Optimization

### **Free Tier Limits:**
- **Database**: 500MB
- **Bandwidth**: 2GB
- **API Requests**: 50,000/month
- **Auth Users**: 50,000

### **Upgrade When:**
- Database size > 500MB
- API requests > 50,000/month
- Need more features (backups, etc.)

## 🆘 Troubleshooting

### **Common Issues:**

1. **Connection Refused:**
   - Check DATABASE_URL format
   - Verify network access
   - Check firewall settings

2. **Authentication Errors:**
   - Verify Supabase URL and keys
   - Check RLS policies
   - Ensure proper auth setup

3. **Migration Errors:**
   - Check schema compatibility
   - Verify table permissions
   - Review error logs

## 📞 Support

- **Supabase Docs**: https://supabase.com/docs
- **Community**: https://github.com/supabase/supabase/discussions
- **Discord**: https://discord.supabase.com

---

**Your production Supabase database is now ready! 🎉** 