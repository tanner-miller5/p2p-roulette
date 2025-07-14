
#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting betting system implementation...${NC}"

# Create server game service
create_game_service() {
    mkdir -p server/src/services
    echo -e "${YELLOW}Creating game service...${NC}"
    cat > "server/src/services/gameService.js" << 'EOL'
const { Game, Bet, User } = require('../models');

class GameService {
  constructor() {
    this.currentGame = null;
    this.timer = null;
    this.startNewRound();
  }

  async startNewRound() {
    try {
      const game = await Game.create({
        status: 'waiting',
        startTime: new Date()
      });

      this.currentGame = {
        id: game.id,
        status: 'waiting',
        timer: 30,
        bets: {
          red: new Map(),
          black: new Map()
        },
        result: null
      };

      this.startTimer();
      return this.currentGame;
    } catch (error) {
      console.error('Error starting new round:', error);
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

  async placeBet(userId, amount, betType) {
    try {
      if (!this.currentGame || this.currentGame.status !== 'waiting') {
        throw new Error('No active game or betting closed');
      }

      const bet = await Bet.create({
        gameId: this.currentGame.id,
        userId,
        amount,
        betType
      });

      this.currentGame.bets[betType].set(userId, {
        amount,
        matched: false
      });

      this.matchBets(betType);

      return bet;
    } catch (error) {
      console.error('Error placing bet:', error);
      throw error;
    }
  }

  matchBets(betType) {
    const oppositeType = betType === 'red' ? 'black' : 'red';
    const currentBets = this.currentGame.bets[betType];
    const oppositeBets = this.currentGame.bets[oppositeType];

    for (const [userId, bet] of currentBets) {
      if (!bet.matched) {
        for (const [oppositeUserId, oppositeBet] of oppositeBets) {
          if (!oppositeBet.matched && bet.amount === oppositeBet.amount) {
            bet.matched = true;
            oppositeBet.matched = true;
            break;
          }
        }
      }
    }
  }

  async finishRound() {
    try {
      clearInterval(this.timer);
      this.currentGame.status = 'finished';
      const result = Math.random() < 0.5 ? 'red' : 'black';
      this.currentGame.result = result;

      await this.processWinnings(result);
      setTimeout(() => this.startNewRound(), 5000);

      return this.currentGame;
    } catch (error) {
      console.error('Error finishing round:', error);
      throw error;
    }
  }

  async processWinnings(result) {
    try {
      const winningBets = this.currentGame.bets[result];
      for (const [userId, bet] of winningBets) {
        if (bet.matched) {
          const winnings = bet.amount * 2 * 0.975; // 2.5% fee
          await User.increment('balance', {
            by: winnings,
            where: { id: userId }
          });
        } else {
          // Refund unmatched bets
          await User.increment('balance', {
            by: bet.amount,
            where: { id: userId }
          });
        }
      }

      // Refund unmatched bets from losing side
      const losingType = result === 'red' ? 'black' : 'red';
      const losingBets = this.currentGame.bets[losingType];
      for (const [userId, bet] of losingBets) {
        if (!bet.matched) {
          await User.increment('balance', {
            by: bet.amount,
            where: { id: userId }
          });
        }
      }
    } catch (error) {
      console.error('Error processing winnings:', error);
      throw error;
    }
  }

  getCurrentGame() {
    return this.currentGame;
  }
}

module.exports = new GameService();
EOL
}

# Update server socket handler
update_socket_handler() {
    mkdir -p server/src/socket
    echo -e "${YELLOW}Updating socket handler...${NC}"
    cat > "server/src/socket/gameHandler.js" << 'EOL'
const gameService = require('../services/gameService');

function handleSocket(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Send current game state to new client
    const currentGame = gameService.getCurrentGame();
    if (currentGame) {
      socket.emit('gameState', currentGame);
    }

    socket.on('placeBet', async ({ amount, betType }) => {
      try {
        const bet = await gameService.placeBet(socket.id, amount, betType);
        io.emit('betPlaced', bet);
        io.emit('gameState', gameService.getCurrentGame());
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Broadcast game state updates
  setInterval(() => {
    const currentGame = gameService.getCurrentGame();
    if (currentGame) {
      io.emit('gameState', currentGame);
    }
  }, 1000);
}

module.exports = handleSocket;
EOL
}

# Update client game component
update_game_component() {
    echo -e "${YELLOW}Updating game component...${NC}"
    cat > "client/src/components/game/Game.js" << 'EOL'
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGameState } from '../../hooks/useGameState';
import { useSocket } from '../../hooks/useSocket';
import { setGameState } from '../../store/slices/gameSlice';
import './Game.css';

const Game = () => {
  const dispatch = useDispatch();
  const { socket } = useSocket();
  const { gameState, placeBet } = useGameState(socket);
  const balance = useSelector(state => state.user.balance);
  const [betAmount, setBetAmount] = useState(10);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (gameState) {
      dispatch(setGameState(gameState));
    }
  }, [gameState, dispatch]);

  const handleBet = (type) => {
    if (!gameState || gameState.status !== 'waiting') {
      setError('Betting is currently closed');
      return;
    }

    if (balance < betAmount) {
      setError('Insufficient balance');
      return;
    }

    try {
      placeBet(betAmount, type);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="game-container">
      <div className="game-board">
        <div className="timer">Time left: {gameState?.timer || 0}s</div>
        <div className="status">
          Status: {gameState?.status || 'Loading...'}
        </div>
        <div className="balance">
          Balance: {balance} RLT
        </div>
        <div className="betting-controls">
          <input
            type="number"
            min="10"
            max="1000"
            step="10"
            value={betAmount}
            onChange={(e) => setBetAmount(Number(e.target.value))}
            className="bet-amount"
          />
          <div className="betting-options">
            <button
              className="bet-button red"
              onClick={() => handleBet('red')}
              disabled={!gameState || gameState.status !== 'waiting'}
            >
              Bet Red
            </button>
            <button
              className="bet-button black"
              onClick={() => handleBet('black')}
              disabled={!gameState || gameState.status !== 'waiting'}
            >
              Bet Black
            </button>
          </div>
        </div>
        {error && <div className="error">{error}</div>}
        {gameState?.result && (
          <div className={`result ${gameState.result}`}>
            Result: {gameState.result}
          </div>
        )}
      </div>
    </div>
  );
};

export default Game;
EOL

    # Update Game CSS
    cat > "client/src/components/game/Game.css" << 'EOL'
.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  color: white;
}

.game-board {
  background: #2c3e50;
  border-radius: 10px;
  padding: 2rem;
  text-align: center;
  min-width: 300px;
}

.timer {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.status {
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.balance {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}

.betting-controls {
  margin-bottom: 2rem;
}

.bet-amount {
  padding: 0.5rem;
  font-size: 1.2rem;
  width: 100px;
  margin-bottom: 1rem;
  text-align: center;
}

.betting-options {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.bet-button {
  padding: 1rem 2rem;
  border: none;
  border-radius: 5px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: transform 0.2s;
}

.bet-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.bet-button:hover:not(:disabled) {
  transform: scale(1.05);
}

.bet-button.red {
  background-color: #e74c3c;
  color: white;
}

.bet-button.black {
  background-color: #2c3e50;
  color: white;
  border: 2px solid white;
}

.error {
  color: #e74c3c;
  margin-top: 1rem;
}

.result {
  font-size: 2rem;
  padding: 1rem;
  border-radius: 5px;
  margin-top: 1rem;
}

.result.red {
  background-color: #e74c3c;
}

.result.black {
  background-color: #2c3e50;
  border: 2px solid white;
}
EOL
}

# Create database models
create_database_models() {
    mkdir -p server/src/models
    echo -e "${YELLOW}Creating database models...${NC}"
    cat > "server/src/models/index.js" << 'EOL'
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/p2p_roulette', {
  logging: false
});

const Game = require('./game')(sequelize);
const Bet = require('./bet')(sequelize);
const User = require('./user')(sequelize);

Game.hasMany(Bet);
Bet.belongsTo(Game);
User.hasMany(Bet);
Bet.belongsTo(User);

module.exports = {
  sequelize,
  Game,
  Bet,
  User
};
EOL

    cat > "server/src/models/game.js" << 'EOL'
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Game', {
    status: {
      type: DataTypes.STRING,
      allowNull: false
    },
    result: {
      type: DataTypes.STRING
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false
    }
  });
};
EOL

    cat > "server/src/models/bet.js" << 'EOL'
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Bet', {
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    betType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    matched: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });
};
EOL

    cat > "server/src/models/user.js" << 'EOL'
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('User', {
    balance: {
      type: DataTypes.INTEGER,
      defaultValue: 1000
    },
    gamesPlayed: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    gamesWon: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  });
};
EOL
}

# Main execution
echo -e "${YELLOW}Starting betting system implementation...${NC}"

if [ -d "server" ] && [ -d "client" ]; then
    create_game_service
    update_socket_handler
    update_game_component
    create_database_models

    echo -e "${GREEN}Betting system implementation completed!${NC}"
    echo -e "\n${YELLOW}Next steps:${NC}"
    echo -e "1. Create PostgreSQL database: ${GREEN}p2p_roulette${NC}"
    echo -e "2. Update server/.env with database credentials"
    echo -e "3. Run: ${GREEN}npm install --workspace=server${NC}"
    echo -e "4. Start the server: ${GREEN}npm run start:server${NC}"
    echo -e "5. Start the client: ${GREEN}npm run start:client${NC}"
else
    echo -e "${RED}Error: server or client directory not found!${NC}"
    exit 1
fi