const jwt = require('jsonwebtoken');
const WalletService = require('../services/walletService');
const { gameService } = require('../services/gameService');
const { Bet } = require('../models');

const socketAuth = (socket, next) => {
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
};

const initializeSocket = (io) => {
  io.use(socketAuth);

  io.on('connection', async (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('joinGame', () => {
      console.log('joinGame');
      const currentGame = gameService.getCurrentGame();
      socket.emit('gameState', currentGame);
      socket.join('game');
    });

    socket.on('placeBet', async ({ userId, amount, betType }) => {
      console.log('placeBet');
      try {
        const currentGame = gameService.getCurrentGame();
        
        if (currentGame?.status !== 'BETTING_OPEN') {
          throw new Error('Betting is not open');
        }

        // Withdraw funds using WalletService
        await WalletService.withdraw(userId, amount);
        console.log('placeBet');
        console.log(userId);
        console.log(socket.user.id);
        // Create bet record
        await Bet.create({
          userId: userId,
          gameId: currentGame.id,
          amount,
          betType
        });

        // Place bet in game service
        await gameService.placeBet(userId, amount, betType);
        
        // Broadcast updated game state
        const updatedState = gameService.getCurrentGame();
        io.emit('gameState', updatedState);
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Listen for game state changes
  gameService.on('stateChange', (newState) => {
    io.emit('gameState', newState);
  });
};

module.exports = { initializeSocket };