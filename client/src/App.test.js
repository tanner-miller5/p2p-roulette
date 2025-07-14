import React from 'react';
import { render, screen } from './utils/test-utils';
import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    const welcomeElement = screen.getByText(/Welcome to P2P Roulette/i);
    expect(welcomeElement).toBeInTheDocument();
  });
});
