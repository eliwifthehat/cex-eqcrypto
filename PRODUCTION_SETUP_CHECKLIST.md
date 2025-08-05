# Production Database Setup Checklist

## 🚀 Quick Start (5 minutes)

### **Step 1: Create Supabase Project**
- [x] Go to [Supabase Dashboard](https://supabase.com/dashboard)
- [x] Click "New Project"
- [x] Name: `crypto-exchange-prod`
- [x] Set strong database password
- [x] Choose region (closest to users)
- [x] Select Free tier
- [x] Wait for setup (2-3 minutes)

### **Step 2: Get Connection Details**
- [x] Go to Settings → Database
- [x] Copy connection string
- [x] Update your `.env` file with DATABASE_URL

### **Step 3: Run Setup Script**
```bash
npm run setup:prod
```

### **Step 4: Set Up Database Schema**
- [x] Go to Supabase SQL Editor
- [x] Copy SQL from `FIXED_SUPABASE_SCHEMA.sql` (this fixes the UUID issue)
- [ ] Run the complete schema
- [ ] RLS policies are already included in the schema

### **Step 5: Configure Authentication**
- [ ] Go to Authentication → Settings
- [ ] Enable Email provider
- [ ] Add Google OAuth (optional)
- [ ] Copy Supabase URL and keys to `.env`

### **Step 6: Test Connection**
```bash
npm run db:test
```

## ✅ What You'll Have

- **Production Database**: PostgreSQL hosted on Supabase
- **Authentication**: Email/password + OAuth options
- **Security**: Row Level Security (RLS) enabled
- **Monitoring**: Built-in Supabase dashboard
- **Backups**: Automatic daily backups
- **Scaling**: Easy upgrade path

## 💰 Free Tier Limits

- **Database**: 500MB
- **Bandwidth**: 2GB
- **API Requests**: 50,000/month
- **Auth Users**: 50,000
- **Perfect for**: MVP and early users

## 🔧 Environment Variables

Your `.env` file should have:
```bash
DATABASE_URL=postgresql://postgres:[password]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NODE_ENV=production
SESSION_SECRET=your-session-secret-key-here
```

## 🎯 Next Steps After Setup

1. **Test your application** with production database
2. **Set up monitoring** and alerts
3. **Configure backup** preferences
4. **Plan for scaling** when you hit free tier limits

## 🆘 Need Help?

- **Supabase Docs**: https://supabase.com/docs
- **Community**: https://github.com/supabase/supabase/discussions
- **Discord**: https://discord.supabase.com

---

**Your production database will be ready in under 10 minutes! 🎉** 