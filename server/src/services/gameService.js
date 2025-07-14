const { Game, Bet, User, sequelize } = require('../models');

class GameService {
  constructor() {
    this.currentGame = null;
    this.timer = null;
    this.initializeGame();
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
        lastResults: []
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
      this.currentGame.status = 'PROCESSING_BETS';

      // Process all bets in a single transaction
      const result = Math.random() < 0.5 ? 'red' : 'black';
      
      // First update game status
      await Game.update({
        status: 'RESULTS',
        result,
        endTime: new Date()
      }, {
        where: { id: this.currentGame.id },
        transaction
      });

      // Process unmatched bets first
      for (const betType of ['red', 'black']) {
        const bets = Array.from(this.currentGame.bets[betType].entries());
        for (const [userId, bet] of bets) {
          if (!bet.matched) {
            await User.increment('balance', {
              by: bet.amount,
              where: { id: userId },
              transaction
            });
          }
        }
      }

      // Then process winning bets
      const winningBets = Array.from(this.currentGame.bets[result].entries());
      for (const [userId, bet] of winningBets) {
        if (bet.matched) {
          const winnings = Math.floor(bet.amount * 2 * 0.975); // 2.5% fee
          await User.increment('balance', {
            by: winnings,
            where: { id: userId },
            transaction
          });
        }
      }

      this.currentGame.result = result;
      this.currentGame.lastResults.unshift(result);
      if (this.currentGame.lastResults.length > 10) {
        this.currentGame.lastResults.pop();
      }

      await transaction.commit();

      // Start new round after delay
      setTimeout(() => this.startNewRound(), 5000);
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
      if (!user || user.balance < amount) {
        throw new Error('Insufficient balance');
      }

      // Create bet and update user balance in the same transaction
      await Promise.all([
        Bet.create({
          userId,
          gameId: this.currentGame.id,
          amount,
          betType,
          matched: false
        }, { transaction }),
        User.decrement('balance', {
          by: amount,
          where: { id: userId },
          transaction
        })
      ]);

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
      const matchingBet = oppositeBets.find(([_, oppBet]) => oppBet.amount === bet.amount);
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
      bets: {
        red: Object.fromEntries(this.currentGame.bets.red),
        black: Object.fromEntries(this.currentGame.bets.black)
      }
    };
  }
}

module.exports = new GameService();