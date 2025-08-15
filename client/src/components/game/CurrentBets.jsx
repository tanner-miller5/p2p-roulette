import React from 'react';
import { useSelector } from 'react-redux';
import './CurrentBets.css';

const CurrentBets = () => {
  const gameState = useSelector((state) => state.game);
  const { bets, currentBets, status } = gameState || {};

  const getTotalBetAmount = (betType) => {
    if (!bets || !bets[betType]) return 0;
    return Object.values(bets[betType]).reduce((total, bet) => total + (bet.amount || 0), 0);
  };

  const getBetCount = (betType) => {
    if (!bets || !bets[betType]) return 0;
    return Object.keys(bets[betType]).length;
  };

  const getPlayerBets = (betType) => {
    if (!bets || !bets[betType]) return [];
    return Object.entries(bets[betType]).map(([userId, bet]) => ({
      userId,
      amount: bet.amount,
      matched: bet.matched
    }));
  };

  const redTotal = getTotalBetAmount('red');
  const blackTotal = getTotalBetAmount('black');
  const redCount = getBetCount('red');
  const blackCount = getBetCount('black');

  return (
    <div className="current-bets">
      <h3 className="current-bets-title">Current Bets</h3>
      
      <div className="bets-overview">
        <div className="bet-summary red-summary">
          <div className="bet-color-indicator red"></div>
          <div className="bet-info">
            <div className="bet-total">Red: {redTotal} RLT</div>
            <div className="bet-players">{redCount} player{redCount !== 1 ? 's' : ''}</div>
          </div>
        </div>
        
        <div className="bet-summary black-summary">
          <div className="bet-color-indicator black"></div>
          <div className="bet-info">
            <div className="bet-total">Black: {blackTotal} RLT</div>
            <div className="bet-players">{blackCount} player{blackCount !== 1 ? 's' : ''}</div>
          </div>
        </div>
      </div>

      {status === 'BETTING_OPEN' && (
        <div className="betting-details">
          <div className="bet-section">
            <h4 className="bet-section-title red-title">Red Bets</h4>
            <div className="player-bets">
              {getPlayerBets('red').length === 0 ? (
                <div className="no-bets">No red bets yet</div>
              ) : (
                getPlayerBets('red').map((bet, index) => (
                  <div key={index} className={`player-bet ${bet.matched ? 'matched' : 'unmatched'}`}>
                    <span className="bet-amount">{bet.amount} RLT</span>
                    <span className="bet-status">
                      {bet.matched ? '✓ Matched' : '○ Waiting'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bet-section">
            <h4 className="bet-section-title black-title">Black Bets</h4>
            <div className="player-bets">
              {getPlayerBets('black').length === 0 ? (
                <div className="no-bets">No black bets yet</div>
              ) : (
                getPlayerBets('black').map((bet, index) => (
                  <div key={index} className={`player-bet ${bet.matched ? 'matched' : 'unmatched'}`}>
                    <span className="bet-amount">{bet.amount} RLT</span>
                    <span className="bet-status">
                      {bet.matched ? '✓ Matched' : '○ Waiting'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {(status === 'spinning' || status === 'PROCESSING_BETS' || status === 'RESULTS') && (
        <div className="betting-closed">
          <div className="closed-message">
            {status === 'spinning' && '🎰 Spinning...'}
            {status === 'PROCESSING_BETS' && '⏳ Processing bets...'}
            {status === 'RESULTS' && '🎉 Round complete!'}
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrentBets;
