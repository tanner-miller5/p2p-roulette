import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { updateBalance } from '../store/slices/userSlice';


export const useGameState = (socket) => {
  const [error, setError] = useState(null);
  const [gameState, setGameState] = useState({
    status: 'waiting',
    timer: 0,
    bets: {
      red: {},
      black: {}
    },
    result: null
  });

  const dispatch = useDispatch();

  useEffect(() => {
    if (!socket) return;

    socket.on('gameState', (state) => {
      console.log('Received game state:', state);
      setGameState(state);
    });

    socket.on('balanceUpdate', ({ balance }) => {
      dispatch(updateBalance(balance));
    });

    socket.on('error', (error) => {
      console.error('Game error:', error);
      setError(error.message);
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
      socket.off('balanceUpdate');
      socket.off('error');
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
