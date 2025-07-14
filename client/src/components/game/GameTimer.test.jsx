import React from 'react';
import { render, screen } from '@testing-library/react';
import GameTimer from './GameTimer';

describe('GameTimer', () => {
  it('renders betting open status with timer', () => {
    render(<GameTimer timeLeft={20} status="BETTING_OPEN" />);
    expect(screen.getByText('Betting Open')).toBeInTheDocument();
    expect(screen.getByText('20s')).toBeInTheDocument();
  });

  it('renders processing bets status without timer', () => {
    render(<GameTimer timeLeft={0} status="PROCESSING_BETS" />);
    expect(screen.getByText('Processing Bets')).toBeInTheDocument();
    expect(screen.queryByText('0s')).not.toBeInTheDocument();
  });

  it('renders results status without timer', () => {
    render(<GameTimer timeLeft={0} status="RESULTS" />);
    expect(screen.getByText('Results')).toBeInTheDocument();
    expect(screen.queryByText('0s')).not.toBeInTheDocument();
  });

  it('applies warning class when time is low', () => {
    render(<GameTimer timeLeft={8} status="BETTING_OPEN" />);
    const timerElement = screen.getByText('8s');
    expect(timerElement).toHaveClass('timer-warning');
  });

  it('applies critical class when time is very low', () => {
    render(<GameTimer timeLeft={3} status="BETTING_OPEN" />);
    const timerElement = screen.getByText('3s');
    expect(timerElement).toHaveClass('timer-critical');
  });

  it('shows connecting status when no valid status provided', () => {
    render(<GameTimer timeLeft={0} status="" />);
    expect(screen.getByText('Connecting...')).toBeInTheDocument();
  });
});