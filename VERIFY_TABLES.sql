-- Verify all tables were created successfully
-- This will show you exactly what tables exist and their structure

-- Show all tables
SELECT 
    table_name,
    'Table exists' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Show table counts (to verify they have the right structure)
SELECT 
    'users' as table_name,
    COUNT(*) as row_count
FROM users
UNION ALL
SELECT 
    'user_profiles' as table_name,
    COUNT(*) as row_count
FROM user_profiles
UNION ALL
SELECT 
    'user_portfolios' as table_name,
    COUNT(*) as row_count
FROM user_portfolios
UNION ALL
SELECT 
    'user_orders' as table_name,
    COUNT(*) as row_count
FROM user_orders
UNION ALL
SELECT 
    'user_trades' as table_name,
    COUNT(*) as row_count
FROM user_trades
UNION ALL
SELECT 
    'trading_pairs' as table_name,
    COUNT(*) as row_count
FROM trading_pairs
UNION ALL
SELECT 
    'order_book_entries' as table_name,
    COUNT(*) as row_count
FROM order_book_entries
UNION ALL
SELECT 
    'trades' as table_name,
    COUNT(*) as row_count
FROM trades
UNION ALL
SELECT 
    'user_api_keys' as table_name,
    COUNT(*) as row_count
FROM user_api_keys
UNION ALL
SELECT 
    'user_notifications' as table_name,
    COUNT(*) as row_count
FROM user_notifications
UNION ALL
SELECT 
    'user_referrals' as table_name,
    COUNT(*) as row_count
FROM user_referrals
UNION ALL
SELECT 
    'user_security_logs' as table_name,
    COUNT(*) as row_count
FROM user_security_logs
UNION ALL
SELECT 
    'user_memberships' as table_name,
    COUNT(*) as row_count
FROM user_memberships
UNION ALL
SELECT 
    'user_devices' as table_name,
    COUNT(*) as row_count
FROM user_devices
UNION ALL
SELECT 
    'user_messages' as table_name,
    COUNT(*) as row_count
FROM user_messages; 