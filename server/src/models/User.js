import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true, index: true },
  passwordHash: { type: String, required: true },
  online: { type: Boolean, default: false },
  lastSeen: { type: Date, default: null },
  sockets: [{ type: String }]
}, { timestamps: true });

export default mongoose.model('User', userSchema);
