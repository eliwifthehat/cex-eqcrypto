/**
 * Caching Configuration
 * Provides Redis and memory caching strategies
 */

import NodeCache from 'node-cache';
import Redis from 'ioredis';
import { logPerformance, logError } from './logger';

// Cache configuration interface
export interface CacheConfig {
  type: 'memory' | 'redis' | 'hybrid';
  ttl: number;
  maxKeys: number;
  checkPeriod: number;
  useClones: boolean;
  deleteOnExpire: boolean;
}

// Redis configuration interface
export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  retryDelayOnFailover: number;
  maxRetriesPerRequest: number;
  lazyConnect: boolean;
  keepAlive: number;
  family: number;
  keyPrefix: string;
}

// Cache types
export enum CacheType {
  USER_PROFILE = 'user_profile',
  USER_PORTFOLIO = 'user_portfolio',
  TRADING_PAIRS = 'trading_pairs',
  ORDER_BOOK = 'order_book',
  PRICE_DATA = 'price_data',
  API_RESPONSES = 'api_responses',
  SESSION_DATA = 'session_data',
  STATIC_DATA = 'static_data',
}

// Cache configuration for different types
export const cacheConfigs: Record<CacheType, CacheConfig> = {
  [CacheType.USER_PROFILE]: {
    type: 'hybrid',
    ttl: 300, // 5 minutes
    maxKeys: 1000,
    checkPeriod: 60,
    useClones: false,
    deleteOnExpire: true,
  },
  [CacheType.USER_PORTFOLIO]: {
    type: 'hybrid',
    ttl: 60, // 1 minute
    maxKeys: 1000,
    checkPeriod: 30,
    useClones: false,
    deleteOnExpire: true,
  },
  [CacheType.TRADING_PAIRS]: {
    type: 'redis',
    ttl: 3600, // 1 hour
    maxKeys: 100,
    checkPeriod: 300,
    useClones: false,
    deleteOnExpire: true,
  },
  [CacheType.ORDER_BOOK]: {
    type: 'memory',
    ttl: 10, // 10 seconds
    maxKeys: 50,
    checkPeriod: 5,
    useClones: false,
    deleteOnExpire: true,
  },
  [CacheType.PRICE_DATA]: {
    type: 'memory',
    ttl: 5, // 5 seconds
    maxKeys: 200,
    checkPeriod: 2,
    useClones: false,
    deleteOnExpire: true,
  },
  [CacheType.API_RESPONSES]: {
    type: 'hybrid',
    ttl: 1800, // 30 minutes
    maxKeys: 500,
    checkPeriod: 300,
    useClones: false,
    deleteOnExpire: true,
  },
  [CacheType.SESSION_DATA]: {
    type: 'redis',
    ttl: 86400, // 24 hours
    maxKeys: 10000,
    checkPeriod: 3600,
    useClones: false,
    deleteOnExpire: true,
  },
  [CacheType.STATIC_DATA]: {
    type: 'redis',
    ttl: 7200, // 2 hours
    maxKeys: 100,
    checkPeriod: 600,
    useClones: false,
    deleteOnExpire: true,
  },
};

// Redis configuration
export const redisConfig: RedisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  family: 4,
  keyPrefix: 'cex:',
};

// Memory cache instances
const memoryCaches = new Map<CacheType, NodeCache>();

// Redis client
let redisClient: Redis | null = null;

// Initialize Redis client
export const initializeRedis = (): Redis | null => {
  try {
    if (process.env.REDIS_URL) {
      redisClient = new Redis(process.env.REDIS_URL, {
        retryDelayOnFailover: redisConfig.retryDelayOnFailover,
        maxRetriesPerRequest: redisConfig.maxRetriesPerRequest,
        lazyConnect: redisConfig.lazyConnect,
        keepAlive: redisConfig.keepAlive,
        family: redisConfig.family,
        keyPrefix: redisConfig.keyPrefix,
      });
    } else if (process.env.NODE_ENV === 'production') {
      redisClient = new Redis(redisConfig);
    }

    if (redisClient) {
      redisClient.on('connect', () => {
        logPerformance('redis_connected', { host: redisConfig.host, port: redisConfig.port });
      });

      redisClient.on('error', (error) => {
        logError(error, { operation: 'redis_connection' });
      });

      redisClient.on('close', () => {
        logPerformance('redis_disconnected');
      });
    }

    return redisClient;
  } catch (error) {
    logError(error as Error, { operation: 'redis_initialization' });
    return null;
  }
};

