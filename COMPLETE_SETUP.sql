-- COMPLETE SETUP SCRIPT
-- This will add all missing components

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Add missing table (likely user_notifications)
CREATE TABLE IF NOT EXISTS user_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS on all user tables
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

-- 4. Create all necessary indexes
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

-- 5. Create RLS policies for all user tables
-- Users table policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- User portfolios policies
CREATE POLICY "Users can view own portfolio" ON user_portfolios
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own portfolio" ON user_portfolios
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolio" ON user_portfolios
    FOR UPDATE USING (auth.uid() = user_id);

-- User orders policies
CREATE POLICY "Users can view own orders" ON user_orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON user_orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders" ON user_orders
    FOR UPDATE USING (auth.uid() = user_id);

-- User trades policies
CREATE POLICY "Users can view own trades" ON user_trades
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trades" ON user_trades
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User API keys policies
CREATE POLICY "Users can view own API keys" ON user_api_keys
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API keys" ON user_api_keys
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys" ON user_api_keys
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys" ON user_api_keys
    FOR DELETE USING (auth.uid() = user_id);

-- User notifications policies
CREATE POLICY "Users can view own notifications" ON user_notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications" ON user_notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON user_notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- User referrals policies
CREATE POLICY "Users can view own referrals" ON user_referrals
    FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Users can insert own referrals" ON user_referrals
    FOR INSERT WITH CHECK (auth.uid() = referrer_id);

-- User security logs policies
CREATE POLICY "Users can view own security logs" ON user_security_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own security logs" ON user_security_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User memberships policies
CREATE POLICY "Users can view own memberships" ON user_memberships
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own memberships" ON user_memberships
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own memberships" ON user_memberships
    FOR UPDATE USING (auth.uid() = user_id);

-- User devices policies
CREATE POLICY "Users can view own devices" ON user_devices
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own devices" ON user_devices
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own devices" ON user_devices
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own devices" ON user_devices
    FOR DELETE USING (auth.uid() = user_id);

-- User messages policies
CREATE POLICY "Users can view own messages" ON user_messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can insert own messages" ON user_messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update own messages" ON user_messages
    FOR UPDATE USING (auth.uid() = sender_id);

-- 6. Insert sample trading pairs
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

-- 7. Insert sample order book data
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
LIMIT 50;

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
LIMIT 50;

-- 8. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_portfolios_updated_at BEFORE UPDATE ON user_portfolios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_orders_updated_at BEFORE UPDATE ON user_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_trades_updated_at BEFORE UPDATE ON user_trades FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_api_keys_updated_at BEFORE UPDATE ON user_api_keys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_notifications_updated_at BEFORE UPDATE ON user_notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_referrals_updated_at BEFORE UPDATE ON user_referrals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_security_logs_updated_at BEFORE UPDATE ON user_security_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_memberships_updated_at BEFORE UPDATE ON user_memberships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_devices_updated_at BEFORE UPDATE ON user_devices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_messages_updated_at BEFORE UPDATE ON user_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trading_pairs_updated_at BEFORE UPDATE ON trading_pairs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_order_book_updated_at BEFORE UPDATE ON order_book FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated; 