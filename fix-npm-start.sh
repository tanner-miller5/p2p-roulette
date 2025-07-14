#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting npm setup fix...${NC}"

# Check if node and npm are installed
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: Node.js and npm are required but not installed.${NC}"
    exit 1
fi

# Function to check and create directories if they don't exist
check_and_create_dirs() {
    dirs=(
        "server/src"
        "shared/src"
        "shared/constants"
        "client/src"
        "client/src/store"
        "client/src/components/common"
        "client/src/components/game"
        "client/src/components/layout"
        "client/src/components/user"
        "client/src/hooks"
        "client/src/pages"
        "client/src/services"
        "client/src/utils"
        "client/src/assets"
    )
    for dir in "${dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            echo -e "${YELLOW}Creating directory: $dir${NC}"
            mkdir -p "$dir"
        fi
    done
}

# Function to create basic server file if it doesn't exist
create_server_file() {
    if [ ! -f "server/src/index.js" ]; then
        echo -e "${YELLOW}Creating basic server/src/index.js${NC}"
        cat > "server/src/index.js" << 'EOL'
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 4000;

io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
EOL
    fi
}

# Function to create basic shared constants if they don't exist
create_shared_constants() {
    if [ ! -f "shared/constants/gameConstants.js" ]; then
        echo -e "${YELLOW}Creating shared/constants/gameConstants.js${NC}"
        cat > "shared/constants/gameConstants.js" << 'EOL'
exports.GAME_STATES = {
  WAITING: 'waiting',
  BETTING: 'betting',
  SPINNING: 'spinning',
  COMPLETE: 'complete'
};

exports.BET_TYPES = {
  RED: 'red',
  BLACK: 'black'
};

exports.PAYOUT_MULTIPLIER = 2;
exports.BETTING_TIME = 30;
exports.SPIN_TIME = 5;
EOL
    fi

    if [ ! -f "shared/src/index.js" ]; then
        echo -e "${YELLOW}Creating shared/src/index.js${NC}"
        cat > "shared/src/index.js" << 'EOL'
const gameConstants = require('../constants/gameConstants');

module.exports = {
  gameConstants
};
EOL
    fi
}

# Function to create necessary environment files
create_env_files() {
    if [ ! -f "server/.env" ]; then
        echo -e "${YELLOW}Creating server/.env${NC}"
        cat > "server/.env" << 'EOL'
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/p2p_roulette
REDIS_URL=redis://localhost:6379
JWT_SECRET=development-secret
EOL
    fi

    if [ ! -f "client/.env" ]; then
        echo -e "${YELLOW}Creating client/.env${NC}"
        cat > "client/.env" << 'EOL'
REACT_APP_API_URL=http://localhost:4000/api
REACT_APP_SOCKET_URL=http://localhost:4000
EOL
    fi
}

# Function to create client files
create_client_files() {
    if [ ! -f "client/src/index.js" ]; then
        echo -e "${YELLOW}Creating client/src/index.js${NC}"
        cat > "client/src/index.js" << 'EOL'
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './store';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
EOL
    fi

    if [ ! -f "client/src/App.js" ]; then
        echo -e "${YELLOW}Creating client/src/App.js${NC}"
        cat > "client/src/App.js" << 'EOL'
import React from 'react';
import { Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<div>Welcome to P2P Roulette</div>} />
      </Routes>
    </div>
  );
};

export default App;
EOL
    fi

    if [ ! -f "client/src/store/index.js" ]; then
        echo -e "${YELLOW}Creating client/src/store/index.js${NC}"
        cat > "client/src/store/index.js" << 'EOL'
import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {
    // Add reducers here
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths in the state
        ignoredActions: ['socket/connected', 'socket/disconnected'],
        ignoredPaths: ['socket.instance'],
      },
    }),
});
EOL
    fi
}

# Main execution
echo -e "${YELLOW}Cleaning up node_modules...${NC}"
rm -rf node_modules */node_modules package-lock.json */package-lock.json

check_and_create_dirs
create_server_file
create_shared_constants
create_env_files
create_client_files  # Add this line

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

# Build shared package
echo -e "${YELLOW}Building shared package...${NC}"
npm run build --workspace=shared

# Verify setup
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Setup completed successfully!${NC}"
    echo -e "${GREEN}You can now run 'npm start' from the root directory${NC}"
else
    echo -e "${RED}Setup failed. Please check the error messages above.${NC}"
    exit 1
fi

# Create helpful message for users
echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "1. Start the application with: ${GREEN}npm start${NC}"
echo -e "2. Client will be available at: ${GREEN}http://localhost:3000${NC}"
echo -e "3. Server will be available at: ${GREEN}http://localhost:4000${NC}"
echo -e "\n${YELLOW}To stop the application:${NC} Press ${GREEN}Ctrl+C${NC}"