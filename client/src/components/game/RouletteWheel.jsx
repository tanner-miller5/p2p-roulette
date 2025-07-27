// RouletteWheel.jsx
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
      // First reset the rotation to 0 without animation
      wheelRef.current.style.transition = 'none';
      wheelRef.current.style.transform = `rotate(0deg)`;
      wheelRef.current.offsetHeight;

      // Get a random number from the correct color array
      const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
      const blackNumbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];
      const possibleNumbers = result === 'red' ? redNumbers : blackNumbers;
      const winningNumber = possibleNumbers[Math.floor(Math.random() * possibleNumbers.length)];

      // Find the index of the winning number
      const resultIndex = wheelNumbers.findIndex(num => num === winningNumber);
      // Calculate the exact angle needed for the winning number to land at the top
      const targetAngle = -(resultIndex * sectorAngle + sectorAngle / 2);
      // Add complete rotations plus the target angle
      const finalRotation = 3600 + targetAngle;

      // Re-enable transition and apply the spin
      wheelRef.current.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
      wheelRef.current.style.transform = `rotate(${finalRotation}deg)`;

      currentRotation.current = finalRotation;
    }
  }, [spinning, result, wheelNumbers, sectorAngle]);

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
          background: `conic-gradient(from 0deg, ${wheelBackground})`
        }}
      >
        <div className="numbers-ring">
          {wheelNumbers.map((number, index) => (
            <div
              key={index}
              className="number-slot"
              style={{
                transform: `rotate(${index * sectorAngle + sectorAngle/2}deg)`,
              }}
            >
              <span style={{
                transform: `rotate(90deg)`
              }}>
                {number}
              </span>
            </div>
          ))}
        </div>
        <div className="wheel-center" />
      </div>
    </div>
  );
};

export default RouletteWheel;