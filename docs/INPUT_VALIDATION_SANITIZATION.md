# 🛡️ Input Validation and Sanitization

This document covers the comprehensive input validation and sanitization system for the CryptoExchange Frontend application.

## 📋 Overview

The input validation and sanitization system provides multiple layers of security to protect against:
- **SQL Injection**: Malicious SQL code injection
- **XSS (Cross-Site Scripting)**: Malicious script injection
- **Path Traversal**: Directory traversal attacks
- **Input Validation**: Invalid or malicious data
- **Data Sanitization**: Cleaning and normalizing inputs

## 🚀 Features

### ✅ Input Validation
- **Type validation**: Ensures correct data types
- **Format validation**: Validates data formats (email, phone, etc.)
- **Range validation**: Checks numeric ranges and limits
- **Custom validation**: Domain-specific validation rules
- **Real-time validation**: Immediate feedback on invalid inputs

### ✅ Input Sanitization
- **HTML sanitization**: Removes dangerous HTML tags and scripts
- **SQL sanitization**: Prevents SQL injection attempts
- **Path sanitization**: Prevents directory traversal attacks
- **String normalization**: Trims and normalizes text inputs
- **Character encoding**: Handles special characters safely

### ✅ Security Features
- **XSS protection**: Built-in XSS prevention
- **Rate limiting**: Prevents validation abuse
- **Error logging**: Comprehensive security event logging
- **Input size limits**: Prevents oversized payloads
- **Content filtering**: Filters malicious content

## 🔧 Configuration

### Validation Rules

#### Crypto Trading Validation
```typescript
// Trading pair validation
const tradingPairRegex = /^[A-Z0-9]{2,10}\/[A-Z0-9]{2,10}$/;
// Examples: BTC/USDT, ETH/USDC, SOL/USDT

// Crypto amount validation
const amountRegex = /^\d+(\.\d{1,8})?$/;
// Range: 0.00000001 to 999,999,999

// Price validation
const priceRegex = /^\d+(\.\d{1,8})?$/;
// Range: 0.00000001 to 999,999,999
```

#### User Input Validation
```typescript
// Email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password strength validation
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
// Requirements: 8+ chars, uppercase, lowercase, number, special char

// Phone number validation
const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
```

#### API Key Validation
```typescript
// API key format validation
const apiKeyRegex = /^cex_[a-f0-9]{32}$/;

// IP address validation
const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
```

### Sanitization Rules

#### HTML Sanitization
```typescript
// Remove dangerous HTML tags
const dangerousTags = [
  '<script>', '</script>',
  '<iframe>', '</iframe>',
  '<object>', '</object>',
  '<embed>', '</embed>'
];

// Remove event handlers
const eventHandlers = /on\w+\s*=/gi;

// Remove javascript protocol
const javascriptProtocol = /javascript:/gi;
```

#### SQL Sanitization
```typescript
// Remove SQL injection patterns
const sqlPatterns = [
  /['";]/g,           // Quotes and semicolons
  /--/g,              // SQL comments
  /\/\*/g,            // Block comments start
  /\*\//g,            // Block comments end
  /union\s+select/gi, // UNION SELECT
  /drop\s+table/gi,   // DROP TABLE
  /delete\s+from/gi,  // DELETE FROM
  /insert\s+into/gi,  // INSERT INTO
  /update\s+set/gi    // UPDATE SET
];
```

## 🛠️ Usage

### Basic Validation

#### Express Validator Integration
```typescript
import { validate, validationChains } from './validation-middleware';

// Apply validation to route
app.post('/api/orders', 
  validate(validationChains.createOrder),
  async (req, res) => {
    // Route handler - data is already validated
  }
);
```

#### Custom Validation
```typescript
import { body } from 'express-validator';

const customValidation = [
  body('customField')
    .isLength({ min: 1, max: 100 })
    .withMessage('Field must be between 1 and 100 characters')
    .custom((value) => {
      // Custom validation logic
      return true;
    })
    .withMessage('Custom validation failed')
];
```

