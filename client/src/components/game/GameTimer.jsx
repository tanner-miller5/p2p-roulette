import React from 'react';
import './GameTimer.css';

const GameTimer = ({ timeLeft, status, result }) => {
    /*
  const getNumberColor = (number) => {
    if (!number) return '#333';
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    return redNumbers.includes(number) ? '#D32F2F' : '#212121';
  };

     */

  const getBackgroundColor = (number) => {
    if (!number) return 'transparent';
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    return redNumbers.includes(number) ? '#D32F2F' : '#212121';
  };

  const renderStatus = () => {
    switch (status) {
      case 'BETTING_OPEN':
        return (
          <div className="timer-content">
            <div className="timer-display">{timeLeft}</div>
            <div className="timer-label">Betting Open</div>
          </div>
        );
      case 'spinning':
        return (
          <div className="timer-content">
            <div className="timer-display spinning">🎰</div>
            <div className="timer-label">Spinning...</div>
          </div>
        );
      case 'PROCESSING_BETS':
        return (
          <div className="timer-content">
            <div className="timer-display">⏳</div>
            <div className="timer-label">Processing</div>
          </div>
        );
      case 'RESULTS':
        return (
          <div className="timer-content">
            <div 
              className="timer-display result-number"
              style={{
                backgroundColor: getBackgroundColor(result),
                color: '#fff'
              }}
            >
              {result}
            </div>
            <div className="timer-label">Winner!</div>
          </div>
        );
      default:
        return (
          <div className="timer-content">
            <div className="timer-display">--</div>
            <div className="timer-label">Waiting</div>
          </div>
        );
    }
  };

  return (
    <div className="game-timer">
      {renderStatus()}
    </div>
  );
};

export default GameTimer;