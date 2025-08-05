/**
 * Input Validation and Sanitization Middleware
 * Provides comprehensive validation and sanitization for all inputs
 */

import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult, ValidationChain } from 'express-validator';
import { logSecurity, logError } from './logger';
import xss from 'xss-clean';

// Custom validation rules
const customValidators = {
  // Validate cryptocurrency symbol format
  isValidCryptoSymbol: (value: string) => {
    const symbolRegex = /^[A-Z0-9]{2,10}$/;
    return symbolRegex.test(value);
  },

  // Validate trading pair format
  isValidTradingPair: (value: string) => {
    const pairRegex = /^[A-Z0-9]{2,10}\/[A-Z0-9]{2,10}$/;
    return pairRegex.test(value);
  },

  // Validate decimal number for crypto amounts
  isValidCryptoAmount: (value: string) => {
    const amountRegex = /^\d+(\.\d{1,8})?$/;
    if (!amountRegex.test(value)) return false;
    const num = parseFloat(value);
    return num > 0 && num <= 999999999;
  },

  // Validate price format
  isValidPrice: (value: string) => {
    const priceRegex = /^\d+(\.\d{1,8})?$/;
    if (!priceRegex.test(value)) return false;
    const num = parseFloat(value);
    return num > 0 && num <= 999999999;
  },

  // Validate order type
  isValidOrderType: (value: string) => {
    return ['market', 'limit', 'stop', 'stop-limit'].includes(value);
  },

  // Validate order side
  isValidOrderSide: (value: string) => {
    return ['buy', 'sell'].includes(value);
  },

  // Validate email format
  isValidEmail: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  // Validate strong password
  isStrongPassword: (value: string) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(value);
  },

  // Validate IP address
  isValidIP: (value: string) => {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(value);
  },

  // Validate API key format
  isValidApiKey: (value: string) => {
    return value.startsWith('cex_') && value.length >= 36;
  },

  // Validate UUID format
  isValidUUID: (value: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  },

  // Validate date format
  isValidDate: (value: string) => {
    const date = new Date(value);
    return !isNaN(date.getTime());
  },

  // Validate positive integer
  isPositiveInteger: (value: string) => {
    const num = parseInt(value);
    return !isNaN(num) && num > 0 && Number.isInteger(num);
  },

  // Validate percentage (0-100)
  isValidPercentage: (value: string) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0 && num <= 100;
  },
};

