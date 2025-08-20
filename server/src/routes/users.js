import express from 'express';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

const router = express.Router();

// Get all users except self, include last message preview
router.get('/', async (req, res) => {
  const me = req.user.id;
  const users = await User.find({ _id: { $ne: me } }, { username: 1, online: 1, lastSeen: 1 }).lean();

  // For each user, get the last message between me and them
  const userIds = users.map(u => u._id);
  // Find conversations that include me and any of the listed users
  const convos = await Conversation.find({
    $and: [
      { participants: me },
      { participants: { $in: userIds } }
    ]
  }).lean();
  const convoByOther = new Map();
  for (const c of convos) {
    const other = c.participants.find(p => String(p) !== String(me));
    if (other) convoByOther.set(String(other), c);
  }
  const convoIds = convos.map(c => c._id);
  const lastMessages = await Message.aggregate([
    { $match: { conversation: { $in: convoIds } } },
    { $sort: { createdAt: -1 } },
    { $group: { _id: '$conversation', doc: { $first: '$$ROOT' } } }
  ]);
  const lastByConvo = new Map(lastMessages.map(m => [String(m._id), m.doc]));

  const results = users.map(u => {
    const c = convoByOther.get(String(u._id));
    const last = c ? lastByConvo.get(String(c._id)) : null;
    return {
      id: u._id,
      username: u.username,
      online: u.online,
      lastSeen: u.lastSeen,
      lastMessage: last ? { text: last.text, at: last.createdAt, from: last.sender } : null,
      conversationId: c ? c._id : null
    };
  });

  res.json(results);
});

export default router;
