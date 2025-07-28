// RouletteWheel.jsx
import React, { useEffect, useRef } from 'react';
import './RouletteWheel.css';
import PropTypes from 'prop-types';
//import {useSelector} from "react-redux";

const RouletteWheel = ({ spinning, result }) => {
  const numberOfSectors = 36;
  const sectorAngle = 360 / numberOfSectors;
  const wheelRef = useRef(null);
  const currentRotation = useRef(0);


  //const gameState = useSelector(state => state.game);

  const wheelNumbers = [
    32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5,
    24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
  ];

  const getSectorColor = (number) => {
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    return redNumbers.includes(number) ? '#D32F2F' : '#212121';
  };
/*
  const generateWinningNumber = (result) => {
    // Numbers should be arranged in order around the wheel
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    const blackNumbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

    // Select from the appropriate array based on result
    const numbers = result === 'red' ? redNumbers : blackNumbers;
    const num = Math.floor(Math.random() * numbers.length);
    console.log('result:', result);
    console.log('num:', num);
    console.log('Winning number:', numbers[num]);
    return numbers[num];
  };

  const getWinningNumberForResult = (result) => {
    if (result === 'red') {
      return wheelNumbers.find(num => [
        1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36
      ].includes(num));
    } else {
      return wheelNumbers.find(num => [
        2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35
      ].includes(num));
    }
  };
*/


  useEffect(() => {
    if (spinning && result) {
      // First reset the rotation to 0 without animation
      wheelRef.current.style.transition = 'none';
      wheelRef.current.style.transform = `rotate(0deg)`;
      wheelRef.current.offsetHeight; // Force reflow

      // Convert color result to specific number that matches the color
      const getRandomNumberForColor = (color) => {
        const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
        const blackNumbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];
        const numbers = color === 'red' ? redNumbers : blackNumbers;
        const num = Math.floor(Math.random() * numbers.length);
        console.log('result:', color);
        console.log('num:', num);
        console.log('Winning number:', numbers[num]);
        return numbers[num];
      };

      const targetNumber = getRandomNumberForColor(result);
      const winningIndex = wheelNumbers.indexOf(targetNumber);
      console.log('winningIndex:', winningIndex);

      //const winningNumber = generateWinningNumber(result);
      //const winningNumber = getWinningNumberForResult(result);
      //const winningIndex = wheelNumbers.indexOf(winningNumber);


      // Find the index of the winning number
      //const resultIndex = wheelNumbers.findIndex(num => num === winningNumber);

      // Calculate the target angle
      // Multiply by negative sectorAngle for clockwise rotation
      // Don't add sectorAngle/2 to align with center of sector
      //const baseAngle = -(resultIndex * sectorAngle) + sectorAngle/2;

      // Add multiple spins for animation effect (5 full rotations)
      const rotations = 0;//5 * 360;
      const sectorAngle = 360 / wheelNumbers.length;
      const finalRotation =
          -1 * (rotations + (winningIndex * sectorAngle) + (sectorAngle/2));
      console.log('finalRotation:', finalRotation);
      // Update current rotation for next spin
      currentRotation.current = finalRotation % 360;



      // Re-enable transition and apply the spin
      wheelRef.current.style.transition = 'transform 3s cubic-bezier(0.2, 0.8, 0.3, 1)';
      wheelRef.current.style.transform = `rotate(${finalRotation}deg)`;

      //currentRotation.current = finalRotation;
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
                transform: `rotate(0deg)`
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

// Add PropTypes for type checking
RouletteWheel.propTypes = {
  spinning: PropTypes.bool.isRequired,
  result: PropTypes.string
};


export default RouletteWheel;