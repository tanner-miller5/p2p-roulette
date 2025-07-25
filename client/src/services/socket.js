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
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('No authentication token found');
      return;
    }

    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';
    console.log('Connecting to socket server at:', socketUrl);

    this.socket = io(socketUrl, {
      auth: { token }, // Add the token to socket auth
      transports: ['websocket', 'polling'],
      path: '/socket.io/',
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true,
      forceNew: true
    });

    this.setupListeners();
  }

  setupListeners() {
    this.socket.on('connect', () => {
      console.log('Socket connected successfully');
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.joinGame();
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.handleConnectionError();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.handleDisconnect(reason);
    });

    this.socket.on('gameState', (state) => {
      console.log('Received game state:', state);
      if (state && state.timer !== undefined) {
        console.log('Timer value:', state.timer);
      }
      if (state) {
        store.dispatch(setGameState({
          status: state.status,
          timer: state.timer,
          bets: state.bets,
          currentBets: state.currentBets,
          result: state.result,
          lastResults: state.lastResults
        }));
      }

    });


    this.socket.on('error', (error) => {
      console.error('Socket server error:', error);
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
    console.log("test")
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