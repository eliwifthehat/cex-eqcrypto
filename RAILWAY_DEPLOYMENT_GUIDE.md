# Railway Deployment Guide with Custom Domain

## 🚀 Deploy to Railway

### Step 1: Create Railway Account
1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Create a new project

### Step 2: Connect Your Repository
1. Click "Deploy from GitHub repo"
2. Select your `CryptoExchangeFrontend` repository
3. Railway will automatically detect your project

### Step 3: Configure Environment Variables
In Railway dashboard, add these environment variables:

```bash
# Database Configuration (Railway will provide this)
DATABASE_URL=postgresql://...

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Server Configuration
NODE_ENV=production
PORT=3000

# Session Configuration
SESSION_SECRET=your-generated-session-secret
```

### Step 4: Add PostgreSQL Database
1. In Railway dashboard, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically set `DATABASE_URL`

### Step 5: Configure Build Settings
Railway will auto-detect your build settings, but verify:
- **Build Command**: `npm run build`
- **Start Command**: `npm run start`
- **Health Check Path**: `/`

## 🌐 Custom Domain Setup: `cex.eqadvertise.com`

### Step 1: Configure Domain in Railway
1. Go to your Railway project dashboard
2. Click on your deployed service
3. Go to "Settings" → "Domains"
4. Click "Generate Domain" (this gives you a Railway subdomain)
5. Click "Custom Domain"
6. Enter: `cex.eqadvertise.com`
7. Railway will provide DNS records to configure

### Step 2: Configure DNS Records
In your domain registrar (where `eqadvertise.com` is registered):

**Option A: CNAME Record (Recommended)**
```
Type: CNAME
Name: cex
Value: your-railway-app.railway.app
TTL: 3600 (or default)
```

**Option B: A Record (If Railway provides IP)**
```
Type: A
Name: cex
Value: [Railway IP address]
TTL: 3600
```

### Step 3: Update CORS Configuration
Update your server CORS settings for the new domain:

```typescript
// In server/index.ts
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://cex.eqadvertise.com', 'https://www.cex.eqadvertise.com']
    : ['http://localhost:5173', 'http://localhost:5002'],
  credentials: true,
  optionsSuccessStatus: 200
};
```

### Step 4: Update Supabase Settings
1. Go to Supabase Dashboard → Settings → API
2. Add `https://cex.eqadvertise.com` to allowed origins
3. Update redirect URLs if needed

## 🔒 SSL Certificate
Railway automatically provides SSL certificates for custom domains.

## 📊 Monitoring Your Deployment

### Railway Dashboard Features:
- ✅ Real-time logs
- ✅ Performance metrics
- ✅ Environment variable management
- ✅ Database management
- ✅ Automatic deployments from Git

### Health Checks:
Railway will automatically monitor your app at the health check path.

## 💰 Cost Estimation
- **Railway**: $5/month credit (usually covers small apps)
- **Supabase**: Free tier available
- **Domain**: Your existing `eqadvertise.com` domain

## 🚀 Alternative: Render Deployment

If you prefer Render:

### Step 1: Create Render Account
1. Go to [Render.com](https://render.com)
2. Sign up with GitHub
3. Create new "Web Service"

### Step 2: Connect Repository
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set start command: `npm run start`

### Step 3: Add PostgreSQL
1. Create new "PostgreSQL" service
2. Connect it to your web service
3. Render will set `DATABASE_URL` automatically

### Step 4: Custom Domain
1. Go to your web service settings
2. Add custom domain: `cex.eqadvertise.com`
3. Configure DNS records as provided by Render

## 🔧 Troubleshooting

### Common Issues:
1. **DNS Propagation**: Can take up to 48 hours
2. **CORS Errors**: Make sure domain is in CORS settings
3. **Database Connection**: Verify `DATABASE_URL` is set
4. **WebSocket Issues**: Railway/Render support WebSockets

### Testing Your Domain:
```bash
# Test if domain resolves
nslookup cex.eqadvertise.com

# Test HTTPS
curl -I https://cex.eqadvertise.com

# Test WebSocket (if needed)
wscat -c wss://cex.eqadvertise.com
```

## 📋 Deployment Checklist

- [ ] Railway/Render account created
- [ ] Repository connected
- [ ] Environment variables configured
- [ ] PostgreSQL database added
- [ ] App deployed successfully
- [ ] Custom domain configured
- [ ] DNS records updated
- [ ] SSL certificate active
- [ ] CORS settings updated
- [ ] Supabase settings updated
- [ ] App tested on custom domain

---

**Next Steps**: Choose Railway or Render, then follow the deployment guide above! 