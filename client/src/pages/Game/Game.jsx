import React, { useEffect, useState } from 'react';
import './Game.css';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {clearUserData} from '../../store/slices/userSlice';
import { useAuth } from '../../context/AuthContext';
import BetHistory from "../../components/game/BetHistory";
import RouletteWheel from "../../components/game/RouletteWheel";
import GameTimer from "../../components/game/GameTimer";
import {getProfile} from "../../services/api";
import {addBet} from "../../store/slices/gameSlice";
import {useSocket} from "../../hooks/useSocket";
import { useGameState } from '../../hooks/useGameState';
import {updateBalance} from "../../store/slices/walletSlice";
import CurrentBets from "../../components/game/CurrentBets";



const Game = () => {

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { username, userId } = useSelector((state) => state.user);
  const { balance } = useSelector((state) => state.wallet);
  const { logout, isAuthenticated } = useAuth();
  const {socket} = useSocket();
  const { placeBet } = useGameState(socket);
  const gameState = useSelector((state) => state.game);
  const [betAmount, setBetAmount] = useState('');
  const [error, setError] = useState('');
  const getProfileApi = async () => {
    const response = await getProfile();
    console.log(response);
  }
  useEffect(() => {
    getProfileApi();
  }, [dispatch]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleSignOut = () => {
    if (socket) {
      socket.disconnect();
    }
    dispatch(clearUserData());
    logout();
    navigate('/login');
  };

  const handleBet = (type) => {
    if (!gameState || gameState.status !== 'BETTING_OPEN') {
      setError('Betting is currently closed');
      return;
    }

    if (balance < betAmount) {
      setError('Insufficient balance');
      return;
    }

    try {
      dispatch(updateBalance(balance - betAmount));
      dispatch(addBet({
        betType: type,
        amount: betAmount,
        userId: userId
      }));

      placeBet(userId, betAmount, type);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBetAmountChange = (e) => {
    const value = Number(e.target.value);
    if (value >= 10 && value <= 1000) {
      setBetAmount(value);
    }
  };


  return (
    <div className="login-container">
      <div className="login-form game-content">
        {/* Header Section */}
        <div className="game-header-wrapper">
          <div className="game-user-info">
            <div className="game-user-details">
              <span className="username">Welcome, {username}</span>
              <span className="balance">Balance: {balance} RLT</span>
            </div>
            <button onClick={handleSignOut} className="sign-out-btn">
              Sign Out
            </button>
          </div>
          <div className="game-status-timer">
            <GameTimer
              timeLeft={gameState?.timer}
              status={gameState?.status}
              result={gameState?.result}
            />
          </div>
        </div>

        {/* Game Content */}
        <RouletteWheel
          spinning={gameState?.status === 'spinning'}
          result={gameState?.result}
        />

        <div className="betting-section">
          <div className="form-group">
            <label htmlFor="betAmount">Bet Amount:</label>
            <input
              id="betAmount"
              type="number"
              min="10"
              max="1000"
              step="10"
              value={betAmount}
              onChange={handleBetAmountChange}
              className="bet-amount-input"
            />
            <div className="quick-bet-buttons">
              <button onClick={() => setBetAmount(10)} className="quick-bet">10</button>
              <button onClick={() => setBetAmount(50)} className="quick-bet">50</button>
              <button onClick={() => setBetAmount(100)} className="quick-bet">100</button>
              <button onClick={() => setBetAmount(500)} className="quick-bet">500</button>
            </div>
          </div>

          <div className="betting-buttons">
            <button
              onClick={() => handleBet('red')}
              disabled={!gameState || gameState.status !== 'BETTING_OPEN'}
              className="bet-button red"
            >
              Bet Red
            </button>
            <button
              onClick={() => handleBet('black')}
              disabled={!gameState || gameState.status !== 'BETTING_OPEN'}
              className="bet-button black"
            >
              Bet Black
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
    <CurrentBets />

        <div className="history-section">
          <BetHistory />
        </div>
      </div>
    </div>
  );
};

export default Game;