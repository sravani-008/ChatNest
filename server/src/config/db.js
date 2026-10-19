import mongoose from 'mongoose';
import { User } from '../models/User.js';

const seedInitialUsers = async () => {
  try {
    const count = await User.countDocuments();
    if (count === 0) {
      console.log('Seeding initial demo users for testing...');
      await User.create([
        {
          googleId: 'google_demo_sarah',
          name: 'Sarah Connor',
          email: 'sarah.connor@gmail.com',
          avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
          bio: 'Frontend enthusiast & coffee lover ☕',
          status: 'offline',
          lastSeen: new Date(Date.now() - 1000 * 60 * 15),
        },
        {
          googleId: 'google_demo_marcus',
          name: 'Marcus Reed',
          email: 'marcus.reed@gmail.com',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          bio: 'Full-stack builder. Working on ChatNest!',
          status: 'offline',
          lastSeen: new Date(Date.now() - 1000 * 60 * 60),
        },
        {
          googleId: 'google_demo_elena',
          name: 'Elena Rostova',
          email: 'elena.rostova@gmail.com',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          bio: 'UX/UI Designer & Creative thinker ✨',
          status: 'offline',
          lastSeen: new Date(Date.now() - 1000 * 60 * 120),
        },
      ]);
      console.log('Demo users seeded successfully.');
    }
  } catch (err) {
    console.warn('Could not seed demo users:', err.message);
  }
};

let listenersAttached = false;
const attachConnectionListeners = () => {
  if (listenersAttached) return;
  listenersAttached = true;

  mongoose.connection.on('connected', () => {
    console.log(`[MongoDB] Connected to database: "${mongoose.connection.name}" at ${mongoose.connection.host}`);
  });

  mongoose.connection.on('error', (err) => {
    console.error(`[MongoDB] Connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] Disconnected from database.');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('[MongoDB] Successfully reconnected to database.');
  });
};

export const connectDB = async (maxRetries = 3) => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chatnest';
  attachConnectionListeners();

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Connecting to MongoDB (attempt ${attempt}/${maxRetries})...`);
      await mongoose.connect(mongoUri, {
        dbName: 'chatnest',
        serverSelectionTimeoutMS: 15000,
      });
      console.log(`[MongoDB] MongoDB connected successfully to database "${mongoose.connection.name}".`);
      await seedInitialUsers();
      return;
    } catch (err) {
      console.warn(`[MongoDB] Connection attempt ${attempt} failed: ${err.message}`);
      if (attempt < maxRetries) {
        const delay = attempt * 1500;
        console.log(`[MongoDB] Retrying in ${delay}ms...`);
        await new Promise((res) => setTimeout(res, delay));
      } else {
        console.error(`[MongoDB] Could not connect to external MongoDB after ${maxRetries} attempts.`);
        console.warn('⚠️ WARNING: Activating In-Memory Store. Notice: Chats sent in this mode will NOT persist in MongoDB.');
        await seedInitialUsers();
      }
    }
  }
};

export const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};
