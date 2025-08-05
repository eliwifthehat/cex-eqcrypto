-- Enable Row Level Security on all user-related tables
-- Run this in your Supabase SQL Editor

-- Enable RLS on all user tables
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

-- Create RLS policies for user_portfolios
CREATE POLICY "Users can view own portfolio" ON user_portfolios
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own portfolio" ON user_portfolios
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own portfolio" ON user_portfolios
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Create RLS policies for user_orders
CREATE POLICY "Users can view own orders" ON user_orders
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own orders" ON user_orders
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own orders" ON user_orders
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Create RLS policies for user_trades
CREATE POLICY "Users can view own trades" ON user_trades
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own trades" ON user_trades
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own trades" ON user_trades
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Create RLS policies for user_api_keys
CREATE POLICY "Users can view own API keys" ON user_api_keys
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own API keys" ON user_api_keys
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own API keys" ON user_api_keys
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Create RLS policies for user_notifications
CREATE POLICY "Users can view own notifications" ON user_notifications
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own notifications" ON user_notifications
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own notifications" ON user_notifications
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Create RLS policies for user_referrals
CREATE POLICY "Users can view own referrals" ON user_referrals
    FOR SELECT USING (auth.uid()::text = referrer_id OR auth.uid()::text = referred_id);

CREATE POLICY "Users can update own referrals" ON user_referrals
    FOR UPDATE USING (auth.uid()::text = referrer_id OR auth.uid()::text = referred_id);

CREATE POLICY "Users can insert own referrals" ON user_referrals
    FOR INSERT WITH CHECK (auth.uid()::text = referrer_id OR auth.uid()::text = referred_id);

-- Create RLS policies for user_security_logs
CREATE POLICY "Users can view own security logs" ON user_security_logs
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own security logs" ON user_security_logs
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Create RLS policies for user_memberships
CREATE POLICY "Users can view own memberships" ON user_memberships
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own memberships" ON user_memberships
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own memberships" ON user_memberships
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Create RLS policies for user_devices
CREATE POLICY "Users can view own devices" ON user_devices
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own devices" ON user_devices
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own devices" ON user_devices
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Create RLS policies for user_messages
CREATE POLICY "Users can view own messages" ON user_messages
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own messages" ON user_messages
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own messages" ON user_messages
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Verify RLS is enabled on all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'user_%'
ORDER BY tablename; 