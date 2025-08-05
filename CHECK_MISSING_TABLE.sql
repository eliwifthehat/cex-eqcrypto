-- Check which table is missing
-- Compare expected vs actual tables

-- Expected tables from FIXED_SUPABASE_SCHEMA.sql
WITH expected_tables AS (
    SELECT unnest(ARRAY[
        'users',
        'user_profiles', 
        'user_portfolios',
        'user_orders',
        'user_trades',
        'trading_pairs',
        'order_book_entries',  -- This might be the issue!
        'trades',
        'user_api_keys',
        'user_notifications',
        'user_referrals',
        'user_security_logs',
        'user_memberships',
        'user_devices',
        'user_messages'
    ]) as table_name
),
actual_tables AS (
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
)
SELECT 
    et.table_name as expected_table,
    CASE 
        WHEN at.table_name IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM expected_tables et
LEFT JOIN actual_tables at ON et.table_name = at.table_name
ORDER BY et.table_name;

-- Also check if we have order_book instead of order_book_entries
SELECT 
    'order_book' as table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'order_book') 
        THEN '✅ EXISTS (but expected order_book_entries)'
        ELSE '❌ MISSING'
    END as status;

-- Show all actual tables for comparison
SELECT 
    'ACTUAL TABLES:' as info,
    string_agg(table_name, ', ' ORDER BY table_name) as tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'; 