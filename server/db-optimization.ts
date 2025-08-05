/**
 * Database Query Optimization
 * Provides connection pooling, query optimization, and performance monitoring
 */

import postgres from "postgres";
import { logPerformance, logError, logDatabase } from "./logger";
import crypto from "crypto";

// Database optimization configuration
export interface DatabaseConfig {
  // Connection pooling
  maxConnections: number;
  idleTimeout: number;
  connectionTimeout: number;
  maxLifetime: number;
  
  // Query optimization
  statementTimeout: number;
  queryTimeout: number;
  slowQueryThreshold: number;
  
  // Performance monitoring
  enableQueryLogging: boolean;
  enableSlowQueryLogging: boolean;
  enableExplainAnalyze: boolean;
  
  // Prepared statements
  enablePreparedStatements: boolean;
  maxPreparedStatements: number;
  
  // Connection settings
  ssl: boolean;
  keepAlive: boolean;
  keepAliveInitialDelay: number;
}

// Production database configuration
export const productionDbConfig: DatabaseConfig = {
  // Connection pooling
  maxConnections: 20,
  idleTimeout: 30000, // 30 seconds
  connectionTimeout: 10000, // 10 seconds
  maxLifetime: 3600000, // 1 hour
  
  // Query optimization
  statementTimeout: 30000, // 30 seconds
  queryTimeout: 60000, // 60 seconds
  slowQueryThreshold: 1000, // 1 second
  
  // Performance monitoring
  enableQueryLogging: true,
  enableSlowQueryLogging: true,
  enableExplainAnalyze: false, // Only enable for debugging
  
  // Prepared statements
  enablePreparedStatements: true,
  maxPreparedStatements: 100,
  
  // Connection settings
  ssl: true,
  keepAlive: true,
  keepAliveInitialDelay: 10000,
};

// Development database configuration
export const developmentDbConfig: DatabaseConfig = {
  // Connection pooling
  maxConnections: 10,
  idleTimeout: 60000, // 1 minute
  connectionTimeout: 15000, // 15 seconds
  maxLifetime: 7200000, // 2 hours
  
  // Query optimization
  statementTimeout: 60000, // 60 seconds
  queryTimeout: 120000, // 2 minutes
  slowQueryThreshold: 5000, // 5 seconds
  
  // Performance monitoring
  enableQueryLogging: true,
  enableSlowQueryLogging: true,
  enableExplainAnalyze: true, // Enable for development debugging
  
  // Prepared statements
  enablePreparedStatements: true,
  maxPreparedStatements: 50,
  
  // Connection settings
  ssl: false,
  keepAlive: true,
  keepAliveInitialDelay: 5000,
};

// Get database configuration based on environment
export const getDatabaseConfig = (): DatabaseConfig => {
  return process.env.NODE_ENV === 'production' ? productionDbConfig : developmentDbConfig;
};

// Query performance metrics
export interface QueryMetrics {
  query: string;
  params: any[];
  duration: number;
  timestamp: Date;
  slow: boolean;
  explainPlan?: any;
}

// Query cache for prepared statements
const queryCache = new Map<string, any>();

// Slow query tracking
const slowQueries: QueryMetrics[] = [];
const MAX_SLOW_QUERIES = 100;

