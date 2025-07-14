import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import './RouletteWheel.css';

const RouletteWheel = ({ spinning, result, lastResults }) => {
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef(null);
  const previousResult = useRef(null);

  useEffect(() => {
    if (spinning) {
      const startRotation = rotation;
      const endRotation = startRotation + (360 * 5) + getResultRotation(result);
      
      if (wheelRef.current) {
        wheelRef.current.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
        wheelRef.current.style.transform = `rotate(${endRotation}deg)`;
      }
      setRotation(endRotation);
    } else if (!spinning && result && result !== previousResult.current) {
      previousResult.current = result;
    }
  }, [spinning, result, rotation]);

  const getResultRotation = (result) => {
    const segments = [
      'red', 'black', 'red', 'black', 'red', 'black',
      'red', 'black', 'red', 'black', 'red', 'black'
    ];
    
    const resultIndex = segments.indexOf(result);
    if (resultIndex === -1) return 0;
    
    return resultIndex * 30;
  };

  const safeLastResults = Array.isArray(lastResults) ? lastResults : [];
  const recentResults = safeLastResults.slice(0, 10);

  return (
    <div className="roulette-container">
      <div className="roulette-marker" data-testid="roulette-marker"></div>
      <div 
        ref={wheelRef}
        className={`roulette-wheel ${spinning ? 'spinning' : ''}`}
        data-testid="roulette-wheel"
      >
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={index}
            className={`wheel-segment ${index % 2 === 0 ? 'red' : 'black'}`}
            style={{
              transform: `rotate(${index * 30}deg) translateY(-50%)`
            }}
            data-testid="wheel-segment"
          />
        ))}
      </div>
      
      {recentResults.length > 0 && (
        <div className="results-history" data-testid="results-history">
          {recentResults.map((historyResult, index) => (
            <div 
              key={index}
              className={`history-item ${historyResult}`}
              data-testid="history-item"
            >
              {historyResult}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

RouletteWheel.propTypes = {
  spinning: PropTypes.bool,
  result: PropTypes.oneOf(['red', 'black', null]),
  lastResults: PropTypes.arrayOf(PropTypes.string)
};

RouletteWheel.defaultProps = {
  spinning: false,
  result: null,
  lastResults: []
};

export default RouletteWheel;