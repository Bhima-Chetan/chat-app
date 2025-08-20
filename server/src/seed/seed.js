import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Seeding sample users...');
  const users = [
    { username: 'alice', password: 'alice123' },
    { username: 'bob', password: 'bob123' }
  ];
  for (const u of users) {
    const existing = await User.findOne({ username: u.username });
    if (!existing) {
      const passwordHash = await bcrypt.hash(u.password, 10);
      await User.create({ username: u.username, passwordHash });
      console.log('Created user', u.username);
    } else {
      console.log('User exists', u.username);
    }
  }
  await mongoose.disconnect();
  console.log('Done.');
}

run().catch(err => { console.error(err); process.exit(1); });