// Database connection with optimization
export const createOptimizedConnection = (connectionString: string) => {
  const config = getDatabaseConfig();
  
  // URL encode the connection string to handle special characters
  const encodedConnectionString = connectionString
    .replace(/!/g, '%21')
    .replace(/#/g, '%23')
    .replace(/&/g, '%26')
    .replace(/%/g, '%25');

  const sql = postgres(encodedConnectionString, {
    // Connection pooling
    max: config.maxConnections,
    idle_timeout: config.idleTimeout,
    connect_timeout: config.connectionTimeout,
    max_lifetime: config.maxLifetime,
    
    // Query optimization
    statement_timeout: config.statementTimeout,
    query_timeout: config.queryTimeout,
    
    // Prepared statements
    prepare: config.enablePreparedStatements,
    max_prepared_statements: config.maxPreparedStatements,
    
    // Connection settings
    ssl: config.ssl,
    keep_alive: config.keepAlive,
    keep_alive_initial_delay: config.keepAliveInitialDelay,
    
    // Performance monitoring
    onnotice: (notice) => {
      if (config.enableQueryLogging) {
        logDatabase('database_notice', { notice: notice.message });
      }
    },
    
    // Connection events
    onparameter: (parameterStatus) => {
      logDatabase('database_parameter', { parameter: parameterStatus });
    },
  });

  return sql;
};

// Query optimization wrapper
export class QueryOptimizer {
  private sql: postgres.Sql;
  private config: DatabaseConfig;
  private preparedStatements: Map<string, any> = new Map();

  constructor(sql: postgres.Sql) {
    this.sql = sql;
    this.config = getDatabaseConfig();
  }

  // Execute query with optimization
  async execute<T = any>(
    query: string,
    params: any[] = [],
    options: {
      explain?: boolean;
      timeout?: number;
      cache?: boolean;
      name?: string;
    } = {}
  ): Promise<T[]> {
    const startTime = Date.now();
    const queryName = options.name || this.generateQueryName(query);
    
    try {
      // Check query cache for prepared statements
      if (options.cache && this.preparedStatements.has(queryName)) {
        const prepared = this.preparedStatements.get(queryName);
        const result = await prepared(params);
        this.logQuery(query, params, Date.now() - startTime, false);
        return result;
      }

      // Execute query with timeout
      const timeout = options.timeout || this.config.queryTimeout;
      const result = await Promise.race([
        this.sql.unsafe(query, params),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), timeout)
        )
      ]) as T[];

      const duration = Date.now() - startTime;
      this.logQuery(query, params, duration, duration > this.config.slowQueryThreshold);

      // Cache prepared statement if enabled
      if (options.cache && this.config.enablePreparedStatements) {
        const prepared = this.sql.unsafe(query);
        this.preparedStatements.set(queryName, prepared);
      }

      // Explain analyze if requested
      if (options.explain && this.config.enableExplainAnalyze) {
        await this.explainQuery(query, params);
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logQueryError(query, params, duration, error as Error);
      throw error;
    }
  }

  // Execute transaction with optimization
  async transaction<T>(
    callback: (sql: postgres.Sql) => Promise<T>,
    options: {
      isolation?: 'read_committed' | 'repeatable_read' | 'serializable';
      timeout?: number;
    } = {}
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      const result = await this.sql.begin(async (sql) => {
        // Set transaction isolation level
        if (options.isolation) {
          await sql`SET TRANSACTION ISOLATION LEVEL ${sql.unsafe(options.isolation)}`;
        }
        
        return await callback(sql);
      });

      const duration = Date.now() - startTime;
      this.logTransaction(duration, options.isolation);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logTransactionError(duration, error as Error);
      throw error;
    }
  }

  // Batch operations for better performance
  async batch<T>(
    queries: Array<{ query: string; params: any[] }>,
    options: {
      batchSize?: number;
      parallel?: boolean;
    } = {}
  ): Promise<T[][]> {
    const batchSize = options.batchSize || 100;
    const results: T[][] = [];

    if (options.parallel) {
      // Execute queries in parallel batches
      for (let i = 0; i < queries.length; i += batchSize) {
        const batch = queries.slice(i, i + batchSize);
        const batchPromises = batch.map(({ query, params }) => 
          this.execute<T>(query, params)
        );
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      }
    } else {
      // Execute queries sequentially in batches
      for (let i = 0; i < queries.length; i += batchSize) {
        const batch = queries.slice(i, i + batchSize);
        for (const { query, params } of batch) {
          const result = await this.execute<T>(query, params);
          results.push(result);
        }
      }
    }

    return results;
  }

  // Explain query plan
  async explainQuery(query: string, params: any[] = []): Promise<any> {
    try {
      const explainQuery = `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${query}`;
      const result = await this.sql.unsafe(explainQuery, params);
      
      if (this.config.enableExplainAnalyze) {
        logDatabase('query_explain', {
          query: query.substring(0, 200),
          plan: result[0]?.['QUERY PLAN'] || result,
        });
      }
      
      return result;
    } catch (error) {
      logError(error as Error, { operation: 'explain_query' });
      return null;
    }
  }

  // Generate query name for caching
  private generateQueryName(query: string): string {
    const hash = crypto.createHash('md5').update(query).digest('hex');
    return `query_${hash.substring(0, 8)}`;
  }

  // Log query performance
  private logQuery(query: string, params: any[], duration: number, slow: boolean): void {
    if (!this.config.enableQueryLogging) return;

    const metrics: QueryMetrics = {
      query: query.substring(0, 200),
      params: params.slice(0, 5), // Limit params for logging
      duration,
      timestamp: new Date(),
      slow,
    };

    if (slow) {
      slowQueries.push(metrics);
      if (slowQueries.length > MAX_SLOW_QUERIES) {
        slowQueries.shift();
      }
      
      logPerformance('slow_query', {
        query: metrics.query,
        duration,
        params: metrics.params,
      });
    }

    if (this.config.enableQueryLogging) {
      logDatabase('query_executed', {
        query: metrics.query,
        duration,
        slow,
        params: metrics.params,
      });
    }
  }

  // Log query errors
  private logQueryError(query: string, params: any[], duration: number, error: Error): void {
    logError(error, {
      operation: 'query_execution',
      query: query.substring(0, 200),
      duration,
      params: params.slice(0, 5),
    });
  }

  // Log transaction performance
  private logTransaction(duration: number, isolation?: string): void {
    logDatabase('transaction_completed', {
      duration,
      isolation,
    });
  }

  // Log transaction errors
  private logTransactionError(duration: number, error: Error): void {
    logError(error, {
      operation: 'transaction_execution',
      duration,
    });
  }

  // Get query statistics
  getQueryStats(): any {
    return {
      slowQueries: slowQueries.length,
      preparedStatements: this.preparedStatements.size,
      config: this.config,
    };
  }

  // Get slow queries
  getSlowQueries(): QueryMetrics[] {
    return [...slowQueries];
  }

  // Clear slow query cache
  clearSlowQueries(): void {
    slowQueries.length = 0;
  }

  // Close connection
  async close(): Promise<void> {
    try {
      await this.sql.end();
    } catch (error) {
      logError(error as Error, { operation: 'database_close' });
    }
  }
}

