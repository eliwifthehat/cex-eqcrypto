-- SAFE SETUP SCRIPT
-- This will only add missing components without failing on existing ones

-- 1. Enable UUID extension (safe)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Check and add missing table safely
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_notifications') THEN
        CREATE TABLE user_notifications (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            type VARCHAR(50) NOT NULL,
            title VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created user_notifications table';
    ELSE
        RAISE NOTICE 'user_notifications table already exists';
    END IF;
END $$;

-- 3. Enable RLS on tables that don't have it enabled
DO $$
DECLARE
    table_record RECORD;
BEGIN
    FOR table_record IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN (
            'users', 'user_profiles', 'user_portfolios', 'user_orders', 
            'user_trades', 'user_api_keys', 'user_notifications', 
            'user_referrals', 'user_security_logs', 'user_memberships', 
            'user_devices', 'user_messages'
        )
        AND NOT rowsecurity
    LOOP
        EXECUTE 'ALTER TABLE ' || table_record.tablename || ' ENABLE ROW LEVEL SECURITY';
        RAISE NOTICE 'Enabled RLS on %', table_record.tablename;
    END LOOP;
END $$;

-- 4. Create missing indexes safely
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_portfolios_user_id ON user_portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_user_portfolios_token_id ON user_portfolios(token_id);
CREATE INDEX IF NOT EXISTS idx_user_orders_user_id ON user_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_user_orders_pair_id ON user_orders(pair_id);
CREATE INDEX IF NOT EXISTS idx_user_orders_status ON user_orders(status);
CREATE INDEX IF NOT EXISTS idx_user_orders_created_at ON user_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_user_trades_user_id ON user_trades(user_id);
CREATE INDEX IF NOT EXISTS idx_user_trades_pair_id ON user_trades(pair_id);
CREATE INDEX IF NOT EXISTS idx_user_trades_created_at ON user_trades(created_at);
CREATE INDEX IF NOT EXISTS idx_user_api_keys_user_id ON user_api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON user_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_trading_pairs_base_token ON trading_pairs(base_token);
CREATE INDEX IF NOT EXISTS idx_trading_pairs_quote_token ON trading_pairs(quote_token);
CREATE INDEX IF NOT EXISTS idx_order_book_pair_id ON order_book(pair_id);
CREATE INDEX IF NOT EXISTS idx_order_book_side ON order_book(side);
CREATE INDEX IF NOT EXISTS idx_order_book_price ON order_book(price);

-- 5. Create RLS policies safely (only if they don't exist)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Users table policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can view own profile') THEN
        CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can update own profile') THEN
        CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
    END IF;

    -- User profiles policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can view own profile') THEN
        CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can insert own profile') THEN
        CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can update own profile') THEN
        CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    -- User portfolios policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_portfolios' AND policyname = 'Users can view own portfolio') THEN
        CREATE POLICY "Users can view own portfolio" ON user_portfolios FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_portfolios' AND policyname = 'Users can insert own portfolio') THEN
        CREATE POLICY "Users can insert own portfolio" ON user_portfolios FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_portfolios' AND policyname = 'Users can update own portfolio') THEN
        CREATE POLICY "Users can update own portfolio" ON user_portfolios FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    -- User orders policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_orders' AND policyname = 'Users can view own orders') THEN
        CREATE POLICY "Users can view own orders" ON user_orders FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_orders' AND policyname = 'Users can insert own orders') THEN
        CREATE POLICY "Users can insert own orders" ON user_orders FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_orders' AND policyname = 'Users can update own orders') THEN
        CREATE POLICY "Users can update own orders" ON user_orders FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    -- User trades policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_trades' AND policyname = 'Users can view own trades') THEN
        CREATE POLICY "Users can view own trades" ON user_trades FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_trades' AND policyname = 'Users can insert own trades') THEN
        CREATE POLICY "Users can insert own trades" ON user_trades FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    -- User API keys policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_api_keys' AND policyname = 'Users can view own API keys') THEN
        CREATE POLICY "Users can view own API keys" ON user_api_keys FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_api_keys' AND policyname = 'Users can insert own API keys') THEN
        CREATE POLICY "Users can insert own API keys" ON user_api_keys FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_api_keys' AND policyname = 'Users can update own API keys') THEN
        CREATE POLICY "Users can update own API keys" ON user_api_keys FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_api_keys' AND policyname = 'Users can delete own API keys') THEN
        CREATE POLICY "Users can delete own API keys" ON user_api_keys FOR DELETE USING (auth.uid() = user_id);
    END IF;

    -- User notifications policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_notifications' AND policyname = 'Users can view own notifications') THEN
        CREATE POLICY "Users can view own notifications" ON user_notifications FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_notifications' AND policyname = 'Users can insert own notifications') THEN
        CREATE POLICY "Users can insert own notifications" ON user_notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_notifications' AND policyname = 'Users can update own notifications') THEN
        CREATE POLICY "Users can update own notifications" ON user_notifications FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    -- User referrals policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_referrals' AND policyname = 'Users can view own referrals') THEN
        CREATE POLICY "Users can view own referrals" ON user_referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_referrals' AND policyname = 'Users can insert own referrals') THEN
        CREATE POLICY "Users can insert own referrals" ON user_referrals FOR INSERT WITH CHECK (auth.uid() = referrer_id);
    END IF;

    -- User security logs policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_security_logs' AND policyname = 'Users can view own security logs') THEN
        CREATE POLICY "Users can view own security logs" ON user_security_logs FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_security_logs' AND policyname = 'Users can insert own security logs') THEN
        CREATE POLICY "Users can insert own security logs" ON user_security_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    -- User memberships policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_memberships' AND policyname = 'Users can view own memberships') THEN
        CREATE POLICY "Users can view own memberships" ON user_memberships FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_memberships' AND policyname = 'Users can insert own memberships') THEN
        CREATE POLICY "Users can insert own memberships" ON user_memberships FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_memberships' AND policyname = 'Users can update own memberships') THEN
        CREATE POLICY "Users can update own memberships" ON user_memberships FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    -- User devices policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_devices' AND policyname = 'Users can view own devices') THEN
        CREATE POLICY "Users can view own devices" ON user_devices FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_devices' AND policyname = 'Users can insert own devices') THEN
        CREATE POLICY "Users can insert own devices" ON user_devices FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_devices' AND policyname = 'Users can update own devices') THEN
        CREATE POLICY "Users can update own devices" ON user_devices FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_devices' AND policyname = 'Users can delete own devices') THEN
        CREATE POLICY "Users can delete own devices" ON user_devices FOR DELETE USING (auth.uid() = user_id);
    END IF;

    -- User messages policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_messages' AND policyname = 'Users can view own messages') THEN
        CREATE POLICY "Users can view own messages" ON user_messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_messages' AND policyname = 'Users can insert own messages') THEN
        CREATE POLICY "Users can insert own messages" ON user_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_messages' AND policyname = 'Users can update own messages') THEN
        CREATE POLICY "Users can update own messages" ON user_messages FOR UPDATE USING (auth.uid() = sender_id);
    END IF;
END $$;

-- 6. Insert sample trading pairs safely
INSERT INTO trading_pairs (base_token, quote_token, base_token_name, quote_token_name, min_order_size, max_order_size, price_precision, quantity_precision, is_active, created_at, updated_at)
VALUES 
    ('SOL', 'USDC', 'Solana', 'USD Coin', 0.1, 1000000, 4, 6, true, NOW(), NOW()),
    ('BTC', 'USDC', 'Bitcoin', 'USD Coin', 0.001, 100, 2, 8, true, NOW(), NOW()),
    ('ETH', 'USDC', 'Ethereum', 'USD Coin', 0.01, 10000, 2, 6, true, NOW(), NOW()),
    ('MATIC', 'USDC', 'Polygon', 'USD Coin', 1, 10000000, 6, 2, true, NOW(), NOW()),
    ('ADA', 'USDC', 'Cardano', 'USD Coin', 10, 10000000, 6, 2, true, NOW(), NOW()),
    ('DOT', 'USDC', 'Polkadot', 'USD Coin', 0.1, 100000, 4, 4, true, NOW(), NOW()),
    ('LINK', 'USDC', 'Chainlink', 'USD Coin', 0.1, 1000000, 4, 4, true, NOW(), NOW()),
    ('UNI', 'USDC', 'Uniswap', 'USD Coin', 0.1, 1000000, 4, 4, true, NOW(), NOW()),
    ('AVAX', 'USDC', 'Avalanche', 'USD Coin', 0.1, 100000, 4, 4, true, NOW(), NOW()),
    ('ATOM', 'USDC', 'Cosmos', 'USD Coin', 0.1, 100000, 4, 4, true, NOW(), NOW())
ON CONFLICT (base_token, quote_token) DO NOTHING;

-- 7. Insert sample order book data safely
INSERT INTO order_book (pair_id, side, price, quantity, user_id, order_type, created_at, updated_at)
SELECT 
    tp.id,
    'buy',
    CASE 
        WHEN tp.base_token = 'SOL' THEN 100.00 + (random() * 20)
        WHEN tp.base_token = 'BTC' THEN 45000.00 + (random() * 5000)
        WHEN tp.base_token = 'ETH' THEN 3000.00 + (random() * 300)
        ELSE 1.00 + (random() * 0.5)
    END,
    CASE 
        WHEN tp.base_token = 'SOL' THEN 10 + (random() * 100)
        WHEN tp.base_token = 'BTC' THEN 0.1 + (random() * 2)
        WHEN tp.base_token = 'ETH' THEN 1 + (random() * 10)
        ELSE 100 + (random() * 1000)
    END,
    NULL,
    'limit',
    NOW(),
    NOW()
FROM trading_pairs tp
WHERE tp.is_active = true
AND NOT EXISTS (
    SELECT 1 FROM order_book ob 
    WHERE ob.pair_id = tp.id 
    AND ob.side = 'buy' 
    LIMIT 1
)
LIMIT 25;

INSERT INTO order_book (pair_id, side, price, quantity, user_id, order_type, created_at, updated_at)
SELECT 
    tp.id,
    'sell',
    CASE 
        WHEN tp.base_token = 'SOL' THEN 100.00 + (random() * 20)
        WHEN tp.base_token = 'BTC' THEN 45000.00 + (random() * 5000)
        WHEN tp.base_token = 'ETH' THEN 3000.00 + (random() * 300)
        ELSE 1.00 + (random() * 0.5)
    END,
    CASE 
        WHEN tp.base_token = 'SOL' THEN 10 + (random() * 100)
        WHEN tp.base_token = 'BTC' THEN 0.1 + (random() * 2)
        WHEN tp.base_token = 'ETH' THEN 1 + (random() * 10)
        ELSE 100 + (random() * 1000)
    END,
    NULL,
    'limit',
    NOW(),
    NOW()
FROM trading_pairs tp
WHERE tp.is_active = true
AND NOT EXISTS (
    SELECT 1 FROM order_book ob 
    WHERE ob.pair_id = tp.id 
    AND ob.side = 'sell' 
    LIMIT 1
)
LIMIT 25;

-- 8. Create function to update updated_at timestamp safely
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Create triggers for updated_at safely
DO $$
DECLARE
    table_record RECORD;
BEGIN
    FOR table_record IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN (
            'users', 'user_profiles', 'user_portfolios', 'user_orders', 
            'user_trades', 'user_api_keys', 'user_notifications', 
            'user_referrals', 'user_security_logs', 'user_memberships', 
            'user_devices', 'user_messages', 'trading_pairs', 'order_book'
        )
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_trigger 
            WHERE tgname = 'update_' || table_record.tablename || '_updated_at'
        ) THEN
            EXECUTE 'CREATE TRIGGER update_' || table_record.tablename || '_updated_at BEFORE UPDATE ON ' || table_record.tablename || ' FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()';
            RAISE NOTICE 'Created trigger for %', table_record.tablename;
        END IF;
    END LOOP;
END $$;

-- 10. Grant necessary permissions safely
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- 11. Summary of what was done
SELECT 'SAFE SETUP COMPLETED' as status, 'All missing components have been added safely' as message; 