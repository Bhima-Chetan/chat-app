# 📋 Render Deployment Checklist

## 🚀 **Quick Start Guide**

### **Step 1: Prepare Your Repository**
- [ ] Push your code to GitHub
- [ ] Ensure both `/server` and `/mobile` directories are in the repo

### **Step 2: Deploy Server**
- [ ] Go to render.com and create account
- [ ] Create "Web Service" 
- [ ] Connect GitHub repo
- [ ] Set Root Directory to `server`
- [ ] Set Build Command to `npm install`
- [ ] Set Start Command to `npm start`
- [ ] Add environment variables:
  - [ ] `NODE_ENV=production`
  - [ ] `MONGO_URI=mongodb+srv://bhimachetan1:8lJr9idGvlJRodRe@cluster0.adpptxr.mongodb.net/chat_app?retryWrites=true&w=majority&appName=Cluster0`
  - [ ] `JWT_SECRET=your_secure_secret_key`
  - [ ] `CLIENT_ORIGIN=https://your-frontend.onrender.com`
- [ ] Deploy and note the server URL

### **Step 3: Update Mobile App**
- [ ] Update `mobile/.env` with server URL:
  ```env
  EXPO_PUBLIC_SERVER_URL=https://your-server.onrender.com
  ```

### **Step 4: Deploy Mobile App (Web)**
- [ ] Create "Static Site" on Render
- [ ] Connect same GitHub repo  
- [ ] Set Root Directory to `mobile`
- [ ] Set Build Command to `npx expo export --platform web`
- [ ] Set Publish Directory to `dist`
- [ ] Deploy and note the frontend URL

### **Step 5: Update CORS**
- [ ] Go back to server deployment
- [ ] Update `CLIENT_ORIGIN` with frontend URL
- [ ] Redeploy server

### **Step 6: Test Everything**
- [ ] Visit server URL - should see API running message
- [ ] Visit `/health` endpoint - should show MongoDB connected
- [ ] Visit frontend URL - should load chat app
- [ ] Test user registration
- [ ] Test real-time messaging
- [ ] Test on mobile device

## 🔗 **Expected URLs**
- Server: `https://chat-app-server-xxxx.onrender.com`
- Frontend: `https://chat-app-frontend-xxxx.onrender.com`

## 🎯 **Success Criteria**
- ✅ Server responds with API running message
- ✅ Database connection successful
- ✅ Frontend loads without errors
- ✅ User can register and login
- ✅ Real-time messaging works
- ✅ Socket.io connections successful

## 📞 **Need Help?**
Check the full guide in `RENDER_DEPLOYMENT.md`
