import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  text: { type: String, required: true },
  status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
  deliveredAt: { type: Date, default: null },
  readAt: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.model('Message', messageSchema);
