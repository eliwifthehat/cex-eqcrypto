-- Fixed Supabase Schema for Crypto Exchange
-- This schema uses UUID for user IDs to match Supabase auth

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (matches Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
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
CREATE TABLE IF NOT EXISTS user_portfolios (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  asset TEXT NOT NULL,
  balance DECIMAL(20,8) DEFAULT 0,
  locked_balance DECIMAL(20,8) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User orders table
CREATE TABLE IF NOT EXISTS user_orders (
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
CREATE TABLE IF NOT EXISTS user_trades (
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
CREATE TABLE IF NOT EXISTS trading_pairs (
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
CREATE TABLE IF NOT EXISTS order_book_entries (
  id SERIAL PRIMARY KEY,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL,
  price DECIMAL(18,8) NOT NULL,
  quantity DECIMAL(18,8) NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Trades table
CREATE TABLE IF NOT EXISTS trades (
  id SERIAL PRIMARY KEY,
  symbol TEXT NOT NULL,
  price DECIMAL(18,8) NOT NULL,
  quantity DECIMAL(18,8) NOT NULL,
  side TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW() NOT NULL
);

-- User API keys table
CREATE TABLE IF NOT EXISTS user_api_keys (
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
CREATE TABLE IF NOT EXISTS user_notifications (
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
CREATE TABLE IF NOT EXISTS user_referrals (
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
CREATE TABLE IF NOT EXISTS user_security_logs (
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
CREATE TABLE IF NOT EXISTS user_memberships (
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
CREATE TABLE IF NOT EXISTS user_devices (
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
CREATE TABLE IF NOT EXISTS user_messages (
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
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_portfolios_user_id ON user_portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_user_orders_user_id ON user_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_user_trades_user_id ON user_trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_pairs_symbol ON trading_pairs(symbol);
CREATE INDEX IF NOT EXISTS idx_order_book_entries_symbol ON order_book_entries(symbol);
CREATE INDEX IF NOT EXISTS idx_trades_symbol ON trades(symbol);
CREATE INDEX IF NOT EXISTS idx_user_api_keys_user_id ON user_api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_referrals_referrer_id ON user_referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_user_security_logs_user_id ON user_security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_memberships_user_id ON user_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_user_id ON user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_messages_user_id ON user_messages(user_id);

-- Enable Row Level Security (RLS)
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

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid()::uuid = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid()::uuid = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid()::uuid = id);

-- Create RLS policies for user_portfolios
CREATE POLICY "Users can view own portfolio" ON user_portfolios
  FOR SELECT USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can update own portfolio" ON user_portfolios
  FOR UPDATE USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can insert own portfolio" ON user_portfolios
  FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);

-- Create RLS policies for user_orders
CREATE POLICY "Users can view own orders" ON user_orders
  FOR SELECT USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can update own orders" ON user_orders
  FOR UPDATE USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can insert own orders" ON user_orders
  FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);

-- Create RLS policies for user_trades
CREATE POLICY "Users can view own trades" ON user_trades
  FOR SELECT USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can insert own trades" ON user_trades
  FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);

-- Create RLS policies for user_api_keys
CREATE POLICY "Users can view own api keys" ON user_api_keys
  FOR SELECT USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can update own api keys" ON user_api_keys
  FOR UPDATE USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can insert own api keys" ON user_api_keys
  FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "Users can delete own api keys" ON user_api_keys
  FOR DELETE USING (auth.uid()::uuid = user_id);

-- Create RLS policies for user_notifications
CREATE POLICY "Users can view own notifications" ON user_notifications
  FOR SELECT USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can update own notifications" ON user_notifications
  FOR UPDATE USING (auth.uid()::uuid = user_id);

-- Create RLS policies for user_memberships
CREATE POLICY "Users can view own membership" ON user_memberships
  FOR SELECT USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can update own membership" ON user_memberships
  FOR UPDATE USING (auth.uid()::uuid = user_id);

-- Create RLS policies for user_devices
CREATE POLICY "Users can view own devices" ON user_devices
  FOR SELECT USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can update own devices" ON user_devices
  FOR UPDATE USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can insert own devices" ON user_devices
  FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);

-- Create RLS policies for user_messages
CREATE POLICY "Users can view own messages" ON user_messages
  FOR SELECT USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can update own messages" ON user_messages
  FOR UPDATE USING (auth.uid()::uuid = user_id);

-- Insert sample trading pairs
INSERT INTO trading_pairs (symbol, base_asset, quote_asset, current_price, price_change_24h, price_change_percent_24h, high_24h, low_24h, volume_24h) VALUES
('BTC/USDT', 'BTC', 'USDT', 45000.00, 500.00, 1.12, 45500.00, 44000.00, 1000000.00),
('ETH/USDT', 'ETH', 'USDT', 2800.00, 50.00, 1.82, 2850.00, 2750.00, 500000.00),
('SOL/USDT', 'SOL', 'USDT', 95.00, 5.00, 5.56, 100.00, 90.00, 200000.00),
('ADA/USDT', 'ADA', 'USDT', 0.45, 0.02, 4.65, 0.47, 0.43, 50000.00),
('DOT/USDT', 'DOT', 'USDT', 7.20, 0.30, 4.35, 7.50, 6.90, 75000.00)
ON CONFLICT (symbol) DO NOTHING;

-- Insert sample order book entries
INSERT INTO order_book_entries (symbol, side, price, quantity) VALUES
('BTC/USDT', 'buy', 44950.00, 0.5),
('BTC/USDT', 'buy', 44900.00, 1.2),
('BTC/USDT', 'sell', 45050.00, 0.8),
('BTC/USDT', 'sell', 45100.00, 1.5),
('ETH/USDT', 'buy', 2795.00, 2.0),
('ETH/USDT', 'buy', 2790.00, 3.5),
('ETH/USDT', 'sell', 2805.00, 1.8),
('ETH/USDT', 'sell', 2810.00, 2.2);

-- Insert sample trades
INSERT INTO trades (symbol, price, quantity, side) VALUES
('BTC/USDT', 45000.00, 0.1, 'buy'),
('BTC/USDT', 45010.00, 0.05, 'sell'),
('ETH/USDT', 2800.00, 1.0, 'buy'),
('ETH/USDT', 2802.00, 0.5, 'sell'),
('SOL/USDT', 95.00, 10.0, 'buy'),
('SOL/USDT', 95.50, 5.0, 'sell'); 