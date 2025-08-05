# 🔑 API Key Management & Security

This document covers the comprehensive API key management system for the CryptoExchange Frontend application.

## 📋 Overview

The API key system provides secure access to the trading API with features including:
- **Secure key generation** with cryptographic randomness
- **Permission-based access control** (read, trade, withdraw, admin)
- **Automatic key rotation** and expiration management
- **IP whitelisting** for enhanced security
- **Usage tracking** and security monitoring
- **Rate limiting** to prevent abuse

## 🚀 Features

### ✅ Key Generation & Security
- **Cryptographic randomness**: 32-character API keys + 64-character secret keys
- **Secure storage**: Secret keys are hashed using SHA-256
- **Unique constraints**: Each API key is globally unique
- **Prefix system**: All keys start with `cex_` for easy identification

### ✅ Permission System
- **read**: View account, portfolio, orders (GET requests)
- **trade**: Place and cancel orders (GET, POST, DELETE)
- **withdraw**: Full trading access + withdrawal capabilities
- **admin**: Complete system access (all HTTP methods)

### ✅ Security Features
- **IP whitelisting**: Restrict key usage to specific IP addresses
- **Automatic expiration**: Keys expire after configurable time (default: 1 year)
- **Usage tracking**: Monitor key usage patterns and detect anomalies
- **Rate limiting**: Prevent API abuse with configurable limits
- **Security logging**: All key events are logged for monitoring

### ✅ Key Rotation & Management
- **Automatic rotation**: Keys older than 90 days are flagged for rotation
- **Manual rotation**: Users can rotate keys on demand
- **Cleanup**: Inactive keys (180+ days) are automatically revoked
- **Expiration handling**: Expired keys are automatically rotated

## 🔧 Configuration

### API Key Settings

```typescript
const API_KEY_CONFIG = {
  prefix: 'cex',
  length: 32,
  expiresIn: 365, // 1 year
  maxKeysPerUser: 5,
  rotationDays: 90, // Rotate every 90 days
  permissions: {
    read: ['GET'],
    trade: ['GET', 'POST'],
    withdraw: ['GET', 'POST', 'DELETE'],
    admin: ['GET', 'POST', 'PUT', 'DELETE'],
  },
};
```

### Environment Variables

```bash
# API Key security settings
API_KEY_MAX_PER_USER=5
API_KEY_EXPIRY_DAYS=365
API_KEY_ROTATION_DAYS=90
API_KEY_INACTIVE_DAYS=180
```

## 🛠️ API Endpoints

### Web Interface (Session-based)

#### Get User API Keys
```http
GET /api/user-api-keys
Authorization: Bearer <session-token>
```

#### Create API Key
```http
POST /api/user-api-keys
Authorization: Bearer <session-token>
Content-Type: application/json

{
  "name": "Trading Bot API Key",
  "permissions": ["read", "trade"],
  "ipWhitelist": ["192.168.1.100"],
  "expiresInDays": 365
}
```

#### Rotate API Key
```http
POST /api/user-api-keys/:keyId/rotate
Authorization: Bearer <session-token>
```

#### Revoke API Key
```http
DELETE /api/user-api-keys/:keyId
Authorization: Bearer <session-token>
```

### API Access (API Key-based)

#### Get Account Information
```http
GET /api/v1/account
X-API-Key: cex_<your-api-key>
```

#### Get Portfolio
```http
GET /api/v1/portfolio
X-API-Key: cex_<your-api-key>
```

#### Get Orders
```http
GET /api/v1/orders?limit=50
X-API-Key: cex_<your-api-key>
```

#### Place Order
```http
POST /api/v1/orders
X-API-Key: cex_<your-api-key>
Content-Type: application/json

{
  "symbol": "BTC/USDT",
  "side": "buy",
  "type": "limit",
  "quantity": "0.001",
  "price": "50000"
}
```

#### Cancel Order
```http
DELETE /api/v1/orders/:orderId
X-API-Key: cex_<your-api-key>
```

## 🔒 Security Headers

### Required Headers
- `X-API-Key`: Your API key (preferred)
- `Authorization`: Bearer token format (alternative)

### Response Headers
- `X-RateLimit-Limit`: Maximum requests per window
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Time when rate limit resets

## 📊 Rate Limiting

### Default Limits
- **Read operations**: 1000 requests per 15 minutes
- **Trade operations**: 100 requests per 15 minutes
- **Admin operations**: 50 requests per 15 minutes

### Rate Limit Response
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Limit: 100 requests per 900 seconds"
}
```

## 🧪 Testing

### Generate Test API Key
```bash
# Generate test key for a user
npm run api-keys:generate-test <userId> "Test Key Name"

