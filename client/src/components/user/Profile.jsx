import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile } from '../store/slices/profileSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const { data: profile, loading, error, statistics } = useSelector((state) => state.profile);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!profile) return null;

  return (
    <div className="profile-container">
      <h2>Profile</h2>
      <div className="profile-info">
        <p>Username: {profile.username}</p>
        <p>Balance: {profile.balance} RLT</p>
      </div>
      <div className="statistics">
        <h3>Statistics</h3>
        <p>Total Games: {statistics.totalGames}</p>
        <p>Games Won: {statistics.gamesWon}</p>
        <p>Win Rate: {statistics.totalGames > 0 
          ? ((statistics.gamesWon / statistics.totalGames) * 100).toFixed(2)
          : 0}%</p>
        <p>Total Bets: {statistics.totalBets}</p>
        <p>Total Winnings: {statistics.totalWinnings} RLT</p>
      </div>
    </div>
  );
};

export default Profile;