#!/bin/bash

echo "🔄 Restarting development server..."

# Kill any existing Node.js processes on port 5002
echo "Stopping existing server..."
pkill -f "node.*5002" || true
pkill -f "tsx.*server/index.ts" || true

# Wait a moment
sleep 2

# Clear any cached files
echo "Clearing cache..."
rm -rf dist/
rm -rf node_modules/.cache/

# Rebuild the project
echo "Rebuilding project..."
npm run build

# Start the development server
echo "Starting development server..."
npm run dev 