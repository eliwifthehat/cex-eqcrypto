-- Comprehensive SQL Verification Script
-- This will check if all necessary SQL has been run

-- 1. Check if UUID extension is enabled
SELECT 
    'UUID Extension' as component,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') 
        THEN '✅ Enabled' 
        ELSE '❌ Missing - Run: CREATE EXTENSION IF NOT EXISTS "uuid-ossp";' 
    END as status;

-- 2. Check all tables exist
SELECT 
    'Tables' as component,
    CASE 
        WHEN COUNT(*) = 15 THEN '✅ All 15 tables exist'
        ELSE '❌ Missing tables - Found ' || COUNT(*) || ' out of 15'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

-- 3. List all existing tables
SELECT 
    'Table: ' || table_name as table_info,
    '✅ Exists' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 4. Check if RLS is enabled on all user tables
SELECT 
    'RLS on ' || tablename as rls_check,
    CASE 
        WHEN rowsecurity THEN '✅ Enabled'
        ELSE '❌ Disabled - Run: ALTER TABLE ' || tablename || ' ENABLE ROW LEVEL SECURITY;'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'users', 'user_profiles', 'user_portfolios', 'user_orders', 
    'user_trades', 'user_api_keys', 'user_notifications', 
    'user_referrals', 'user_security_logs', 'user_memberships', 
    'user_devices', 'user_messages'
)
ORDER BY tablename;

-- 5. Check if indexes exist
SELECT 
    'Indexes' as component,
    CASE 
        WHEN COUNT(*) >= 15 THEN '✅ All indexes exist (' || COUNT(*) || ' found)'
        ELSE '❌ Missing indexes - Found ' || COUNT(*) || ' out of 15+'
    END as status
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%';

-- 6. List all indexes
SELECT 
    'Index: ' || indexname as index_info,
    '✅ Exists' as status
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%'
ORDER BY indexname;

-- 7. Check if sample data exists
SELECT 
    'Sample Data' as component,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Sample trading pairs exist (' || COUNT(*) || ' found)'
        ELSE '❌ No sample data - Run sample data inserts'
    END as status
FROM trading_pairs;

-- 8. Check RLS policies exist
SELECT 
    'RLS Policies' as component,
    CASE 
        WHEN COUNT(*) >= 20 THEN '✅ All RLS policies exist (' || COUNT(*) || ' found)'
        ELSE '❌ Missing RLS policies - Found ' || COUNT(*) || ' out of 20+'
    END as status
FROM pg_policies 
WHERE schemaname = 'public';

-- 9. List RLS policies
SELECT 
    'Policy: ' || policyname || ' on ' || tablename as policy_info,
    '✅ Exists' as status
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 10. Check table structures (verify UUID columns)
SELECT 
    'UUID Columns' as component,
    CASE 
        WHEN COUNT(*) >= 2 THEN '✅ UUID columns properly configured (' || COUNT(*) || ' found)'
        ELSE '❌ Missing UUID columns - Check table structures'
    END as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND data_type = 'uuid' 
AND column_name IN ('id', 'user_id');

-- 11. Check foreign key relationships
SELECT 
    'Foreign Keys' as component,
    CASE 
        WHEN COUNT(*) >= 10 THEN '✅ Foreign keys properly configured (' || COUNT(*) || ' found)'
        ELSE '❌ Missing foreign keys - Check table relationships'
    END as status
FROM information_schema.table_constraints 
WHERE table_schema = 'public' 
AND constraint_type = 'FOREIGN KEY';

-- 12. Summary of what needs to be done
SELECT 
    'SUMMARY' as component,
    CASE 
        WHEN (SELECT COUNT(*) FROM pg_extension WHERE extname = 'uuid-ossp') = 0 
        THEN '❌ Run: CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'
        WHEN (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') < 15
        THEN '❌ Missing tables - Run ADD_MISSING_TABLES.sql'
        WHEN (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = false AND tablename IN ('users', 'user_profiles', 'user_portfolios', 'user_orders', 'user_trades', 'user_api_keys', 'user_notifications', 'user_referrals', 'user_security_logs', 'user_memberships', 'user_devices', 'user_messages')) > 0
        THEN '❌ RLS not enabled on all tables'
        WHEN (SELECT COUNT(*) FROM trading_pairs) = 0
        THEN '❌ No sample data - Run sample data inserts'
        WHEN (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') < 20
        THEN '❌ Missing RLS policies'
        ELSE '✅ All SQL components are properly configured!'
    END as status; 