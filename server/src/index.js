const express = require('express');
const walletRoutes = require('./routes/walletRoutes');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const userRoutes = require('./routes/userRoutes');
const gameRoutes = require('./routes/gameRoutes');
const {gameService, setIo} = require('./services/gameService');
require('dotenv').config();
console.log(process.env.JWT_SECRET);
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Authorization"]
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/game', gameRoutes);
app.use('/auth', userRoutes);
app.use('/api/wallet', walletRoutes);


// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return next(new Error('Authentication token missing'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('joinGame', () => {
    const currentGame = gameService.getCurrentGame();
    socket.emit('gameState', currentGame);
    // Join game room for future updates
    socket.join('game');

  });

  socket.on('placeBet', async ({ amount, betType }) => {
    try {
      await gameService.placeBet(socket.user.id, amount, betType);
      io.emit('gameState', gameService.getCurrentGame());
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

setIo(io);


module.exports = { app, httpServer, io };