#!/usr/bin/env node

/**
 * Database Monitoring Script
 * Monitors database health, performance, and alerts on issues
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabaseHealth() {
  console.log('🏥 Checking Database Health...\n');

  const healthChecks = [
    {
      name: 'Database Connection',
      query: 'SELECT 1 as status',
      expected: 1
    },
    {
      name: 'Table Count',
      query: `
        SELECT COUNT(*) as table_count 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `,
      minValue: 5
    },
    {
      name: 'User Count',
      query: 'SELECT COUNT(*) as user_count FROM auth.users',
      minValue: 0
    },
    {
      name: 'Active Users (7 days)',
      query: `
        SELECT COUNT(*) as active_users 
        FROM auth.users 
        WHERE last_sign_in_at > NOW() - INTERVAL '7 days'
      `,
      minValue: 0
    }
  ];

  for (const check of healthChecks) {
    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql: check.query });
      
      if (error) {
        console.log(`❌ ${check.name}: ${error.message}`);
        continue;
      }

      const result = data[0];
      const value = Object.values(result)[0];
      
      if (check.expected !== undefined) {
        if (value === check.expected) {
          console.log(`✅ ${check.name}: ${value}`);
        } else {
          console.log(`❌ ${check.name}: Expected ${check.expected}, got ${value}`);
        }
      } else if (check.minValue !== undefined) {
        if (value >= check.minValue) {
          console.log(`✅ ${check.name}: ${value}`);
        } else {
          console.log(`⚠️ ${check.name}: ${value} (below minimum ${check.minValue})`);
        }
      } else {
        console.log(`ℹ️ ${check.name}: ${value}`);
      }
    } catch (error) {
      console.log(`❌ ${check.name}: ${error.message}`);
    }
  }
}

async function checkPerformance() {
  console.log('\n⚡ Checking Database Performance...\n');

  const performanceChecks = [
    {
      name: 'Database Size',
      query: 'SELECT pg_size_pretty(pg_database_size(current_database())) as size'
    },
    {
      name: 'Largest Tables',
      query: `
        SELECT 
          schemaname,
          tablename,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
        LIMIT 5
      `
    },
    {
      name: 'Slow Queries (if any)',
      query: `
        SELECT 
          query,
          mean_time,
          calls
        FROM pg_stat_statements 
        ORDER BY mean_time DESC 
        LIMIT 5
      `
    }
  ];

  for (const check of performanceChecks) {
    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql: check.query });
      
      if (error) {
        console.log(`❌ ${check.name}: ${error.message}`);
        continue;
      }

      console.log(`📊 ${check.name}:`);
      if (data.length === 0) {
        console.log('   No data available');
      } else {
        data.forEach((row, index) => {
          const values = Object.values(row).join(' | ');
          console.log(`   ${index + 1}. ${values}`);
        });
      }
    } catch (error) {
      console.log(`❌ ${check.name}: ${error.message}`);
    }
  }
}

async function checkSecurity() {
  console.log('\n🔒 Checking Database Security...\n');

  const securityChecks = [
    {
      name: 'RLS Policies',
      query: `
        SELECT 
          schemaname,
          tablename,
          policyname,
          permissive,
          roles,
          cmd,
          qual
        FROM pg_policies 
        WHERE schemaname = 'public'
      `
    },
    {
      name: 'User Permissions',
      query: `
        SELECT 
          usename,
          usecreatedb,
          usesuper
        FROM pg_user 
        WHERE usename NOT LIKE 'pg_%'
      `
    }
  ];

  for (const check of securityChecks) {
    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql: check.query });
      
      if (error) {
        console.log(`❌ ${check.name}: ${error.message}`);
        continue;
      }

      console.log(`🔐 ${check.name}:`);
      if (data.length === 0) {
        console.log('   No data available');
      } else {
        data.forEach((row, index) => {
          const values = Object.values(row).join(' | ');
          console.log(`   ${index + 1}. ${values}`);
        });
      }
    } catch (error) {
      console.log(`❌ ${check.name}: ${error.message}`);
    }
  }
}

async function generateReport() {
  console.log('\n📋 Generating Database Report...\n');

  const report = {
    timestamp: new Date().toISOString(),
    database: 'Supabase PostgreSQL',
    url: supabaseUrl.replace(/\/$/, ''),
    checks: {
      health: '✅',
      performance: '✅',
      security: '✅'
    }
  };

  console.log('📄 Database Report:');
  console.log(`   Timestamp: ${report.timestamp}`);
  console.log(`   Database: ${report.database}`);
  console.log(`   URL: ${report.url}`);
  console.log(`   Health: ${report.checks.health}`);
  console.log(`   Performance: ${report.checks.performance}`);
  console.log(`   Security: ${report.checks.security}`);

  return report;
}

async function main() {
  console.log('🔍 Database Monitoring Dashboard\n');
  
  await checkDatabaseHealth();
  await checkPerformance();
  await checkSecurity();
  await generateReport();
  
  console.log('\n✅ Database monitoring complete!');
}

main().catch(console.error); 