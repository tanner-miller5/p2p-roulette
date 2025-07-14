import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import Game from './pages/Game/Game';
import Register from './pages/Register/Register';
import './App.css';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  console.log('Auth check:', isAuthenticated); // Debug log
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

          <Route
          path="/game"
          element={
            <PrivateRoute>
              <Game />
            </PrivateRoute>
          }
        />
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </div>
  );
}

export default App;