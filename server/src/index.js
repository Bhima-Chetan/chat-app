import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import conversationRoutes from './routes/conversations.js';
import { authMiddleware } from './middleware/auth.js';
import { initSockets } from './sockets/index.js';

dotenv.config();

// Render uses dynamic PORT assignment
const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || '*';
// Prefer env, fallback to local dev for convenience
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/chat_app';

const app = express();

app.use(cors({ origin: CLIENT_ORIGIN === '*' ? true : CLIENT_ORIGIN.split(','), credentials: true }));
app.use(express.json());

app.get('/', (req, res) => res.send({ ok: true, message: 'Chat API is running' }));
app.get('/health', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.json({
      status: 'healthy',
      database: dbStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

app.use('/auth', authRoutes);
app.use('/users', authMiddleware, userRoutes);
app.use('/conversations', authMiddleware, conversationRoutes);
app.get('/me', authMiddleware, (req, res) => res.json(req.user));

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: CLIENT_ORIGIN === '*' ? true : CLIENT_ORIGIN.split(','), credentials: true }
});

initSockets(io);

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  maxPoolSize: 10,
  bufferCommands: false,
  // Atlas-optimized settings
  retryWrites: true,
  w: 'majority'
}).then(() => {
  console.log('✅ MongoDB connected successfully');
  console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
  console.log(`🌐 Host: ${mongoose.connection.host}`);
  server.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
    console.log(`📡 Socket.IO enabled with CORS: ${CLIENT_ORIGIN}`);
  });
}).catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  console.error('💡 Make sure your MONGO_URI is correct and network access is configured');
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  await mongoose.connection.close();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
