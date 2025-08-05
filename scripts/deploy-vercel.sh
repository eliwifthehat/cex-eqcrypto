#!/bin/bash

# Vercel Deployment Script for Crypto Exchange Frontend

echo "🚀 Starting Vercel Deployment..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please log in to Vercel..."
    vercel login
fi

# Build the project
echo "📦 Building project..."
npm run build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "🌐 Your app should be live at:"
echo "   https://your-project-name.vercel.app"
echo ""
echo "🔧 To add your custom domain:"
echo "   1. Go to Vercel Dashboard"
echo "   2. Select your project"
echo "   3. Go to Settings > Domains"
echo "   4. Add your subdomain (e.g., cex.yourdomain.com)"
echo ""
echo "📋 Environment Variables to set in Vercel:"
echo "   - DATABASE_URL"
echo "   - SUPABASE_URL"
echo "   - SUPABASE_ANON_KEY"
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo "   - NODE_ENV=production" 