# Example output:
# ✅ Test API key generated:
#    API Key: cex_a1b2c3d4e5f6...
#    Secret Key: s1e2c3r4e5t6...
#    Key ID: 123
#    Expires: 2024-02-15T10:30:00.000Z
```

### Test API Key Usage
```bash
# Test account endpoint
curl -H "X-API-Key: cex_<your-api-key>" \
     https://your-domain.com/api/v1/account

# Test portfolio endpoint
curl -H "X-API-Key: cex_<your-api-key>" \
     https://your-domain.com/api/v1/portfolio

# Test order placement
curl -X POST \
     -H "X-API-Key: cex_<your-api-key>" \
     -H "Content-Type: application/json" \
     -d '{"symbol":"BTC/USDT","side":"buy","type":"limit","quantity":"0.001","price":"50000"}' \
     https://your-domain.com/api/v1/orders
```

## 🔧 Management Commands

### View API Key Statistics
```bash
npm run api-keys:stats
```

### Rotate Expired Keys
```bash
npm run api-keys:rotate-expired
```

### Rotate Old Keys (90+ days)
```bash
npm run api-keys:rotate-old
```

### Clean Up Inactive Keys
```bash
npm run api-keys:cleanup
```

### Generate Test Key
```bash
npm run api-keys:generate-test <userId> [name]
```

## 📈 Monitoring & Logging

### Security Events Logged
- `api_key_created`: New key generation
- `api_key_rotated`: Key rotation (manual/automatic)
- `api_key_revoked`: Key revocation
- `api_key_validation_failed`: Failed authentication attempts
- `api_key_permission_denied`: Insufficient permissions
- `api_key_rate_limit_exceeded`: Rate limit violations
- `api_key_ip_violation`: IP whitelist violations

### Log Analysis
```bash
# View API key security events
npm run logs:errors | grep -i "api_key"

# View recent security events
npm run logs:analyze
```

## 🛡️ Security Best Practices

### For Users
1. **Keep keys secure**: Never share API keys or commit them to code
2. **Use IP whitelisting**: Restrict keys to specific IP addresses
3. **Regular rotation**: Rotate keys every 90 days
4. **Minimal permissions**: Use the least privileged permissions needed
5. **Monitor usage**: Regularly check key usage and security logs

### For Developers
1. **Secure storage**: Store API keys in environment variables or secure vaults
2. **Key rotation**: Implement automatic key rotation in applications
3. **Error handling**: Handle rate limits and authentication errors gracefully
4. **Logging**: Log API key usage for monitoring and debugging
5. **Testing**: Use test keys for development and testing

### For Administrators
1. **Regular monitoring**: Monitor API key usage and security events
2. **Automatic cleanup**: Run cleanup scripts regularly
3. **Security alerts**: Set up alerts for suspicious activity
4. **Audit trails**: Maintain comprehensive audit logs
5. **Incident response**: Have procedures for key compromise

## 🚨 Incident Response

### Key Compromise
1. **Immediate revocation**: Revoke compromised keys immediately
2. **Investigation**: Review security logs for unauthorized usage
3. **User notification**: Notify affected users
4. **Key rotation**: Generate new keys for affected users
5. **Security review**: Review and update security measures

### Rate Limit Abuse
1. **Temporary suspension**: Suspend abusive API keys
2. **Investigation**: Review usage patterns
3. **User contact**: Contact users about usage patterns
4. **Rate limit adjustment**: Adjust limits if necessary
5. **Monitoring**: Increase monitoring for affected keys

## 📋 Checklist

### Setup Checklist
- [ ] API key system configured
- [ ] Database tables created
- [ ] Security policies enabled
- [ ] Rate limiting configured
- [ ] Monitoring set up
- [ ] Documentation complete

### Security Checklist
- [ ] Keys are cryptographically secure
- [ ] Secret keys are properly hashed
- [ ] IP whitelisting enabled
- [ ] Rate limiting active
- [ ] Security logging configured
- [ ] Automatic rotation enabled
- [ ] Cleanup procedures in place

### Monitoring Checklist
- [ ] Security events logged
- [ ] Usage patterns tracked
- [ ] Rate limit monitoring
- [ ] Expiration alerts
- [ ] Suspicious activity detection
- [ ] Regular security reviews

## 🔗 Resources

- [API Security Best Practices](https://owasp.org/www-project-api-security/)
- [Rate Limiting Strategies](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)
- [JWT Security](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [API Key Management](https://www.nginx.com/blog/deploying-nginx-plus-as-an-api-gateway-part-2-protecting-backend-services/)

## 📝 Notes

- API keys are **cryptographically secure** and globally unique
- Secret keys are **only shown once** during creation/rotation
- **Automatic rotation** helps maintain security
- **IP whitelisting** provides additional security layer
- **Rate limiting** prevents API abuse
- **Security logging** enables monitoring and incident response 