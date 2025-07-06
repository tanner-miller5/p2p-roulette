
import React, { useState } from 'react';
import './RouletteGameStyles.css';

const numbers = Array.from({ length: 37 }, (_, i) => i); // 0-36

const Roulette = () => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [bet, setBet] = useState({ type: 'number', value: null, amount: 0 });
  const [balance, setBalance] = useState(1000);

  const getNumberColor = (num) => {
    if (num === 0) return 'green';
    return [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(num) ? 'red' : 'black';
  };

  const spin = () => {
    if (spinning || bet.amount <= 0 || bet.value === null) return;
    
    if (bet.amount > balance) {
      alert('Insufficient funds!');
      return;
    }

    setSpinning(true);
    setBalance(prev => prev - bet.amount);

    // Simulate wheel spinning
    setTimeout(() => {
      const winningNumber = Math.floor(Math.random() * 37);
      setResult(winningNumber);
      
      // Calculate winnings
      let winnings = 0;
      if (bet.type === 'number' && bet.value === winningNumber) {
        winnings = bet.amount * 35;
      } else if (bet.type === 'color' && getNumberColor(winningNumber) === bet.value) {
        winnings = bet.amount * 2;
      }

      setBalance(prev => prev + winnings);
      setSpinning(false);
    }, 3000);
  };

  return (
    <div className="roulette-container">
      <h2>Balance: ${balance}</h2>
      
      <div className="roulette-wheel">
        {spinning ? (
          <div className="spinning">Spinning...</div>
        ) : (
          <div className="result">
            {result !== null && (
              <div className={`number ${getNumberColor(result)}`}>
                {result}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="betting-controls">
        <div className="bet-type">
          <button 
            onClick={() => setBet(prev => ({ ...prev, type: 'number' }))}>
            Bet on Number
          </button>
          <button 
            onClick={() => setBet(prev => ({ ...prev, type: 'color' }))}>
            Bet on Color
          </button>
        </div>

        {bet.type === 'number' && (
          <div className="number-grid">
            {numbers.map(num => (
              <button
                key={num}
                className={`number-button ${getNumberColor(num)}`}
                onClick={() => setBet(prev => ({ ...prev, value: num }))}
              >
                {num}
              </button>
            ))}
          </div>
        )}

        {bet.type === 'color' && (
          <div className="color-buttons">
            <button 
              className="red"
              onClick={() => setBet(prev => ({ ...prev, value: 'red' }))}>
              Red
            </button>
            <button 
              className="black"
              onClick={() => setBet(prev => ({ ...prev, value: 'black' }))}>
              Black
            </button>
          </div>
        )}

        <div className="bet-amount">
          <input
            type="number"
            value={bet.amount}
            onChange={(e) => setBet(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
            placeholder="Enter bet amount"
          />
        </div>

        <button 
          className="spin-button" 
          onClick={spin}
          disabled={spinning}>
          SPIN
        </button>
      </div>
    </div>
  );
};

export default Roulette;
