import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';

export async function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });
  const user = await User.findById(payload.id).lean();
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  req.user = { id: user._id, username: user.username };
  next();
}
