
#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting game display fix implementation...${NC}"

# Create Game Component
create_game_component() {
    mkdir -p client/src/components/game
    echo -e "${YELLOW}Creating Game component...${NC}"
    cat > "client/src/components/game/Game.js" << 'EOL'
import React, { useEffect } from 'react';
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

  useEffect(() => {
    if (gameState) {
      dispatch(setGameState(gameState));
    }
  }, [gameState, dispatch]);

  const handleBet = (type) => {
    if (balance >= 10) {
      placeBet(10, type);
    }
  };

  return (
    <div className="game-container">
      <div className="game-board">
        <div className="timer">{gameState?.timer || 0}</div>
        <div className="betting-options">
          <button
            className="bet-button red"
            onClick={() => handleBet('red')}
            disabled={!gameState || gameState.status !== 'waiting'}
          >
            Red
          </button>
          <button
            className="bet-button black"
            onClick={() => handleBet('black')}
            disabled={!gameState || gameState.status !== 'waiting'}
          >
            Black
          </button>
        </div>
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

    # Create Game CSS
    cat > "client/src/components/game/Game.css" << 'EOL'
.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
}

.game-board {
  background: #2c3e50;
  border-radius: 10px;
  padding: 2rem;
  text-align: center;
}

.timer {
  font-size: 3rem;
  margin-bottom: 2rem;
  color: #fff;
}

.betting-options {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
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

.red {
  background-color: #e74c3c;
  color: white;
}

.black {
  background-color: #2c3e50;
  color: white;
}

.result {
  font-size: 2rem;
  padding: 1rem;
  border-radius: 5px;
  color: white;
}

.result.red {
  background-color: #e74c3c;
}

.result.black {
  background-color: #2c3e50;
}
EOL
}

# Create game state hook
create_game_state_hook() {
    echo -e "${YELLOW}Creating useGameState hook...${NC}"
    cat > "client/src/hooks/useGameState.js" << 'EOL'
import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { updateBalance } from '../store/slices/userSlice';

export const useGameState = (socket) => {
  const [gameState, setGameState] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!socket) return;

    socket.on('gameState', (state) => {
      setGameState(state);
    });

    socket.on('result', (result) => {
      setGameState(prev => ({ ...prev, result, status: 'finished' }));
    });

    socket.on('winnings', (amount) => {
      dispatch(updateBalance(amount));
    });

    return () => {
      socket.off('gameState');
      socket.off('result');
      socket.off('winnings');
    };
  }, [socket, dispatch]);

  const placeBet = useCallback((amount, betType) => {
    if (socket) {
      socket.emit('placeBet', { amount, betType });
      dispatch(updateBalance(-amount));
    }
  }, [socket, dispatch]);

  return { gameState, placeBet };
};
EOL
}

# Create socket hook
create_socket_hook() {
    echo -e "${YELLOW}Creating useSocket hook...${NC}"
    cat > "client/src/hooks/useSocket.js" << 'EOL'
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:3001');
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  return { socket };
};
EOL
}

# Create game slice
create_game_slice() {
    mkdir -p client/src/store/slices
    echo -e "${YELLOW}Creating game slice...${NC}"
    cat > "client/src/store/slices/gameSlice.js" << 'EOL'
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  status: 'waiting',
  timer: 30,
  result: null,
  bets: [],
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setGameState: (state, action) => {
      return { ...state, ...action.payload };
    },
    resetGame: () => initialState,
  },
});

export const { setGameState, resetGame } = gameSlice.actions;
export default gameSlice.reducer;
EOL
}

# Create user slice
create_user_slice() {
    echo -e "${YELLOW}Creating user slice...${NC}"
    cat > "client/src/store/slices/userSlice.js" << 'EOL'
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  balance: 1000,
  username: 'Player',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateBalance: (state, action) => {
      state.balance += action.payload;
    },
    setUsername: (state, action) => {
      state.username = action.payload;
    },
  },
});

export const { updateBalance, setUsername } = userSlice.actions;
export default userSlice.reducer;
EOL
}

# Update store configuration
update_store() {
    echo -e "${YELLOW}Updating store configuration...${NC}"
    cat > "client/src/store/store.js" << 'EOL'
import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './slices/gameSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    game: gameReducer,
    user: userReducer,
  },
});
EOL
}

# Update App.js to include Game component
update_app() {
    echo -e "${YELLOW}Updating App.js...${NC}"
    cat > "client/src/App.js" << 'EOL'
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Game from './components/game/Game';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>P2P Roulette</h1>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Game />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
EOL
}

# Install required dependencies
install_dependencies() {
    echo -e "${YELLOW}Installing required dependencies...${NC}"
    cd client
    npm install socket.io-client@4.7.2
    cd ..
}

# Main execution
echo -e "${YELLOW}Starting implementation...${NC}"

if [ -d "client" ]; then
    create_game_component
    create_game_state_hook
    create_socket_hook
    create_game_slice
    create_user_slice
    update_store
    update_app
    install_dependencies

    echo -e "${GREEN}Game implementation completed!${NC}"
    echo -e "\n${YELLOW}Next steps:${NC}"
    echo -e "1. Start the server: ${GREEN}npm run start --workspace=server${NC}"
    echo -e "2. Start the client: ${GREEN}npm run start --workspace=client${NC}"
    echo -e "3. Make sure your .env file in client contains: ${GREEN}REACT_APP_API_URL=http://localhost:3001${NC}"
else
    echo -e "${RED}Error: client directory not found!${NC}"
    exit 1
fi