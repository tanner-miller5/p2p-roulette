import React from 'react';
import PropTypes from 'prop-types';
import './GameTimer.css';

const GameTimer = ({ timeLeft, status, result }) => {
  const getStatusDisplay = () => {
    console.log(status);
    switch (status) {
      case 'BETTING_OPEN':
        return 'Betting Open';
      case 'PROCESSING_BETS':
        return 'Processing Bets';
      case 'RESULTS':
        return 'Result: ' + result;
      case 'spinning':
        return 'Spinning';
      default:
        return 'Connecting...';
    }
  };

  const getTimerColor = () => {
    if (timeLeft <= 5) return 'timer-critical';
    if (timeLeft <= 10) return 'timer-warning';
    return 'timer-normal';
  };

  const shouldShowTimer = status === 'BETTING_OPEN';

  return (
    <div className="game-timer">
      <div className="game-status">{getStatusDisplay()}</div>
      {shouldShowTimer && (
        <div className={`timer-count ${getTimerColor()}`}>
          {timeLeft}s
        </div>
      )}
    </div>
  );
};

GameTimer.propTypes = {
  timeLeft: PropTypes.number.isRequired,
  status: PropTypes.oneOf(['BETTING_OPEN', 'PROCESSING_BETS', 'RESULTS', '']).isRequired,
  result: PropTypes.string
};

export default GameTimer;