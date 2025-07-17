import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './Game.css';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {clearUserData} from '../../store/slices/userSlice';
import { useAuth } from '../../context/AuthContext';
import BetHistory from "../../components/game/BetHistory";
import RouletteWheel from "../../components/game/RouletteWheel";
import GameTimer from "../../components/game/GameTimer";
import {updateBalance} from "../../store/slices/profileSlice";
import {getProfile} from "../../services/api";

const Game = () => {

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { username } = useSelector((state) => state.user);
  const { balance } = useSelector((state) => state.profile);
  const { logout, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState({
    status: 'waiting',
    timer: 0,
    bets: {
      red: {},
      black: {}
    },
    currentBets: { red: 0, black: 0 },
    lastResults: [],
  });
  const [betAmount, setBetAmount] = useState('');
  const [error, setError] = useState('');
  const getProfileApi = async () => {
    const response = await getProfile();
    console.log(response);
    dispatch(updateBalance(response.balance));
  }
  useEffect(() => {
    getProfileApi();
  }, [dispatch]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const token = localStorage.getItem('token');
    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';

    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    newSocket.on('connect', () => {
      console.log('Connected to game server');
      newSocket.emit('joinGame');
    });

    newSocket.on('gameState', (state) => {
      console.log('Received game state:', state);
      setGameState(prev => ({
        ...prev,
        ...state,
        currentBets: {
          red: calculateTotalBets(state.bets?.red || {}),
          black: calculateTotalBets(state.bets?.black || {})
        }
      }));
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [isAuthenticated, navigate]);

  const calculateTotalBets = (bets) => {
    return Object.values(bets).reduce((total, bet) => total + (bet.amount || 0), 0);
  };

  const handleSignOut = () => {
    if (socket) {
      socket.disconnect();
    }
    dispatch(clearUserData());
    logout();
    navigate('/login');
  };

  const placeBet = (color) => {
    if (!socket) return;
    if (!betAmount || isNaN(betAmount) || betAmount <= 0) {
      setError('Please enter a valid bet amount');
      return;
    }

    socket.emit('placeBet', {
      amount: parseInt(betAmount),
      betType: color
    });

    setBetAmount('');
  };

  const handleBet = (type) => {
    if (!socket?.connected) {
      setError('Not connected to game server');
      return;
    }

    if (!gameState || gameState.status !== 'waiting') {
      setError('Betting is currently closed');
      return;
    }

    if (balance < betAmount) {
      setError('Insufficient balance');
      return;
    }

    try {
      placeBet(betAmount, type);
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
              timeLeft={gameState?.timer || 0}
              gameStatus={gameState?.status || 'connecting'}
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
              disabled={!gameState || gameState.status !== 'waiting'}
              className="bet-button red"
            >
              Bet Red
            </button>
            <button
              onClick={() => handleBet('black')}
              disabled={!gameState || gameState.status !== 'waiting'}
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

        <div className="history-section">
          <BetHistory history={gameState.lastResults} />
        </div>
      </div>
    </div>
  );
};

export default Game;