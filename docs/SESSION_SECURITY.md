# 🔐 Session Security Configuration

This document covers the comprehensive session security system for the CryptoExchange Frontend application.

## 📋 Overview

The session security system provides secure session management with PostgreSQL storage, protecting against:
- **Session Hijacking**: Unauthorized session access
- **Session Fixation**: Session ID manipulation
- **CSRF Attacks**: Cross-site request forgery
- **Session Replay**: Reusing expired sessions
- **Brute Force**: Session ID guessing attacks
- **Session Pollution**: Malicious session data injection

## 🚀 Features

### ✅ Secure Session Management
- **PostgreSQL Storage**: Persistent session storage in database
- **Secure Cookies**: HttpOnly, Secure, SameSite attributes
- **Session Regeneration**: Automatic session ID rotation
- **Session Expiration**: Configurable timeout periods
- **Session Cleanup**: Automatic expired session removal

### ✅ Session Security Monitoring
- **Access Logging**: Track session creation and access
- **Suspicious Activity Detection**: Monitor for unusual patterns
- **IP Tracking**: Log IP changes and geographic anomalies
- **User Agent Monitoring**: Track browser/client changes
- **Rate Limiting**: Prevent session abuse

### ✅ Session Validation
- **Session Integrity**: Validate session data integrity
- **Expiration Checking**: Automatic session expiration
- **User Validation**: Verify user permissions and status
- **Device Tracking**: Monitor device changes
- **Geographic Validation**: Track location changes

## 🔧 Configuration

### Environment Variables

```bash
# Session Configuration
SESSION_SECRET=your-very-long-and-secure-session-secret-key
SESSION_DOMAIN=.eqadvertise.com  # For subdomain support
NODE_ENV=production              # Enable production security
```

### Production Configuration

```typescript
const productionSessionConfig = {
  secret: process.env.SESSION_SECRET,
  name: 'cex.sid',                    // Custom cookie name
  resave: false,                      // Don't save if unmodified
  saveUninitialized: false,           // Don't create until needed
  cookie: {
    secure: true,                     // HTTPS only
    httpOnly: true,                   // No client access
    sameSite: 'strict',               // CSRF protection
    maxAge: 24 * 60 * 60 * 1000,      // 24 hours
    domain: process.env.SESSION_DOMAIN,
    path: '/',
  },
  store: new PostgresStore({
    tableName: 'user_sessions',
    createTableIfMissing: true,
    pruneSessionInterval: 60,         // Cleanup every 60 seconds
    ttl: 24 * 60 * 60,               // 24 hour TTL
  }),
  rolling: true,                      // Extend on each request
  unset: 'destroy',                   // Destroy when unset
  proxy: true,                        // Trust proxy
};
```

### Development Configuration

```typescript
const developmentSessionConfig = {
  secret: process.env.SESSION_SECRET,
  name: 'cex.sid',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,                    // Allow HTTP in dev
    httpOnly: true,
    sameSite: 'lax',                  // Less strict for dev
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
  },
  store: new PostgresStore({
    tableName: 'user_sessions',
    createTableIfMissing: true,
    pruneSessionInterval: 60,
    ttl: 24 * 60 * 60,
  }),
  rolling: true,
  unset: 'destroy',
  proxy: false,                       // Don't trust proxy in dev
};
```

## 🛠️ Usage

### Basic Session Management

#### Session Creation
```typescript
// Login endpoint
app.post('/api/login', async (req, res) => {
  // Validate credentials
  const user = await validateCredentials(email, password);
  
  // Create session
  req.session.userId = user.id;
  req.session.userEmail = user.email;
  req.session.createdAt = new Date().toISOString();
  
  res.json({ message: 'Login successful' });
});
```

#### Session Validation
```typescript
// Protected route
app.get('/api/profile', validateSession, async (req, res) => {
  const userId = req.session.userId;
  const user = await getUserById(userId);
  res.json(user);
});
```

