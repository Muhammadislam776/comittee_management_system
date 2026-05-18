const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Message = require('./models/Message');

let io = null;
const onlineUsers = new Map(); // Maps userId -> set of socketIds

const initSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: "*", // Adjust in production to match frontend url
      methods: ["GET", "POST", "PUT", "DELETE"]
    }
  });

  // Socket middleware for JWT Authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers['x-auth-token'];
      if (!token) {
        return next(new Error('Authentication error: Token required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      const userId = decoded.id || decoded.user?.id;
      
      const user = await User.findById(userId).select('-password');
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid Token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();

    // Track user presence
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Broadcast updated online status
    broadcastOnlineUsers();

    // Listen for room joins (committees)
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
    });

    // Listen for room leaves
    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
    });

    // Chat messaging
    socket.on('send_message', async (data) => {
      try {
        const { committeeId, text } = data;
        
        // Save to DB
        const message = await Message.create({
          committee: committeeId || null,
          sender: socket.user._id,
          text
        });

        // Populate sender before broadcasting
        const populatedMessage = await message.populate('sender', 'name email role');

        const broadcastRoom = committeeId || 'general';
        io.to(broadcastRoom).emit('new_message', populatedMessage);
      } catch (err) {
        socket.emit('error', 'Failed to send message');
      }
    });

    socket.on('disconnect', () => {
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
        }
      }
      broadcastOnlineUsers();
    });
  });

  return io;
};

const broadcastOnlineUsers = () => {
  if (io) {
    const activeIds = Array.from(onlineUsers.keys());
    io.emit('online_users', activeIds);
  }
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized');
  }
  return io;
};

module.exports = {
  initSocket,
  getIO
};
