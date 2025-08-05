/**
 * Session Security Configuration
 * Provides secure session management with PostgreSQL storage
 */

import session from 'express-session';
import pgSession from 'connect-pg-simple';
import { logSecurity, logError } from './logger';

// Session store configuration
const PostgresStore = pgSession(session);

// Session security configuration
export interface SessionConfig {
  secret: string;
  name: string;
  resave: boolean;
  saveUninitialized: boolean;
  cookie: {
    secure: boolean;
    httpOnly: boolean;
    sameSite: boolean | 'lax' | 'strict' | 'none';
    maxAge: number;
    domain?: string;
    path: string;
  };
  store: any;
  rolling: boolean;
  unset: 'destroy' | 'keep';
  proxy: boolean;
}

// Production session configuration
export const productionSessionConfig: SessionConfig = {
  secret: process.env.SESSION_SECRET || 'fallback-secret-change-in-production',
  name: 'cex.sid', // Custom session cookie name
  resave: false, // Don't save session if unmodified
  saveUninitialized: false, // Don't create session until something stored
  cookie: {
    secure: true, // Only transmit cookie over HTTPS
    httpOnly: true, // Prevent client-side access to session cookie
    sameSite: 'strict', // Protect against CSRF attacks
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    domain: process.env.SESSION_DOMAIN, // Set domain for subdomain support
    path: '/', // Cookie path
  },
  store: new PostgresStore({
    conObject: {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    },
    tableName: 'user_sessions', // Custom table name
    createTableIfMissing: true,
    pruneSessionInterval: 60, // Clean up expired sessions every 60 seconds
    ttl: 24 * 60 * 60, // Session TTL in seconds (24 hours)
  }),
  rolling: true, // Extend session on each request
  unset: 'destroy', // Destroy session when unset
  proxy: true, // Trust proxy for secure cookies
};

// Development session configuration
export const developmentSessionConfig: SessionConfig = {
  secret: process.env.SESSION_SECRET || 'dev-secret-key',
  name: 'cex.sid',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Allow HTTP in development
    httpOnly: true,
    sameSite: 'lax', // Less strict for development
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/',
  },
  store: new PostgresStore({
    conObject: {
      connectionString: process.env.DATABASE_URL,
      ssl: false,
    },
    tableName: 'user_sessions',
    createTableIfMissing: true,
    pruneSessionInterval: 60,
    ttl: 24 * 60 * 60,
  }),
  rolling: true,
  unset: 'destroy',
  proxy: false, // Don't trust proxy in development
};

// Get session configuration based on environment
export const getSessionConfig = (): SessionConfig => {
  return process.env.NODE_ENV === 'production' 
    ? productionSessionConfig 
    : developmentSessionConfig;
};