#### Session Destruction
```typescript
// Logout endpoint
app.post('/api/logout', async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logout successful' });
  });
});
```

### Session Security Middleware

#### Automatic Security Features
```typescript
// Session security middleware (applied automatically)
app.use(sessionSecurityMiddleware);  // Log session events
app.use(sessionCleanup);             // Clean up on logout
app.use(sessionMonitoring);          // Monitor suspicious activity
```

#### Manual Session Validation
```typescript
// Custom session validation
app.use('/api/admin', validateSession, (req, res, next) => {
  // Additional admin checks
  if (!req.session.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
});
```

## 📊 Session Security Headers

### Automatic Headers
```typescript
// Session security headers (applied automatically)
{
  'X-Session-Timeout': '86400',           // 24 hours
  'X-Session-Secure': 'true',             // HTTPS required
  'X-Session-HttpOnly': 'true',           // No client access
  'X-Session-SameSite': 'strict',         // CSRF protection
}
```

### Cookie Security
```typescript
// Secure cookie configuration
{
  secure: true,        // HTTPS only
  httpOnly: true,      // No JavaScript access
  sameSite: 'strict',  // CSRF protection
  maxAge: 86400000,    // 24 hours
  domain: '.eqadvertise.com',  // Subdomain support
  path: '/',           // Root path
}
```

## 🔒 Security Features

### Session Hijacking Protection
```typescript
// Multiple layers of protection
1. HttpOnly cookies (no client-side access)
2. Secure cookies (HTTPS only)
3. SameSite cookies (CSRF protection)
4. Session ID regeneration
5. IP tracking and validation
6. User agent monitoring
```

### Session Fixation Protection
```typescript
// Automatic session regeneration
app.post('/api/login', async (req, res) => {
  // Regenerate session after successful login
  req.session.regenerate((err) => {
    if (err) {
      return res.status(500).json({ error: 'Login failed' });
    }
    
    // Set session data
    req.session.userId = user.id;
    req.session.userEmail = user.email;
    
    res.json({ message: 'Login successful' });
  });
});
```

### CSRF Protection
```typescript
// SameSite cookie protection
cookie: {
  sameSite: 'strict',  // Blocks cross-site requests
  secure: true,        // HTTPS only
  httpOnly: true,      // No client access
}
```

### Rate Limiting
```typescript
// Session-based rate limiting
const sessionRateLimit = {
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                  // 100 requests per session
  keyGenerator: (req) => req.sessionID || req.ip,
  handler: (req, res) => {
    logSecurity('session_rate_limit_exceeded', {
      sessionId: req.sessionID,
      userId: req.session?.userId,
      ip: req.ip,
    });
    res.status(429).json({ error: 'Too many requests' });
  },
};
```

## 📈 Monitoring and Logging

### Security Events
```typescript
// Session security events logged
logSecurity('session_created', {
  sessionId: req.sessionID,
  userId: req.session.userId,
  ip: req.ip,
  userAgent: req.get('User-Agent'),
});

logSecurity('session_suspicious_activity', {
  sessionId: req.sessionID,
  userId: req.session.userId,
  ip: req.ip,
  lastIP: req.session.lastIP,
  timeDiff: timeDiff,
});

logSecurity('session_expired', {
  sessionId: req.sessionID,
  userId: req.session.userId,
  ip: req.ip,
});
```

### Session Statistics
```typescript
// Get session statistics
const stats = await sessionUtils.getSessionStats(store);
// Returns: { totalSessions, activeSessions, expiredSessions }

// Clean up expired sessions
const cleanedCount = await sessionUtils.cleanupExpiredSessions(store);
// Returns: number of sessions cleaned
```

## 🧪 Testing

### Run Session Security Tests
```bash
# Test all session security features
npm run test:session

# Test specific features
npm run test:session -- --filter="validation"
npm run test:session -- --filter="monitoring"
```

