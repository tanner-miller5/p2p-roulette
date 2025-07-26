import {useCallback } from 'react';
//import { useDispatch } from 'react-redux';
//import { updateBalance } from '../store/slices/userSlice';


export const useGameState = (socket) => {
  const placeBet = useCallback((userId, amount, betType) => {
    if (socket) {
      console.log('placeBet');
      socket.emit('placeBet', { userId, amount, betType });
    }
  }, [socket]);

  return { placeBet };
};

