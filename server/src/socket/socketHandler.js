import { Server } from 'socket.io';
import { verifyToken } from '../config/jwt.js';
import { User } from '../models/User.js';

let ioInstance = null;

// Track active sockets per user: userId -> Set of socket IDs
const activeUserSockets = new Map();

export const initSocket = (httpServer, clientOrigin) => {
  const io = new Server(httpServer, {
    cors: {
      origin: clientOrigin || '*',
      methods: ['GET', 'POST', 'PATCH'],
      credentials: true,
    },
  });

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Socket authentication error: Token not provided'));
      }

      const decoded = verifyToken(token);
      if (!decoded || !decoded.id) {
        return next(new Error('Socket authentication error: Invalid token'));
      }

      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new Error('Socket authentication error: User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Socket authentication failure'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;

    // Join personal room
    socket.join(userId);

    // Track active connection
    if (!activeUserSockets.has(userId)) {
      activeUserSockets.set(userId, new Set());
    }
    activeUserSockets.get(userId).add(socket.id);

    // If first active socket for user, mark online and broadcast
    if (activeUserSockets.get(userId).size === 1) {
      try {
        await User.findByIdAndUpdate(userId, { status: 'online' });
        socket.broadcast.emit('user:online', { userId });
      } catch (e) {
        console.error('Error updating user online status:', e);
      }
    }

    socket.on('disconnect', async () => {
      const userSockets = activeUserSockets.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          activeUserSockets.delete(userId);
          const lastSeen = new Date();
          try {
            await User.findByIdAndUpdate(userId, {
              status: 'offline',
              lastSeen,
            });
            io.emit('user:offline', {
              userId,
              lastSeen: lastSeen.toISOString(),
            });
          } catch (e) {
            console.error('Error updating user offline status:', e);
          }
        }
      }
    });
  });

  ioInstance = io;
  return io;
};

export const getSocketIO = () => {
  return ioInstance;
};
