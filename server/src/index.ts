import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';

import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import messageRoutes from './routes/messageRoutes';

dotenv.config();

const app = express();
const server = http.createServer(app);

// ✅ REST API CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

// 🔌 Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// 🗺️ Track online users
const onlineUsers = new Map<string, string>();

io.on('connection', (socket) => {
  console.log('🟢 [SOCKET] New socket connected:', socket.id);

  // ✅ Step 1: Register user to socket map
  socket.on('add-user', (userId: string) => {
    onlineUsers.set(userId, socket.id);
    console.log(`✅ [SOCKET] add-user: ${userId} → socket ${socket.id}`);
    console.log('🌐 [SOCKET] Current online users:', Object.fromEntries(onlineUsers));
  });

  // ✅ Step 2: Handle real-time message
  socket.on('send-msg', ({ to, msg }) => {
    console.log(`📤 [SOCKET] send-msg from socket ${socket.id} to user ${to}`);
    console.log(`📝 [SOCKET] Message:`, msg);

    const receiverSocketId = onlineUsers.get(to);

    // 🔍 Get sender userId from socket.id
    const senderId = [...onlineUsers.entries()].find(([_, sid]) => sid === socket.id)?.[0];

    if (!senderId) {
      console.warn(`⚠️ [SOCKET] Could not find sender userId for socket ${socket.id}`);
      return;
    }

    if (receiverSocketId) {
      console.log(`📡 [SOCKET] Emitting 'msg-receive' to socket ${receiverSocketId}`);
      io.to(receiverSocketId).emit('msg-receive', msg, senderId);
    } else {
      console.warn(`⚠️ [SOCKET] User ${to} is offline. No socket found.`);
    }
  });

  // ✅ Step 3: Handle disconnect
  socket.on('disconnect', () => {
    console.log('🔴 [SOCKET] Disconnected socket:', socket.id);

    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        console.log(`🧹 [SOCKET] Removed user ${userId} from onlineUsers map`);
        break;
      }
    }
  });
});

// 🚀 Start server after DB is connected
connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
  });
});