### Sanitization

#### Automatic Sanitization
```typescript
import { sanitizeInput } from './validation-middleware';

// Apply sanitization middleware
app.use(sanitizeInput);

// All inputs are automatically sanitized
app.post('/api/data', (req, res) => {
  // req.body, req.query, req.params are sanitized
});
```

#### Manual Sanitization
```typescript
import { sanitizers } from './validation-middleware';

const userInput = '<script>alert("xss")</script>Hello World';
const sanitized = sanitizers.sanitizeHtml(userInput);
// Result: "Hello World"
```

## 📊 Validation Chains

### User Management
```typescript
// User registration
validationChains.registerUser = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).matches(passwordRegex),
  body('phone').optional().isMobilePhone('any')
];

// User login
validationChains.loginUser = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

// Update profile
validationChains.updateProfile = [
  body('firstName').optional().isLength({ min: 1, max: 50 }),
  body('lastName').optional().isLength({ min: 1, max: 50 }),
  body('phone').optional().isMobilePhone('any'),
  body('country').optional().isLength({ min: 2, max: 3 }).isUppercase()
];
```

### Trading Operations
```typescript
// Create order
validationChains.createOrder = [
  body('symbol').custom(isValidTradingPair),
  body('side').isIn(['buy', 'sell']),
  body('type').isIn(['market', 'limit', 'stop', 'stop-limit']),
  body('quantity').custom(isValidCryptoAmount),
  body('price').optional().custom(isValidPrice)
];

// Query parameters
validationChains.pagination = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('sort').optional().isIn(['asc', 'desc'])
];
```

### API Key Management
```typescript
// Create API key
validationChains.createApiKey = [
  body('name').isLength({ min: 1, max: 100 }),
  body('permissions').optional().isArray(),
  body('permissions.*').optional().isIn(['read', 'trade', 'withdraw', 'admin']),
  body('ipWhitelist').optional().isArray(),
  body('ipWhitelist.*').optional().custom(isValidIP),
  body('expiresInDays').optional().isInt({ min: 1 })
];
```

## 🔒 Security Features

### XSS Protection
```typescript
import { xssProtection } from './validation-middleware';

// Apply XSS protection middleware
app.use(xssProtection);

// Automatically cleans:
// - <script> tags
// - <iframe> tags
// - Event handlers (onclick, onload, etc.)
// - javascript: protocol
```

### Rate Limiting
```typescript
import { validateWithRateLimit } from './validation-middleware';

// Apply validation with rate limiting
app.post('/api/login',
  validateWithRateLimit(validationChains.loginUser, 5, 15 * 60 * 1000),
  async (req, res) => {
    // Max 5 attempts per 15 minutes
  }
);
```

### Error Handling
```typescript
import { handleValidationErrors } from './validation-middleware';

// Automatic error handling
app.use(handleValidationErrors);

// Returns structured error responses:
{
  "error": "Validation failed",
  "message": "Please check your input and try again",
  "details": [
    {
      "field": "email",
      "message": "Please provide a valid email address",
      "value": "invalid-email"
    }
  ]
}
```

## 📈 Monitoring and Logging

### Security Events
```typescript
// Validation failures are logged
logSecurity('input_validation_failed', {
  path: req.path,
  method: req.method,
  ip: req.ip,
  userAgent: req.get('User-Agent'),
  errors: errors.array()
});

// Rate limit violations
logSecurity('validation_rate_limit_exceeded', {
  ip: req.ip,
  path: req.path,
  method: req.method
});
```

### Log Analysis
```bash
# View validation errors
npm run logs:errors | grep -i "validation"

# View security events
npm run logs:analyze
```

## 🧪 Testing

### Run Validation Tests
```bash
# Test all validation rules
npm run test:validation

# Test specific validation
npm run test:validation -- --filter="crypto"

# Test sanitization
npm run test:validation -- --filter="sanitization"
```

