# GoDaddy Domain + Railway Setup Guide

## 🛒 Step 1: Buy Domain from GoDaddy

### Current GoDaddy Deals (Check their website):
- **First Year**: $1-5 for `.com` domains
- **Renewal**: ~$15-20/year
- **Other TLDs**: `.co`, `.net`, `.org` often cheaper

### Domain Ideas for Your Projects:
- `cryptoexchange.com` → `cex.cryptoexchange.com`
- `tradingapp.com` → `app.tradingapp.com`
- `myportfolio.com` → `portfolio.myportfolio.com`
- `webapp.co` → `app.webapp.co`
- `fintech.net` → `exchange.fintech.net`

## 🚀 Step 2: Deploy to Railway

1. **Create Railway Account**: [railway.app](https://railway.app)
2. **Connect GitHub Repository**
3. **Deploy Your App**
4. **Get Railway URL**: `your-app.railway.app`

## 🔧 Step 3: Configure DNS in GoDaddy

### Option A: CNAME Record (Recommended)

1. **Login to GoDaddy**
2. **Go to Domain Management**
3. **Click "DNS" for your domain**
4. **Add CNAME Record**:

```
Type: CNAME
Name: cex (or whatever subdomain you want)
Value: your-app.railway.app
TTL: 600 (or default)
```

### Option B: A Record (If Railway provides IP)

1. **Get IP from Railway** (if available)
2. **Add A Record**:

```
Type: A
Name: cex
Value: [Railway IP address]
TTL: 600
```

## 🌐 Step 4: Add Custom Domain in Railway

1. **Go to Railway Dashboard**
2. **Click on your deployed service**
3. **Go to "Settings" → "Domains"**
4. **Click "Custom Domain"**
5. **Enter**: `cex.yourdomain.com`
6. **Railway will verify DNS**

## ⏱️ Step 5: Wait for DNS Propagation

- **CNAME**: Usually 15 minutes to 2 hours
- **A Record**: Usually 15 minutes to 2 hours
- **Full propagation**: Up to 48 hours

## 🔒 Step 6: SSL Certificate

Railway automatically provides SSL certificates for custom domains.

## 📋 Complete Setup Checklist

### GoDaddy Side:
- [ ] Domain purchased
- [ ] DNS records configured
- [ ] CNAME/A record added
- [ ] TTL set to 600 or default

### Railway Side:
- [ ] App deployed successfully
- [ ] Custom domain added
- [ ] DNS verification passed
- [ ] SSL certificate active

### Testing:
- [ ] Domain resolves: `nslookup cex.yourdomain.com`
- [ ] HTTPS works: `https://cex.yourdomain.com`
- [ ] App loads correctly
- [ ] WebSocket connections work

## 💰 Cost Breakdown Example

### For `cryptoexchange.com`:
- **GoDaddy Domain**: $1-5 first year, $15-20 renewal
- **Railway Hosting**: $5/month credit (usually covers small apps)
- **SSL Certificate**: Free (Railway provides)
- **Total First Year**: ~$6-25 + $60 hosting = ~$66-85
- **Total Renewal**: ~$15-20 + $60 hosting = ~$75-80/year

### For Multiple Projects:
- **Domain 1**: `cryptoexchange.com` → $15-20/year
- **Domain 2**: `tradingapp.com` → $15-20/year
- **Domain 3**: `portfolio.com` → $15-20/year
- **Railway Hosting**: $5/month = $60/year
- **Total**: ~$105-120/year for 3 projects

## 🎯 Pro Tips

### 1. **Bulk Domain Strategy**
- Buy domains during GoDaddy sales
- Use consistent naming: `project1.com`, `project2.com`
- Create subdomains: `app.project1.com`, `app.project2.com`

### 2. **Cost Optimization**
- Look for GoDaddy coupons online
- Consider longer registration periods for discounts
- Use Railway's free tier efficiently

### 3. **Domain Management**
- Keep all domains in one GoDaddy account
- Set up auto-renewal to avoid losing domains
- Use GoDaddy's domain forwarding for redirects

## 🔧 Troubleshooting

### Common Issues:

1. **DNS Not Propagating**
   - Wait 24-48 hours
   - Check with `nslookup` or `dig`
   - Verify TTL settings

2. **SSL Certificate Issues**
   - Wait for Railway to provision SSL
   - Check DNS is fully propagated
   - Contact Railway support if needed

3. **CORS Errors**
   - Update CORS settings in your app
   - Add domain to allowed origins

### Testing Commands:
```bash
# Test DNS resolution
nslookup cex.yourdomain.com

# Test HTTPS
curl -I https://cex.yourdomain.com

# Test WebSocket
wscat -c wss://cex.yourdomain.com
```

## 🚀 Next Steps

1. **Find a good GoDaddy deal** for your domain
2. **Deploy your app to Railway**
3. **Configure DNS records**
4. **Add custom domain in Railway**
5. **Test everything works**

---

**This setup works for ALL your projects!** Just repeat the process for each new project with a new domain. 