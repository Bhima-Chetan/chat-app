import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lastMessage: { type: String, default: '' },
  lastMessageAt: { type: Date, default: null }
}, { timestamps: true });

conversationSchema.index({ participants: 1 }, { unique: false });

export default mongoose.model('Conversation', conversationSchema);
