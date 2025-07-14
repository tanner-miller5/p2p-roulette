import { render, screen } from '@testing-library/react';
import { GameStats } from './GameStats';

describe('GameStats', () => {
  it('renders correctly', () => {
    render(<GameStats />);
  });
});
