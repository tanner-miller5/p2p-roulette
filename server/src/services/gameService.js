const { Game, Bet, User, sequelize, Wallet} = require('../models');
const { EventEmitter } = require('events');
let io = null;

// Add this function to set io instance
const setIo = (ioInstance) => {
  io = ioInstance;
};


class GameService extends EventEmitter {
  constructor() {
    super();
    this.currentGame = null;
    this.timer = null;
    this.lastResults = []; // Move lastResults to class level to persist across rounds
    this.initializeGame();
    // Listen to our own events and broadcast them via Socket.IO
    this.on('gameState', (state) => {
      if(io) {
        io.emit('gameState', state);
      }
    });
  }

  async initializeGame() {
    if (!this.currentGame) {
      await this.startNewRound();
    }
  }

  async startNewRound() {
    const transaction = await sequelize.transaction();

    try {
      const game = await Game.create({
        status: 'BETTING_OPEN',
        startTime: new Date()
      }, { transaction });

      this.currentGame = {
        id: game.id,
        status: 'BETTING_OPEN',
        timer: 30,
        bets: {
          red: new Map(),
          black: new Map()
        },
        currentBets: { red: 0, black: 0 },
        lastResults: this.lastResults // Use the persistent lastResults array
      };

      await transaction.commit();
      this.startTimer();
      return this.getCurrentGame();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  startTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }

    this.timer = setInterval(() => {
      if (this.currentGame.timer > 0) {
        this.currentGame.timer--;
        // Emit timer update to all clients
        this.emit('gameState', this.getCurrentGame());

        if (this.currentGame.timer === 0) {
          this.finishRound();
        }
      }
    }, 1000);
  }

  async finishRound() {
    const transaction = await sequelize.transaction();

    try {
      clearInterval(this.timer);

      // Generate a random roulette number (1-36)
      const resultNumber = Math.floor(Math.random() * 36) + 1;
      
      // Add spinning state
      this.currentGame.result = resultNumber;
      this.currentGame.status = 'spinning';
      this.emit('gameState', this.getCurrentGame());

      // Wait for spinning animation
      await new Promise(resolve => setTimeout(resolve, 3000));

      this.currentGame.status = 'PROCESSING_BETS';
      this.emit('gameState', this.getCurrentGame());
      
      // First update game status
      await Game.update({
        status: 'RESULTS',
        result: resultNumber,
        endTime: new Date()
      }, {
        where: { id: this.currentGame.id },
        transaction
      });

      // Determine color from number for bet processing
      const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
      const resultColor = redNumbers.includes(resultNumber) ? 'red' : 'black';

      // Process unmatched bets first
      for (const betType of ['red', 'black']) {
        const bets = Array.from(this.currentGame.bets[betType].entries());
        for (const [userId, bet] of bets) {
          if (!bet.matched) {
            await Wallet.increment('balance', {
              by: bet.amount,
              where: { userId },
              transaction
            });
          }
        }
      }

      // Then process winning bets based on the color derived from the number
      const winningBets = Array.from(this.currentGame.bets[resultColor].entries());
      for (const [userId, bet] of winningBets) {
        if (bet.matched) {
          const winnings = Math.floor(bet.amount * 2 * 0.975); // 2.5% fee
          await Wallet.increment('balance', {
            by: winnings,
            where: { userId },
            transaction
          });
        }
      }

      this.currentGame.status = 'RESULTS';
      this.emit('gameState', this.getCurrentGame());

      // Update the persistent lastResults array
      this.lastResults.unshift(resultNumber);
      if (this.lastResults.length > 10) {
        this.lastResults.pop();
      }
      
      // Update currentGame's lastResults reference
      this.currentGame.lastResults = this.lastResults;

      await transaction.commit();

      // Start new round after delay
      setTimeout(() => {
        this.startNewRound();
        this.emit('gameState', this.getCurrentGame());
      }, 5000);
      return this.getCurrentGame();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async placeBet(userId, amount, betType) {
    const transaction = await sequelize.transaction();

    try {
      if (!this.currentGame || this.currentGame.status !== 'BETTING_OPEN') {
        throw new Error('Betting is currently closed');
      }

      const user = await User.findByPk(userId, { transaction });

      // Create bet and update user balance in the same transaction
      // First check balance
      const wallet = await Wallet.findOne({
        where: { userId },
        transaction
      });

      if (!wallet || wallet.balance < amount) {
        throw new Error('Insufficient balance');
      }

      // Then perform operations sequentially
      await Wallet.decrement('balance', {
        by: amount,
        where: { userId },
        transaction
      });

      await Bet.create({
        userId,
        gameId: this.currentGame.id,
        amount,
        betType,
        matched: false
      }, { transaction });

      if (!this.currentGame.bets[betType]) {
        this.currentGame.bets[betType] = new Map();
      }
      this.currentGame.bets[betType].set(userId, { amount, matched: false });
      this.currentGame.currentBets[betType] += amount;

      await transaction.commit();
      
      // Match bets after transaction is committed
      this.matchBets(betType);
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  matchBets(betType) {
    const oppositeType = betType === 'red' ? 'black' : 'red';
    const currentBets = Array.from(this.currentGame.bets[betType].entries())
      .filter(([_, bet]) => !bet.matched);
    const oppositeBets = Array.from(this.currentGame.bets[oppositeType].entries())
      .filter(([_, bet]) => !bet.matched);

  for (const [userId, bet] of currentBets) {
    const matchingBet = oppositeBets.find(([oppUserId, oppBet]) => 
      oppBet.amount === bet.amount && oppUserId !== userId
    );
    if (matchingBet) {
      bet.matched = true;
      this.currentGame.bets[betType].set(userId, bet);
      this.currentGame.bets[oppositeType].set(matchingBet[0], { ...matchingBet[1], matched: true });
    }
  }
}

  getCurrentGame() {
    if (!this.currentGame) return null;
    
    return {
      ...this.currentGame,
      lastResults: this.lastResults, // Always include the persistent lastResults
      bets: {
        red: Object.fromEntries(this.currentGame.bets.red),
        black: Object.fromEntries(this.currentGame.bets.black)
      }
    };
  }
}
const gameService = new GameService();
module.exports = {gameService, setIo};