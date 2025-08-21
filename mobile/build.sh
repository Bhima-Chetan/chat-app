#!/bin/bash

# Build script for Render deployment
echo "Building Expo web app for production..."

# Set production environment variable
export EXPO_PUBLIC_SERVER_URL=https://chat-app-1-kg3e.onrender.com

# Install dependencies
npm install

# Export for web platform with production config
npx expo export --platform web

echo "Build completed successfully!"
echo "Server URL configured: $EXPO_PUBLIC_SERVER_URL"