### Test Coverage
- ✅ **Crypto symbol validation**: BTC, ETH, etc.
- ✅ **Trading pair validation**: BTC/USDT, ETH/USDC
- ✅ **Amount validation**: Decimal numbers with limits
- ✅ **Order type validation**: market, limit, stop, stop-limit
- ✅ **Email validation**: Standard email format
- ✅ **Password strength**: 8+ chars, mixed case, numbers, symbols
- ✅ **HTML sanitization**: Script tags, iframes, event handlers
- ✅ **SQL sanitization**: Injection patterns, comments
- ✅ **Path sanitization**: Directory traversal, invalid chars
- ✅ **String normalization**: Trimming, case conversion

## 🛡️ Security Best Practices

### For Developers
1. **Always validate inputs**: Use validation chains for all user inputs
2. **Sanitize before storage**: Clean data before database operations
3. **Use parameterized queries**: Prevent SQL injection with Drizzle ORM
4. **Validate on both client and server**: Client validation for UX, server for security
5. **Log security events**: Monitor validation failures and suspicious activity

### For Administrators
1. **Monitor validation logs**: Watch for patterns of validation failures
2. **Set appropriate rate limits**: Prevent brute force attacks
3. **Review security events**: Regular review of security logs
4. **Update validation rules**: Keep rules current with new threats
5. **Test security measures**: Regular penetration testing

### For Users
1. **Use strong passwords**: Follow password requirements
2. **Validate inputs**: Check data before submission
3. **Report suspicious activity**: Contact support for security concerns
4. **Keep software updated**: Use latest browser versions
5. **Enable 2FA**: Additional security layer

## 🚨 Incident Response

### Validation Attack Detection
1. **Monitor error rates**: Sudden increase in validation failures
2. **Check IP patterns**: Multiple failures from same IP
3. **Review user agents**: Suspicious browser signatures
4. **Analyze payloads**: Look for injection patterns
5. **Block malicious IPs**: Temporary or permanent blocking

### Response Procedures
1. **Immediate blocking**: Block IPs with suspicious activity
2. **Log analysis**: Review logs for attack patterns
3. **System hardening**: Update validation rules if needed
4. **User notification**: Alert users if accounts compromised
5. **Post-incident review**: Document lessons learned

## 📋 Checklist

### Implementation Checklist
- [ ] Input validation middleware installed
- [ ] Sanitization middleware configured
- [ ] Validation chains defined for all endpoints
- [ ] Error handling middleware active
- [ ] Rate limiting configured
- [ ] Security logging enabled
- [ ] XSS protection active
- [ ] SQL injection prevention active

### Security Checklist
- [ ] All user inputs validated
- [ ] All inputs sanitized before processing
- [ ] Validation rules comprehensive
- [ ] Error messages don't leak information
- [ ] Rate limiting prevents abuse
- [ ] Security events logged
- [ ] Regular security testing
- [ ] Incident response procedures defined

### Testing Checklist
- [ ] Validation rules tested
- [ ] Sanitization functions tested
- [ ] Error handling tested
- [ ] Rate limiting tested
- [ ] Security logging tested
- [ ] XSS protection tested
- [ ] SQL injection prevention tested
- [ ] Performance impact assessed

## 🔗 Resources

- [OWASP Input Validation](https://owasp.org/www-project-proactive-controls/v3/en/c5-validate-inputs)
- [Express Validator Documentation](https://express-validator.github.io/docs/)
- [XSS Prevention](https://owasp.org/www-project-cheat-sheets/cheat_sheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [SQL Injection Prevention](https://owasp.org/www-project-cheat-sheets/cheat_sheets/SQL_Injection_Prevention_Cheat_Sheet.html)
- [Input Validation Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)

## 📝 Notes

- **Validation is mandatory**: All user inputs must be validated
- **Sanitization is automatic**: All inputs are sanitized by default
- **Error messages are safe**: No sensitive information in error responses
- **Rate limiting is active**: Prevents validation abuse
- **Logging is comprehensive**: All security events are logged
- **Testing is regular**: Validation system is tested regularly
- **Updates are automatic**: Security rules are updated as needed 