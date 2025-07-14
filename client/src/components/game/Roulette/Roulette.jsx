import React from 'react';
import PropTypes from 'prop-types';
import './Roulette.css';

/**
 * Main roulette wheel component with Web3 integration
 */
export const Roulette = ({ children, ...props }) => {
  return (
    <div className="Roulette" {...props}>
      {children}
    </div>
  );
};

Roulette.propTypes = {
  children: PropTypes.node
};

export default Roulette;
