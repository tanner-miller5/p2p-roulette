import React from 'react';
import PropTypes from 'prop-types';
import './Balance.css';

/**
 * Practice currency balance
 */
export const Balance = ({ children, ...props }) => {
  return (
    <div className="Balance" {...props}>
      {children}
    </div>
  );
};

Balance.propTypes = {
  children: PropTypes.node
};

export default Balance;
