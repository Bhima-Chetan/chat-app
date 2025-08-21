# 🚀 Chat App Deployment Guide

## 🖥️ **Server Deployment**

### **Option 1: Vercel (Recommended)**

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy from server directory:**
   ```bash
   cd server
   vercel
   ```

3. **Set Environment Variables in Vercel Dashboard:**
   - `MONGO_URI`: Your Atlas connection string
   - `JWT_SECRET`: A secure secret key
   - `CLIENT_ORIGIN`: Your frontend domain(s)
   - `NODE_ENV`: production

4. **Get your deployment URL** (e.g., `https://your-app.vercel.app`)

### **Option 2: Railway**

1. **Go to [Railway.app](https://railway.app)**
2. **Connect GitHub and deploy from repository**
3. **Set environment variables:**
   - Same as Vercel above
4. **Railway will auto-deploy on git push**

### **Option 3: Heroku**

1. **Install Heroku CLI**
2. **Deploy:**
   ```bash
   cd server
   heroku create your-chat-app-api
   heroku config:set MONGO_URI="your-atlas-connection-string"
   heroku config:set JWT_SECRET="your-secret-key"
   heroku config:set CLIENT_ORIGIN="your-frontend-domain"
   git push heroku main
   ```

---

## 📱 **Mobile App Deployment**

### **Option 1: Expo Application Services (EAS)**

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```

3. **Configure project:**
   ```bash
   cd mobile
   eas build:configure
   ```

4. **Update server URL in your app:**
   ```bash
   # Update mobile/.env
   EXPO_PUBLIC_SERVER_URL=https://your-deployed-server.vercel.app
   ```

5. **Build for different platforms:**
   ```bash
   # Android APK (for testing)
   eas build --platform android --profile preview

   # iOS build
   eas build --platform ios --profile production

   # Web deployment
   npx expo export --platform web
   ```

### **Option 2: Expo Web (GitHub Pages/Netlify)**

1. **Build web version:**
   ```bash
   cd mobile
   npx expo export --platform web
   ```

2. **Deploy to Netlify:**
   - Drag the `dist` folder to netlify.com
   - Or connect GitHub and auto-deploy

---

## 🔧 **Pre-Deployment Checklist**

### **Server Configuration:**
- ✅ Update `JWT_SECRET` to a secure random string
- ✅ Set `NODE_ENV=production`
- ✅ Configure `CLIENT_ORIGIN` with your frontend domain
- ✅ Test MongoDB Atlas connection
- ✅ Add error logging for production

### **Mobile App Configuration:**
- ✅ Update `EXPO_PUBLIC_SERVER_URL` to your deployed server
- ✅ Test app with production server
- ✅ Update app icons and splash screen
- ✅ Set proper bundle identifiers for iOS/Android

---

## 🌐 **Environment Variables Setup**

### **Server (.env for production):**
```env
PORT=4002
NODE_ENV=production
MONGO_URI=mongodb+srv://bhimachetan1:8lJr9idGvlJRodRe@cluster0.adpptxr.mongodb.net/chat_app?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=ultra_secure_jwt_secret_for_production_2024
CLIENT_ORIGIN=https://your-frontend.netlify.app,https://your-expo-app.expo.dev
```

### **Mobile (.env):**
```env
EXPO_PUBLIC_SERVER_URL=https://your-chat-api.vercel.app
```

---

## 🚀 **Quick Deploy Commands**

### **Deploy Server to Vercel:**
```bash
cd server
npm install -g vercel
vercel
# Follow prompts and set environment variables
```

### **Deploy Mobile to Expo:**
```bash
cd mobile
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview
```

### **Deploy Web Version:**
```bash
cd mobile
npx expo export --platform web
# Upload dist folder to Netlify/Vercel
```

---

## 📊 **Post-Deployment**

1. **Test all features:**
   - User registration/login
   - Real-time messaging
   - Socket.io connections
   - Mobile app connectivity

2. **Monitor:**
   - Server logs in deployment platform
   - Database performance in Atlas
   - User analytics in Expo

3. **Scale:**
   - Add Redis for Socket.io scaling
   - Set up load balancing if needed
   - Implement proper logging

---

## 🆘 **Troubleshooting**

### **Common Issues:**

1. **CORS Errors:**
   - Update `CLIENT_ORIGIN` with correct domains
   - Don't use `*` in production

2. **Socket.io Connection Failed:**
   - Check server URL in mobile app
   - Verify CORS configuration

3. **MongoDB Connection Issues:**
   - Check Atlas network access
   - Verify connection string

4. **Build Errors:**
   - Clear node_modules and reinstall
   - Check for incompatible dependencies

---

Choose your preferred deployment method and let me know if you need help with any specific step!
