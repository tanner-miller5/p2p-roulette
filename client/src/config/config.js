export const config = {
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  socketOptions: {
    transports: ['websocket'],
    upgrade: false,
    forceNew: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
  }
};
