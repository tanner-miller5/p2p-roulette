import React from 'react';
import './App.css';
import Roulette from './RouletteGame';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>React Roulette</h1>
      </header>
      <main>
        <Roulette />
      </main>
    </div>
  );
}

export default App;