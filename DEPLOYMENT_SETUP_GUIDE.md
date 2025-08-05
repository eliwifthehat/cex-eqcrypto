# Deployment Setup Guide

## Step 1: Environment Configuration

### Current State
- ✅ `.env.example` file created
- ✅ `.env` file exists (currently has mock database URL)
- ✅ `.env` is in `.gitignore` (secure)

### Required Environment Variables

You need to update your `.env` file with the following variables:

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# Supabase Configuration (Get these from your Supabase project dashboard)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Server Configuration
NODE_ENV=development
PORT=5002

# Session Configuration (for production, use a strong secret)
SESSION_SECRET=your-session-secret-key-here

# Optional: External APIs (if needed)
# MORALIS_API_KEY=your-moralis-api-key
# PYTH_NETWORK_ENDPOINT=your-pyth-endpoint
# JUPITER_API_KEY=your-jupiter-api-key
```

### How to Get Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select existing one
3. Go to Settings → API
4. Copy the following:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### How to Get Database URL

1. In Supabase Dashboard, go to Settings → Database
2. Find the "Connection string" section
3. Copy the PostgreSQL connection string
4. Replace `[YOUR-PASSWORD]` with your database password

### Generate Session Secret

Run this command to generate a secure session secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 2: Test Environment Setup

After updating your `.env` file, test the setup:

```bash
# Test database connection
npm run db:push

# Test build process
npm run build

# Test production server
npm run start
```

## Step 3: Production Environment Variables

For production deployment, you'll need to set these environment variables in your deployment platform:

### Required for Production:
- `DATABASE_URL` (production Supabase database)
- `VITE_SUPABASE_URL` (production Supabase project)
- `VITE_SUPABASE_ANON_KEY` (production anon key)
- `SUPABASE_SERVICE_ROLE_KEY` (production service key)
- `NODE_ENV=production`
- `SESSION_SECRET` (strong secret for production)

### Optional for Production:
- `PORT` (deployment platform will set this)
- External API keys if using additional services

## Next Steps

1. **Update your `.env` file** with the variables above
2. **Test the setup** with the commands above
3. **Choose a deployment platform** (Vercel, Railway, Render, etc.)
4. **Set up production database** and run migrations
5. **Deploy and test** in production environment

## Troubleshooting

### Common Issues:

1. **Database Connection Error**
   - Check `DATABASE_URL` format
   - Verify database credentials
   - Ensure database is accessible

2. **Supabase Connection Error**
   - Verify `VITE_SUPABASE_URL` and keys
   - Check Supabase project settings
   - Ensure RLS policies are configured

3. **Build Errors**
   - Check all environment variables are set
   - Verify TypeScript compilation
   - Check for missing dependencies

4. **Runtime Errors**
   - Check server logs
   - Verify environment variables in production
   - Test database connections

## Security Notes

- Never commit `.env` files to version control
- Use strong, unique secrets for production
- Regularly rotate API keys and secrets
- Monitor for security vulnerabilities
- Use HTTPS in production 