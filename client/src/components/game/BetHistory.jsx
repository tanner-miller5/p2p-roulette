import React from 'react';
import { useSelector } from 'react-redux';
import './BetHistory.css';

const BetHistory = () => {
  const gameState = useSelector((state) => state.game);
  const lastResults = gameState?.lastResults || [];

  const getNumberColor = (number) => {
    if (!number) return 'transparent';
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    return redNumbers.includes(number) ? '#D32F2F' : '#212121';
  };

  const getTextColor = (number) => {
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    return redNumbers.includes(number) ? '#fff' : '#fff';
  };

  return (
    <div className="bet-history">
      <h3 className="bet-history-title">Recent Results</h3>
      <div className="bet-history-results">
        {lastResults.length === 0 ? (
          <div className="no-results">No results yet</div>
        ) : (
          lastResults.map((number, index) => (
            <div
              key={index}
              className="result-item"
              style={{
                backgroundColor: getNumberColor(number),
                color: getTextColor(number)
              }}
            >
              {number}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BetHistory;
