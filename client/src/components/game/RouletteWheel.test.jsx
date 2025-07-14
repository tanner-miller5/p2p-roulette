import React from 'react';
import { render, screen } from '@testing-library/react';
import RouletteWheel from './RouletteWheel';

describe('RouletteWheel', () => {
  it('renders without crashing', () => {
    render(<RouletteWheel />);
    expect(screen.getByTestId('roulette-wheel')).toBeInTheDocument();
  });

  it('displays correct number of wheel segments', () => {
    const { container } = render(<RouletteWheel />);
    const segments = container.querySelectorAll('.wheel-segment');
    expect(segments.length).toBe(12);
  });

  it('applies spinning class when spinning prop is true', () => {
    const { container } = render(<RouletteWheel spinning={true} />);
    expect(container.querySelector('.spinning')).toBeInTheDocument();
  });

  it('displays history items correctly', () => {
    const lastResults = ['red', 'black', 'red'];
    render(<RouletteWheel lastResults={lastResults} />);
    
    const historyItems = screen.getAllByTestId('history-item');
    expect(historyItems).toHaveLength(3);
    expect(historyItems[0]).toHaveClass('red');
    expect(historyItems[1]).toHaveClass('black');
    expect(historyItems[2]).toHaveClass('red');
  });

  it('limits history items to 10', () => {
    const lastResults = Array(15).fill('red');
    const { container } = render(<RouletteWheel lastResults={lastResults} />);
    const historyItems = container.querySelectorAll('.history-item');
    expect(historyItems).toHaveLength(10);
  });

  it('handles null result properly', () => {
    render(<RouletteWheel result={null} />);
    expect(screen.getByTestId('roulette-wheel')).not.toHaveClass('spinning');
  });
});