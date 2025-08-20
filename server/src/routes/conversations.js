import express from 'express';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

const router = express.Router();

async function ensureConversation(me, other) {
  let convo = await Conversation.findOne({ participants: { $all: [me, other] } });
  if (!convo) {
    convo = await Conversation.create({ participants: [me, other] });
  }
  return convo;
}

// Get messages with a peer userId (param :id = peer userId)
router.get('/:id/messages', async (req, res) => {
  const me = req.user.id;
  const other = req.params.id;
  const convo = await ensureConversation(me, other);
  const messages = await Message.find({ conversation: convo._id }).sort({ createdAt: 1 }).lean();
  res.json({ conversationId: convo._id, messages });
});

export default router;