// Session security middleware
export const sessionSecurityMiddleware = (req: any, res: any, next: any) => {
  // Log session creation
  const originalEnd = res.end;
  res.end = function(chunk: any, encoding: any) {
    if (req.session && req.sessionID) {
      logSecurity('session_created', {
        sessionId: req.sessionID,
        userId: req.session.userId,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
      });
    }
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

// Session validation middleware
export const validateSession = (req: any, res: any, next: any) => {
  if (!req.session) {
    logSecurity('session_missing', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
    });
    return res.status(401).json({ error: 'Session required' });
  }

  // Check if session is expired
  if (req.session.cookie && req.session.cookie.expires) {
    const now = new Date();
    const expires = new Date(req.session.cookie.expires);
    
    if (now > expires) {
      logSecurity('session_expired', {
        sessionId: req.sessionID,
        userId: req.session.userId,
        ip: req.ip,
      });
      
      req.session.destroy((err: any) => {
        if (err) {
          logError(err, { operation: 'session_destroy' });
        }
      });
      
      return res.status(401).json({ error: 'Session expired' });
    }
  }

  next();
};

// Session cleanup middleware
export const sessionCleanup = (req: any, res: any, next: any) => {
  // Clean up session on logout
  if (req.path === '/api/logout' && req.method === 'POST') {
    const sessionId = req.sessionID;
    const userId = req.session?.userId;
    
    req.session.destroy((err: any) => {
      if (err) {
        logError(err, { operation: 'session_destroy_logout' });
      } else {
        logSecurity('session_destroyed_logout', {
          sessionId,
          userId,
          ip: req.ip,
        });
      }
    });
  }

  next();
};

// Session monitoring middleware
export const sessionMonitoring = (req: any, res: any, next: any) => {
  const startTime = Date.now();
  
  // Monitor session access patterns
  if (req.session && req.sessionID) {
    const sessionData = {
      sessionId: req.sessionID,
      userId: req.session.userId,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
    };

    // Log suspicious session activity
    if (req.session.lastAccess) {
      const lastAccess = new Date(req.session.lastAccess);
      const now = new Date();
      const timeDiff = now.getTime() - lastAccess.getTime();
      
      // Log if session accessed from different IP within short time
      if (req.session.lastIP && req.session.lastIP !== req.ip && timeDiff < 60000) {
        logSecurity('session_suspicious_activity', {
          ...sessionData,
          lastIP: req.session.lastIP,
          timeDiff,
        });
      }
    }

    // Update session access info
    req.session.lastAccess = new Date().toISOString();
    req.session.lastIP = req.ip;
    req.session.lastUserAgent = req.get('User-Agent');
  }

  next();
};

// Session rate limiting
export const sessionRateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each session to 100 requests per windowMs
  message: 'Too many requests from this session',
  keyGenerator: (req: any) => req.sessionID || req.ip,
  handler: (req: any, res: any) => {
    logSecurity('session_rate_limit_exceeded', {
      sessionId: req.sessionID,
      userId: req.session?.userId,
      ip: req.ip,
      path: req.path,
    });
    
    res.status(429).json({
      error: 'Too many requests',
      message: 'Please try again later',
    });
  },
};

// Session security utilities
export const sessionUtils = {
  // Generate secure session secret
  generateSessionSecret: (): string => {
    const crypto = require('crypto');
    return crypto.randomBytes(64).toString('hex');
  },

  // Validate session secret strength
  validateSessionSecret: (secret: string): boolean => {
    return secret.length >= 32 && /^[a-f0-9]+$/i.test(secret);
  },

  // Get session statistics
  getSessionStats: async (store: any) => {
    try {
      const sessions = await store.all();
      return {
        totalSessions: sessions.length,
        activeSessions: sessions.filter((s: any) => s.cookie && s.cookie.expires > new Date()).length,
        expiredSessions: sessions.filter((s: any) => s.cookie && s.cookie.expires <= new Date()).length,
      };
    } catch (error) {
      logError(error as Error, { operation: 'get_session_stats' });
      return null;
    }
  },

  // Clean up expired sessions
  cleanupExpiredSessions: async (store: any) => {
    try {
      const sessions = await store.all();
      const now = new Date();
      let cleanedCount = 0;

      for (const session of sessions) {
        if (session.cookie && session.cookie.expires <= now) {
          await store.destroy(session.id);
          cleanedCount++;
        }
      }

      logSecurity('sessions_cleaned', { cleanedCount });
      return cleanedCount;
    } catch (error) {
      logError(error as Error, { operation: 'cleanup_expired_sessions' });
      return 0;
    }
  },
};

// Session security headers
export const sessionSecurityHeaders = {
  'X-Session-Timeout': '86400', // 24 hours in seconds
  'X-Session-Secure': process.env.NODE_ENV === 'production' ? 'true' : 'false',
  'X-Session-HttpOnly': 'true',
  'X-Session-SameSite': process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
};

export default {
  getSessionConfig,
  sessionSecurityMiddleware,
  validateSession,
  sessionCleanup,
  sessionMonitoring,
  sessionRateLimit,
  sessionUtils,
  sessionSecurityHeaders,
}; 