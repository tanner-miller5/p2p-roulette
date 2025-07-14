
#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting WebSocket connection fix...${NC}"

# Update server Socket.IO setup
update_server_socket() {
    mkdir -p server/src/socket
    echo -e "${YELLOW}Updating server socket setup...${NC}"
    cat > "server/src/socket/index.js" << 'EOL'
const { Server } = require('socket.io');
const gameHandler = require('./gameHandler');

function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
      allowedHeaders: ["my-custom-header"],
    },
    transports: ['websocket', 'polling'],
    path: '/socket.io/',
    serveClient: false,
    pingTimeout: 60000,
    pingInterval: 25000,
    upgradeTimeout: 10000,
    allowUpgrades: true,
    cookie: false
  });

  gameHandler(io);

  return io;
}

module.exports = initializeSocket;
EOL
}

# Update server entry point
update_server_index() {
    echo -e "${YELLOW}Updating server entry point...${NC}"
    cat > "server/src/index.js" << 'EOL'
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { initializeDatabase } = require('./models');
const initializeSocket = require('./socket');

const app = express();
const server = http.createServer(app);

// Configure CORS
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  methods: ["GET", "POST"],
  credentials: true,
  allowedHeaders: ["my-custom-header"],
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const startServer = async () => {
  try {
    // Initialize database
    await initializeDatabase();

    // Initialize Socket.IO
    const io = initializeSocket(server);

    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`WebSocket server is ready`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
EOL
}

# Update client socket service
update_client_socket_service() {
    mkdir -p client/src/services
    echo -e "${YELLOW}Updating client socket service...${NC}"
    cat > "client/src/services/socket.js" << 'EOL'
import { io } from 'socket.io-client';
import { store } from '../store/store';
import { setGameState } from '../store/slices/gameSlice';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect() {
    if (this.socket?.connected || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    const socketUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      path: '/socket.io/',
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true,
      withCredentials: true
    });

    this.setupListeners();
  }

  setupListeners() {
    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.joinGame();
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.handleConnectionError();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected:', reason);
      this.handleDisconnect(reason);
    });

    this.socket.on('gameState', (state) => {
      store.dispatch(setGameState(state));
    });

    this.socket.on('error', (error) => {
      console.error('Server error:', error);
    });
  }

  handleConnectionError() {
    this.isConnecting = false;
    this.reconnectAttempts++;

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.socket?.close();
      return;
    }

    setTimeout(() => {
      if (!this.socket?.connected) {
        this.connect();
      }
    }, 1000 * Math.min(this.reconnectAttempts, 5));
  }

  handleDisconnect(reason) {
    this.isConnecting = false;
    if (reason === 'io server disconnect') {
      // Server initiated disconnect, try reconnecting
      setTimeout(() => this.connect(), 1000);
    }
  }

  joinGame() {
    if (this.socket?.connected) {
      this.socket.emit('joinGame');
    }
  }

  placeBet(betType, amount) {
    if (this.socket?.connected) {
      this.socket.emit('placeBet', { betType, amount });
    } else {
      console.error('Cannot place bet: Socket not connected');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnecting = false;
  }
}

export default new SocketService();
EOL
}

# Update client hook
update_client_socket_hook() {
    mkdir -p client/src/hooks
    echo -e "${YELLOW}Updating client socket hook...${NC}"
    cat > "client/src/hooks/useSocket.js" << 'EOL'
import { useEffect, useState } from 'react';
import socketService from '../services/socket';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    socketService.connect();
    setSocket(socketService.socket);

    const updateSocket = () => {
      setSocket(socketService.socket);
    };

    // Listen for socket instance changes
    socketService.socket?.on('connect', updateSocket);
    socketService.socket?.on('disconnect', updateSocket);

    return () => {
      socketService.socket?.off('connect', updateSocket);
      socketService.socket?.off('disconnect', updateSocket);
      socketService.disconnect();
    };
  }, []);

  return { socket, connected: socket?.connected || false };
};
EOL
}

# Update client environment
update_client_env() {
    echo -e "${YELLOW}Creating client environment files...${NC}"
    cat > "client/.env.development" << 'EOL'
REACT_APP_API_URL=http://localhost:3001
EOL

    cat > "client/.env.production" << 'EOL'
REACT_APP_API_URL=http://localhost:3001
EOL
}

# Update server environment
update_server_env() {
    echo -e "${YELLOW}Updating server environment...${NC}"
    cat > "server/.env" << 'EOL'
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:3000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/p2p_roulette
REDIS_URL=redis://localhost:6379
EOL
}

# Update dependencies
update_dependencies() {
    echo -e "${YELLOW}Updating dependencies...${NC}"

    # Update server dependencies
    cd server
    npm install --save \
        socket.io@4.7.2 \
        cors@2.8.5 \
        express@4.18.2 \
        dotenv@16.3.1
    cd ..

    # Update client dependencies
    cd client
    npm install --save \
        socket.io-client@4.7.2
    cd ..
}

# Create connection test script
create_test_script() {
    echo -e "${YELLOW}Creating connection test script...${NC}"
    cat > "test-connection.js" << 'EOL'
const io = require('socket.io-client');

const socket = io('http://localhost:3001', {
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

// Keep the script running
setTimeout(() => {
  socket.close();
  process.exit(0);
}, 5000);
EOL
}

# Main execution
echo -e "${YELLOW}Starting WebSocket connection fix...${NC}"

if [ -d "server" ] && [ -d "client" ]; then
    update_server_socket
    update_server_index
    update_client_socket_service
    update_client_socket_hook
    update_client_env
    update_server_env
    update_dependencies
    create_test_script

    echo -e "${GREEN}WebSocket connection configuration completed!${NC}"
    echo -e "\n${YELLOW}Please follow these steps:${NC}"
    echo -e "1. Stop all running servers"
    echo -e "2. Clear npm cache:"
    echo -e "   ${GREEN}npm cache clean --force${NC}"
    echo -e "3. Delete node_modules:"
    echo -e "   ${GREEN}npm run clean${NC}"
    echo -e "4. Install dependencies:"
    echo -e "   ${GREEN}npm install${NC}"
    echo -e "5. Start the server:"
    echo -e "   ${GREEN}npm run start:server${NC}"
    echo -e "6. Test the connection:"
    echo -e "   ${GREEN}node test-connection.js${NC}"
    echo -e "7. Start the client:"
    echo -e "   ${GREEN}npm run start:client${NC}"
else
    echo -e "${RED}Error: server or client directory not found!${NC}"
    exit 1
fi