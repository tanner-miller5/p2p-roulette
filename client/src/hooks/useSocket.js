import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import socketService from '../services/socket';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
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
    }
  }, [isAuthenticated]);

  return { socket, connected: socket?.connected || false };
};
