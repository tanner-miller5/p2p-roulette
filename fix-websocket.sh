
#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Fixing WebSocket connection issues...${NC}"

# Create server Socket.IO setup
create_server_socket() {
    mkdir -p server/src/socket

    echo -e "${YELLOW}Creating server socket setup...${NC}"
    cat > "server/src/socket/index.js" << 'EOL'
const { Server } = require('socket.io');
const gameService = require('../services/gameService');

function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('joinGame', async () => {
      try {
        const game = await gameService.getCurrentGame();
        socket.emit('gameState', game);
      } catch (error) {
        console.error('Error joining game:', error);
      }
    });

    socket.on('placeBet', async ({ betType, amount }) => {
      try {
        const bet = await gameService.placeBet(socket.id, amount, betType);
        io.emit('betPlaced', bet);
      } catch (error) {
        console.error('Error placing bet:', error);
        socket.emit('error', { message: 'Failed to place bet' });
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

module.exports = initializeSocket;
EOL
}

# Update server index.js
update_server_index() {
    echo -e "${YELLOW}Updating server index.js...${NC}"
    cat > "server/src/index.js" << 'EOL'
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const initializeSocket = require('./socket');

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));

app.use(express.json());

// Initialize Socket.IO
const io = initializeSocket(server);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
EOL
}

# Update client socket configuration
update_client_socket() {
    echo -e "${YELLOW}Updating client socket configuration...${NC}"
    mkdir -p client/src/services

    cat > "client/src/services/socket.js" << 'EOL'
import { io } from 'socket.io-client';
import { store } from '../store/store';
import { setGameState } from '../store/slices/gameSlice';

class SocketService {
  constructor() {
    this.socket = null;
    this.connect();
  }

  connect() {
    this.socket = io(process.env.REACT_APP_API_URL || 'http://localhost:3001', {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.setupListeners();
  }

  setupListeners() {
    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.joinGame();
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    this.socket.on('gameState', (state) => {
      store.dispatch(setGameState(state));
    });

    this.socket.on('betPlaced', (bet) => {
      console.log('Bet placed:', bet);
    });

    this.socket.on('error', (error) => {
      console.error('Server error:', error);
    });
  }

  joinGame() {
    this.socket.emit('joinGame');
  }

  placeBet(betType, amount) {
    this.socket.emit('placeBet', { betType, amount });
  }
}

export default new SocketService();
EOL

    # Update useSocket hook
    cat > "client/src/hooks/useSocket.js" << 'EOL'
import { useEffect, useState } from 'react';
import socketService from '../services/socket';

export const useSocket = () => {
  const [socket, setSocket] = useState(socketService.socket);

  useEffect(() => {
    setSocket(socketService.socket);

    return () => {
      if (socketService.socket) {
        socketService.socket.disconnect();
      }
    };
  }, []);

  return { socket };
};
EOL
}

# Update environment files
create_env_files() {
    echo -e "${YELLOW}Creating environment files...${NC}"

    # Client .env
    cat > "client/.env" << 'EOL'
REACT_APP_API_URL=http://localhost:3001
EOL

    # Server .env
    cat > "server/.env" << 'EOL'
PORT=3001
CLIENT_URL=http://localhost:3000
EOL
}

# Update server package.json
update_server_package() {
    echo -e "${YELLOW}Updating server package.json...${NC}"
    cd server
    npm install --save socket.io@4.7.2 cors@2.8.5 dotenv@16.3.1
    cd ..
}

# Main execution
echo -e "${YELLOW}Starting WebSocket fixes...${NC}"

if [ -d "client" ] && [ -d "server" ]; then
    create_server_socket
    update_server_index
    update_client_socket
    create_env_files
    update_server_package

    echo -e "${GREEN}WebSocket configuration has been updated!${NC}"
    echo -e "\n${YELLOW}Please follow these steps:${NC}"
    echo -e "1. Stop all running servers"
    echo -e "2. Delete node_modules: ${GREEN}npm run clean${NC}"
    echo -e "3. Install dependencies: ${GREEN}npm install${NC}"
    echo -e "4. Start the server: ${GREEN}npm run start:server${NC}"
    echo -e "5. Start the client: ${GREEN}npm run start:client${NC}"
else
    echo -e "${RED}Error: client or server directory not found!${NC}"
    exit 1
fi