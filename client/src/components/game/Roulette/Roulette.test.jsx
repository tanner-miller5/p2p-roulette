import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Roulette } from './Roulette';

describe('Roulette Component', () => {
  it('renders without crashing', () => {
    render(<Roulette />);
  });

  it('renders children correctly', () => {
    render(<Roulette>Test Content</Roulette>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});
