import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { signToken } from '../utils/jwt.js';

const router = express.Router();

router.post('/register',
  body('username').isString().isLength({ min: 3 }).trim(),
  body('password').isString().isLength({ min: 6 }),
  async (req, res) => {
    console.log('🔍 Register request body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    const { username, password } = req.body;
    const existing = await User.findOne({ username });
    if (existing) {
      console.log(`❌ Username already exists: ${username}`);
      return res.status(400).json({ error: 'Username already exists' });
    }
    console.log(`✅ Creating new user: ${username}`);
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, passwordHash });
    const token = signToken({ id: user._id, username: user.username });
    res.json({ token, user: { id: user._id, username: user.username } });
  }
);

router.post('/login',
  body('username').isString().trim(),
  body('password').isString(),
  async (req, res) => {
    console.log('🔍 Login request body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      console.log(`❌ User not found: ${username}`);
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      console.log(`❌ Password mismatch for user: ${username}`);
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    console.log(`✅ Login successful for user: ${username}`);
    const token = signToken({ id: user._id, username: user.username });
    res.json({ token, user: { id: user._id, username: user.username } });
  }
);

export default router;
