import React from 'react';
import PropTypes from 'prop-types';
import './BettingButtons.css';

const BettingButtons = ({
  onBet,
  betAmount,
  disabled,
  currentBets,
  balance,
  errorMessage
}) => {

  const getBetButtonStatus = () => {
    if (disabled) return 'Betting is closed';
    if (!balance) return 'No balance available';
    if (balance < betAmount) return 'Insufficient balance';
    if (betAmount < 10) return 'Minimum bet is 10';
    if (betAmount > 1000) return 'Maximum bet is 1000';
    return '';
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US').format(amount);
  };

  return (
    <div className="betting-controls" data-testid="betting-controls">
      <div className="betting-buttons">
        <button
          className="bet-button red"
          onClick={() => onBet('red')}
          disabled={disabled || balance < betAmount}
          title={getBetButtonStatus()}
          data-testid="bet-red-button"
        >
          <span className="bet-button-text">Bet Red</span>
          <span className="bet-total">
            {formatAmount(currentBets?.red || 0)} RLT
          </span>
        </button>
        <button
          className="bet-button black"
          onClick={() => onBet('black')}
          disabled={disabled || balance < betAmount}
          title={getBetButtonStatus()}
          data-testid="bet-black-button"
        >
          <span className="bet-button-text">Bet Black</span>
          <span className="bet-total">
            {formatAmount(currentBets?.black || 0)} RLT
          </span>
        </button>
      </div>

      {errorMessage && (
        <div className="betting-error" data-testid="betting-error">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

BettingButtons.propTypes = {
  onBet: PropTypes.func.isRequired,
  betAmount: PropTypes.number.isRequired,
  onBetAmountChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  currentBets: PropTypes.shape({
    red: PropTypes.number,
    black: PropTypes.number
  }),
  balance: PropTypes.number,
  errorMessage: PropTypes.string
};

BettingButtons.defaultProps = {
  disabled: false,
  currentBets: { red: 0, black: 0 },
  balance: 0,
  errorMessage: ''
};

export default BettingButtons;