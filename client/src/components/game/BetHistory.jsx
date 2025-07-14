import React from 'react';
import PropTypes from 'prop-types';
import './BetHistory.css';

/**
 * Display recent bet results
 */
export const BetHistory = ({ children, ...props }) => {
  return (
    <div className="BetHistory" {...props}>
      {children}
    </div>
  );
};

BetHistory.propTypes = {
  children: PropTypes.node
};

export default BetHistory;
