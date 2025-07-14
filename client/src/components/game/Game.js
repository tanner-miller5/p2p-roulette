import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGameState } from '../../hooks/useGameState';
import { useSocket } from '../../hooks/useSocket';
import { setGameState } from '../../store/slices/gameSlice';
import { updateBalance } from '../../store/slices/userSlice';
import './Game.css';
import { addBet } from '../../store/slices/gameSlice';

const Game = () => {
  const dispatch = useDispatch();
  const { socket } = useSocket();
  const { gameState, placeBet } = useGameState(socket);
  const balance = useSelector(state => state.user.balance);
  const [betAmount, setBetAmount] = useState(10);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (gameState) {
      dispatch(setGameState(gameState));
    }
  }, [gameState, dispatch]);

  const handleBet = (type) => {
    if (!gameState || gameState.status !== 'waiting') {
      setError('Betting is currently closed');
      return;
    }

    if (balance < betAmount) {
      setError('Insufficient balance');
      return;
    }

    try {
      // Optimistically update the balance
      dispatch(updateBalance(balance - betAmount));
      // Add bet to the game state
      dispatch(addBet({
        betType: type,
        amount: betAmount,
        userId: socket.id // or however you store the user ID
      }));

      placeBet(betAmount, type);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="game-container">
      <div className="game-board">
        <div className="timer">Time left: {gameState?.timer || 0}s</div>
        <div className="status">
          Status: {gameState?.status || 'Loading...'}
        </div>
        <div className="balance">
          Balance: {balance} RLT
        </div>
        <div className="betting-controls">
          <input
            type="number"
            min="10"
            max="1000"
            step="10"
            value={betAmount}
            onChange={(e) => setBetAmount(Number(e.target.value))}
            className="bet-amount"
          />
          <div className="betting-options">
            <button
              className="bet-button red"
              onClick={() => handleBet('red')}
              disabled={!gameState || gameState.status !== 'waiting'}
            >
              Bet Red
            </button>
            <button
              className="bet-button black"
              onClick={() => handleBet('black')}
              disabled={!gameState || gameState.status !== 'waiting'}
            >
              Bet Black
            </button>
          </div>
        </div>
        {error && <div className="error">{error}</div>}
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