// Get memory cache instance
export const getMemoryCache = (type: CacheType): NodeCache => {
  if (!memoryCaches.has(type)) {
    const config = cacheConfigs[type];
    const cache = new NodeCache({
      stdTTL: config.ttl,
      maxKeys: config.maxKeys,
      checkperiod: config.checkPeriod,
      useClones: config.useClones,
      deleteOnExpire: config.deleteOnExpire,
    });

    // Log cache events
    cache.on('expired', (key) => {
      logPerformance('cache_expired', { type, key });
    });

    cache.on('flush', () => {
      logPerformance('cache_flushed', { type });
    });

    memoryCaches.set(type, cache);
  }

  return memoryCaches.get(type)!;
};

// Cache manager class
export class CacheManager {
  private redis: Redis | null;
  private memoryCaches: Map<CacheType, NodeCache>;

  constructor() {
    this.redis = initializeRedis();
    this.memoryCaches = new Map();
  }

  // Generate cache key
  private generateKey(type: CacheType, key: string): string {
    return `${type}:${key}`;
  }

  // Get value from cache
  async get<T>(type: CacheType, key: string): Promise<T | null> {
    const cacheKey = this.generateKey(type, key);
    const config = cacheConfigs[type];

    try {
      // Try memory cache first for hybrid/memory types
      if (config.type === 'memory' || config.type === 'hybrid') {
        const memoryCache = getMemoryCache(type);
        const memoryValue = memoryCache.get<T>(cacheKey);
        
        if (memoryValue !== undefined) {
          logPerformance('cache_hit', { type, key, source: 'memory' });
          return memoryValue;
        }
      }

      // Try Redis for redis/hybrid types
      if ((config.type === 'redis' || config.type === 'hybrid') && this.redis) {
        const redisValue = await this.redis.get(cacheKey);
        
        if (redisValue) {
          const parsedValue = JSON.parse(redisValue) as T;
          
          // Store in memory cache for hybrid types
          if (config.type === 'hybrid') {
            const memoryCache = getMemoryCache(type);
            memoryCache.set(cacheKey, parsedValue, config.ttl);
          }
          
          logPerformance('cache_hit', { type, key, source: 'redis' });
          return parsedValue;
        }
      }

      logPerformance('cache_miss', { type, key });
      return null;
    } catch (error) {
      logError(error as Error, { operation: 'cache_get', type, key });
      return null;
    }
  }

  // Set value in cache
  async set<T>(type: CacheType, key: string, value: T, ttl?: number): Promise<boolean> {
    const cacheKey = this.generateKey(type, key);
    const config = cacheConfigs[type];
    const cacheTTL = ttl || config.ttl;

    try {
      // Set in memory cache for memory/hybrid types
      if (config.type === 'memory' || config.type === 'hybrid') {
        const memoryCache = getMemoryCache(type);
        memoryCache.set(cacheKey, value, cacheTTL);
      }

      // Set in Redis for redis/hybrid types
      if ((config.type === 'redis' || config.type === 'hybrid') && this.redis) {
        const serializedValue = JSON.stringify(value);
        await this.redis.setex(cacheKey, cacheTTL, serializedValue);
      }

      logPerformance('cache_set', { type, key, ttl: cacheTTL });
      return true;
    } catch (error) {
      logError(error as Error, { operation: 'cache_set', type, key });
      return false;
    }
  }

  // Delete value from cache
  async delete(type: CacheType, key: string): Promise<boolean> {
    const cacheKey = this.generateKey(type, key);
    const config = cacheConfigs[type];

    try {
      // Delete from memory cache
      if (config.type === 'memory' || config.type === 'hybrid') {
        const memoryCache = getMemoryCache(type);
        memoryCache.del(cacheKey);
      }

      // Delete from Redis
      if ((config.type === 'redis' || config.type === 'hybrid') && this.redis) {
        await this.redis.del(cacheKey);
      }

      logPerformance('cache_delete', { type, key });
      return true;
    } catch (error) {
      logError(error as Error, { operation: 'cache_delete', type, key });
      return false;
    }
  }

  // Clear all cache of a type
  async clear(type: CacheType): Promise<boolean> {
    const config = cacheConfigs[type];

    try {
      // Clear memory cache
      if (config.type === 'memory' || config.type === 'hybrid') {
        const memoryCache = getMemoryCache(type);
        memoryCache.flushAll();
      }

      // Clear Redis cache
      if ((config.type === 'redis' || config.type === 'hybrid') && this.redis) {
        const pattern = `${this.generateKey(type, '*')}`;
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      }

      logPerformance('cache_clear', { type });
      return true;
    } catch (error) {
      logError(error as Error, { operation: 'cache_clear', type });
      return false;
    }
  }

