const { Server } = require('socket.io');
const gameService = require('../services/gameService');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling'] // Allow both transports
  });

  // Add authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

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


  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('joinGame', () => {
      const currentGame = gameService.getCurrentGame();
      socket.emit('gameState', currentGame);
    });

    // Broadcast game state updates every second
    const intervalId = setInterval(() => {
      const currentGame = gameService.getCurrentGame();
      io.emit('gameState', currentGame);
    }, 1000);

    socket.on('disconnect', () => {
      clearInterval(intervalId);
    });
  });

  io.on('placeBet', async ({ amount, betType }) => {
    try {
      // Validate user has enough balance
      const user = await User.findByPk(io.user.id);
      if (!user || user.balance < amount) {
        throw new Error('Insufficient balance');
      }

      // Place the bet and update balance
      await gameService.placeBet(io.user.id, amount, betType);

      // Update user's balance
      await user.decrement('balance', { by: amount });

      // Emit updated game state and balance
      io.emit('balanceUpdate', { balance: user.balance - amount });
      io.emit('gameState', gameService.getCurrentGame());
    } catch (error) {
      io.emit('error', { message: error.message });
    }
  });


  return io;
}
module.exports = initializeSocket;