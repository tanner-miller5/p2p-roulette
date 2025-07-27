import React, { useEffect, useRef } from 'react';
import './RouletteWheel.css';

const RouletteWheel = ({ spinning, result }) => {
  const wheelRef = useRef(null);
  const currentRotation = useRef(0);
  const numberOfSectors = 36;
  const sectorAngle = 360 / numberOfSectors;

  const wheelNumbers = [
    32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5,
    24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
  ];

  const getSectorColor = (number) => {
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    return redNumbers.includes(number) ? '#D32F2F' : '#212121';
  };

  useEffect(() => {
    if (spinning) {
      const additionalRotation = 3600 + (result === 'red' ? 0 : sectorAngle);
      currentRotation.current += additionalRotation;
      
      if (wheelRef.current) {
        wheelRef.current.style.transform = `rotate(${currentRotation.current}deg)`;
      }
    }
  }, [spinning, result]);

  const wheelBackground = wheelNumbers.map((number, index) => 
    `${getSectorColor(number)} ${index * sectorAngle}deg ${(index + 1) * sectorAngle}deg`
  ).join(',');

  return (
    <div className="roulette-container">
      <div className="roulette-ball" />
      <div 
        ref={wheelRef}
        className="roulette-wheel"
        style={{
          background: `conic-gradient(${wheelBackground})`
        }}
      >
        {wheelNumbers.map((number, index) => (
          <div
            key={index}
            className="sector-number"
            style={{
              transform: `rotate(${index * sectorAngle + sectorAngle/2}deg) translateY(-125px)`
            }}
          >
            {number}
          </div>
        ))}
        <div className="wheel-center" />
      </div>
    </div>
  );
};

export default RouletteWheel;