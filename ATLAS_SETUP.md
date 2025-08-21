# MongoDB Atlas Setup Guide

## Quick Setup Steps

### 1. Create Atlas Account
- Go to https://www.mongodb.com/cloud/atlas
- Sign up for free account
- Create a new cluster (M0 tier is free)

### 2. Configure Database Access
```
Database Access → Add New Database User
- Username: chatapp_user
- Password: <generate-strong-password>
- Database User Privileges: Read and write to any database
```

### 3. Configure Network Access
```
Network Access → Add IP Address
- For development: 0.0.0.0/0 (anywhere)
- For production: Add your server's IP address
```

### 4. Get Connection String
```
Clusters → Connect → Connect your application
- Choose: Node.js
- Version: 4.1 or later
- Copy the connection string
```

### 5. Update Your .env File
Replace the MONGO_URI in `server/.env` with your Atlas connection string:

```env
MONGO_URI=mongodb+srv://chatapp_user:YOUR_PASSWORD@cluster0.abc123.mongodb.net/chat_app?retryWrites=true&w=majority
```

**Replace:**
- `chatapp_user` with your username
- `YOUR_PASSWORD` with your password
- `cluster0.abc123.mongodb.net` with your cluster URL
- `chat_app` with your database name

### 6. Test Connection
```bash
cd server
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
📊 Database: chat_app
🌐 Host: cluster0-shard-00-01.abc123.mongodb.net
```

### 7. Migrate Existing Data (Optional)
If you have existing local data:
```bash
npm run migrate-to-atlas
```

## Troubleshooting

### Common Issues:

1. **Authentication Failed**
   - Check username/password in connection string
   - Ensure database user has proper permissions

2. **Network Error**
   - Add your IP to Network Access whitelist
   - For development, use 0.0.0.0/0

3. **Database Not Found**
   - MongoDB Atlas creates databases automatically
   - Database will be created when first document is inserted

4. **Connection Timeout**
   - Check your internet connection
   - Verify cluster is not paused (free tier auto-pauses after inactivity)

### Atlas Benefits:
- ✅ Automatic backups
- ✅ Built-in security
- ✅ Global clusters
- ✅ Real-time monitoring
- ✅ Automatic scaling
- ✅ Free tier available

### Production Considerations:
- Use specific IP addresses instead of 0.0.0.0/0
- Set up database indexes for better performance
- Enable MongoDB Charts for analytics
- Set up alerts for monitoring
- Consider using connection pooling for high traffic
