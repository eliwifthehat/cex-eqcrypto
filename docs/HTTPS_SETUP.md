# 🔒 HTTPS Setup & Configuration

This document covers the HTTPS configuration for the CryptoExchange Frontend application.

## 📋 Overview

The application is configured with comprehensive HTTPS security including:
- Automatic HTTP to HTTPS redirects
- Strict Transport Security (HSTS)
- Security headers
- Request validation
- Security logging

## 🚀 Features

### ✅ HTTPS Redirects
- **Automatic redirects**: HTTP requests automatically redirect to HTTPS
- **Load balancer support**: Trusts `X-Forwarded-Proto` headers
- **Cloud provider support**: Works with AWS, Azure, Railway, Vercel
- **Security logging**: All redirects are logged for monitoring

### ✅ Security Headers
- **HSTS**: Strict Transport Security (1 year, includeSubDomains, preload)
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-XSS-Protection**: XSS protection
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Restricts browser features
- **Cross-Origin Policies**: Enhanced security for cross-origin requests

### ✅ Request Validation
- **HTTPS enforcement**: All requests must use HTTPS in production
- **Host validation**: Only allowed hosts are accepted
- **Security logging**: Violations are logged for monitoring

## 🔧 Configuration

### Environment Variables

```bash
# Production environment
NODE_ENV=production

# Domain configuration (update these for your domain)
ALLOWED_HOSTS=cex.eqadvertise.com,www.cex.eqadvertise.com
```

### HTTPS Configuration File

The main configuration is in `server/https-config.ts`:

```typescript
export const httpsConfig: HTTPSConfig = {
  enabled: process.env.NODE_ENV === 'production',
  redirectHttp: true,
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  allowedHosts: [
    'cex.eqadvertise.com',
    'www.cex.eqadvertise.com',
    // Add your production domains here
  ],
  // ... security headers configuration
};
```

## 🧪 Testing

### Test HTTPS Configuration

```bash
# Test HTTPS redirects and security headers
npm run test:https
```

This will test:
- HTTP to HTTPS redirects
- Direct HTTPS access
- Security headers presence
- SSL certificate validity

### Manual Testing

```bash
# Test HTTP redirect
curl -I http://cex.eqadvertise.com

# Test HTTPS access
curl -I https://cex.eqadvertise.com

# Test security headers
curl -I https://cex.eqadvertise.com | grep -E "(Strict-Transport-Security|X-Content-Type-Options|X-Frame-Options)"
```

## 🚀 Deployment Platforms

### Railway
Railway automatically provides SSL certificates for custom domains.

**Setup:**
1. Add custom domain in Railway dashboard
2. Update DNS records
3. Wait for SSL certificate provisioning
4. Test with `npm run test:https`

### Vercel
Vercel provides automatic SSL certificates.

**Setup:**
1. Deploy to Vercel
2. Add custom domain in Vercel dashboard
3. Update DNS records
4. SSL certificate is automatically provisioned

### AWS/CloudFront
For AWS deployments with CloudFront:

**Setup:**
1. Configure CloudFront distribution
2. Request SSL certificate in AWS Certificate Manager
3. Attach certificate to CloudFront
4. Configure origin protocol policy

## 🔍 Monitoring

### Security Logs

HTTPS-related events are logged to:
- `logs/combined-*.log`: All application logs
- `logs/error-*.log`: Error logs including HTTPS violations

### Log Events

```typescript
// HTTP to HTTPS redirect
logSecurity('http_to_https_redirect', {
  originalUrl: '/api/users',
  userAgent: 'Mozilla/5.0...',
  ip: '192.168.1.1',
  referer: 'http://example.com',
});

// HTTPS violation
logSecurity('https_violation', {
  timestamp: '2024-01-15T10:30:00Z',
  ip: '192.168.1.1',
  host: 'invalid-domain.com',
  url: '/api/data',
  reason: 'invalid_https_request',
});
```

### Monitoring Commands

```bash
# Check for HTTPS violations
npm run logs:errors | grep -i https

# Monitor security events
npm run logs:analyze
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. SSL Certificate Not Working
```bash
# Check certificate
openssl s_client -connect cex.eqadvertise.com:443 -servername cex.eqadvertise.com

# Verify certificate chain
openssl x509 -in certificate.crt -text -noout
```

#### 2. Redirect Loop
- Check if load balancer is properly forwarding headers
- Verify `X-Forwarded-Proto` header is set correctly
- Check for conflicting redirect rules

#### 3. Security Headers Missing
- Ensure `NODE_ENV=production`
- Check if Helmet middleware is properly configured
- Verify HTTPS configuration is enabled

#### 4. Host Validation Failing
- Update `allowedHosts` in `https-config.ts`
- Check DNS resolution
- Verify domain configuration

### Debug Commands

```bash
# Test HTTPS configuration
npm run test:https

# Check server logs
npm run logs:analyze

# Test specific URL
curl -v https://cex.eqadvertise.com

# Check SSL certificate
echo | openssl s_client -servername cex.eqadvertise.com -connect cex.eqadvertise.com:443 2>/dev/null | openssl x509 -noout -dates
```

## 📊 Security Checklist

- [ ] SSL certificate installed and valid
- [ ] HTTP to HTTPS redirects working
- [ ] HSTS header present and configured
- [ ] Security headers implemented
- [ ] Host validation enabled
- [ ] Security logging configured
- [ ] HTTPS testing passing
- [ ] Monitoring alerts set up

## 🔗 Resources

- [Mozilla Security Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers#security)
- [HSTS Preload List](https://hstspreload.org/)
- [SSL Labs SSL Test](https://www.ssllabs.com/ssltest/)
- [Security Headers Check](https://securityheaders.com/)

## 📝 Notes

- HTTPS is **enforced** in production mode
- Development mode allows HTTP for local development
- All HTTPS violations are logged for security monitoring
- Security headers are automatically applied in production
- HSTS preload is enabled for maximum security 