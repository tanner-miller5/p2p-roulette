
#!/bin/bash

# Function to create React component
create_react_component() {
    local name=$1
    local dir=$2
    local description=$3

    # JSX file
    cat > "$dir/$name.jsx" << EOL
import React from 'react';
import PropTypes from 'prop-types';
import './$name.css';

/**
 * $description
 */
export const $name = ({ children, ...props }) => {
  return (
    <div className="$name" {...props}>
      {children}
    </div>
  );
};

$name.propTypes = {
  children: PropTypes.node
};

export default $name;
EOL

    # CSS file
    cat > "$dir/$name.css" << EOL
.$name {
  display: flex;
  flex-direction: column;
  position: relative;
}
EOL

    # Test file
    cat > "$dir/$name.test.jsx" << EOL
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { $name } from './$name';

describe('$name Component', () => {
  it('renders without crashing', () => {
    render(<$name />);
  });

  it('renders children correctly', () => {
    render(<$name>Test Content</$name>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});
EOL
}

# Create Redux slice
create_redux_slice() {
    local name=$1
    local dir=$2

    cat > "$dir/${name}Slice.js" << EOL
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  error: null,
  data: null
};

const ${name}Slice = createSlice({
  name: '${name}',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setData: (state, action) => {
      state.data = action.payload;
    },
    reset: () => initialState
  }
});

export const { setLoading, setError, setData, reset } = ${name}Slice.actions;
export default ${name}Slice.reducer;
EOL
}

# Create client structure
mkdir -p client/src/{components,pages,services,store,hooks,utils}

# Create components
mkdir -p client/src/components/{game,user}

# Game components
create_react_component "RouletteWheel" "client/src/components/game" "Simple roulette wheel with red/black slots"
create_react_component "BettingButtons" "client/src/components/game" "Red and black betting buttons"
create_react_component "GameTimer" "client/src/components/game" "Round countdown timer"
create_react_component "BetHistory" "client/src/components/game" "Display recent bet results"

# User components
create_react_component "Profile" "client/src/components/user" "User profile display"
create_react_component "Balance" "client/src/components/user" "Practice currency balance"
create_react_component "Statistics" "client/src/components/user" "Win/loss statistics"

# Create game constants
mkdir -p shared/constants
cat > shared/constants/gameConstants.js << EOL
export const GAME_STATES = {
  WAITING: 'waiting',
  BETTING: 'betting',
  SPINNING: 'spinning',
  COMPLETE: 'complete'
};

export const BET_TYPES = {
  RED: 'red',
  BLACK: 'black'
};

export const PAYOUT_MULTIPLIER = 2; // 1:1 payout for red/black bets

export const BETTING_TIME = 30; // seconds
export const SPIN_TIME = 5; // seconds
EOL

# Create socket service
cat > client/src/services/socket.js << EOL
import io from 'socket.io-client';
import { store } from '../store/store';
import { setGameState } from '../store/slices/gameSlice';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    this.socket = io(process.env.REACT_APP_SOCKET_URL);
    this.setupListeners();
  }

  setupListeners() {
    this.socket.on('gameState', (state) => {
      store.dispatch(setGameState(state));
    });

    this.socket.on('betPlaced', (bet) => {
      // Handle new bet
    });

    this.socket.on('gameResult', (result) => {
      // Handle game result
    });
  }

  placeBet(betType, amount) {
    this.socket.emit('placeBet', { betType, amount });
  }

  joinGame() {
    this.socket.emit('joinGame');
  }
}

export const socketService = new SocketService();
EOL

# Create server models
mkdir -p server/src/{models,controllers,routes,services}

cat > server/src/models/User.js << EOL
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class User extends Model {}

User.init({
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  balance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 1000.00
  },
  lastDailyBonus: {
    type: DataTypes.DATE
  },
  totalGames: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  gamesWon: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  sequelize,
  modelName: 'User'
});

module.exports = User;
EOL

cat > server/src/models/Game.js << EOL
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Game extends Model {}

Game.init({
  status: {
    type: DataTypes.ENUM('waiting', 'betting', 'spinning', 'complete'),
    defaultValue: 'waiting'
  },
  result: {
    type: DataTypes.ENUM('red', 'black'),
    allowNull: true
  },
  startTime: {
    type: DataTypes.DATE
  },
  endTime: {
    type: DataTypes.DATE
  }
}, {
  sequelize,
  modelName: 'Game'
});

module.exports = Game;
EOL

cat > server/src/models/Bet.js << EOL
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Bet extends Model {}

Bet.init({
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  betType: {
    type: DataTypes.ENUM('red', 'black'),
    allowNull: false
  },
  won: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  payout: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Bet'
});

module.exports = Bet;
EOL

# Create game service
cat > server/src/services/gameService.js << EOL
const { Game, Bet, User } = require('../models');
const { GAME_STATES } = require('../../shared/constants/gameConstants');

class GameService {
  constructor() {
    this.currentGame = null;
    this.timer = null;
  }

  async createGame() {
    const game = await Game.create({
      status: 'waiting',
      startTime: new Date()
    });

    this.currentGame = {
      id: game.id,
      timer: 30,
      bets: new Map()
    };

    return game;
  }

  async placeBet(userId, amount, betType) {
    const bet = await Bet.create({
      gameId: this.currentGame.id,
      userId,
      amount,
      betType
    });
    return bet;
  }

  generateResult() {
    return Math.random() < 0.5 ? 'red' : 'black';
  }

  async processWinnings(gameId) {
    const game = await Game.findByPk(gameId, {
      include: [{ model: Bet, include: [User] }]
    });

    const result = game.result;
    for (const bet of game.Bets) {
      if (bet.betType === result) {
        const winnings = bet.amount * 2;
        await bet.User.increment('balance', { by: winnings });
        await bet.User.increment('gamesWon');
      }
      await bet.User.increment('totalGames');
    }
  }
}

module.exports = new GameService();
EOL

# Create configuration files
cat > .env.example << EOL
# Client
REACT_APP_API_URL=http://localhost:4000
REACT_APP_SOCKET_URL=http://localhost:4000

# Server
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/p2p_roulette
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-jwt-secret
INITIAL_BALANCE=1000
DAILY_BONUS_AMOUNT=100
EOL

# Create docker-compose
cat > docker-compose.yml << EOL
version: '3.8'
services:
  client:
    build:
      context: ./client
      dockerfile: ../docker/client/Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    volumes:
      - ./client:/app
      - /app/node_modules

  server:
    build:
      context: ./server
      dockerfile: ../docker/server/Dockerfile
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:postgres@database:5432/p2p_roulette
      - REDIS_URL=redis://redis:6379
    volumes:
      - ./server:/app
      - /app/node_modules
    depends_on:
      - database
      - redis

  database:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=p2p_roulette
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
EOL

echo "Project files implemented successfully!"