// Sanitization functions
const sanitizers = {
  // Remove HTML tags and dangerous characters
  sanitizeHtml: (value: string) => {
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<[^>]*>/g, '');
  },

  // Sanitize SQL injection attempts
  sanitizeSql: (value: string) => {
    return value
      .replace(/['";]/g, '')
      .replace(/--/g, '')
      .replace(/\/\*/g, '')
      .replace(/\*\//g, '')
      .replace(/union\s+select/gi, '')
      .replace(/drop\s+table/gi, '')
      .replace(/delete\s+from/gi, '')
      .replace(/insert\s+into/gi, '')
      .replace(/update\s+set/gi, '');
  },

  // Sanitize file paths
  sanitizePath: (value: string) => {
    return value
      .replace(/\.\./g, '')
      .replace(/\/\//g, '/')
      .replace(/[<>:"|?*]/g, '');
  },

  // Normalize email
  normalizeEmail: (value: string) => {
    return value.toLowerCase().trim();
  },

  // Trim and normalize strings
  normalizeString: (value: string) => {
    return value.trim().replace(/\s+/g, ' ');
  },

  // Sanitize phone number
  sanitizePhone: (value: string) => {
    return value.replace(/[^\d+\-\(\)\s]/g, '');
  },
};

// Validation chains for common operations
export const validationChains = {
  // User registration
  registerUser: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('password')
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .withMessage('Password must be at least 8 characters with uppercase, lowercase, number, and special character'),
    body('phone')
      .optional()
      .isMobilePhone('any')
      .customSanitizer(sanitizers.sanitizePhone)
      .withMessage('Please provide a valid phone number'),
  ],

  // User login
  loginUser: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],

  // Create order
  createOrder: [
    body('symbol')
      .notEmpty()
      .custom(customValidators.isValidTradingPair)
      .withMessage('Please provide a valid trading pair (e.g., BTC/USDT)'),
    body('side')
      .notEmpty()
      .custom(customValidators.isValidOrderSide)
      .withMessage('Order side must be "buy" or "sell"'),
    body('type')
      .notEmpty()
      .custom(customValidators.isValidOrderType)
      .withMessage('Order type must be "market", "limit", "stop", or "stop-limit"'),
    body('quantity')
      .notEmpty()
      .custom(customValidators.isValidCryptoAmount)
      .withMessage('Please provide a valid quantity'),
    body('price')
      .optional()
      .custom(customValidators.isValidPrice)
      .withMessage('Please provide a valid price'),
  ],

  // Update user profile
  updateProfile: [
    body('firstName')
      .optional()
      .isLength({ min: 1, max: 50 })
      .customSanitizer(sanitizers.normalizeString)
      .withMessage('First name must be between 1 and 50 characters'),
    body('lastName')
      .optional()
      .isLength({ min: 1, max: 50 })
      .customSanitizer(sanitizers.normalizeString)
      .withMessage('Last name must be between 1 and 50 characters'),
    body('phone')
      .optional()
      .isMobilePhone('any')
      .customSanitizer(sanitizers.sanitizePhone)
      .withMessage('Please provide a valid phone number'),
    body('country')
      .optional()
      .isLength({ min: 2, max: 3 })
      .isUppercase()
      .withMessage('Please provide a valid country code'),
  ],

  // Create API key
  createApiKey: [
    body('name')
      .notEmpty()
      .isLength({ min: 1, max: 100 })
      .customSanitizer(sanitizers.normalizeString)
      .withMessage('API key name is required and must be between 1 and 100 characters'),
    body('permissions')
      .optional()
      .isArray()
      .withMessage('Permissions must be an array'),
    body('permissions.*')
      .optional()
      .isIn(['read', 'trade', 'withdraw', 'admin'])
      .withMessage('Invalid permission type'),
    body('ipWhitelist')
      .optional()
      .isArray()
      .withMessage('IP whitelist must be an array'),
    body('ipWhitelist.*')
      .optional()
      .custom(customValidators.isValidIP)
      .withMessage('Invalid IP address format'),
    body('expiresInDays')
      .optional()
      .custom(customValidators.isPositiveInteger)
      .withMessage('Expiration days must be a positive integer'),
  ],

  // Query parameters
  pagination: [
    query('page')
      .optional()
      .custom(customValidators.isPositiveInteger)
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .custom(customValidators.isPositiveInteger)
      .withMessage('Limit must be a positive integer'),
    query('sort')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort must be "asc" or "desc"'),
  ],

  // URL parameters
  userId: [
    param('userId')
      .notEmpty()
      .custom(customValidators.isValidUUID)
      .withMessage('Invalid user ID format'),
  ],

  orderId: [
    param('orderId')
      .notEmpty()
      .custom(customValidators.isPositiveInteger)
      .withMessage('Invalid order ID format'),
  ],

  symbol: [
    param('symbol')
      .notEmpty()
      .custom(customValidators.isValidTradingPair)
      .withMessage('Invalid trading pair format'),
  ],
};

// XSS protection middleware
export const xssProtection = xss();

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Sanitize body
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = sanitizers.sanitizeHtml(req.body[key]);
          req.body[key] = sanitizers.sanitizeSql(req.body[key]);
        }
      });
    }

    // Sanitize query parameters
    if (req.query) {
      Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
          req.query[key] = sanitizers.sanitizeHtml(req.query[key] as string);
          req.query[key] = sanitizers.sanitizeSql(req.query[key] as string);
        }
      });
    }

    // Sanitize URL parameters
    if (req.params) {
      Object.keys(req.params).forEach(key => {
        if (typeof req.params[key] === 'string') {
          req.params[key] = sanitizers.sanitizeHtml(req.params[key]);
          req.params[key] = sanitizers.sanitizeSql(req.params[key]);
        }
      });
    }

    next();
  } catch (error) {
    logError(error as Error, { operation: 'sanitizeInput' });
    next();
  }
};

// Validation error handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Log validation errors for security monitoring
    logSecurity('input_validation_failed', {
      path: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      errors: errors.array(),
    });

    return res.status(400).json({
      error: 'Validation failed',
      message: 'Please check your input and try again',
      details: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value,
      })),
    });
  }

  next();
};

// Generic validation middleware
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    handleValidationErrors(req, res, next);
  };
};

// Rate limiting for validation attempts
const validationAttempts = new Map<string, { count: number; resetTime: number }>();

export const validateWithRateLimit = (validations: ValidationChain[], maxAttempts = 10, windowMs = 15 * 60 * 1000) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || 'unknown';
    const now = Date.now();
    const key = `validation_${ip}`;
    
    const currentAttempts = validationAttempts.get(key);
    
    if (currentAttempts && currentAttempts.resetTime > now) {
      if (currentAttempts.count >= maxAttempts) {
        logSecurity('validation_rate_limit_exceeded', {
          ip,
          path: req.path,
          method: req.method,
        });
        
        return res.status(429).json({
          error: 'Too many validation attempts',
          message: 'Please try again later',
        });
      }
      currentAttempts.count++;
    } else {
      validationAttempts.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
    }

    await Promise.all(validations.map(validation => validation.run(req)));
    handleValidationErrors(req, res, next);
  };
};

// Clean up validation attempts
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of validationAttempts.entries()) {
    if (value.resetTime < now) {
      validationAttempts.delete(key);
    }
  }
}, 60000); // Clean up every minute

export default {
  validationChains,
  xssProtection,
  sanitizeInput,
  handleValidationErrors,
  validate,
  validateWithRateLimit,
  customValidators,
  sanitizers,
}; 