  // Get cache statistics
  async getStats(type: CacheType): Promise<any> {
    const config = cacheConfigs[type];
    const stats: any = { type, config };

    try {
      // Memory cache stats
      if (config.type === 'memory' || config.type === 'hybrid') {
        const memoryCache = getMemoryCache(type);
        stats.memory = {
          keys: memoryCache.keys().length,
          hits: memoryCache.getStats().hits,
          misses: memoryCache.getStats().misses,
          keyspace: memoryCache.getStats().keys,
        };
      }

      // Redis stats
      if ((config.type === 'redis' || config.type === 'hybrid') && this.redis) {
        const pattern = `${this.generateKey(type, '*')}`;
        const keys = await this.redis.keys(pattern);
        stats.redis = {
          keys: keys.length,
          connected: this.redis.status === 'ready',
        };
      }

      return stats;
    } catch (error) {
      logError(error as Error, { operation: 'cache_stats', type });
      return { type, error: 'Failed to get stats' };
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      if (this.redis) {
        await this.redis.ping();
      }
      return true;
    } catch (error) {
      logError(error as Error, { operation: 'cache_health_check' });
      return false;
    }
  }

  // Close connections
  async close(): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.quit();
      }
      
      // Clear memory caches
      this.memoryCaches.forEach(cache => cache.flushAll());
      this.memoryCaches.clear();
    } catch (error) {
      logError(error as Error, { operation: 'cache_close' });
    }
  }
}

// Global cache manager instance
export const cacheManager = new CacheManager();

// Cache middleware for Express
export const cacheMiddleware = (type: CacheType, ttl?: number) => {
  return async (req: any, res: any, next: any) => {
    const cacheKey = `${req.method}:${req.originalUrl}`;
    
    try {
      const cachedResponse = await cacheManager.get(type, cacheKey);
      
      if (cachedResponse) {
        return res.json(cachedResponse);
      }

      // Store original send method
      const originalSend = res.json;
      
      // Override send method to cache response
      res.json = function(data: any) {
        cacheManager.set(type, cacheKey, data, ttl);
        return originalSend.call(this, data);
      };

      next();
    } catch (error) {
      logError(error as Error, { operation: 'cache_middleware', type, key: cacheKey });
      next();
    }
  };
};

// Cache utilities
export const cacheUtils = {
  // Generate cache key from request
  generateRequestKey: (req: any): string => {
    return `${req.method}:${req.originalUrl}:${JSON.stringify(req.query)}:${JSON.stringify(req.body)}`;
  },

  // Generate cache key from parameters
  generateKey: (prefix: string, ...params: any[]): string => {
    return `${prefix}:${params.join(':')}`;
  },

  // Cache with fallback
  withFallback: async <T>(
    type: CacheType,
    key: string,
    fallback: () => Promise<T>,
    ttl?: number
  ): Promise<T> => {
    const cached = await cacheManager.get<T>(type, key);
    if (cached !== null) {
      return cached;
    }

    const result = await fallback();
    await cacheManager.set(type, key, result, ttl);
    return result;
  },

  // Invalidate cache by pattern
  invalidatePattern: async (type: CacheType, pattern: string): Promise<boolean> => {
    try {
      const config = cacheConfigs[type];
      
      // Clear memory cache keys matching pattern
      if (config.type === 'memory' || config.type === 'hybrid') {
        const memoryCache = getMemoryCache(type);
        const keys = memoryCache.keys();
        const matchingKeys = keys.filter(key => key.includes(pattern));
        matchingKeys.forEach(key => memoryCache.del(key));
      }

      // Clear Redis cache keys matching pattern
      if ((config.type === 'redis' || config.type === 'hybrid') && cacheManager['redis']) {
        const redisPattern = `${cacheManager['generateKey'](type, pattern)}*`;
        const keys = await cacheManager['redis'].keys(redisPattern);
        if (keys.length > 0) {
          await cacheManager['redis'].del(...keys);
        }
      }

      return true;
    } catch (error) {
      logError(error as Error, { operation: 'cache_invalidate_pattern', type, pattern });
      return false;
    }
  },
};

export default {
  CacheManager,
  cacheManager,
  cacheMiddleware,
  cacheUtils,
  cacheConfigs,
  CacheType,
  initializeRedis,
  getMemoryCache,
}; 