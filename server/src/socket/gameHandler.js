const gameStateManager = require('../services/GameStateManager');
const WalletService = require('../services/walletService');
const {Bet} = require("../models");

module.exports = (io) => {
  io.on('connection', async (socket) => {
    console.log('Client connected:', socket.id);

    await gameStateManager.addPlayer(socket.id);
    await gameStateManager.transition('CONNECTION_ESTABLISHED');

    socket.on('disconnect', async () => {
      console.log('Client disconnected:', socket.id);
      await gameStateManager.removePlayer(socket.id);
    });

    socket.on('place_bet', async (data) => {
      try {
        const { userId, amount, betType } = data;
        const currentGame = gameStateManager.getCurrentGame();

        if (currentGame?.status !== 'BETTING_OPEN') {
          throw new Error('Betting is not open');
        }

        await WalletService.withdraw(userId, amount);
        const bet = await Bet.create({
          userId,
          gameId: currentGame.id,
          amount,
          betType
        });

        socket.emit('bet_placed', { success: true, bet });
      } catch (error) {
        socket.emit('bet_placed', { 
          success: false, 
          error: error.message 
        });
      }
    });

    socket.on('get_game_state', () => {
      socket.emit('game_state', gameStateManager.getCurrentGame());
    });
  });

  // Listen for state changes and broadcast to all clients
  gameStateManager.on('stateChange', (newState) => {
    io.emit('game_state', newState);
  });
};