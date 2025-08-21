# CRITICAL: Render Environment Variables Setup

## 🚨 IMMEDIATE ACTION REQUIRED

### Server Environment Variables (chat-app-jb8r.onrender.com):
```
NODE_ENV=production
MONGO_URI=mongodb+srv://bhimachetan1:8lJr9idGvlJRodRe@cluster0.adpptxr.mongodb.net/chat_app?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=ultra_secure_jwt_secret_for_production_render_2024
CLIENT_ORIGIN=https://chat-app-1-kg3e.onrender.com
```

### Frontend Build Configuration:
Update your frontend service on Render:
- Build Command: `chmod +x render-build.sh && ./render-build.sh`
- OR: `EXPO_PUBLIC_SERVER_URL=https://chat-app-jb8r.onrender.com npx expo export --platform web --clear`

## 🔍 Current Issues:
1. Frontend still using old socket URL (chat-app-1-kg3e.onrender.com)
2. Corrupted localStorage causing JSON parse errors
3. Socket connection failing due to wrong host

## ✅ What the fixes do:
1. Aggressive localStorage cleanup on startup
2. Force correct server URL in config
3. Add build cache clearing
4. Console logging for debugging

## 🔄 Steps to Fix:
1. Update Render server env vars (above)
2. Update frontend build command (above) 
3. Manual deploy both services
4. Clear browser storage and refresh

## 🆘 If still broken:
- Check Network tab: should call chat-app-jb8r.onrender.com
- Check Console: should log "🔧 Using SERVER_URL: https://chat-app-jb8r.onrender.com"
- If not, frontend build cache is stuck - try manual rebuild
