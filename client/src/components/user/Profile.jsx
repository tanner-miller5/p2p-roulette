import React from 'react';
import PropTypes from 'prop-types';
import './Profile.css';

/**
 * User profile display
 */
export const Profile = ({ children, ...props }) => {
  return (
    <div className="Profile" {...props}>
      {children}
    </div>
  );
};

Profile.propTypes = {
  children: PropTypes.node
};

export default Profile;
