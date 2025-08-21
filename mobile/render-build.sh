#!/bin/bash

# Render build script with forced environment variables
echo "🚀 Building Expo web app for Render deployment..."

# Force the correct server URL
export EXPO_PUBLIC_SERVER_URL=https://chat-app-jb8r.onrender.com

echo "📡 Server URL: $EXPO_PUBLIC_SERVER_URL"

# Clear any cached builds
rm -rf dist .expo node_modules/.cache

# Install dependencies
npm install

# Export for web with forced environment
npx expo export --platform web --clear

echo "✅ Build completed successfully!"
echo "🔗 Will connect to: $EXPO_PUBLIC_SERVER_URL"
