import React from 'react';
import PropTypes from 'prop-types';
import './Statistics.css';

/**
 * Win/loss statistics
 */
export const Statistics = ({ children, ...props }) => {
  return (
    <div className="Statistics" {...props}>
      {children}
    </div>
  );
};

Statistics.propTypes = {
  children: PropTypes.node
};

export default Statistics;
