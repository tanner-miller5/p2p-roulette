import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as loginApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Login.css';
import {useDispatch} from "react-redux";
import {setUsername} from "../../store/slices/userSlice";

const Login = () => {
  const dispatch = useDispatch();
  const [username, updateUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginApi(username, password);
      login({
        username: response.username,
        balance: response.balance,
        token: response.token
      });
      dispatch(setUsername(username));
      navigate('/game');
    } catch (error) {
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => updateUsername(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <button type="submit" disabled={loading} className="login-button">
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <div className="register-section">
          <p>Don&apos;t have an account?</p>
          <Link to="/register" className="register-button">
            Register
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;