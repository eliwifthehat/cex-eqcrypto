-- Add missing users and user_profiles tables
-- Run this in your Supabase SQL Editor

-- 1. Create users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    uid TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    avatar TEXT,
    verified BOOLEAN DEFAULT FALSE,
    kyc_status TEXT DEFAULT 'pending',
    security_level INTEGER DEFAULT 1,
    withdrawal_limit DECIMAL(10,2) DEFAULT '1000.00',
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    api_key_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    slippage_tolerance DECIMAL(5,2) DEFAULT '0.50'
);

-- 3. Enable RLS on both tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for users table
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "Users can insert own data" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = id);

-- 5. Create RLS policies for user_profiles table
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid()::text = id);

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_user_profiles_uid ON user_profiles(uid);
CREATE INDEX IF NOT EXISTS idx_user_profiles_verified ON user_profiles(verified);

-- 7. Add sample user data (optional - for testing)
INSERT INTO users (id, email, phone) VALUES 
    ('sample-user-123', 'demo@cryptoexchange.com', '+1234567890')
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_profiles (id, uid, first_name, last_name, verified, kyc_status, security_level, withdrawal_limit, two_factor_enabled, phone_verified, email_verified, api_key_enabled, slippage_tolerance) VALUES 
    ('sample-user-123', 'EQ123456789', 'Demo', 'User', true, 'approved', 3, '5000.00', true, true, true, true, '0.50')
ON CONFLICT (id) DO NOTHING;

-- 8. Verify tables were created
SELECT 'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'user_profiles' as table_name, COUNT(*) as row_count FROM user_profiles; 