// Query optimization utilities
export const queryUtils = {
  // Optimize SELECT queries
  optimizeSelect: (query: string): string => {
    // Add LIMIT if missing for large result sets
    if (!query.toLowerCase().includes('limit') && !query.toLowerCase().includes('count(')) {
      return query + ' LIMIT 1000';
    }
    return query;
  },

  // Optimize INSERT queries
  optimizeInsert: (query: string): string => {
    // Use ON CONFLICT for upserts
    if (query.toLowerCase().includes('insert') && !query.toLowerCase().includes('on conflict')) {
      return query.replace(/INSERT INTO (\w+)/i, 'INSERT INTO $1 ON CONFLICT DO NOTHING');
    }
    return query;
  },

  // Optimize UPDATE queries
  optimizeUpdate: (query: string): string => {
    // Add WHERE clause check
    if (query.toLowerCase().includes('update') && !query.toLowerCase().includes('where')) {
      console.warn('UPDATE query without WHERE clause detected');
    }
    return query;
  },

  // Generate optimized pagination
  paginate: (query: string, page: number = 1, limit: number = 20): string => {
    const offset = (page - 1) * limit;
    return `${query} LIMIT ${limit} OFFSET ${offset}`;
  },

  // Generate optimized search
  search: (query: string, searchTerm: string, columns: string[]): string => {
    const searchConditions = columns.map(col => `${col} ILIKE $1`).join(' OR ');
    const searchParam = `%${searchTerm}%`;
    return `${query} WHERE ${searchConditions}`;
  },

  // Generate optimized sorting
  sort: (query: string, column: string, direction: 'ASC' | 'DESC' = 'ASC'): string => {
    return `${query} ORDER BY ${column} ${direction}`;
  },

  // Generate optimized filtering
  filter: (query: string, filters: Record<string, any>): { query: string; params: any[] } => {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    Object.entries(filters).forEach(([column, value]) => {
      if (value !== undefined && value !== null) {
        conditions.push(`${column} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    });

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return {
      query: `${query} ${whereClause}`,
      params,
    };
  },
};

// Database health check
export const checkDatabaseHealth = async (sql: postgres.Sql): Promise<boolean> => {
  try {
    const result = await sql`SELECT 1 as health_check`;
    return result.length > 0 && result[0].health_check === 1;
  } catch (error) {
    logError(error as Error, { operation: 'database_health_check' });
    return false;
  }
};

// Database performance monitoring
export const monitorDatabasePerformance = async (sql: postgres.Sql): Promise<any> => {
  try {
    const stats = await sql`
      SELECT 
        schemaname,
        tablename,
        attname,
        n_distinct,
        correlation
      FROM pg_stats 
      WHERE schemaname = 'public'
      ORDER BY n_distinct DESC
      LIMIT 20
    `;

    const connections = await sql`
      SELECT 
        count(*) as active_connections,
        state
      FROM pg_stat_activity 
      WHERE state = 'active'
      GROUP BY state
    `;

    const slowQueries = await sql`
      SELECT 
        query,
        calls,
        total_time,
        mean_time,
        rows
      FROM pg_stat_statements 
      ORDER BY mean_time DESC 
      LIMIT 10
    `;

    return {
      tableStats: stats,
      connections,
      slowQueries,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logError(error as Error, { operation: 'database_performance_monitoring' });
    return null;
  }
};

export default {
  QueryOptimizer,
  createOptimizedConnection,
  queryUtils,
  checkDatabaseHealth,
  monitorDatabasePerformance,
  getDatabaseConfig,
  productionDbConfig,
  developmentDbConfig,
}; 