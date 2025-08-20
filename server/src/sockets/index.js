import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

const userSockets = new Map(); // userId -> Set(socketId)

function addUserSocket(userId, socketId) {
  if (!userSockets.has(userId)) userSockets.set(userId, new Set());
  userSockets.get(userId).add(socketId);
}
function removeUserSocket(userId, socketId) {
  if (!userSockets.has(userId)) return;
  const set = userSockets.get(userId);
  set.delete(socketId);
  if (set.size === 0) userSockets.delete(userId);
}
function getUserSocketIds(userId) {
  return Array.from(userSockets.get(userId) || []);
}

export function initSockets(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers['authorization']?.replace('Bearer ', '');
    const payload = token ? verifyToken(token) : null;
    if (!payload) return next(new Error('Unauthorized'));
    socket.user = { id: payload.id, username: payload.username };
    next();
  });

  io.on('connection', async (socket) => {
    const { id: userId } = socket.user;
    addUserSocket(String(userId), socket.id);

    await User.findByIdAndUpdate(userId, { online: true });
    io.emit('presence:update', { userId, online: true, lastSeen: null });

    // Deliver any pending messages to this user
    try {
      const pending = await Message.find({ recipient: userId, status: 'sent' }).lean();
      if (pending.length) {
        await Message.updateMany({ recipient: userId, status: 'sent' }, { $set: { status: 'delivered', deliveredAt: new Date() } });
        const updated = await Message.find({ _id: { $in: pending.map(p => p._id) } }).lean();
        // Notify both sender and recipient sockets
        updated.forEach(m => {
          const targets = new Set([ ...getUserSocketIds(String(m.sender)), ...getUserSocketIds(String(m.recipient)) ]);
          targets.forEach(sid => io.to(sid).emit('message:new', { message: m }));
        });
      }
    } catch (e) {
      // swallow to avoid crashing socket
    }

    socket.on('typing:start', ({ to }) => {
      getUserSocketIds(String(to)).forEach(sid => io.to(sid).emit('typing:start', { from: userId }));
    });
    socket.on('typing:stop', ({ to }) => {
      getUserSocketIds(String(to)).forEach(sid => io.to(sid).emit('typing:stop', { from: userId }));
    });

    socket.on('message:send', async ({ to, text, tempId }) => {
      if (!to || !text) return;
      let convo = await Conversation.findOne({ participants: { $all: [userId, to] } });
      if (!convo) convo = await Conversation.create({ participants: [userId, to] });
      const msg = await Message.create({ conversation: convo._id, sender: userId, recipient: to, text, status: 'sent' });
      await Conversation.findByIdAndUpdate(convo._id, { lastMessage: text, lastMessageAt: new Date() });

      // Attempt delivery
      const toSockets = getUserSocketIds(String(to));
      if (toSockets.length > 0) {
        await Message.findByIdAndUpdate(msg._id, { status: 'delivered', deliveredAt: new Date() });
      }
      const full = await Message.findById(msg._id).lean();

      // Emit to recipient
      toSockets.forEach(sid => io.to(sid).emit('message:new', { message: full }));
      // Emit to sender (include tempId for client reconciliation)
      io.to(socket.id).emit('message:new', { message: { ...full, tempId } });
    });

    socket.on('message:read', async ({ conversationId, messageIds }) => {
      if (!conversationId || !Array.isArray(messageIds)) return;
      await Message.updateMany({ _id: { $in: messageIds } }, { $set: { status: 'read', readAt: new Date() } });
      const updated = await Message.find({ _id: { $in: messageIds } }).lean();
      // Broadcast updates to both participants
      updated.forEach(m => {
        const targets = new Set([ ...getUserSocketIds(String(m.sender)), ...getUserSocketIds(String(m.recipient)) ]);
        targets.forEach(sid => io.to(sid).emit('message:new', { message: m }));
      });
    });

  socket.on('disconnect', async () => {
      removeUserSocket(String(userId), socket.id);
      const stillOnline = getUserSocketIds(String(userId)).length > 0;
      if (!stillOnline) {
    const when = new Date();
    await User.findByIdAndUpdate(userId, { online: false, lastSeen: when });
    io.emit('presence:update', { userId, online: false, lastSeen: when });
      }
    });
  });
}
