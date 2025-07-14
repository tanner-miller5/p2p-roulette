
#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting database models fix...${NC}"

# Update database configuration
update_database_config() {
    mkdir -p server/src/config
    echo -e "${YELLOW}Updating database configuration...${NC}"
    cat > "server/src/config/database.js" << 'EOL'
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: console.log,
  define: {
    timestamps: true,
    underscored: true
  }
});

module.exports = sequelize;
EOL
}

# Update models
update_models() {
    mkdir -p server/src/models
    echo -e "${YELLOW}Updating models...${NC}"

    # Game model
    cat > "server/src/models/game.js" << 'EOL'
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Game = sequelize.define('Game', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    status: {
      type: DataTypes.ENUM('waiting', 'active', 'finished'),
      allowNull: false,
      defaultValue: 'waiting'
    },
    result: {
      type: DataTypes.ENUM('red', 'black'),
      allowNull: true
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'games',
    timestamps: true,
    underscored: true
  });

  return Game;
};
EOL

    # Bet model
    cat > "server/src/models/bet.js" << 'EOL'
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Bet = sequelize.define('Bet', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'user_id'
    },
    gameId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'game_id',
      references: {
        model: 'games',
        key: 'id'
      }
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    betType: {
      type: DataTypes.ENUM('red', 'black'),
      allowNull: false,
      field: 'bet_type'
    },
    matched: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    processed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'bets',
    timestamps: true,
    underscored: true
  });

  return Bet;
};
EOL

    # User model
    cat > "server/src/models/user.js" << 'EOL'
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    balance: {
      type: DataTypes.INTEGER,
      defaultValue: 1000,
      allowNull: false
    },
    gamesPlayed: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'games_played'
    },
    gamesWon: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'games_won'
    }
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true
  });

  return User;
};
EOL

    # Index file for models
    cat > "server/src/models/index.js" << 'EOL'
const sequelize = require('../config/database');
const defineGame = require('./game');
const defineBet = require('./bet');
const defineUser = require('./user');

const Game = defineGame(sequelize);
const Bet = defineBet(sequelize);
const User = defineUser(sequelize);

// Define relationships
Game.hasMany(Bet, {
  foreignKey: 'game_id',
  as: 'bets'
});
Bet.belongsTo(Game, {
  foreignKey: 'game_id',
  as: 'game'
});

const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Sync models with force option in development
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ force: true });
      console.log('Database tables recreated.');

      // Create initial user if none exists
      const userCount = await User.count();
      if (userCount === 0) {
        await User.create({
          id: 'system',
          balance: 1000000 // System user with high balance
        });
        console.log('System user created.');
      }
    } else {
      await sequelize.sync();
      console.log('Database tables synchronized.');
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  Game,
  Bet,
  User,
  initializeDatabase
};
EOL
}

# Update game service
update_game_service() {
    mkdir -p server/src/services
    echo -e "${YELLOW}Updating game service...${NC}"
    cat > "server/src/services/gameService.js" << 'EOL'
const { Game, Bet, User, sequelize } = require('../models');

class GameService {
  constructor() {
    this.currentGame = null;
    this.timer = null;
  }

  async startNewRound() {
    const transaction = await sequelize.transaction();

    try {
      const game = await Game.create({
        status: 'waiting',
        startTime: new Date()
      }, { transaction });

      await transaction.commit();

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
      await transaction.rollback();
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
    const transaction = await sequelize.transaction();

    try {
      if (!this.currentGame || this.currentGame.status !== 'waiting') {
        throw new Error('No active game or betting closed');
      }

      const user = await User.findByPk(userId, { transaction });
      if (!user || user.balance < amount) {
        throw new Error('Insufficient balance');
      }

      const bet = await Bet.create({
        gameId: this.currentGame.id,
        userId,
        amount,
        betType
      }, { transaction });

      await User.decrement('balance', {
        by: amount,
        where: { id: userId },
        transaction
      });

      this.currentGame.bets[betType].set(userId, {
        amount,
        matched: false
      });

      await transaction.commit();
      this.matchBets(betType);

      return bet;
    } catch (error) {
      await transaction.rollback();
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
    const transaction = await sequelize.transaction();

    try {
      clearInterval(this.timer);
      this.currentGame.status = 'finished';
      const result = Math.random() < 0.5 ? 'red' : 'black';
      this.currentGame.result = result;

      await Game.update({
        status: 'finished',
        result,
        endTime: new Date()
      }, {
        where: { id: this.currentGame.id },
        transaction
      });

      await this.processWinnings(result, transaction);
      await transaction.commit();

      setTimeout(() => this.startNewRound(), 5000);
      return this.currentGame;
    } catch (error) {
      await transaction.rollback();
      console.error('Error finishing round:', error);
      throw error;
    }
  }

  async processWinnings(result, transaction) {
    try {
      const winningBets = this.currentGame.bets[result];
      for (const [userId, bet] of winningBets) {
        if (bet.matched) {
          const winnings = bet.amount * 2 * 0.975; // 2.5% fee
          await User.increment('balance', {
            by: winnings,
            where: { id: userId },
            transaction
          });
          await User.increment('gamesWon', {
            by: 1,
            where: { id: userId },
            transaction
          });
        } else {
          // Refund unmatched bets
          await User.increment('balance', {
            by: bet.amount,
            where: { id: userId },
            transaction
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
            where: { id: userId },
            transaction
          });
        }
      }

      // Update all users' games played count
      const uniqueUsers = new Set([
        ...Array.from(winningBets.keys()),
        ...Array.from(losingBets.keys())
      ]);

      for (const userId of uniqueUsers) {
        await User.increment('gamesPlayed', {
          by: 1,
          where: { id: userId },
          transaction
        });
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

# Create database initialization script
create_init_script() {
    echo -e "${YELLOW}Creating database initialization script...${NC}"
    cat > "server/src/scripts/initDb.js" << 'EOL'
require('dotenv').config();
const { initializeDatabase } = require('../models');

async function init() {
  try {
    await initializeDatabase();
    console.log('Database initialized successfully');
    process.exit(0);
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

init();
EOL
}

# Update package.json scripts
update_package_json() {
    echo -e "${YELLOW}Updating package.json scripts...${NC}"
    cd server
    if [ -f "package.json" ]; then
        # Add init-db script using node
        npm pkg set scripts.init-db="node src/scripts/initDb.js"
    fi
    cd ..
}

# Main execution
echo -e "${YELLOW}Starting database models fix...${NC}"

if [ -d "server" ]; then
    update_database_config
    update_models
    update_game_service
    create_init_script
    update_package_json

    echo -e "${GREEN}Database models fix completed!${NC}"
    echo -e "\n${YELLOW}Please follow these steps:${NC}"
    echo -e "1. Stop all running servers"
    echo -e "2. Make sure PostgreSQL is running:"
    echo -e "   ${GREEN}docker-compose up -d${NC}"
    echo -e "3. Initialize the database:"
    echo -e "   ${GREEN}cd server && npm run init-db${NC}"
    echo -e "4. Start the server:"
    echo -e "   ${GREEN}npm run start:server${NC}"
    echo -e "5. Start the client:"
    echo -e "   ${GREEN}npm run start:client${NC}"
else
    echo -e "${RED}Error: server directory not found!${NC}"
    exit 1
fi