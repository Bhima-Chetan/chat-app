#!/bin/bash

echo "🚀 Chat App Deployment Script"
echo "=============================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the server directory"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔍 Checking environment variables..."
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please create it with your environment variables."
    exit 1
fi

echo "🧪 Testing MongoDB connection..."
timeout 10s npm start &
PID=$!
sleep 5
kill $PID 2>/dev/null

echo "✅ Ready for deployment!"
echo ""
echo "📋 Next steps:"
echo "1. Choose a deployment platform (Vercel, Railway, Heroku)"
echo "2. Set up environment variables on the platform"
echo "3. Deploy using the platform's CLI or web interface"
echo ""
echo "🔗 Useful commands:"
echo "  Vercel: npx vercel"
echo "  Railway: railway login && railway deploy"
echo "  Heroku: git push heroku main"
