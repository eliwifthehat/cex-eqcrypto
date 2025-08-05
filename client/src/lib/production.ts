/**
 * Production Configuration
 * Optimizations and settings for production builds
 */

// Production environment detection
export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';

// Performance optimizations
export const performanceConfig = {
  // Enable React Strict Mode in development
  strictMode: isDevelopment,
  
  // Enable React DevTools in development
  devTools: isDevelopment,
  
  // Bundle size warnings
  bundleSizeWarning: 500, // KB
  
  // API rate limiting
  apiRateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: isProduction ? 100 : 1000, // requests per window
  },
  
  // Caching strategies
  cache: {
    // Static assets cache
    staticAssets: 'public, max-age=31536000, immutable',
    // API responses cache
    apiResponses: 'public, max-age=300', // 5 minutes
    // User data cache
    userData: 'private, max-age=60', // 1 minute
  },
  
  // Error reporting
  errorReporting: {
    enabled: isProduction,
    sampleRate: 0.1, // 10% of errors
  },
  
  // Analytics
  analytics: {
    enabled: isProduction,
    trackPageViews: true,
    trackUserInteractions: true,
  },
};

// Feature flags for production
export const featureFlags = {
  // Enable advanced features only in production
  advancedCharts: isProduction,
  realTimeUpdates: isProduction,
  pushNotifications: isProduction,
  advancedAnalytics: isProduction,
  
  // Development-only features
  debugMode: isDevelopment,
  mockData: isDevelopment,
  performanceMonitoring: isDevelopment,
};

// API configuration
export const apiConfig = {
  baseUrl: isProduction 
    ? 'https://your-production-domain.com/api'
    : 'http://localhost:5002/api',
  
  timeout: isProduction ? 10000 : 30000, // 10s in prod, 30s in dev
  
  retries: isProduction ? 3 : 1,
  
  // CORS settings
  cors: {
    origin: isProduction 
      ? ['https://your-production-domain.com']
      : ['http://localhost:5173', 'http://localhost:5002'],
    credentials: true,
  },
};

// Database configuration
export const databaseConfig = {
  // Connection pooling
  pool: {
    min: isProduction ? 2 : 1,
    max: isProduction ? 10 : 5,
  },
  
  // Query timeout
  queryTimeout: isProduction ? 5000 : 30000,
  
  // Enable query logging in development
  logQueries: isDevelopment,
  
  // Enable slow query detection
  slowQueryThreshold: isProduction ? 1000 : 5000, // ms
};

// Security configuration
export const securityConfig = {
  // Content Security Policy
  csp: {
    enabled: isProduction,
    strict: isProduction,
  },
  
  // Rate limiting
  rateLimit: {
    enabled: isProduction,
    strict: isProduction,
  },
  
  // CORS
  cors: {
    enabled: true,
    strict: isProduction,
  },
  
  // HTTPS enforcement
  httpsOnly: isProduction,
  
  // Security headers
  headers: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': isProduction ? 'strict-origin-when-cross-origin' : 'no-referrer-when-downgrade',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  },
};

// Logging configuration
export const loggingConfig = {
  level: isProduction ? 'warn' : 'debug',
  
  // Structured logging in production
  structured: isProduction,
  
  // Log to external service in production
  external: isProduction,
  
  // Sensitive data filtering
  filterSensitiveData: isProduction,
};

// Monitoring configuration
export const monitoringConfig = {
  // Performance monitoring
  performance: {
    enabled: isProduction,
    sampleRate: 0.1, // 10% of requests
  },
  
  // Error monitoring
  errors: {
    enabled: isProduction,
    sampleRate: 0.5, // 50% of errors
  },
  
  // User analytics
  analytics: {
    enabled: isProduction,
    trackPageViews: true,
    trackUserInteractions: true,
  },
  
  // Health checks
  healthChecks: {
    enabled: isProduction,
    interval: 30000, // 30 seconds
  },
};

// Export all configurations
export const productionConfig = {
  performance: performanceConfig,
  features: featureFlags,
  api: apiConfig,
  database: databaseConfig,
  security: securityConfig,
  logging: loggingConfig,
  monitoring: monitoringConfig,
};

export default productionConfig; 