### Test Coverage
- ✅ **Session secret generation**: Secure random secrets
- ✅ **Configuration validation**: Production vs development
- ✅ **Security headers**: Proper header configuration
- ✅ **Session validation**: ID, user, expiration checks
- ✅ **Rate limiting**: Request limits and abuse prevention
- ✅ **Session monitoring**: Access patterns and suspicious activity
- ✅ **Cookie security**: HttpOnly, Secure, SameSite attributes
- ✅ **Session cleanup**: Expired session removal

## 🛡️ Security Best Practices

### For Developers
1. **Always validate sessions**: Use `validateSession` middleware
2. **Regenerate sessions**: After login and privilege changes
3. **Set secure cookies**: Use HTTPS and proper attributes
4. **Monitor session activity**: Log suspicious patterns
5. **Clean up sessions**: Remove expired sessions regularly

### For Administrators
1. **Use strong secrets**: Generate cryptographically secure secrets
2. **Monitor session logs**: Watch for suspicious activity
3. **Set appropriate timeouts**: Balance security and usability
4. **Review session statistics**: Monitor session usage patterns
5. **Update session policies**: Keep security policies current

### For Users
1. **Logout properly**: Always use logout endpoint
2. **Use HTTPS**: Ensure secure connections
3. **Clear cookies**: Clear browser cookies regularly
4. **Report suspicious activity**: Contact support for concerns
5. **Use trusted devices**: Avoid public computers for sensitive operations

## 🚨 Incident Response

### Session Attack Detection
1. **Monitor session logs**: Watch for unusual patterns
2. **Check IP changes**: Sudden geographic changes
3. **Review user agents**: Unexpected browser changes
4. **Analyze access times**: Unusual access patterns
5. **Check session counts**: Multiple active sessions

### Response Procedures
1. **Immediate session invalidation**: Destroy compromised sessions
2. **User notification**: Alert users of suspicious activity
3. **IP blocking**: Block suspicious IP addresses
4. **Session analysis**: Review session logs for patterns
5. **Security review**: Update security measures if needed

## 📋 Checklist

### Implementation Checklist
- [ ] Session middleware configured
- [ ] PostgreSQL session store setup
- [ ] Security headers configured
- [ ] Cookie security enabled
- [ ] Session validation middleware active
- [ ] Rate limiting configured
- [ ] Security logging enabled
- [ ] Session cleanup scheduled

### Security Checklist
- [ ] Strong session secrets used
- [ ] Secure cookies configured
- [ ] CSRF protection enabled
- [ ] Session expiration set
- [ ] Session regeneration implemented
- [ ] Suspicious activity monitoring
- [ ] Rate limiting active
- [ ] Session cleanup automated

### Testing Checklist
- [ ] Session creation tested
- [ ] Session validation tested
- [ ] Session expiration tested
- [ ] Session cleanup tested
- [ ] Rate limiting tested
- [ ] Security headers tested
- [ ] Cookie security tested
- [ ] Monitoring tested

## 🔗 Resources

- [OWASP Session Management](https://owasp.org/www-project-cheat-sheets/cheat_sheets/Session_Management_Cheat_Sheet.html)
- [Express Session Documentation](https://github.com/expressjs/session)
- [Connect PG Simple](https://github.com/voxpelli/node-connect-pg-simple)
- [Session Security Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [CSRF Protection](https://owasp.org/www-project-cheat-sheets/cheat_sheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)

## 📝 Notes

- **Sessions are secure by default**: All security features enabled
- **PostgreSQL storage**: Sessions persist across server restarts
- **Automatic cleanup**: Expired sessions removed automatically
- **Comprehensive logging**: All session events logged for security
- **Rate limiting**: Prevents session abuse and brute force
- **Monitoring active**: Suspicious activity detected automatically
- **CSRF protected**: SameSite cookies prevent cross-site attacks
- **XSS protected**: HttpOnly cookies prevent client-side access 