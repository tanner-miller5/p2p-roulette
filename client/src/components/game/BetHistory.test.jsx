import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BetHistory } from './BetHistory';

describe('BetHistory Component', () => {
  it('renders without crashing', () => {
    render(<BetHistory />);
  });

  it('renders children correctly', () => {
    render(<BetHistory>Test Content</BetHistory>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});
