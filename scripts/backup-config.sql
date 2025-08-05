-- Database Backup & Monitoring Configuration
-- Run these in Supabase SQL Editor

-- 1. Enable Point-in-Time Recovery
-- This is done in Supabase Dashboard > Settings > Database

-- 2. Create monitoring functions
CREATE OR REPLACE FUNCTION get_database_stats()
RETURNS TABLE (
    metric_name TEXT,
    metric_value TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 'database_size'::TEXT, pg_size_pretty(pg_database_size(current_database()))::TEXT
    UNION ALL
    SELECT 'total_users'::TEXT, COUNT(*)::TEXT FROM auth.users
    UNION ALL
    SELECT 'active_users_7d'::TEXT, COUNT(*)::TEXT FROM auth.users WHERE last_sign_in_at > NOW() - INTERVAL '7 days'
    UNION ALL
    SELECT 'total_orders'::TEXT, COUNT(*)::TEXT FROM user_orders
    UNION ALL
    SELECT 'recent_orders_24h'::TEXT, COUNT(*)::TEXT FROM user_orders WHERE created_at > NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create backup status function
CREATE OR REPLACE FUNCTION get_backup_status()
RETURNS TABLE (
    backup_type TEXT,
    last_backup TIMESTAMP,
    status TEXT
) AS $$
BEGIN
    -- This is a placeholder - actual backup status comes from Supabase
    RETURN QUERY
    SELECT 
        'automated'::TEXT,
        NOW() - INTERVAL '1 day'::TEXT,
        'enabled'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create performance monitoring function
CREATE OR REPLACE FUNCTION get_performance_metrics()
RETURNS TABLE (
    table_name TEXT,
    table_size TEXT,
    row_count BIGINT,
    last_vacuum TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.table_name::TEXT,
        pg_size_pretty(pg_total_relation_size(t.table_name))::TEXT,
        (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = t.table_name)::BIGINT,
        NOW() - INTERVAL '1 day'::TIMESTAMP
    FROM information_schema.tables t
    WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create alert function for monitoring
CREATE OR REPLACE FUNCTION check_database_alerts()
RETURNS TABLE (
    alert_type TEXT,
    alert_message TEXT,
    severity TEXT
) AS $$
DECLARE
    user_count INTEGER;
    order_count INTEGER;
    db_size BIGINT;
BEGIN
    -- Check user count
    SELECT COUNT(*) INTO user_count FROM auth.users;
    IF user_count = 0 THEN
        RETURN QUERY SELECT 'no_users'::TEXT, 'No users found in database'::TEXT, 'warning'::TEXT;
    END IF;
    
    -- Check order count
    SELECT COUNT(*) INTO order_count FROM user_orders;
    IF order_count = 0 THEN
        RETURN QUERY SELECT 'no_orders'::TEXT, 'No orders found in database'::TEXT, 'info'::TEXT;
    END IF;
    
    -- Check database size
    SELECT pg_database_size(current_database()) INTO db_size;
    IF db_size > 1000000000 THEN -- 1GB
        RETURN QUERY SELECT 'large_database'::TEXT, 'Database size exceeds 1GB'::TEXT, 'warning'::TEXT;
    END IF;
    
    -- Return empty if no alerts
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Grant permissions
GRANT EXECUTE ON FUNCTION get_database_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_backup_status() TO authenticated;
GRANT EXECUTE ON FUNCTION get_performance_metrics() TO authenticated;
GRANT EXECUTE ON FUNCTION check_database_alerts() TO authenticated;

-- 7. Create monitoring views
CREATE OR REPLACE VIEW database_monitoring AS
SELECT 
    'health' as category,
    metric_name,
    metric_value
FROM get_database_stats()
UNION ALL
SELECT 
    'performance' as category,
    table_name as metric_name,
    table_size as metric_value
FROM get_performance_metrics()
UNION ALL
SELECT 
    'alerts' as category,
    alert_type as metric_name,
    alert_message as metric_value
FROM check_database_alerts();

-- 8. Grant view permissions
GRANT SELECT ON database_monitoring TO authenticated;

-- 9. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_orders_created_at ON user_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_user_orders_user_id ON user_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_user_portfolios_user_id ON user_portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);

-- 10. Create maintenance function
CREATE OR REPLACE FUNCTION run_maintenance()
RETURNS TEXT AS $$
BEGIN
    -- Vacuum tables
    VACUUM ANALYZE user_orders;
    VACUUM ANALYZE user_portfolios;
    VACUUM ANALYZE user_notifications;
    
    -- Update statistics
    ANALYZE;
    
    RETURN 'Maintenance completed successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant maintenance permissions
GRANT EXECUTE ON FUNCTION run_maintenance() TO service_role; 