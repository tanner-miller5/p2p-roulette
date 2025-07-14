import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Statistics } from './Statistics';

describe('Statistics Component', () => {
  it('renders without crashing', () => {
    render(<Statistics />);
  });

  it('renders children correctly', () => {
    render(<Statistics>Test Content</Statistics>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});
