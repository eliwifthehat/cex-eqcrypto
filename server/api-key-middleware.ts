/**
 * API Key Middleware
 * Validates API keys and tracks usage
 */

import { Request, Response, NextFunction } from 'express';
import { apiKeyManager, ApiKeyUsage } from './api-key-manager';
import { logSecurity, logError } from './logger';

export interface AuthenticatedRequest extends Request {
  apiKey?: {
    userId: string;
    permissions: string[];
    keyId: number;
  };
}

export interface ApiKeyMiddlewareOptions {
  requiredPermissions?: string[];
  trackUsage?: boolean;
  rateLimit?: {
    windowMs: number;
    maxRequests: number;
  };
}

// Rate limiting store for API keys
const apiKeyRateLimit = new Map<string, { count: number; resetTime: number }>();

/**
 * API Key validation middleware
 */
export function validateApiKey(options: ApiKeyMiddlewareOptions = {}) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    
    try {
      // Extract API key from headers
      const apiKey = req.headers['x-api-key'] as string || req.headers['authorization']?.replace('Bearer ', '');
      
      if (!apiKey) {
        return res.status(401).json({
          error: 'API key required',
          message: 'Please provide a valid API key in the X-API-Key header or Authorization header',
        });
      }

      // Get client IP
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';

      // Check rate limiting
      if (options.rateLimit) {
        const rateLimitKey = `api_key_${apiKey}`;
        const now = Date.now();
        const windowStart = now - options.rateLimit.windowMs;
        
        const currentLimit = apiKeyRateLimit.get(rateLimitKey);
        
        if (currentLimit && currentLimit.resetTime > now) {
          if (currentLimit.count >= options.rateLimit.maxRequests) {
            logSecurity('api_key_rate_limit_exceeded', {
              apiKey: apiKey.substring(0, 10) + '...',
              ipAddress,
              endpoint: req.path,
              method: req.method,
            });
            
            return res.status(429).json({
              error: 'Rate limit exceeded',
              message: `Too many requests. Limit: ${options.rateLimit.maxRequests} requests per ${options.rateLimit.windowMs / 1000} seconds`,
            });
          }
          currentLimit.count++;
        } else {
          apiKeyRateLimit.set(rateLimitKey, {
            count: 1,
            resetTime: now + options.rateLimit.windowMs,
          });
        }
      }

      // Validate API key
      const validation = await apiKeyManager.validateApiKey(
        apiKey,
        options.requiredPermissions || ['read'],
        ipAddress
      );

      if (!validation.valid) {
        const responseTime = Date.now() - startTime;
        
        // Log failed validation
        logSecurity('api_key_validation_failed', {
          apiKey: apiKey.substring(0, 10) + '...',
          ipAddress,
          endpoint: req.path,
          method: req.method,
          error: validation.error,
          responseTime,
        });

        return res.status(401).json({
          error: 'Invalid API key',
          message: validation.error || 'API key validation failed',
        });
      }

      // Attach API key info to request
      req.apiKey = {
        userId: validation.userId!,
        permissions: validation.permissions!,
        keyId: validation.keyId!,
      };

      // Track usage if enabled
      if (options.trackUsage !== false) {
        const responseTime = Date.now() - startTime;
        const usage: ApiKeyUsage = {
          keyId: validation.keyId!,
          endpoint: req.path,
          ipAddress,
          userAgent: req.get('User-Agent') || 'unknown',
          timestamp: new Date(),
          success: true,
          responseTime,
        };

        // Log usage asynchronously (don't block the request)
        apiKeyManager.logApiKeyUsage(usage).catch(error => {
          logError(error, { operation: 'logApiKeyUsage', keyId: validation.keyId });
        });
      }

      next();
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      logError(error as Error, {
        operation: 'validateApiKey',
        endpoint: req.path,
        method: req.method,
        responseTime,
      });

      return res.status(500).json({
        error: 'Internal server error',
        message: 'API key validation failed',
      });
    }
  };
}

/**
 * Permission-based middleware
 */
export function requirePermissions(permissions: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.apiKey) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'API key authentication required',
      });
    }

    const hasAllPermissions = permissions.every(permission =>
      req.apiKey!.permissions.includes(permission)
    );

    if (!hasAllPermissions) {
      logSecurity('api_key_permission_denied', {
        userId: req.apiKey.userId,
        keyId: req.apiKey.keyId,
        requiredPermissions: permissions,
        actualPermissions: req.apiKey.permissions,
        endpoint: req.path,
        method: req.method,
      });

      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `Required permissions: ${permissions.join(', ')}`,
      });
    }

    next();
  };
}

/**
 * Rate limiting middleware for API keys
 */
export function createApiKeyRateLimit(options: { windowMs: number; maxRequests: number }) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'] as string || req.headers['authorization']?.replace('Bearer ', '');
    
    if (!apiKey) {
      return next();
    }

    const rateLimitKey = `api_key_${apiKey}`;
    const now = Date.now();
    const windowStart = now - options.windowMs;
    
    const currentLimit = apiKeyRateLimit.get(rateLimitKey);
    
    if (currentLimit && currentLimit.resetTime > now) {
      if (currentLimit.count >= options.maxRequests) {
        logSecurity('api_key_rate_limit_exceeded', {
          apiKey: apiKey.substring(0, 10) + '...',
          ipAddress: req.ip || 'unknown',
          endpoint: req.path,
          method: req.method,
        });
        
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: `Too many requests. Limit: ${options.maxRequests} requests per ${options.windowMs / 1000} seconds`,
        });
      }
      currentLimit.count++;
    } else {
      apiKeyRateLimit.set(rateLimitKey, {
        count: 1,
        resetTime: now + options.windowMs,
      });
    }

    next();
  };
}

/**
 * Clean up expired rate limit entries
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of apiKeyRateLimit.entries()) {
    if (value.resetTime < now) {
      apiKeyRateLimit.delete(key);
    }
  }
}, 60000); // Clean up every minute

export default {
  validateApiKey,
  requirePermissions,
  createApiKeyRateLimit,
}; 