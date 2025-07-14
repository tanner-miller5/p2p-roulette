const { EventEmitter } = require('events');
const { Game, Bet, User, sequelize } = require('../models');
const WalletService = require('./walletService');

class GameStateManager extends EventEmitter {
  constructor() {
    super();
    this.currentGame = null;
    this.timers = new Map();
    this.MIN_PLAYERS = 2;
    this.BETTING_WINDOW = 30000;
    this.SPIN_DURATION = 10000;
    this.RESULTS_DISPLAY = 5000;
    this.connectedPlayers = new Set();
  }

  async transitionToInitializing() {
    this.clearAllTimers();
    this.currentGame = await Game.create({
      status: 'INITIALIZING',
      startTime: new Date()
    });
    this.emit('stateChange', this.currentGame);
  }

  async transitionToWaitingForPlayers() {
    await this.currentGame.update({ status: 'WAITING_FOR_PLAYERS' });
    this.emit('stateChange', this.currentGame);
    this.checkPlayerCount();
  }

  async transitionToBettingOpen() {
    await this.currentGame.update({ status: 'BETTING_OPEN' });
    this.emit('stateChange', this.currentGame);

    this.timers.set('betting', setTimeout(
      () => this.transition('BETTING_WINDOW_CLOSED'),
      this.BETTING_WINDOW
    ));
  }

  async transitionToProcessingBets() {
    await this.currentGame.update({ status: 'PROCESSING_BETS' });
    await this.processFinalBets();
    this.emit('stateChange', this.currentGame);
  }

  async transitionToSpinning() {
    await this.currentGame.update({ status: 'SPINNING' });
    this.emit('stateChange', this.currentGame);

    this.timers.set('spinning', setTimeout(
      () => this.transition('SPIN_COMPLETED'),
      this.SPIN_DURATION
    ));
  }

  async transitionToResults(result) {
    const transaction = await sequelize.transaction();
    try {
      await this.currentGame.update({
        status: 'RESULTS',
        result,
        endTime: new Date()
      }, { transaction });

      await this.processWinnings(result, transaction);
      await transaction.commit();
      this.emit('stateChange', this.currentGame);

      this.timers.set('results', setTimeout(
        () => this.transition('DISPLAY_TIMEOUT'),
        this.RESULTS_DISPLAY
      ));
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async transitionToCleanup() {
    await this.currentGame.update({ status: 'CLEANUP' });
    await this.cleanupGame();
    this.emit('stateChange', this.currentGame);
  }

  async handleError(error) {
    console.error('Game error:', error);
    this.clearAllTimers();

    if (this.currentGame) {
      await this.currentGame.update({
        status: 'ERROR',
        errorMessage: error.message
      });
      this.emit('stateChange', this.currentGame);
    }

    try {
      await this.recoverGame();
      await this.transition('RECOVERY_SUCCESS');
    } catch (recoveryError) {
      console.error('Recovery failed:', recoveryError);
      await this.transition('RECOVERY_FAILED');
    }
  }

  async transition(event) {
    try {
      switch (this.currentGame?.status) {
        case 'INITIALIZING':
          if (event === 'CONNECTION_ESTABLISHED') {
            await this.transitionToWaitingForPlayers();
          }
          break;

        case 'WAITING_FOR_PLAYERS':
          if (event === 'MIN_PLAYERS_REACHED') {
            await this.transitionToBettingOpen();
          } else if (event === 'PLAYER_DISCONNECTED') {
            await this.updatePlayerCount();
          }
          break;

        case 'BETTING_OPEN':
          if (event === 'BETTING_WINDOW_CLOSED') {
            await this.transitionToProcessingBets();
          }
          break;

        case 'PROCESSING_BETS':
          if (event === 'BETS_PROCESSED') {
            await this.transitionToSpinning();
          }
          break;

        case 'SPINNING':
          if (event === 'SPIN_COMPLETED') {
            const result = Math.random() < 0.5 ? 'red' : 'black';
            await this.transitionToResults(result);
          }
          break;

        case 'RESULTS':
          if (event === 'DISPLAY_TIMEOUT') {
            await this.transitionToCleanup();
          }
          break;

        case 'CLEANUP':
          if (event === 'CLEANUP_COMPLETED') {
            await this.transitionToInitializing();
          }
          break;

        case 'ERROR':
          if (event === 'RECOVERY_SUCCESS') {
            await this.transitionToWaitingForPlayers();
          } else if (event === 'RECOVERY_FAILED') {
            await this.transitionToInitializing();
          }
          break;
      }
    } catch (error) {
      await this.handleError(error);
    }
  }

  async processFinalBets() {
    const bets = await Bet.findAll({
      where: { gameId: this.currentGame.id, processed: false }
    });

    for (const bet of bets) {
      try {
        await this.matchBet(bet);
      } catch (error) {
        console.error(`Error processing bet ${bet.id}:`, error);
      }
    }
    
    await this.transition('BETS_PROCESSED');
  }

  async matchBet(bet) {
    const transaction = await sequelize.transaction();
    try {
      const oppositeType = bet.betType === 'red' ? 'black' : 'red';
      const matchingBet = await Bet.findOne({
        where: {
          gameId: this.currentGame.id,
          betType: oppositeType,
          amount: bet.amount,
          matched: false
        },
        transaction
      });

      if (matchingBet) {
        await Promise.all([
          bet.update({ matched: true, processed: true }, { transaction }),
          matchingBet.update({ matched: true, processed: true }, { transaction })
        ]);
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async processWinnings(result, transaction) {
    const winningBets = await Bet.findAll({
      where: {
        gameId: this.currentGame.id,
        betType: result,
        matched: true
      },
      transaction
    });

    for (const bet of winningBets) {
      const winnings = Math.floor(bet.amount * 2 * 0.975); // 2.5% fee
      await WalletService.credit(bet.userId, winnings, transaction);
    }

    // Refund unmatched bets
    const unmatchedBets = await Bet.findAll({
      where: {
        gameId: this.currentGame.id,
        matched: false
      },
      transaction
    });

    for (const bet of unmatchedBets) {
      await WalletService.refund(bet.userId, bet.amount, transaction);
    }
  }

  async cleanupGame() {
    await Bet.update(
      { processed: true },
      { where: { gameId: this.currentGame.id } }
    );
    await this.transition('CLEANUP_COMPLETED');
  }

  async recoverGame() {
    this.clearAllTimers();
    const lastGame = await Game.findOne({
      where: { status: { [Op.ne]: 'ERROR' } },
      order: [['createdAt', 'DESC']]
    });

    if (lastGame) {
      this.currentGame = lastGame;
      return true;
    }
    return false;
  }

  clearAllTimers() {
    for (const [key, timer] of this.timers.entries()) {
      clearTimeout(timer);
      this.timers.delete(key);
    }
  }

  async updatePlayerCount() {
    const playerCount = this.connectedPlayers.size;
    await this.currentGame.update({ playerCount });
    
    if (playerCount >= this.MIN_PLAYERS) {
      await this.transition('MIN_PLAYERS_REACHED');
    }
  }

  async addPlayer(playerId) {
    this.connectedPlayers.add(playerId);
    await this.updatePlayerCount();
  }

  async removePlayer(playerId) {
    this.connectedPlayers.delete(playerId);
    await this.transition('PLAYER_DISCONNECTED');
  }

  getCurrentGame() {
    return this.currentGame;
  }
}

module.exports = new GameStateManager();