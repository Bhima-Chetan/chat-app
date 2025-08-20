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

const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || '*';
// Prefer env, fallback to local dev for convenience
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/chat_app';

const app = express();

app.use(cors({ origin: CLIENT_ORIGIN === '*' ? true : CLIENT_ORIGIN.split(','), credentials: true }));
app.use(express.json());

app.get('/', (req, res) => res.send({ ok: true }));

app.use('/auth', authRoutes);
app.use('/users', authMiddleware, userRoutes);
app.use('/conversations', authMiddleware, conversationRoutes);
app.get('/me', authMiddleware, (req, res) => res.json(req.user));

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: CLIENT_ORIGIN === '*' ? true : CLIENT_ORIGIN.split(','), credentials: true }
});

initSockets(io);

mongoose.connect(MONGO_URI).then(() => {
  console.log('MongoDB connected');
  server.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
}).catch(err => {
  console.error('MongoDB connection error', err);
  process.exit(1);
});
