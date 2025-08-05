# Content Security Policy (CSP) Troubleshooting Guide

## 🔒 What is CSP?

Content Security Policy is a security feature that helps prevent:
- Cross-site scripting (XSS) attacks
- Data injection attacks
- Clickjacking
- Other code injection attacks

## 🚨 Common CSP Errors

### 1. **Supabase Connection Errors**
```
Refused to connect because it violates the document's Content Security Policy
```

**Solution**: Add Supabase domains to `connectSrc`:
```javascript
connectSrc: [
  "'self'",
  "https://*.supabase.co",
  "https://supabase.co",
  "https://your-project.supabase.co"
]
```

### 2. **External API Errors**
```
Fetch API cannot load [URL] because it violates CSP
```

**Solution**: Add API domains to `connectSrc`:
```javascript
connectSrc: [
  "'self'",
  "https://api.coingecko.com",
  "https://api.moralis.io",
  "https://fstream.binance.com"
]
```

### 3. **Script Loading Errors**
```
Refused to load the script because it violates CSP
```

**Solution**: Add script sources to `scriptSrc`:
```javascript
scriptSrc: [
  "'self'",
  "'unsafe-inline'",
  "'unsafe-eval'",
  "https://replit.com"
]
```

## 🔧 Current CSP Configuration

Your app's current CSP settings:

```javascript
contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    imgSrc: ["'self'", "data:", "https:"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://replit.com"],
    connectSrc: [
      "'self'", 
      "wss:", 
      "ws:", 
      "https://api.coingecko.com", 
      "https://api.moralis.io",
      "https://*.supabase.co",
      "https://supabase.co",
      "https://replit.com",
      "https://heldzockilbftitlcbac.supabase.co",
      "https://fstream.binance.com",
      "https://api.binance.com"
    ],
    frameSrc: ["'self'"],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: [],
  },
}
```

## 🛠️ How to Add New Domains

### Step 1: Identify the Error
Look for CSP errors in browser console:
```
Refused to connect to 'https://new-api.com' because it violates CSP
```

### Step 2: Add to Appropriate Directive
- **API calls**: Add to `connectSrc`
- **Scripts**: Add to `scriptSrc`
- **Styles**: Add to `styleSrc`
- **Images**: Add to `imgSrc`

### Step 3: Update Configuration
```javascript
// In server/index.ts
connectSrc: [
  "'self'",
  // ... existing domains
  "https://new-api.com"  // Add new domain here
]
```

### Step 4: Rebuild and Test
```bash
npm run build
npm run start
```

## 🎯 Common Domains for Crypto Apps

### **Price APIs**
- `https://api.coingecko.com`
- `https://api.moralis.io`
- `https://fstream.binance.com`
- `https://api.binance.com`

### **Authentication**
- `https://*.supabase.co`
- `https://supabase.co`

### **Development**
- `https://replit.com`
- `https://localhost:*`

### **WebSocket Connections**
- `wss:`
- `ws:`

## 🔍 Debugging CSP Issues

### 1. **Check Browser Console**
Look for CSP violation errors and note the blocked URLs.

### 2. **Use CSP Report-Only Mode**
Temporarily switch to report-only mode to see violations without blocking:
```javascript
contentSecurityPolicy: {
  reportOnly: true,
  directives: {
    // ... your directives
  }
}
```

### 3. **Test in Development**
CSP is less strict in development mode, so test in production build.

## 🚀 Production Deployment

### **For Railway/Render Deployment**
The current CSP configuration should work for production deployment.

### **For Custom Domains**
Update CORS settings when adding custom domains:
```javascript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com', 'https://www.your-domain.com']
    : ['http://localhost:5173', 'http://localhost:5002'],
  credentials: true,
  optionsSuccessStatus: 200
};
```

## ⚠️ Security Considerations

### **Avoid These in Production**
- `'unsafe-inline'` (if possible)
- `'unsafe-eval'` (if possible)
- Wildcard domains (`https://*`)

### **Best Practices**
- Use specific domains instead of wildcards
- Regularly audit allowed domains
- Remove unused domains
- Use nonces or hashes for inline scripts

## 🔧 Quick Fix Commands

### **Rebuild After CSP Changes**
```bash
npm run build
npm run start
```

### **Check for CSP Errors**
```bash
# Look for CSP violations in browser console
# Or check server logs for CSP-related errors
```

### **Test Specific Domain**
```bash
# Test if a domain is accessible
curl -I https://api.coingecko.com
```

## 📋 CSP Checklist

- [ ] Supabase domains added to `connectSrc`
- [ ] External APIs added to `connectSrc`
- [ ] WebSocket connections allowed (`wss:`, `ws:`)
- [ ] Development domains included
- [ ] Production domains configured
- [ ] No unnecessary `'unsafe-*'` directives
- [ ] CSP tested in production build

---

**Remember**: CSP errors are security features, not bugs. They help protect your app from attacks! 