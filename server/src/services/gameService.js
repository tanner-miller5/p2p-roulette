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

      // Mark all bets as processed
      await Bet.update({
        processed: true
      }, {
        where: {
          gameId: this.currentGame.id
        },
        transaction
      });

      // Determine color from number for bet processing
      const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
      const resultColor = redNumbers.includes(resultNumber) ? 'red' : 'black';

      // Process unmatched bets (refund remaining amounts)
      for (const betType of ['red', 'black']) {
        const bets = Array.from(this.currentGame.bets[betType].entries());
        for (const [userId, bet] of bets) {
          if (bet.amount > 0) { // Refund remaining unmatched amount
            await Wallet.increment('balance', {
              by: bet.amount,
              where: { userId },
              transaction
            });
          }
        }
      }

      // Process matched bets using the matches array
      if (this.currentGame.matches) {
        for (const match of this.currentGame.matches) {
          const winningUserId = match.bet1Type === resultColor ? match.user1 : match.user2;
          const winnings = Math.floor(match.amount * 2 * 0.975); // 2.5% fee
          
          await Wallet.increment('balance', {
            by: winnings,
            where: { userId: winningUserId },
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

async matchBets(betType) {
  console.log(`matchBets called for ${betType}`);
  const oppositeType = betType === 'red' ? 'black' : 'red';
  
  // Get all unmatched bets and convert to a workable format
  const currentBets = Array.from(this.currentGame.bets[betType].entries())
    .filter(([_, bet]) => !bet.matched)
    .map(([userId, bet]) => ({
      userId,
      amount: bet.amount,
      originalAmount: bet.originalAmount || bet.amount,
      matched: false,
      betType
    }));
    
  const oppositeBets = Array.from(this.currentGame.bets[oppositeType].entries())
    .filter(([_, bet]) => !bet.matched)
    .map(([userId, bet]) => ({
      userId,
      amount: bet.amount,
      originalAmount: bet.originalAmount || bet.amount,
      matched: false,
      betType: oppositeType
    }));

  console.log(`Current bets (${betType}):`, currentBets);
  console.log(`Opposite bets (${oppositeType}):`, oppositeBets);

  // Sort bets by amount (smallest first for optimal matching)
  currentBets.sort((a, b) => a.amount - b.amount);
  oppositeBets.sort((a, b) => a.amount - b.amount);

  const dbUpdates = []; // Track database updates needed

  // Perform matching with splitting
  for (let i = 0; i < currentBets.length; i++) {
    const currentBet = currentBets[i];
    if (currentBet.matched) continue;

    for (let j = 0; j < oppositeBets.length; j++) {
      const oppositeBet = oppositeBets[j];
      if (oppositeBet.matched || oppositeBet.userId === currentBet.userId) continue;

      // Determine the smaller amount to match
      const matchAmount = Math.min(currentBet.amount, oppositeBet.amount);

      console.log(`Matching ${matchAmount} between user ${currentBet.userId} (${betType}) and user ${oppositeBet.userId} (${oppositeType})`);

      // Create the match
      this.createMatch(currentBet, oppositeBet, matchAmount);

      // Track database updates
      dbUpdates.push({
        userId: currentBet.userId,
        betType: currentBet.betType,
        matchedAmount: matchAmount
      });
      dbUpdates.push({
        userId: oppositeBet.userId,
        betType: oppositeBet.betType,
        matchedAmount: matchAmount
      });

      // Update remaining amounts
      currentBet.amount -= matchAmount;
      oppositeBet.amount -= matchAmount;

      // Mark as matched if fully consumed
      if (currentBet.amount === 0) {
        currentBet.matched = true;
      }
      if (oppositeBet.amount === 0) {
        oppositeBet.matched = true;
      }

      // If current bet is fully matched, move to next
      if (currentBet.matched) break;
    }
  }

  console.log('Database updates to perform:', dbUpdates);

  // Update database records ONLY if there are updates to make
  if (dbUpdates.length > 0) {
    await this.updateBetRecordsInDatabase(dbUpdates);
  }

  // Update the game state with the new bet structure
  this.updateGameStateAfterMatching(betType, currentBets);
  this.updateGameStateAfterMatching(oppositeType, oppositeBets);
}

async updateBetRecordsInDatabase(updates) {
  console.log('updateBetRecordsInDatabase called with updates:', updates);
  const transaction = await sequelize.transaction();
  
  try {
    // Group updates by user and bet type
    const groupedUpdates = new Map();
    
    for (const update of updates) {
      const key = `${update.userId}-${update.betType}`;
      if (!groupedUpdates.has(key)) {
        groupedUpdates.set(key, {
          userId: update.userId,
          betType: update.betType,
          totalMatchedAmount: 0
        });
      }
      groupedUpdates.get(key).totalMatchedAmount += update.matchedAmount;
    }

    console.log('Grouped updates:', Array.from(groupedUpdates.values()));

    // Update each bet record
    for (const [_, update] of groupedUpdates) {
      // Find the bet record
      const betRecord = await Bet.findOne({
        where: {
          userId: update.userId,
          gameId: this.currentGame.id,
          betType: update.betType
        },
        transaction
      });

      console.log('Found bet record:', betRecord ? betRecord.toJSON() : 'null');

      if (betRecord) {
        // Convert strings to numbers properly
        const currentMatchedAmount = parseFloat(betRecord.matchedAmount) || 0;
        const totalMatchedAmount = parseFloat(update.totalMatchedAmount);
        const betAmount = parseFloat(betRecord.amount);
        
        const newMatchedAmount = currentMatchedAmount + totalMatchedAmount;
        const isFullyMatched = newMatchedAmount >= betAmount;

        console.log(`Current: ${currentMatchedAmount}, Additional: ${totalMatchedAmount}, Total Bet: ${betAmount}`);
        console.log(`Updating bet ${betRecord.id}: matched=${isFullyMatched}, matchedAmount=${newMatchedAmount}`);

        const [affectedRows] = await Bet.update({
          matched: isFullyMatched,
          matchedAmount: newMatchedAmount
        }, {
          where: {
            id: betRecord.id
          },
          transaction
        });

        console.log(`Update affected ${affectedRows} rows`);

        // Verify the update
        const updatedRecord = await Bet.findByPk(betRecord.id, { transaction });
        console.log('Updated record:', updatedRecord ? updatedRecord.toJSON() : 'null');
      } else {
        console.log(`No bet record found for userId: ${update.userId}, gameId: ${this.currentGame.id}, betType: ${update.betType}`);
      }
    }

    await transaction.commit();
    console.log('Transaction committed successfully');
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating bet records:', error);
    throw error;
  }
}

createMatch(bet1, bet2, matchAmount) {
  // Record the match for payout processing
  if (!this.currentGame.matches) {
    this.currentGame.matches = [];
  }
  
  this.currentGame.matches.push({
    user1: bet1.userId,
    user2: bet2.userId,
    amount: matchAmount,
    bet1Type: bet1.betType,
    bet2Type: bet2.betType
  });
}

updateGameStateAfterMatching(betType, processedBets) {
  // Clear the current bets for this type
  this.currentGame.bets[betType].clear();
  
  // Group processed bets by userId and rebuild the bet structure
  const userBets = new Map();
  
  for (const bet of processedBets) {
    if (!userBets.has(bet.userId)) {
      userBets.set(bet.userId, {
        totalAmount: 0,
        matchedAmount: 0,
        remainingAmount: 0,
        originalAmount: bet.originalAmount
      });
    }
    
    const userBet = userBets.get(bet.userId);
    userBet.totalAmount += bet.originalAmount;
    
    if (bet.amount === 0) {
      // Fully matched
      userBet.matchedAmount += (bet.originalAmount - bet.amount);
    } else {
      // Partially or not matched
      userBet.remainingAmount += bet.amount;
      userBet.matchedAmount += (bet.originalAmount - bet.amount);
    }
  }
  
  // Rebuild the bets map with the new structure
  for (const [userId, userBet] of userBets) {
    this.currentGame.bets[betType].set(userId, {
      amount: userBet.remainingAmount,
      matchedAmount: userBet.matchedAmount,
      originalAmount: userBet.originalAmount,
      matched: userBet.remainingAmount === 0
    });
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