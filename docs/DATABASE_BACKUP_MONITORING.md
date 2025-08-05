# Database Backup & Monitoring Setup

## Overview
This document outlines the database backup and monitoring setup for the CryptoExchangeFrontend project using Supabase PostgreSQL.

## 🗄️ Backup Configuration

### Automated Backups
- **Frequency**: Daily at 2:00 AM UTC
- **Retention**: 7 days
- **Point-in-Time Recovery**: Enabled
- **Storage**: Supabase managed storage

### Manual Backup Steps
1. Go to Supabase Dashboard > Settings > Database
2. Enable "Point in time recovery"
3. Set backup retention to 7 days
4. Enable "Database backups"

## 📊 Monitoring Setup

### Health Checks
- Database connection status
- Table count verification
- User count monitoring
- Active users tracking (7-day window)

### Performance Monitoring
- Database size tracking
- Table size analysis
- Query performance monitoring
- Index usage statistics

### Security Monitoring
- RLS policy verification
- User permission checks
- Authentication monitoring
- Access pattern analysis

## 🚀 Quick Start

### 1. Setup Backups
```bash
npm run setup-backups
```

### 2. Run Monitoring
```bash
npm run monitor-db
# or
npm run db:health
```

### 3. Apply SQL Configuration
Run the SQL commands in `scripts/backup-config.sql` in your Supabase SQL Editor.

## 📈 Monitoring Dashboard

### Available Metrics
- **Database Health**: Connection, table count, user count
- **Performance**: Size, query performance, index usage
- **Security**: RLS policies, user permissions
- **Alerts**: Automated alerting for issues

### Monitoring Functions
- `get_database_stats()` - Basic database statistics
- `get_backup_status()` - Backup status information
- `get_performance_metrics()` - Performance metrics
- `check_database_alerts()` - Alert checking

## 🔧 Maintenance

### Automated Maintenance
```sql
SELECT run_maintenance();
```

### Manual Maintenance Tasks
1. **Vacuum Tables**: Clean up dead tuples
2. **Update Statistics**: Refresh query planner stats
3. **Index Maintenance**: Rebuild fragmented indexes
4. **Log Analysis**: Review error logs

## 🚨 Alerting

### Critical Alerts
- Database connection failures
- Backup failures
- High disk usage (>80%)
- Performance degradation

### Warning Alerts
- Low disk space (<20% free)
- High query latency
- Unusual access patterns
- Failed authentication attempts

## 📋 Recovery Procedures

### Point-in-Time Recovery
1. Go to Supabase Dashboard > Settings > Database
2. Click "Point in time recovery"
3. Select recovery point
4. Confirm restoration

### Full Backup Restoration
1. Go to Supabase Dashboard > Settings > Database
2. Click "Backups"
3. Select backup to restore
4. Confirm restoration

## 🔒 Security Considerations

### Backup Security
- Encrypted backups
- Access control for backup files
- Regular security audits
- Compliance with data protection regulations

### Monitoring Security
- Secure access to monitoring tools
- Audit logging for all monitoring activities
- Regular review of monitoring permissions
- Encryption of monitoring data

## 📊 Performance Optimization

### Index Strategy
- Primary key indexes on all tables
- Foreign key indexes for joins
- Composite indexes for common queries
- Partial indexes for filtered queries

### Query Optimization
- Regular query analysis
- Performance tuning
- Query plan optimization
- Resource allocation monitoring

## 🛠️ Troubleshooting

### Common Issues
1. **Backup Failures**: Check disk space and permissions
2. **Monitoring Errors**: Verify service role permissions
3. **Performance Issues**: Review query plans and indexes
4. **Connection Problems**: Check network and firewall settings

### Debug Commands
```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size(current_database()));

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check slow queries
SELECT 
    query,
    mean_time,
    calls
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

## 📞 Support

### Emergency Contacts
- **Database Issues**: Check Supabase status page
- **Backup Problems**: Contact Supabase support
- **Performance Issues**: Review monitoring dashboard

### Documentation
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Backup Best Practices](https://supabase.com/docs/guides/backups)

## 🔄 Regular Tasks

### Daily
- Review monitoring dashboard
- Check for alerts
- Verify backup completion

### Weekly
- Performance analysis
- Security review
- Maintenance tasks

### Monthly
- Backup restoration testing
- Performance optimization
- Security audit
- Documentation updates 